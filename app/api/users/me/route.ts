import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { User } from "../../../models/User";
import { apiError } from "../../../lib/server/api-error";
import { getSession, isRole } from "../../../lib/server/auth";
import { connectDatabase } from "../../../lib/server/db";

const profileSchema = z.object({ name: z.string().trim().min(2).max(100).optional(), phone: z.string().trim().max(30).optional() }).strict();

export async function GET(request: NextRequest) {
  try {
    const session = getSession(request);
    if (!isRole(session, "user", "doctor")) return NextResponse.json({ error: "Authentication required." }, { status: 401 });
    await connectDatabase();
    const user = await User.findById(session!.id).select("name email phone role").lean();
    return user ? NextResponse.json({ user }) : NextResponse.json({ error: "Account not found." }, { status: 404 });
  } catch (error) { return apiError(error); }
}

export async function PATCH(request: NextRequest) {
  try {
    const session = getSession(request);
    if (!isRole(session, "user", "doctor")) return NextResponse.json({ error: "Authentication required." }, { status: 401 });
    const changes = profileSchema.parse(await request.json());
    await connectDatabase();
    const user = await User.findByIdAndUpdate(session!.id, changes, { new: true, runValidators: true }).select("name email phone role").lean();
    return user ? NextResponse.json({ user }) : NextResponse.json({ error: "Account not found." }, { status: 404 });
  } catch (error) { return apiError(error); }
}