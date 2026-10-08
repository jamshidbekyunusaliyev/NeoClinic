"use client";

import { useEffect, useState } from "react";
import { doctors, type Doctor } from "../lib/doctors";

type ApiDoctor = { _id: string; name: string; speciality: string; degree: string; experience: number; fees: number; rating: number; reviews: number; available: boolean; availableToday?: boolean; bio?: string };

export function useDoctorCatalog() {
  const [catalog, setCatalog] = useState(doctors);
  useEffect(() => {
    let active = true;
    fetch("/api/doctors")
      .then(async (response) => response.ok ? response.json() as Promise<{ doctors: ApiDoctor[] }> : null)
      .then((result) => {
        if (!active || !result?.doctors?.length) return;
        const mapped = result.doctors.map((item, index): Doctor => {
          const databaseId = String(item._id);
          const seeded = doctors.find((doctor) => doctor.databaseId === databaseId);
          const fallback = seeded ?? doctors[index % doctors.length];
          return { ...fallback, id: seeded?.id ?? databaseId, databaseId, name: item.name, speciality: item.speciality, degree: item.degree, experience: item.experience, fees: item.fees, rating: item.rating, reviews: item.reviews, available: item.available, today: item.availableToday ?? fallback.today, bio: item.bio ?? fallback.bio };
        });
        setCatalog(mapped);
      })
      .catch(() => undefined);
    return () => { active = false; };
  }, []);
  return catalog;
}