import { NextRequest, NextResponse } from "next/server";
import { Appointment } from "../../../models/Appointment";
import { Doctor } from "../../../models/Doctor";
import { User } from "../../../models/User";
import { apiError } from "../../../lib/server/api-error";
import { getSession, isRole } from "../../../lib/server/auth";
import { connectDatabase } from "../../../lib/server/db";

export async function GET(request: NextRequest) {
  try {
    if (!isRole(getSession(request), "admin")) return NextResponse.json({ error: "Administrator access required." }, { status: 403 });
    await connectDatabase();
    const [doctors, patients, appointments, upcoming] = await Promise.all([
      Doctor.countDocuments(),
      User.countDocuments({ role: "user" }),
      Appointment.countDocuments(),
      Appointment.countDocuments({ status: "booked", date: { $gte: new Date().toISOString().slice(0, 10) } }),
    ]);
    return NextResponse.json({ doctors, patients, appointments, upcoming });
  } catch (error) { return apiError(error); }
}