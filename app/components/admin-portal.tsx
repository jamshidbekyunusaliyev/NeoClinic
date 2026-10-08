"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight, CalendarDays, ChevronDown, ImagePlus, Sparkles, Stethoscope } from "lucide-react";
import { specialities } from "../lib/doctors";
import { FancyButton } from "./fancy-button";

type ApiDoctor = { _id: string; name: string; speciality: string; degree: string; experience: number; fees: number; available: boolean };
type ApiAppointment = { _id: string; date: string; time: string; status: string; doctorId?: { name?: string }; userId?: { name?: string; email?: string } };
type Stats = { doctors: number; patients: number; appointments: number; upcoming: number };
type Tab = "Dashboard" | "Add doctor" | "Doctors list" | "Appointments";

export function AdminPortal() {
  const [tab, setTab] = useState<Tab>("Dashboard");
  const [stats, setStats] = useState<Stats>({ doctors: 0, patients: 0, appointments: 0, upcoming: 0 });
  const [doctorList, setDoctorList] = useState<ApiDoctor[]>([]);
  const [appointments, setAppointments] = useState<ApiAppointment[]>([]);
  const [imageData, setImageData] = useState("");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let active = true;
    const load = async () => {
      const token = localStorage.getItem("prescripto-token");
      if (!token) { setMessage("Sign in with an administrator account to manage Prescripto."); return; }
      const headers = { Authorization: `Bearer ${token}` };
      try {
        const [statsResponse, doctorsResponse, appointmentsResponse] = await Promise.all([
          fetch("/api/admin/stats", { headers }), fetch("/api/doctors", { headers }), fetch("/api/appointments", { headers }),
        ]);
        const [statsResult, doctorsResult, appointmentsResult] = await Promise.all([statsResponse.json(), doctorsResponse.json(), appointmentsResponse.json()]) as [{ error?: string } & Stats, { error?: string; doctors?: ApiDoctor[] }, { error?: string; appointments?: ApiAppointment[] }];
        if (!active) return;
        if (!statsResponse.ok) { setMessage(statsResult.error ?? "Administrator access is required."); return; }
        setStats(statsResult);
        setDoctorList(doctorsResult.doctors ?? []);
        setAppointments(appointmentsResult.appointments ?? []);
      } catch { if (active) setMessage("The admin service is unavailable."); }
    };
    void load();
    return () => { active = false; };
  }, []);

  const token = () => localStorage.getItem("prescripto-token") ?? "";
  const addDoctor = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formElement = event.currentTarget;
    setBusy(true);
    setMessage("");
    const form = new FormData(formElement);
    const payload = { name: String(form.get("name")), speciality: String(form.get("speciality")), degree: String(form.get("degree")), experience: Number(form.get("experience")), fees: Number(form.get("fees")), imageUrl: imageData, bio: String(form.get("bio") ?? "") };
    try {
      const response = await fetch("/api/doctors", { method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${token()}` }, body: JSON.stringify(payload) });
      const result = await response.json() as { error?: string; doctor?: ApiDoctor };
      if (!response.ok || !result.doctor) { setMessage(result.error ?? "The doctor profile could not be created."); return; }
      setDoctorList((current) => [result.doctor!, ...current]);
      setStats((current) => ({ ...current, doctors: current.doctors + 1 }));
      setImageData("");
      setMessage("Doctor profile created.");
      setTab("Doctors list");
      formElement.reset();
    } catch { setMessage("The doctor service is unavailable."); }
    finally { setBusy(false); }
  };

  const toggleAvailability = async (doctor: ApiDoctor) => {
    setMessage("");
    try {
      const response = await fetch(`/api/doctors/${doctor._id}`, { method: "PATCH", headers: { "Content-Type": "application/json", Authorization: `Bearer ${token()}` }, body: JSON.stringify({ available: !doctor.available }) });
      const result = await response.json() as { error?: string };
      if (!response.ok) { setMessage(result.error ?? "Availability could not be updated."); return; }
      setDoctorList((current) => current.map((item) => item._id === doctor._id ? { ...item, available: !doctor.available } : item));
    } catch { setMessage("The doctor service is unavailable."); }
  };

  const cancelAppointment = async (appointment: ApiAppointment) => {
    setMessage("");
    try {
      const response = await fetch(`/api/appointments/${appointment._id}`, { method: "PATCH", headers: { "Content-Type": "application/json", Authorization: `Bearer ${token()}` }, body: JSON.stringify({ status: "cancelled" }) });
      const result = await response.json() as { error?: string };
      if (!response.ok) { setMessage(result.error ?? "The appointment could not be cancelled."); return; }
      setAppointments((current) => current.filter((item) => item._id !== appointment._id));
      setStats((current) => ({ ...current, upcoming: Math.max(0, current.upcoming - 1) }));
    } catch { setMessage("The appointment service is unavailable."); }
  };

  const tabs: { label: Tab; icon: React.ReactNode }[] = [{ label: "Dashboard", icon: <Sparkles size={16} /> }, { label: "Add doctor", icon: <ImagePlus size={16} /> }, { label: "Doctors list", icon: <Stethoscope size={16} /> }, { label: "Appointments", icon: <CalendarDays size={16} /> }];
  return <main className="page-shell subpage admin-page">
    <aside className="admin-sidebar glass-card"><div className="admin-sidebar-label">WORKSPACE</div>{tabs.map(({ label, icon }) => <button key={label} onClick={() => setTab(label)} className={tab === label ? "admin-nav-item selected" : "admin-nav-item"}>{icon}{label}</button>)}<div className="admin-account"><div className="admin-avatar">AD</div><div><b>Admin desk</b><small>Administrator</small></div></div></aside>
    <section className="admin-content"><div className="admin-topline"><div><span className="section-kicker">PRESCRIPTO / ADMIN</span><h1>{tab}</h1></div><span className="admin-live"><i /> SYSTEM LIVE</span></div>
      {message && <div className={message.includes("created") ? "admin-message success" : "admin-message"} role="status">{message}</div>}
      {tab === "Dashboard" && <><div className="admin-stats"><div className="admin-stat glass-card"><span>DOCTORS</span><b>{stats.doctors}</b><small>Specialists in the directory</small></div><div className="admin-stat glass-card"><span>PATIENTS</span><b>{stats.patients}</b><small>Registered patient accounts</small></div><div className="admin-stat glass-card"><span>APPOINTMENTS</span><b>{stats.appointments}</b><small>{stats.upcoming} upcoming visits</small></div></div><div className="admin-dashboard-grid"><div className="admin-chart glass-card"><div className="admin-card-head"><div><span className="section-kicker">ACTIVITY / 7 DAYS</span><h2>Appointments</h2></div><span className="chart-period">Live totals <ChevronDown size={14} /></span></div><div className="chart-total">{stats.upcoming} <span>upcoming</span></div><div className="bar-chart">{[34, 50, 43, 70, 57, 86, 65].map((height, index) => <div key={index} className="bar-column"><i style={{ height: `${height}%` }} /><small>{["M", "T", "W", "T", "F", "S", "S"][index]}</small></div>)}</div></div><div className="admin-recent glass-card"><div className="admin-card-head"><div><span className="section-kicker">NEXT VISITS</span><h2>Upcoming appointments</h2></div><CalendarDays size={16} /></div>{appointments.slice(0, 4).map((appointment) => <div className="recent-row" key={appointment._id}><span className="recent-initial">{appointment.userId?.name?.slice(0, 1) ?? "P"}</span><span><b>{appointment.userId?.name ?? "Patient"}</b><small>{appointment.doctorId?.name ?? "Specialist"}</small></span><span className="recent-time">{appointment.time}</span></div>)}{appointments.length === 0 && <p className="admin-empty">No upcoming appointments.</p>}</div></div></>}
      {tab === "Add doctor" && <form className="admin-form glass-card" onSubmit={addDoctor}><span className="section-kicker">CARE TEAM / NEW PROFILE</span><h2>Add a specialist</h2><div className="admin-form-grid"><label>Doctor name<input name="name" required minLength={2} placeholder="Dr. Full Name" /></label><label>Speciality<select name="speciality" required defaultValue=""><option value="" disabled>Select speciality</option>{specialities.map((speciality) => <option key={speciality}>{speciality}</option>)}</select></label><label>Qualifications<input name="degree" required placeholder="MD · Specialty" /></label><label>Years of experience<input name="experience" required type="number" min="0" max="60" placeholder="Years" /></label><label>Consultation fee<input name="fees" required type="number" min="0" placeholder="$" /></label><label>Short bio<input name="bio" maxLength={2000} placeholder="A few words about the doctor" /></label></div><label className="upload-zone"><input type="file" accept="image/png,image/jpeg,image/webp" onChange={(event) => { const file = event.currentTarget.files?.[0]; if (!file) return; if (file.size > 5 * 1024 * 1024) { setMessage("Please choose an image smaller than 5 MB."); event.currentTarget.value = ""; return; } const reader = new FileReader(); reader.onload = () => setImageData(String(reader.result)); reader.readAsDataURL(file); }} /><span>{imageData ? <span className="image-preview" style={{ backgroundImage: `url(${imageData})` }} /> : <ImagePlus size={18} />} {imageData ? "Change profile photo" : "Upload profile photo"}</span><small>PNG, JPG or WebP · up to 5 MB</small></label><div className="admin-form-actions"><span>Profile is created as available.</span><FancyButton type="submit" variant="glow" loading={busy}>Add doctor <ArrowRight size={15} /></FancyButton></div></form>}
      {tab === "Doctors list" && <div className="admin-table glass-card"><div className="admin-table-heading"><span>DOCTOR</span><span>SPECIALITY</span><span>EXPERIENCE</span><span>STATUS</span><span>FEE</span></div>{doctorList.map((doctor) => <div className="admin-table-row" key={doctor._id}><span className="table-doctor"><span className="table-initial">{doctor.name.slice(0, 1)}</span><b>{doctor.name}</b></span><span>{doctor.speciality}</span><span>{doctor.experience} years</span><span className={doctor.available ? "table-status" : "table-status unavailable"}><i />{doctor.available ? "Available" : "Paused"}</span><button className="availability-action" onClick={() => void toggleAvailability(doctor)}>{doctor.available ? "Pause" : "Enable"}</button></div>)}</div>}
      {tab === "Appointments" && <div className="admin-table glass-card"><div className="admin-table-heading"><span>PATIENT</span><span>DOCTOR</span><span>DATE</span><span>STATUS</span><span>ACTION</span></div>{appointments.map((appointment) => <div className="admin-table-row" key={appointment._id}><span><b>{appointment.userId?.name ?? appointment.userId?.email ?? "Patient"}</b></span><span>{appointment.doctorId?.name ?? "Specialist"}</span><span>{appointment.date} · {appointment.time}</span><span className="table-status"><i /> {appointment.status}</span><button className="cancel-appointment" onClick={() => void cancelAppointment(appointment)}>Cancel</button></div>)}{appointments.length === 0 && <p className="admin-empty">No appointments to manage.</p>}</div>}
      {message.includes("Sign in") && <Link href="/login" className="inline-link">Go to sign in <ArrowRight size={14} /></Link>}
    </section>
  </main>;
}