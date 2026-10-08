import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { Appointment } from "../../models/Appointment";
import { Doctor } from "../../models/Doctor";
import { apiError } from "../../lib/server/api-error";
import { getSession, isRole } from "../../lib/server/auth";
import { connectDatabase } from "../../lib/server/db";

const bookingSchema = z.object({ doctorId: z.string().regex(/^[a-f\d]{24}$/i), date: z.iso.date(), time: z.string().regex(/^([01]\d|2[0-3]):(00|30)$/) });

export async function GET(request: NextRequest) {
  try {
    const params = request.nextUrl.searchParams;
    const doctorId = params.get("doctorId");
    const date = params.get("date");
    if (doctorId && date) {
      if (!/^[a-f\d]{24}$/i.test(doctorId) || !z.iso.date().safeParse(date).success) return NextResponse.json({ error: "Invalid doctor id or date." }, { status: 400 });
      if (!process.env.MONGODB_URI) return NextResponse.json({ bookedSlots: [] });
      await connectDatabase();
      const appointments = await Appointment.find({ doctorId, date, status: "booked" }).select("time -_id").lean();
      return NextResponse.json({ bookedSlots: appointments.map((appointment) => appointment.time) });
    }

    const session = getSession(request);
    if (!session) return NextResponse.json({ error: "Authentication required." }, { status: 401 });
    await connectDatabase();
    const filter: Record<string, unknown> = {};
    if (session.role === "user") filter.userId = session.id;
    if (session.role === "doctor") {
      const doctor = await Doctor.findOne({ userId: session.id }).select("_id").lean();
      if (!doctor) return NextResponse.json({ appointments: [] });
      filter.doctorId = doctor._id;
    }
    const appointments = await Appointment.find(filter).populate("doctorId", "name speciality imageUrl fees").populate("userId", "name email").sort({ date: 1, time: 1 }).lean();
    return NextResponse.json({ appointments });
  } catch (error) { return apiError(error); }
}

export async function POST(request: NextRequest) {
  try {
    const session = getSession(request);
    if (!isRole(session, "user")) return NextResponse.json({ error: "Patient access is required to book an appointment." }, { status: 403 });
    const input = bookingSchema.parse(await request.json());
    const [year, month, day] = input.date.split("-").map(Number);
    const bookingDate = new Date(Date.UTC(year, month - 1, day));
    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);
    if (bookingDate < today) return NextResponse.json({ error: "Appointments must be booked for a future date." }, { status: 400 });
    await connectDatabase();
    const doctor = await Doctor.findById(input.doctorId).select("available").lean();
    if (!doctor) return NextResponse.json({ error: "Doctor not found." }, { status: 404 });
    if (!doctor.available) return NextResponse.json({ error: "This doctor is not accepting appointments right now." }, { status: 409 });
    const appointment = await Appointment.create({ ...input, userId: session!.id, status: "booked" });
    return NextResponse.json({ appointment }, { status: 201 });
  } catch (error) { return apiError(error); }
}