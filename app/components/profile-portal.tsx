"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight, Check, ShieldCheck } from "lucide-react";
import { FancyButton } from "./fancy-button";

type Profile = { name: string; email: string; phone?: string };

export function ProfilePortal() {
  const [profile, setProfile] = useState<Profile>({ name: "", email: "", phone: "" });
  const [message, setMessage] = useState("");
  const [saved, setSaved] = useState(false);
  const [requiresLogin, setRequiresLogin] = useState(false);

  useEffect(() => {
    const timer = window.setTimeout(async () => {
      const token = localStorage.getItem("prescripto-token");
      if (!token) { setMessage("Sign in to view and edit your profile."); setRequiresLogin(true); return; }
      try {
        const response = await fetch("/api/users/me", { headers: { Authorization: `Bearer ${token}` } });
        const result = await response.json() as { user?: Profile; error?: string };
        if (!response.ok || !result.user) { setMessage(result.error ?? "Unable to load your profile."); return; }
        setProfile(result.user);
      } catch { setMessage("The profile service is unavailable."); }
    }, 0);
    return () => window.clearTimeout(timer);
  }, []);

  const save = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const token = localStorage.getItem("prescripto-token");
    if (!token) { setMessage("Sign in to save profile changes."); return; }
    setMessage("");
    try {
      const response = await fetch("/api/users/me", { method: "PATCH", headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` }, body: JSON.stringify({ name: profile.name, phone: profile.phone }) });
      const result = await response.json() as { user?: Profile; error?: string };
      if (!response.ok || !result.user) { setMessage(result.error ?? "Unable to save profile changes."); return; }
      setProfile(result.user);
      setSaved(true);
    } catch { setMessage("The profile service is unavailable."); }
  };

  return <main className="page-shell subpage"><div className="breadcrumb"><Link href="/">Home</Link><span>/</span> My profile</div><div className="simple-page-heading"><p className="section-kicker">YOUR DETAILS</p><h1>My <span className="gradient-text">profile.</span></h1><p>Keep your information current for a smoother visit.</p></div>
    <form className="profile-form glass-card" onSubmit={save}>
      <div className="profile-avatar">{profile.name ? profile.name.split(" ").map((part) => part[0]).join("") : <ShieldCheck size={18} />}</div>
      <label>Full name<input required minLength={2} value={profile.name} onChange={(event) => { setProfile({ ...profile, name: event.target.value }); setSaved(false); }} /></label>
      <label>Email address<input readOnly type="email" value={profile.email} /></label>
      <label>Phone number<input type="tel" value={profile.phone ?? ""} onChange={(event) => { setProfile({ ...profile, phone: event.target.value }); setSaved(false); }} /></label>
      <div className="profile-form-footer"><span role="status">{saved ? <><Check size={14} /> Changes saved</> : message || "Your information is private and secure."}</span><FancyButton type="submit" variant="glow">Save changes <ArrowRight size={15} /></FancyButton></div>
      {requiresLogin && <Link href="/login" className="inline-link">Sign in to continue <ArrowRight size={13} /></Link>}
    </form>
  </main>;
}