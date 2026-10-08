import jwt from "jsonwebtoken";
import type { NextRequest } from "next/server";

export type Role = "user" | "doctor" | "admin";
export type Session = { id: string; role: Role };

const jwtSecret = process.env.JWT_SECRET;

export function createToken(session: Session) {
  if (!jwtSecret) throw new Error("JWT_SECRET is required to issue authentication tokens.");
  return jwt.sign({ role: session.role }, jwtSecret, { subject: session.id, expiresIn: "7d" });
}

export function getSession(request: NextRequest): Session | null {
  if (!jwtSecret) return null;
  const token = request.headers.get("authorization")?.replace(/^Bearer\s+/i, "");
  if (!token) return null;
  try {
    const payload = jwt.verify(token, jwtSecret);
    if (typeof payload === "string" || !payload.sub || !["user", "doctor", "admin"].includes(String(payload.role))) return null;
    return { id: payload.sub, role: payload.role as Role };
  } catch {
    return null;
  }
}

export function isRole(session: Session | null, ...roles: Role[]) {
  return Boolean(session && roles.includes(session.role));
}