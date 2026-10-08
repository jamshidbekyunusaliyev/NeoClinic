"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, CalendarDays, Clock3 } from "lucide-react";
import { doctors, type Doctor } from "../lib/doctors";
import { FancyLink } from "./fancy-button";

type Visit = { id: string; doctorId: string; date: string; time: string; status: "upcoming" | "completed" | "cancelled" };
type ServerVisit = { _id: string; doctorId: string | { _id: string }; date: string; time: string; status: string };
const storageKey = "prescripto-appointments";

function DoctorPhoto({ doctor }: { doctor: Doctor }) {
  return <div className="doctor-photo appointment-photo" style={{ backgroundImage: `url(https://images.unsplash.com/${doctor.image}?auto=format&fit=crop&w=180&q=75)`, backgroundColor: doctor.color }} role="img" aria-label={doctor.name} />;
}

export function AppointmentsPortal() {
  const [visits, setVisits] = useState<Visit[]>([]);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const timer = window.setTimeout(async () => {
      const token = localStorage.getItem("prescripto-token");
      if (!token) {
        try { setVisits(JSON.parse(localStorage.getItem(storageKey) ?? "[]") as Visit[]); } catch { setVisits([]); }
        return;
      }
      try {
        const response = await fetch("/api/appointments", { headers: { Authorization: `Bearer ${token}` } });
        const result = await response.json() as { appointments?: ServerVisit[]; error?: string };
        if (!response.ok) { setMessage(result.error ?? "Unable to load appointments."); return; }
        const mapped = (result.appointments ?? []).map((visit) => {
          const databaseId = typeof visit.doctorId === "string" ? visit.doctorId : visit.doctorId._id;
          const doctor = doctors.find((item) => item.databaseId === databaseId);
          return { id: visit._id, doctorId: doctor?.id ?? databaseId, date: visit.date, time: visit.time, status: visit.status === "completed" ? "completed" as const : visit.status === "cancelled" ? "cancelled" as const : "upcoming" as const };
        });
        setVisits(mapped);
      } catch { setMessage("The appointment service is unavailable."); }
    }, 0);
    return () => window.clearTimeout(timer);
  }, []);

  const cancel = async (visit: Visit) => {
    const token = localStorage.getItem("prescripto-token");
    if (token) {
      try {
        const response = await fetch(`/api/appointments/${visit.id}`, { method: "PATCH", headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` }, body: JSON.stringify({ status: "cancelled" }) });
        const result = await response.json() as { error?: string };
        if (!response.ok) { setMessage(result.error ?? "The appointment could not be cancelled."); return; }
      } catch { setMessage("The appointment service is unavailable."); return; }
    }
    const next = visits.map((item) => item.id === visit.id ? { ...item, status: "cancelled" as const } : item);
    setVisits(next);
    localStorage.setItem(storageKey, JSON.stringify(next));
    setMessage("");
  };

  const visible = visits.filter((visit) => visit.status !== "cancelled");
  return <main className="page-shell subpage"><div className="breadcrumb"><Link href="/">Home</Link><span>/</span> My appointments</div><div className="simple-page-heading"><p className="section-kicker">YOUR CARE, IN ONE PLACE</p><h1>My <span className="gradient-text">appointments.</span></h1><p>All your upcoming visits, together.</p></div>
    {message && <div className="admin-message" role="status">{message}</div>}
    {visible.length ? <div className="appointment-list"><AnimatePresence initial={false}>{visible.map((visit) => { const doctor = doctors.find((item) => item.id === visit.doctorId) ?? doctors[0]; return <motion.article key={visit.id} className="appointment-row glass-card" layout initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, height: 0, margin: 0, paddingBlock: 0 }}><DoctorPhoto doctor={doctor} /><div className="appointment-person"><span className="doctor-speciality">{doctor.speciality}</span><h3>{doctor.name}</h3><p>{doctor.degree}</p></div><div className="appointment-time"><span><CalendarDays size={15} />{new Date(`${visit.date}T12:00:00`).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })}</span><span><Clock3 size={15} />{visit.time}</span></div><span className={`appointment-status ${visit.status}`}><i />{visit.status === "upcoming" ? "Confirmed" : "Completed"}</span>{visit.status === "upcoming" ? <button className="cancel-appointment" onClick={() => void cancel(visit)}>Cancel visit</button> : <span />}</motion.article>; })}</AnimatePresence></div> : <div className="empty-state"><div className="empty-icon"><CalendarDays size={21} /></div><h2>A little room for what’s next.</h2><p>Your upcoming appointments will show up here.</p><FancyLink href="/doctors" variant="ghost-neon">Meet your doctor <ArrowRight size={15} /></FancyLink></div>}
  </main>;
}