"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight, CalendarDays, Check, Clock3, Power, ShieldCheck } from "lucide-react";
import { FancyButton } from "./fancy-button";

type DoctorProfile = { name: string; speciality: string; available: boolean };
type Visit = { _id: string; date: string; time: string; status: "booked" | "cancelled" | "completed"; userId?: { name?: string; email?: string } };

export function DoctorPortal() {
  const [doctor, setDoctor] = useState<DoctorProfile | null>(null);
  const [visits, setVisits] = useState<Visit[]>([]);
  const [message, setMessage] = useState("");

  useEffect(() => {
    let active = true;
    const load = async () => {
      const token = localStorage.getItem("prescripto-token");
      if (!token) { setMessage("Sign in with a clinician account to manage your schedule."); return; }
      const headers = { Authorization: `Bearer ${token}` };
      try {
        const [doctorResponse, visitResponse] = await Promise.all([fetch("/api/doctors/me", { headers }), fetch("/api/appointments", { headers })]);
        const [doctorResult, visitResult] = await Promise.all([doctorResponse.json(), visitResponse.json()]) as [{ doctor?: DoctorProfile; error?: string }, { appointments?: Visit[]; error?: string }];
        if (!active) return;
        if (!doctorResponse.ok || !doctorResult.doctor) { setMessage(doctorResult.error ?? "No clinician profile is linked to this account."); return; }
        setDoctor(doctorResult.doctor);
        setVisits(visitResult.appointments ?? []);
      } catch { if (active) setMessage("The clinician service is unavailable."); }
    };
    void load();
    return () => { active = false; };
  }, []);

  const updateVisit = async (visit: Visit, status: "cancelled" | "completed") => {
    const token = localStorage.getItem("prescripto-token") ?? "";
    try {
      const response = await fetch(`/api/appointments/${visit._id}`, { method: "PATCH", headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` }, body: JSON.stringify({ status }) });
      const result = await response.json() as { error?: string };
      if (!response.ok) { setMessage(result.error ?? "The appointment could not be updated."); return; }
      setVisits((current) => current.map((item) => item._id === visit._id ? { ...item, status } : item));
      setMessage(`Appointment marked ${status}.`);
    } catch { setMessage("The appointment service is unavailable."); }
  };

  const toggleAvailability = async () => {
    if (!doctor) return;
    const token = localStorage.getItem("prescripto-token") ?? "";
    try {
      const response = await fetch("/api/doctors/me", { method: "PATCH", headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` }, body: JSON.stringify({ available: !doctor.available }) });
      const result = await response.json() as { doctor?: DoctorProfile; error?: string };
      if (!response.ok || !result.doctor) { setMessage(result.error ?? "Availability could not be changed."); return; }
      setDoctor(result.doctor);
      setMessage(`You are now ${result.doctor.available ? "accepting" : "not accepting"} appointments.`);
    } catch { setMessage("The clinician service is unavailable."); }
  };

  const upcoming = visits.filter((visit) => visit.status === "booked");
  return <main className="page-shell subpage"><div className="breadcrumb"><Link href="/">Home</Link><span>/</span> Clinician portal</div>
    <div className="doctor-portal-heading"><div><p className="section-kicker">PRESCRIPTO / CLINICIAN</p><h1>{doctor?.name ?? "Your care desk"}</h1><p>{doctor?.speciality ?? "Schedule and availability"}</p></div><button className={`doctor-availability ${doctor?.available ? "is-open" : ""}`} onClick={() => void toggleAvailability()} disabled={!doctor}><Power size={15} /> {doctor?.available ? "Accepting visits" : "Availability paused"}</button></div>
    {message && <div className="admin-message" role="status">{message}{message.includes("Sign in") && <Link href="/login"> Sign in</Link>}</div>}
    <div className="doctor-portal-stats"><div className="glass-card"><span>UPCOMING</span><b>{upcoming.length}</b><small>Scheduled visits</small></div><div className="glass-card"><span>COMPLETED</span><b>{visits.filter((visit) => visit.status === "completed").length}</b><small>Care delivered</small></div><div className="glass-card"><span>AVAILABILITY</span><b>{doctor?.available ? "Open" : "Paused"}</b><small>Current booking status</small></div></div>
    <div className="doctor-visits-head"><div><span className="section-kicker">YOUR SCHEDULE</span><h2>Appointments</h2></div><span><ShieldCheck size={14} /> Private to your account</span></div>
    {visits.length === 0 ? <div className="empty-state glass-card"><div className="empty-icon"><CalendarDays size={21} /></div><h2>Your schedule is clear.</h2><p>New patient appointments will appear here.</p></div> : <div className="appointment-list">{visits.map((visit) => <article key={visit._id} className="appointment-row glass-card"><div className="visit-calendar"><CalendarDays size={18} /></div><div className="appointment-person"><span className="doctor-speciality">PATIENT</span><h3>{visit.userId?.name ?? visit.userId?.email ?? "Patient"}</h3><p>{visit.status}</p></div><div className="appointment-time"><span><CalendarDays size={15} />{visit.date}</span><span><Clock3 size={15} />{visit.time}</span></div><span className={`visit-status ${visit.status}`}>{visit.status}</span>{visit.status === "booked" ? <span className="visit-actions"><button onClick={() => void updateVisit(visit, "completed")} aria-label="Mark appointment completed" title="Mark completed"><Check size={16} /></button><button onClick={() => void updateVisit(visit, "cancelled")} aria-label="Cancel appointment" title="Cancel appointment">×</button></span> : <span />}</article>)}</div>}
    <div className="doctor-portal-footnote"><FancyButton variant="ghost-neon" onClick={() => window.location.reload()}>Refresh schedule <ArrowRight size={14} /></FancyButton></div>
  </main>;
}