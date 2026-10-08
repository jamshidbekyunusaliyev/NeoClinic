import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { Doctor } from "../../models/Doctor";
import { apiError } from "../../lib/server/api-error";
import { getSession, isRole } from "../../lib/server/auth";
import { connectDatabase } from "../../lib/server/db";

const imageValue = z.string().max(7_000_000).refine((value) => value === "" || /^https?:\/\//.test(value) || /^data:image\/(png|jpeg|webp);base64,/.test(value));
const doctorSchema = z.object({ name: z.string().trim().min(2).max(100), speciality: z.string().trim().min(2).max(80), degree: z.string().trim().min(2).max(120), experience: z.number().int().min(0).max(60), fees: z.number().min(0).max(100000), availableToday: z.boolean().optional(), imageUrl: imageValue.optional(), bio: z.string().max(2000).optional() });
const querySchema = z.object({ fee: z.coerce.number().min(0).max(100000).optional(), experience: z.coerce.number().int().min(0).max(60).optional(), rating: z.coerce.number().min(0).max(5).optional() });

export async function GET(request: NextRequest) {
  try {
    if (!process.env.MONGODB_URI) return NextResponse.json({ doctors: [] });
    await connectDatabase();
    const params = request.nextUrl.searchParams;
    const query = params.get("q")?.trim();
    const speciality = params.get("speciality");
    const parsedFilters = querySchema.safeParse({ fee: params.get("fee") ?? undefined, experience: params.get("experience") ?? undefined, rating: params.get("rating") ?? undefined });
    if (!parsedFilters.success) return apiError(parsedFilters.error);
    const filter: Record<string, unknown> = {};
    if (query) filter.name = { $regex: query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), $options: "i" };
    if (speciality) filter.speciality = speciality;
    if (params.has("available")) filter.available = params.get("available") === "1";
    if (params.get("today") === "1") filter.availableToday = true;
    if (parsedFilters.data.fee !== undefined) filter.fees = { $lte: parsedFilters.data.fee };
    if (parsedFilters.data.experience !== undefined) filter.experience = { $gte: parsedFilters.data.experience };
    if (parsedFilters.data.rating !== undefined) filter.rating = { $gte: parsedFilters.data.rating };
    const sort: Record<string, 1 | -1> = params.get("sort") === "fee-low" ? { fees: 1 } : params.get("sort") === "experience" ? { experience: -1 } : { rating: -1 };
    const result = await Doctor.find(filter).select("name speciality degree experience fees rating reviews available availableToday bio").sort(sort).lean();
    return NextResponse.json({ doctors: result });
  } catch (error) { return apiError(error); }
}

export async function POST(request: NextRequest) {
  try {
    if (!isRole(getSession(request), "admin")) return NextResponse.json({ error: "Administrator access required." }, { status: 403 });
    await connectDatabase();
    const input = doctorSchema.parse(await request.json());
    const doctor = await Doctor.create(input);
    return NextResponse.json({ doctor }, { status: 201 });
  } catch (error) { return apiError(error); }
}