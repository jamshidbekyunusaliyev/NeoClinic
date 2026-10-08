"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowRight, Check, ShieldCheck } from "lucide-react";
import { FancyButton } from "./fancy-button";

type AuthResponse = { token?: string; user?: { id: string; name: string; email: string; role: string }; error?: string };

export function AuthPortal() {
  const router = useRouter();
  const [register, setRegister] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [complete, setComplete] = useState(false);

  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setMessage("");
    const form = new FormData(event.currentTarget);
    const payload = Object.fromEntries(form.entries());
    try {
      const response = await fetch(`/api/auth/${register ? "register" : "login"}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const result = await response.json() as AuthResponse;
      if (!response.ok || !result.token || !result.user) {
        setMessage(result.error ?? "Unable to sign in. Check your details and try again.");
        return;
      }
      localStorage.setItem("prescripto-token", result.token);
      localStorage.setItem("prescripto-user", JSON.stringify(result.user));
      setComplete(true);
      window.setTimeout(() => router.push("/appointments"), 650);
    } catch {
      setMessage("The account service is unavailable. Check your connection and try again.");
    } finally {
      setLoading(false);
    }
  };

  return <main className="page-shell subpage auth-page">
    <div className="auth-aside"><span className="section-kicker">CARE, ON YOUR TERMS</span><h1>A healthier<br />you starts with<br /><span className="gradient-text">one hello.</span></h1><p>Trusted care should feel personal, simple, and easy to reach.</p><div className="auth-aside-note"><ShieldCheck size={17} /> Your health details stay private.</div></div>
    <form className="auth-form glass-card" onSubmit={submit}>
      <div className="auth-form-heading"><span className="section-kicker">{register ? "A FRESH START" : "WELCOME BACK"}</span><h2>{register ? "Create your account." : "Good to see you."}</h2><p>{register ? "Join a more thoughtful kind of healthcare." : "Sign in to manage your care and appointments."}</p></div>
      {register && <label>Full name<input name="name" required minLength={2} placeholder="Your name" /></label>}
      <label>Email address<input name="email" required type="email" placeholder="you@example.com" /></label>
      <label>Password<input name="password" required minLength={8} type="password" placeholder="At least 8 characters" /></label>
      {!register && <div className="auth-options"><label className="checkbox-label"><input type="checkbox" /> Remember me</label><span className="plain-link">JWT-secured sign in</span></div>}
      <FancyButton type="submit" variant="glow" loading={loading}>{register ? "Create account" : "Sign in"} <ArrowRight size={15} /></FancyButton>
      {message && <span className="form-error" role="alert">{message}</span>}
      {complete && <span className="inline-success"><Check size={14} /> Signed in. Taking you to your appointments.</span>}
      <div className="auth-switch">{register ? "Already have an account?" : "New to Prescripto?"} <button type="button" onClick={() => { setRegister(!register); setMessage(""); }}>{register ? "Sign in" : "Create account"}</button></div>
      <Link href="/doctors" className="auth-browse-link">Browse doctors without an account <ArrowRight size={13} /></Link>
    </form>
  </main>;
}