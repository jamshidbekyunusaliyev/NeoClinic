"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useMemo, useState } from "react";
import { ArrowDown, ArrowRight, ArrowUpRight, CalendarDays, Check, ChevronDown, Clock3, HeartPulse, Menu, Search, ShieldCheck, Sparkles, Star, Stethoscope, UsersRound, X } from "lucide-react";
import { doctors, doctorImage, specialities, type Doctor } from "../lib/doctors";
import { useDoctorFilters, type FilterValues } from "../hooks/use-doctor-filters";
import { useDoctorCatalog } from "../hooks/use-doctor-catalog";
import { FancyButton, FancyLink } from "./fancy-button";

type Appointment = { id: string; doctorId: string; date: string; time: string; status: "upcoming" | "completed" | "cancelled" };
const storageKey = "prescripto-appointments";
const days = Array.from({ length: 7 }, (_, index) => {
  const date = new Date();
  date.setDate(date.getDate() + index);
  return date;
});
const slots = Array.from({ length: 17 }, (_, index) => `${String(10 + Math.floor(index / 2)).padStart(2, "0")}:${index % 2 ? "30" : "00"}`);
const dateKey = (date: Date) => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
const formatDate = (date: Date) => date.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });

function Photo({ doctor, className = "" }: { doctor: Doctor; className?: string }) {
  return <div className={`doctor-photo ${className}`} style={{ backgroundImage: `url('${doctorImage(doctor.image)}')`, backgroundColor: doctor.color }} role="img" aria-label={doctor.name} />;
}

function Wordmark() {
  return <Link href="/" className="wordmark" aria-label="Prescripto home"><span className="wordmark-icon"><HeartPulse size={19} /></span>prescripto<span className="wordmark-dot">.</span></Link>;
}

function SiteHeader({ active }: { active: string }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const navItems = [["Home", "/"], ["Find a doctor", "/doctors"], ["About", "/about"], ["Contact", "/contact"]];
  return (
    <header className="site-header">
      <div className="header-inner">
        <Wordmark />
        <nav className={`main-nav ${menuOpen ? "nav-open" : ""}`} aria-label="Main navigation">
          {navItems.map(([label, href]) => <Link key={href} href={href} onClick={() => setMenuOpen(false)} className={(active === href.slice(1) || (!active && href === "/")) ? "nav-link active" : "nav-link"}>{label}</Link>)}
        </nav>
        <div className="header-actions">
          <Link href="/appointments" className="header-icon-link" aria-label="My appointments"><CalendarDays size={17} /><span>My visits</span></Link>
          <Link href="/login" className="header-login">Sign in <ArrowUpRight size={14} /></Link>
          <button className="mobile-menu" onClick={() => setMenuOpen(!menuOpen)} aria-label="Toggle navigation">{menuOpen ? <X size={20} /> : <Menu size={20} />}</button>
        </div>
      </div>
    </header>
  );
}

function DoctorCard({ doctor, index = 0 }: { doctor: Doctor; index?: number }) {
  return (
    <motion.article className="doctor-card glass-card" layout initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.97 }} transition={{ duration: 0.32, delay: Math.min(index * 0.035, 0.2) }}>
      <Link href={`/doctors/${doctor.id}`} className="doctor-card-link" aria-label={`View ${doctor.name}`}>
        <div className="doctor-card-image-wrap"><Photo doctor={doctor} className="doctor-card-image" /><span className={`availability-dot ${doctor.available ? "is-available" : ""}`}><span />{doctor.available ? "Available" : "Fully booked"}</span><span className="doctor-card-arrow"><ArrowUpRight size={17} /></span></div>
        <div className="doctor-card-info"><div className="doctor-speciality">{doctor.speciality}</div><h3>{doctor.name}</h3><p>{doctor.degree}</p><div className="doctor-card-meta"><span><Star size={13} fill="currentColor" /> {doctor.rating.toFixed(2)} <span className="muted">({doctor.reviews})</span></span><span>{doctor.experience} yrs exp.</span></div><div className="doctor-card-bottom"><span>Consultation <strong>${doctor.fees}</strong></span><span className="book-link">View profile <ArrowRight size={14} /></span></div></div>
      </Link>
    </motion.article>
  );
}

function AnimatedDoctorGrid({ items }: { items: Doctor[] }) {
  return <div className="doctor-grid directory-grid"><AnimatePresence mode="popLayout">{items.map((doctor, index) => <DoctorCard key={doctor.id} doctor={doctor} index={index} />)}</AnimatePresence></div>;
}

function HomePage() {
  const catalog = useDoctorCatalog();
  return (
    <>
      <section className="hero-section page-shell">
        <div className="hero-copy">
          <div className="eyebrow"><span className="eyebrow-pulse" /> CARE THAT MOVES WITH YOU <span className="eyebrow-line" /></div>
          <h1>Book an appointment<br />with <span className="gradient-text">trusted doctors.</span></h1>
          <p className="hero-description">Good health starts with the right conversation. Meet exceptional doctors who make care feel a little more human.</p>
          <div className="hero-cta-row"><FancyLink href="/doctors" variant="glow">Find your doctor <ArrowRight size={16} /></FancyLink><a className="text-link" href="#how-it-works">How it works <ArrowDown size={14} /></a></div>
          <div className="patient-proof"><div className="avatar-stack">{["photo-1534528741775-53994a69daeb", "photo-1500648767791-00dcc994a43e", "photo-1531123897727-8f129e1688ce", "photo-1506794778202-cad84cf45f1d"].map((image) => <span key={image} style={{ backgroundImage: `url(https://images.unsplash.com/${image}?auto=format&fit=crop&w=90&q=75)` }} />)}</div><div><div className="proof-stars"><Star size={12} fill="currentColor" /> <b>4.9/5</b> <span>from 2,400+ patients</span></div><div className="proof-caption">Care that earns your trust.</div></div></div>
        </div>
        <div className="hero-visual">
          <div className="hero-image-frame"><div className="hero-image" role="img" aria-label="Doctor ready to care for patients" /><div className="hero-image-shade" /><div className="hero-image-label"><span className="image-label-icon"><ShieldCheck size={16} /></span><span><b>Care you can count on</b><small>Verified specialists, always</small></span></div><div className="hero-image-index">01 <span>/ 04</span></div></div>
          <div className="hero-floating-note"><div className="note-icon"><CalendarDays size={17} /></div><div><b>Appointments, made easy</b><small>Your health, on your time</small></div><span className="note-status"><Check size={12} /></span></div>
          <div className="hero-orbit orbit-one" /><div className="hero-orbit orbit-two" />
        </div>
        <div className="hero-side-label">A BETTER WAY TO FEEL BETTER <span>·</span> EST. 2024</div>
      </section>

      <section className="trust-strip page-shell"><div className="trust-intro">A more thoughtful<br />kind of healthcare.</div><div><b>12k<span>+</span></b><small>appointments booked</small></div><div><b>120<span>+</span></b><small>trusted specialists</small></div><div><b>4.9<span>/5</span></b><small>average patient rating</small></div><div className="trust-check"><ShieldCheck size={20} /><span>Private by design<br /><small>Your health stays yours.</small></span></div></section>

      <section className="featured-section page-shell" id="how-it-works"><div className="section-topline"><span>01 / MEET YOUR CARE TEAM</span><span className="section-rule" /></div><div className="section-heading-row"><div><p className="section-kicker">Care starts here</p><h2>People first.<br /><span className="muted-heading">Always.</span></h2></div><div className="section-heading-aside"><p>Great care begins with finding someone who gets you. Start with one of our most-loved specialists.</p><Link href="/doctors" className="inline-link">Meet all doctors <ArrowUpRight size={16} /></Link></div></div><div className="doctor-grid home-doctor-grid">{catalog.slice(0, 3).map((doctor, index) => <DoctorCard key={doctor.id} doctor={doctor} index={index} />)}</div><div className="section-bottom"><span>Thoughtfully matched to your needs</span><Link href="/doctors" className="inline-link">Explore the directory <ArrowRight size={15} /></Link></div></section>

      <section className="how-section page-shell"><div className="how-intro"><div className="section-topline"><span>02 / YOUR NEXT STEP</span><span className="section-rule" /></div><p className="section-kicker">Healthcare, without the hassle</p><h2>A little more<br /><span className="gradient-text">in your hands.</span></h2><p>From first search to follow-up, we make it easier to put your wellbeing first.</p></div><div className="steps-list"><div className="step-row"><span className="step-num">01</span><div><b>Find your person</b><p>Browse verified specialists by what matters to you.</p></div><ArrowUpRight size={17} /></div><div className="step-row"><span className="step-num">02</span><div><b>Choose your moment</b><p>See real availability and pick a time that fits.</p></div><ArrowUpRight size={17} /></div><div className="step-row"><span className="step-num">03</span><div><b>Feel good about care</b><p>Connect with your doctor, in person or online.</p></div><ArrowUpRight size={17} /></div></div></section>
      <Callout />
    </>
  );
}

function Callout() {
  return <section className="callout-section page-shell"><div className="callout-panel"><div className="callout-mark"><HeartPulse size={21} /></div><div><span className="section-kicker">YOUR NEXT CHAPTER IN GOOD HEALTH</span><h2>Care that feels<br />like it <span className="gradient-text">gets you.</span></h2></div><FancyLink href="/doctors" variant="liquid">Find your doctor <ArrowRight size={16} /></FancyLink><div className="callout-glow" /></div></section>;
}

export function DoctorFilter({ values, update, reset }: { values: FilterValues; update: (key: keyof FilterValues, value: string | boolean | number) => void; reset: () => void }) {
  return (
    <div className="filter-panel glass-card">
      <div className="filter-top-row"><div className="search-field"><Search size={17} /><input value={values.query} onChange={(event) => update("query", event.target.value)} placeholder="Search by doctor name" aria-label="Search by doctor name" /></div><button onClick={reset} className="reset-filters">Reset filters <X size={14} /></button></div>
      <div className="filter-group"><span className="filter-label">SPECIALITY</span><div className="speciality-chips"><button className={!values.speciality ? "speciality-chip selected" : "speciality-chip"} onClick={() => update("speciality", "")}>All doctors</button>{specialities.map((speciality) => <button key={speciality} className={values.speciality === speciality ? "speciality-chip selected" : "speciality-chip"} onClick={() => update("speciality", values.speciality === speciality ? "" : speciality)}>{speciality}</button>)}</div></div>
      <div className="range-filters"><label className="range-control"><span className="filter-label">CONSULTATION FEE <strong>Up to ${values.fee}</strong></span><input type="range" min="50" max="300" step="10" value={values.fee} onChange={(event) => update("fee", Number(event.target.value))} /></label><label className="range-control"><span className="filter-label">EXPERIENCE <strong>{values.experience === 0 ? "Any" : `${values.experience}+ years`}</strong></span><input type="range" min="0" max="20" step="1" value={values.experience} onChange={(event) => update("experience", Number(event.target.value))} /></label></div>
      <div className="filter-bottom-row"><div className="availability-filter"><span className="filter-label">AVAILABILITY</span><button onClick={() => update("available", !values.available)} className={`availability-toggle ${values.available ? "toggled" : ""}`}><span />Available now</button><button onClick={() => update("today", !values.today)} className={`availability-toggle ${values.today ? "toggled" : ""}`}><span />Today</button></div><label className="rating-select"><span className="filter-label">MINIMUM RATING</span><span className="select-wrap"><select value={values.rating} onChange={(event) => update("rating", Number(event.target.value))}><option value={0}>Any rating</option><option value={4.5}>4.5 and up</option><option value={4.8}>4.8 and up</option><option value={4.9}>4.9 and up</option></select><ChevronDown size={14} /></span></label><label className="sort-select"><span className="filter-label">SORT BY</span><span className="select-wrap"><select value={values.sort} onChange={(event) => update("sort", event.target.value)}><option value="recommended">Recommended</option><option value="rating">Highest rated</option><option value="fee-low">Fee: low to high</option><option value="experience">Most experienced</option></select><ChevronDown size={14} /></span></label></div>
    </div>
  );
}

function DoctorsPage() {
  const { filters, update, reset } = useDoctorFilters();
  const catalog = useDoctorCatalog();
  const filteredDoctors = useMemo(() => {
    const result = catalog.filter((doctor) => doctor.name.toLowerCase().includes(filters.query.toLowerCase()) && (!filters.speciality || doctor.speciality === filters.speciality) && doctor.fees <= filters.fee && doctor.experience >= filters.experience && doctor.rating >= filters.rating && (!filters.available || doctor.available) && (!filters.today || doctor.today));
    if (filters.sort === "rating") result.sort((a, b) => b.rating - a.rating);
    if (filters.sort === "fee-low") result.sort((a, b) => a.fees - b.fees);
    if (filters.sort === "experience") result.sort((a, b) => b.experience - a.experience);
    return result;
  }, [catalog, filters]);
  return <main className="page-shell subpage">
    <div className="breadcrumb"><Link href="/">Home</Link><span>/</span> Find a doctor</div>
    <div className="directory-heading"><div><p className="section-kicker">A good place to start</p><h1>Find the right<br /><span className="gradient-text">care for you.</span></h1></div><p>Good care is personal. Search our community of verified specialists and find the right person to talk to.</p></div>
    <DoctorFilter values={filters} update={update} reset={reset} />
    <div className="results-summary"><span><b>{filteredDoctors.length}</b> {filteredDoctors.length === 1 ? "doctor" : "doctors"} to meet</span><span>VERIFIED SPECIALISTS <ShieldCheck size={14} /></span></div>
    <AnimatedDoctorGrid items={filteredDoctors} />
    {filteredDoctors.length === 0 && <div className="empty-state"><div className="empty-icon"><Search size={21} /></div><h2>No matches just yet.</h2><p>Try a different name or relax a filter to see more of our care team.</p><FancyButton variant="ghost-neon" onClick={reset}>Reset filters <ArrowRight size={15} /></FancyButton></div>}
  </main>;
}

function DoctorDetails({ id }: { id: string }) {
  const router = useRouter();
  const catalog = useDoctorCatalog();
  const doctor = catalog.find((item) => item.id === id || item.databaseId === id) ?? doctors[0];
  const [selectedDay, setSelectedDay] = useState(0);
  const [selectedTime, setSelectedTime] = useState("");
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [showSuccess, setShowSuccess] = useState(false);
  const [remoteBooked, setRemoteBooked] = useState<string[]>([]);
  const [bookingError, setBookingError] = useState("");
  useEffect(() => {
    const timer = window.setTimeout(() => {
      try { setAppointments(JSON.parse(localStorage.getItem(storageKey) ?? "[]") as Appointment[]); } catch { setAppointments([]); }
    }, 0);
    return () => window.clearTimeout(timer);
  }, []);
  const dateString = dateKey(days[selectedDay]);
  useEffect(() => {
    let active = true;
    fetch(`/api/appointments?doctorId=${doctor.databaseId}&date=${dateString}`)
      .then(async (response) => response.ok ? response.json() as Promise<{ bookedSlots: string[] }> : { bookedSlots: [] })
      .then((result) => { if (active) setRemoteBooked(result.bookedSlots); })
      .catch(() => { if (active) setRemoteBooked([]); });
    return () => { active = false; };
  }, [dateString, doctor.databaseId]);
  useEffect(() => {
    if (!bookingError) return;
    const toast = document.createElement("div");
    toast.className = "booking-error-toast";
    toast.setAttribute("role", "alert");
    toast.textContent = bookingError;
    document.body.append(toast);
    const timer = window.setTimeout(() => toast.remove(), 4500);
    return () => { window.clearTimeout(timer); toast.remove(); };
  }, [bookingError]);
  const locallyBooked = appointments.filter((appointment) => appointment.doctorId === doctor.id && appointment.date === dateString && appointment.status !== "cancelled").map((appointment) => appointment.time);
  const booked = [...new Set([...locallyBooked, ...remoteBooked])];
  const book = async () => {
    if (!selectedTime) return;
    setBookingError("");
    const token = localStorage.getItem("prescripto-token");
    if (token) {
      try {
        const response = await fetch("/api/appointments", { method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` }, body: JSON.stringify({ doctorId: doctor.databaseId, date: dateString, time: selectedTime }) });
        if (!response.ok) {
          const result = await response.json() as { error?: string };
          setBookingError(result.error ?? "We could not book that time. Please choose another slot.");
          return;
        }
      } catch {
        setBookingError("The booking service is temporarily unavailable.");
        return;
      }
    }
    const next = [...appointments, { id: crypto.randomUUID(), doctorId: doctor.id, date: dateString, time: selectedTime, status: "upcoming" as const }];
    localStorage.setItem(storageKey, JSON.stringify(next));
    setAppointments(next);
    setShowSuccess(true);
  };
  return <main className="page-shell subpage"><div className="breadcrumb"><Link href="/">Home</Link><span>/</span><Link href="/doctors">Find a doctor</Link><span>/</span>{doctor.name}</div><section className="doctor-detail"><div className="detail-main glass-card"><Photo doctor={doctor} className="detail-photo" /><div className="detail-copy"><span className="detail-verified"><ShieldCheck size={14} /> VERIFIED SPECIALIST</span><p className="doctor-speciality">{doctor.speciality}</p><h1>{doctor.name}</h1><p className="detail-degree">{doctor.degree}</p><div className="detail-stats"><span><Star size={15} fill="currentColor" /> {doctor.rating} <small>({doctor.reviews} reviews)</small></span><span><Clock3 size={15} /> {doctor.experience} years experience</span></div><p className="detail-bio">{doctor.bio}</p><div className="detail-facts"><span><Check size={14} /> Board-certified</span><span><Check size={14} /> Patient-first care</span><span><Check size={14} /> Secure booking</span></div></div></div><aside className="booking-panel glass-card"><div className="booking-panel-heading"><span className="section-kicker">BOOK A VISIT</span><span className="booking-price">${doctor.fees}<small> / visit</small></span></div><h2>Choose a time<br />that works for you.</h2><p className="booking-note">All times shown in your local timezone.</p><span className="filter-label">SELECT A DAY</span><div className="day-picker">{days.map((date, index) => <button key={date.toISOString()} className={selectedDay === index ? "day-option selected" : "day-option"} onClick={() => { setSelectedDay(index); setSelectedTime(""); }}><small>{date.toLocaleDateString("en-US", { weekday: "short" })}</small><b>{date.getDate()}</b><span>{date.toLocaleDateString("en-US", { month: "short" })}</span></button>)}</div><span className="filter-label slot-label">AVAILABLE TIMES</span><div className="slot-grid">{slots.map((time, index) => { const unavailable = booked.includes(time) || (selectedDay === 0 && index % 7 === 1); return <button disabled={unavailable} key={time} className={`${selectedTime === time ? "selected" : ""}`} onClick={() => setSelectedTime(time)}>{time}</button>; })}</div><div className="booking-action"><FancyButton variant="glow" disabled={!selectedTime} onClick={book}>Confirm appointment <ArrowRight size={15} /></FancyButton><span><ShieldCheck size={13} /> Free cancellation up to 24h before</span></div></aside></section><AnimatePresence>{showSuccess && <motion.div className="modal-backdrop" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}><motion.div className="success-modal glass-card" initial={{ opacity: 0, y: 16, scale: 0.97 }} animate={{ opacity: 1, y: 0, scale: 1 }}><button className="modal-close" onClick={() => { setShowSuccess(false); router.push("/appointments"); }} aria-label="Close"><X size={18} /></button><div className="success-check"><Check size={25} /></div><p className="section-kicker">YOU&apos;RE ALL SET</p><h2>Your visit is booked.</h2><p>{doctor.name} · {formatDate(days[selectedDay])} at {selectedTime}</p><FancyButton variant="glow" onClick={() => router.push("/appointments")}>View my appointments <ArrowRight size={15} /></FancyButton></motion.div></motion.div>}</AnimatePresence></main>;
}

function AppointmentsPage() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  useEffect(() => {
    const timer = window.setTimeout(() => {
      try { setAppointments(JSON.parse(localStorage.getItem(storageKey) ?? "[]") as Appointment[]); } catch { setAppointments([]); }
    }, 0);
    return () => window.clearTimeout(timer);
  }, []);
  const cancel = (id: string) => { const next = appointments.map((appointment) => appointment.id === id ? { ...appointment, status: "cancelled" as const } : appointment); setAppointments(next); localStorage.setItem(storageKey, JSON.stringify(next)); };
  const visible = appointments.filter((appointment) => appointment.status !== "cancelled");
  return <main className="page-shell subpage"><div className="breadcrumb"><Link href="/">Home</Link><span>/</span> My appointments</div><div className="simple-page-heading"><p className="section-kicker">YOUR CARE, IN ONE PLACE</p><h1>My <span className="gradient-text">appointments.</span></h1><p>All your upcoming visits, together.</p></div>{visible.length ? <div className="appointment-list">{visible.map((appointment) => { const doctor = doctors.find((item) => item.id === appointment.doctorId) ?? doctors[0]; return <motion.article key={appointment.id} className="appointment-row glass-card" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}><Photo doctor={doctor} className="appointment-photo" /><div className="appointment-person"><span className="doctor-speciality">{doctor.speciality}</span><h3>{doctor.name}</h3><p>{doctor.degree}</p></div><div className="appointment-time"><span><CalendarDays size={15} />{new Date(`${appointment.date}T12:00:00`).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })}</span><span><Clock3 size={15} />{appointment.time}</span></div><span className="appointment-status"><i /> Confirmed</span><button className="cancel-appointment" onClick={() => cancel(appointment.id)}>Cancel visit</button></motion.article>; })}</div> : <div className="empty-state"><div className="empty-icon"><CalendarDays size={21} /></div><h2>A little room for what’s next.</h2><p>Your upcoming appointments will show up here.</p><Link href="/doctors"><FancyButton variant="ghost-neon">Meet your doctor <ArrowRight size={15} /></FancyButton></Link></div>}</main>;
}

function ProfilePage() {
  const [saved, setSaved] = useState(false);
  const [name, setName] = useState("Alex Morgan");
  const [email, setEmail] = useState("alex.morgan@email.com");
  return <main className="page-shell subpage"><div className="breadcrumb"><Link href="/">Home</Link><span>/</span> My profile</div><div className="simple-page-heading"><p className="section-kicker">YOUR DETAILS</p><h1>My <span className="gradient-text">profile.</span></h1><p>Keep your information current for a smoother visit.</p></div><form className="profile-form glass-card" onSubmit={(event) => { event.preventDefault(); setSaved(true); }}><div className="profile-avatar">{name.split(" ").map((part) => part[0]).join("")}</div><label>Full name<input value={name} onChange={(event) => { setName(event.target.value); setSaved(false); }} /></label><label>Email address<input type="email" value={email} onChange={(event) => { setEmail(event.target.value); setSaved(false); }} /></label><label>Phone number<input type="tel" defaultValue="+1 (555) 014-0928" /></label><label>Date of birth<input type="date" defaultValue="1991-06-14" /></label><div className="profile-form-footer"><span>{saved ? <><Check size={14} /> Changes saved</> : "Your information is private and secure."}</span><FancyButton type="submit" variant="glow">Save changes <ArrowRight size={15} /></FancyButton></div></form></main>;
}

function AuthPage() {
  const [isRegister, setIsRegister] = useState(false);
  const [complete, setComplete] = useState(false);
  return <main className="page-shell subpage auth-page"><div className="auth-aside"><span className="section-kicker">CARE, ON YOUR TERMS</span><h1>A healthier<br />you starts with<br /><span className="gradient-text">one hello.</span></h1><p>Trusted care should feel personal, simple, and easy to reach.</p><div className="auth-aside-note"><ShieldCheck size={17} /> Your health details stay private.</div></div><form className="auth-form glass-card" onSubmit={(event) => { event.preventDefault(); setComplete(true); }}><div className="auth-form-heading"><span className="section-kicker">{isRegister ? "A FRESH START" : "WELCOME BACK"}</span><h2>{isRegister ? "Create your account." : "Good to see you."}</h2><p>{isRegister ? "Join a more thoughtful kind of healthcare." : "Sign in to manage your care and appointments."}</p></div>{isRegister && <label>Full name<input required placeholder="Your name" /></label>}<label>Email address<input required type="email" placeholder="you@example.com" /></label><label>Password<input required minLength={8} type="password" placeholder="At least 8 characters" /></label><div className="auth-options"><label className="checkbox-label"><input type="checkbox" /> Remember me</label><button type="button" className="plain-link">Forgot password?</button></div><FancyButton type="submit" variant="glow">{isRegister ? "Create account" : "Sign in"} <ArrowRight size={15} /></FancyButton>{complete && <span className="inline-success"><Check size={14} /> Demo sign-in complete. Welcome to Prescripto.</span>}<div className="auth-switch">{isRegister ? "Already have an account?" : "New to Prescripto?"} <button type="button" onClick={() => { setIsRegister(!isRegister); setComplete(false); }}>{isRegister ? "Sign in" : "Create account"}</button></div></form></main>;
}

function AdminPage() {
  const [tab, setTab] = useState("Dashboard");
  const [doctorCount, setDoctorCount] = useState(doctors.length);
  const tabs = ["Dashboard", "Add doctor", "Doctors list", "Appointments"];
  // eslint-disable-next-line react/jsx-key
  return <main className="page-shell subpage admin-page"><aside className="admin-sidebar glass-card"><div className="admin-sidebar-label">WORKSPACE</div>{tabs.map((item, index) => <button key={item} onClick={() => setTab(item)} className={tab === item ? "admin-nav-item selected" : "admin-nav-item"}>{[<Sparkles size={16} />, <UsersRound size={16} />, <Stethoscope size={16} />, <CalendarDays size={16} />][index]}{item}</button>)}<div className="admin-account"><div className="admin-avatar">AD</div><div><b>Admin desk</b><small>Administrator</small></div></div></aside><section className="admin-content"><div className="admin-topline"><div><span className="section-kicker">PRESCRIPTO / ADMIN</span><h1>{tab}</h1></div><span className="admin-live"><i /> SYSTEM LIVE</span></div>{tab === "Dashboard" && <><div className="admin-stats"><div className="admin-stat glass-card"><span>DOCTORS</span><b>{doctorCount}</b><small><span>↗ 12%</span> this month</small></div><div className="admin-stat glass-card"><span>PATIENTS</span><b>2,481</b><small><span>↗ 8.4%</span> this month</small></div><div className="admin-stat glass-card"><span>APPOINTMENTS</span><b>846</b><small><span>↗ 16%</span> this month</small></div></div><div className="admin-dashboard-grid"><div className="admin-chart glass-card"><div className="admin-card-head"><div><span className="section-kicker">ACTIVITY / 7 DAYS</span><h2>Appointments</h2></div><button className="chart-period">This week <ChevronDown size={14} /></button></div><div className="chart-total">186 <span>visits</span></div><div className="bar-chart">{[46, 67, 52, 78, 61, 92, 70].map((height, index) => <div key={index} className="bar-column"><span className="bar-value">{height}</span><i style={{ height: `${height}%` }} /><small>{["M", "T", "W", "T", "F", "S", "S"][index]}</small></div>)}</div></div><div className="admin-recent glass-card"><div className="admin-card-head"><div><span className="section-kicker">TODAY</span><h2>Recent visits</h2></div><ArrowUpRight size={16} /></div>{doctors.slice(0, 4).map((doctor, i) => <div className="recent-row" key={doctor.id}><Photo doctor={doctor} className="recent-photo" /><span><b>{["Olivia Bennett", "Mateo Rivera", "Emma Johnson", "Noah Wilson"][i]}</b><small>{doctor.name}</small></span><span className="recent-time">{["09:30", "10:00", "11:30", "13:00"][i]}</span></div>)}</div></div></>}{tab === "Add doctor" && <form className="admin-form glass-card" onSubmit={(event) => { event.preventDefault(); setDoctorCount((count) => count + 1); setTab("Doctors list"); }}><span className="section-kicker">CARE TEAM / NEW PROFILE</span><h2>Add a specialist</h2><div className="admin-form-grid"><label>Doctor name<input required placeholder="Dr. Full Name" /></label><label>Speciality<select defaultValue=""><option value="" disabled>Select speciality</option>{specialities.map((speciality) => <option key={speciality}>{speciality}</option>)}</select></label><label>Qualifications<input required placeholder="MD · Specialty" /></label><label>Years of experience<input required type="number" min="0" placeholder="Years" /></label><label>Consultation fee<input required type="number" min="0" placeholder="$" /></label><label>Email address<input required type="email" placeholder="doctor@clinic.com" /></label></div><label className="upload-zone"><input type="file" accept="image/*" /><span><UsersRound size={18} /> Upload profile photo</span><small>PNG or JPG, up to 5 MB</small></label><div className="admin-form-actions"><span>Profile will be added as available.</span><FancyButton type="submit" variant="glow">Add doctor <ArrowRight size={15} /></FancyButton></div></form>}{tab === "Doctors list" && <div className="admin-table glass-card"><div className="admin-table-heading"><span>DOCTOR</span><span>SPECIALITY</span><span>EXPERIENCE</span><span>STATUS</span><span>FEE</span></div>{doctors.map((doctor) => <div className="admin-table-row" key={doctor.id}><span className="table-doctor"><Photo doctor={doctor} className="table-photo" /><b>{doctor.name}</b></span><span>{doctor.speciality}</span><span>{doctor.experience} years</span><span className="table-status"><i /> Available</span><span>${doctor.fees}</span></div>)}</div>}{tab === "Appointments" && <div className="admin-table glass-card"><div className="admin-table-heading"><span>PATIENT</span><span>DOCTOR</span><span>DATE</span><span>STATUS</span><span>ACTION</span></div>{["Olivia Bennett", "Mateo Rivera", "Emma Johnson", "Noah Wilson"].map((patient, index) => <div className="admin-table-row" key={patient}><span><b>{patient}</b></span><span>{doctors[index].name}</span><span>Oct {8 + index}, 2026</span><span className="table-status"><i /> Confirmed</span><button className="cancel-appointment">Cancel</button></div>)}</div>}</section></main>;
}

function InformationalPage({ type }: { type: string }) {
  if (type === "contact") return <main className="page-shell subpage contact-page"><div className="simple-page-heading"><p className="section-kicker">WE’RE HERE FOR YOU</p><h1>Let’s <span className="gradient-text">talk.</span></h1><p>Questions about finding care? Our team is happy to help.</p></div><div className="contact-layout"><div className="contact-details glass-card"><span className="section-kicker">PATIENT SUPPORT</span><h2>A real person,<br />ready to help.</h2><a href="mailto:hello@prescripto.health">hello@prescripto.health <ArrowUpRight size={14} /></a><span>Monday–Friday · 8am–6pm ET</span></div><form className="contact-form glass-card" onSubmit={(event) => { event.preventDefault(); alert("Thanks for reaching out. Our team will be in touch soon."); }}><label>Your name<input required placeholder="Name" /></label><label>Email address<input required type="email" placeholder="you@example.com" /></label><label>How can we help?<textarea required rows={4} placeholder="Tell us a little about it…" /></label><FancyButton type="submit" variant="glow">Send a message <ArrowRight size={15} /></FancyButton></form></div></main>;
  return <main className="page-shell subpage about-page"><div className="about-hero"><span className="section-kicker">A MORE HUMAN HEALTHCARE</span><h1>Care should feel<br /><span className="gradient-text">like care.</span></h1><p>We believe finding someone you trust shouldn’t be the hardest part of getting well. Prescripto helps people meet exceptional doctors, on their own terms.</p><Link href="/doctors"><FancyButton variant="glow">Meet our doctors <ArrowRight size={15} /></FancyButton></Link></div><div className="about-stats"><div><b>12k+</b><span>visits made simpler</span></div><div><b>120+</b><span>verified specialists</span></div><div><b>98%</b><span>would recommend us</span></div></div><section className="about-values"><div><span className="section-kicker">WHAT WE BELIEVE</span><h2>Better care starts<br />with being <span className="gradient-text">heard.</span></h2></div><p>We bring thoughtful people and thoughtful technology together. Every detail is designed to make healthcare feel a little less like a system and a little more like a relationship.</p></section></main>;
}

function SiteFooter() {
  return <footer className="site-footer page-shell"><div className="footer-main"><div><Wordmark /><p>Care that feels personal.<br />Healthcare that moves with you.</p></div><div className="footer-links"><div><b>EXPLORE</b><Link href="/doctors">Find a doctor</Link><Link href="/about">Our story</Link><Link href="/contact">Get in touch</Link></div><div><b>YOUR CARE</b><Link href="/appointments">Appointments</Link><Link href="/profile">My profile</Link><Link href="/login">Sign in</Link></div><div><b>FOR CLINICS</b><Link href="/admin">Admin portal</Link><a href="mailto:partners@prescripto.health">Partner with us</a></div></div></div><div className="footer-bottom"><span>© 2026 Prescripto Health, Inc.</span><span><ShieldCheck size={13} /> Your privacy is always a priority.</span><span>Made for better days <HeartPulse size={13} /></span></div></footer>;
}

export function PrescriptoApp({ section = "home", doctorId = "" }: { section?: string; doctorId?: string }) {
  const [showIntro, setShowIntro] = useState(false);
  useEffect(() => {
    if (sessionStorage.getItem("prescripto-intro-seen")) return;
    let finishTimer = 0;
    const startTimer = window.setTimeout(() => {
      setShowIntro(true);
      finishTimer = window.setTimeout(() => { setShowIntro(false); sessionStorage.setItem("prescripto-intro-seen", "1"); }, 1250);
    }, 0);
    return () => { window.clearTimeout(startTimer); window.clearTimeout(finishTimer); };
  }, []);
  const content = section === "home" ? <HomePage /> : section === "doctors" && doctorId ? <DoctorDetails id={doctorId} /> : section === "doctors" ? <DoctorsPage /> : section === "appointments" ? <AppointmentsPage /> : section === "profile" ? <ProfilePage /> : section === "login" ? <AuthPage /> : section === "admin" ? <AdminPage /> : section === "about" || section === "contact" ? <InformationalPage type={section} /> : <HomePage />;
  return <div className="site-frame"><SiteHeader active={section} /><AnimatePresence mode="wait"><motion.div key={`${section}-${doctorId}`} className="page-transition" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -5 }} transition={{ duration: 0.25 }}>{content}</motion.div></AnimatePresence><SiteFooter /><AnimatePresence>{showIntro && <motion.div className="intro-screen" initial={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.7 }}><div className="intro-logo"><span className="wordmark-icon"><HeartPulse size={22} /></span>prescripto<span className="wordmark-dot">.</span></div><div className="intro-progress"><motion.i initial={{ scaleX: 0 }} animate={{ scaleX: 1 }} transition={{ duration: 1.05, ease: "easeInOut" }} /></div><span className="intro-caption">A BETTER WAY TO FEEL BETTER</span></motion.div>}</AnimatePresence></div>;
}