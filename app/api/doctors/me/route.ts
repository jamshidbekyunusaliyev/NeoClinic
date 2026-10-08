import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { Doctor } from "../../../models/Doctor";
import { apiError } from "../../../lib/server/api-error";
import { getSession, isRole } from "../../../lib/server/auth";
import { connectDatabase } from "../../../lib/server/db";

const availabilitySchema = z.object({ available: z.boolean() }).strict();

export async function GET(request: NextRequest) {
  try {
    const session = getSession(request);
    if (!isRole(session, "doctor")) return NextResponse.json({ error: "Clinician access required." }, { status: 403 });
    await connectDatabase();
    const doctor = await Doctor.findOne({ userId: session!.id }).select("name speciality degree experience fees rating reviews available bio").lean();
    return doctor ? NextResponse.json({ doctor }) : NextResponse.json({ error: "No clinician profile is linked to this account." }, { status: 404 });
  } catch (error) { return apiError(error); }
}

export async function PATCH(request: NextRequest) {
  try {
    const session = getSession(request);
    if (!isRole(session, "doctor")) return NextResponse.json({ error: "Clinician access required." }, { status: 403 });
    const { available } = availabilitySchema.parse(await request.json());
    await connectDatabase();
    const doctor = await Doctor.findOneAndUpdate({ userId: session!.id }, { available }, { new: true, runValidators: true }).select("name speciality available").lean();
    return doctor ? NextResponse.json({ doctor }) : NextResponse.json({ error: "No clinician profile is linked to this account." }, { status: 404 });
  } catch (error) { return apiError(error); }
}