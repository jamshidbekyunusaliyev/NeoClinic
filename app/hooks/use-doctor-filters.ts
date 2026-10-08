"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";

export type FilterValues = { query: string; speciality: string; fee: number; experience: number; rating: number; available: boolean; today: boolean; sort: string };
export const defaultFilters: FilterValues = { query: "", speciality: "", fee: 300, experience: 0, rating: 0, available: false, today: false, sort: "recommended" };

export function useDoctorFilters() {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const [filters, setFilters] = useState<FilterValues>(() => ({
    query: params.get("q") ?? "",
    speciality: params.get("speciality") ?? "",
    fee: Number(params.get("fee") ?? 300),
    experience: Number(params.get("experience") ?? 0),
    rating: Number(params.get("rating") ?? 0),
    available: params.get("available") === "1",
    today: params.get("today") === "1",
    sort: params.get("sort") ?? "recommended",
  }));

  const update = (key: keyof FilterValues, value: string | boolean | number) => {
    const next = { ...filters, [key]: value };
    setFilters(next);
    const query = new URLSearchParams();
    if (next.query) query.set("q", next.query);
    if (next.speciality) query.set("speciality", next.speciality);
    if (next.fee < 300) query.set("fee", String(next.fee));
    if (next.experience > 0) query.set("experience", String(next.experience));
    if (next.rating > 0) query.set("rating", String(next.rating));
    if (next.available) query.set("available", "1");
    if (next.today) query.set("today", "1");
    if (next.sort !== "recommended") query.set("sort", next.sort);
    router.replace(`${pathname}${query.size ? `?${query.toString()}` : ""}`, { scroll: false });
  };

  const reset = () => { setFilters(defaultFilters); router.replace(pathname, { scroll: false }); };
  return { filters, update, reset };
}