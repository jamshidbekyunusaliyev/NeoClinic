import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { Doctor } from "../../../models/Doctor";
import { apiError } from "../../../lib/server/api-error";
import { getSession, isRole } from "../../../lib/server/auth";
import { connectDatabase } from "../../../lib/server/db";

const imageValue = z.string().max(7_000_000).refine((value) => value === "" || /^https?:\/\//.test(value) || /^data:image\/(png|jpeg|webp);base64,/.test(value));
const doctorUpdateSchema = z.object({ name: z.string().trim().min(2).max(100).optional(), speciality: z.string().trim().min(2).max(80).optional(), degree: z.string().trim().min(2).max(120).optional(), experience: z.number().int().min(0).max(60).optional(), fees: z.number().min(0).max(100000).optional(), imageUrl: imageValue.optional(), bio: z.string().max(2000).optional(), available: z.boolean().optional(), availableToday: z.boolean().optional() }).strict();
type RouteContext = { params: Promise<{ id: string }> };
const validId = (id: string) => /^[a-f\d]{24}$/i.test(id);

export async function GET(_request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;
    if (!validId(id)) return NextResponse.json({ error: "Invalid doctor id." }, { status: 400 });
    await connectDatabase();
    const doctor = await Doctor.findById(id).lean();
    return doctor ? NextResponse.json({ doctor }) : NextResponse.json({ error: "Doctor not found." }, { status: 404 });
  } catch (error) { return apiError(error); }
}

export async function PATCH(request: NextRequest, context: RouteContext) {
  try {
    const session = getSession(request);
    if (!isRole(session, "admin", "doctor")) return NextResponse.json({ error: "Doctor or administrator access required." }, { status: 403 });
    const { id } = await context.params;
    if (!validId(id)) return NextResponse.json({ error: "Invalid doctor id." }, { status: 400 });
    await connectDatabase();
    const changes = doctorUpdateSchema.parse(await request.json());
    const doctor = await Doctor.findById(id);
    if (!doctor) return NextResponse.json({ error: "Doctor not found." }, { status: 404 });
    if (session?.role === "doctor" && String(doctor.userId) !== session.id) return NextResponse.json({ error: "You can only update your own profile." }, { status: 403 });
    const updated = await Doctor.findByIdAndUpdate(id, changes, { new: true, runValidators: true });
    return NextResponse.json({ doctor: updated });
  } catch (error) { return apiError(error); }
}

export async function DELETE(request: NextRequest, context: RouteContext) {
  try {
    if (!isRole(getSession(request), "admin")) return NextResponse.json({ error: "Administrator access required." }, { status: 403 });
    const { id } = await context.params;
    if (!validId(id)) return NextResponse.json({ error: "Invalid doctor id." }, { status: 400 });
    await connectDatabase();
    const doctor = await Doctor.findByIdAndDelete(id);
    return doctor ? NextResponse.json({ success: true }) : NextResponse.json({ error: "Doctor not found." }, { status: 404 });
  } catch (error) { return apiError(error); }
}