import { Suspense } from "react";
import { PrescriptoApp } from "../components/prescripto-app";
import { AuthPortal } from "../components/auth-portal";
import { ProfilePortal } from "../components/profile-portal";
import { AdminPortal } from "../components/admin-portal";
import { DoctorPortal } from "../components/doctor-portal";
import { AppointmentsPortal } from "../components/appointments-portal";

async function SectionContent({ params }: { params: Promise<{ section: string }> }) {
  const { section } = await params;
  if (section === "login") return <AuthPortal />;
  if (section === "profile") return <ProfilePortal />;
  if (section === "admin") return <AdminPortal />;
  if (section === "doctor") return <DoctorPortal />;
  if (section === "appointments") return <AppointmentsPortal />;
  return <Suspense><PrescriptoApp section={section} /></Suspense>;
}

export default function SectionPage({ params }: { params: Promise<{ section: string }> }) {
  return <Suspense fallback={null}><SectionContent params={params} /></Suspense>;
}