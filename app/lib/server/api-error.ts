import { NextResponse } from "next/server";
import { ZodError } from "zod";

export function apiError(error: unknown) {
  if (error instanceof ZodError) return NextResponse.json({ error: "Invalid request", details: error.issues }, { status: 400 });
  if (error && typeof error === "object" && "code" in error && error.code === 11000) return NextResponse.json({ error: "That appointment slot is already booked." }, { status: 409 });
  if (error instanceof Error && (error.message.includes("MONGODB_URI") || error.message.includes("JWT_SECRET"))) return NextResponse.json({ error: "The API is not configured. Set the required server environment variables." }, { status: 503 });
  console.error("API request failed:", error);
  return NextResponse.json({ error: "The request could not be completed." }, { status: 500 });
}