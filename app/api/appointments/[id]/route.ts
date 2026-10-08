import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { Appointment } from "../../../models/Appointment";
import { Doctor } from "../../../models/Doctor";
import { apiError } from "../../../lib/server/api-error";
import { getSession, isRole } from "../../../lib/server/auth";
import { connectDatabase } from "../../../lib/server/db";

const statusSchema = z.object({ status: z.enum(["cancelled", "completed"]) });
type RouteContext = { params: Promise<{ id: string }> };

export async function PATCH(request: NextRequest, context: RouteContext) {
  try {
    const session = getSession(request);
    if (!session) return NextResponse.json({ error: "Authentication required." }, { status: 401 });
    const { status } = statusSchema.parse(await request.json());
    if (status === "completed" && !isRole(session, "doctor", "admin")) return NextResponse.json({ error: "Doctor or administrator access required." }, { status: 403 });
    const { id } = await context.params;
    if (!/^[a-f\d]{24}$/i.test(id)) return NextResponse.json({ error: "Invalid appointment id." }, { status: 400 });
    await connectDatabase();
    const appointment = await Appointment.findById(id);
    if (!appointment) return NextResponse.json({ error: "Appointment not found." }, { status: 404 });
    if (session.role === "user" && String(appointment.userId) !== session.id) return NextResponse.json({ error: "You can only update your own appointments." }, { status: 403 });
    if (session.role === "doctor") {
      const doctor = await Doctor.findOne({ userId: session.id }).select("_id").lean();
      if (!doctor || String(appointment.doctorId) !== String(doctor._id)) return NextResponse.json({ error: "You can only update your own appointments." }, { status: 403 });
    }
    if (appointment.status !== "booked") return NextResponse.json({ error: "Only booked appointments can be updated." }, { status: 409 });
    appointment.status = status;
    await appointment.save();
    return NextResponse.json({ appointment });
  } catch (error) { return apiError(error); }
}