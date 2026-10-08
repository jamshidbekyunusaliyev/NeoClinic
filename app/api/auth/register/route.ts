import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { User } from "../../../models/User";
import { apiError } from "../../../lib/server/api-error";
import { connectDatabase } from "../../../lib/server/db";
import { createToken } from "../../../lib/server/auth";

const registerSchema = z.object({ name: z.string().trim().min(2).max(100), email: z.email().max(254), password: z.string().min(8).max(100) });

export async function POST(request: NextRequest) {
  try {
    const input = registerSchema.parse(await request.json());
    await connectDatabase();
    const email = input.email.toLowerCase();
    if (await User.exists({ email })) return NextResponse.json({ error: "An account with this email already exists." }, { status: 409 });
    const user = await User.create({ name: input.name, email, passwordHash: await bcrypt.hash(input.password, 12) });
    const token = createToken({ id: String(user._id), role: user.role });
    return NextResponse.json({ token, user: { id: user.id, name: user.name, email: user.email, role: user.role } }, { status: 201 });
  } catch (error) { return apiError(error); }
}