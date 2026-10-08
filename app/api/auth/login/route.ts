import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { User } from "../../../models/User";
import { apiError } from "../../../lib/server/api-error";
import { connectDatabase } from "../../../lib/server/db";
import { createToken } from "../../../lib/server/auth";

const loginSchema = z.object({ email: z.email().max(254), password: z.string().min(1).max(100) });

export async function POST(request: NextRequest) {
  try {
    const input = loginSchema.parse(await request.json());
    await connectDatabase();
    const user = await User.findOne({ email: input.email.toLowerCase() });
    if (!user || !(await bcrypt.compare(input.password, user.passwordHash))) return NextResponse.json({ error: "Email or password is incorrect." }, { status: 401 });
    const token = createToken({ id: String(user._id), role: user.role });
    return NextResponse.json({ token, user: { id: user.id, name: user.name, email: user.email, role: user.role } });
  } catch (error) { return apiError(error); }
}