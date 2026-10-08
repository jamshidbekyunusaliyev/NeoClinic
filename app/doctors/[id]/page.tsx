import { Suspense } from "react";
import { PrescriptoApp } from "../../components/prescripto-app";

async function DoctorContent({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <Suspense><PrescriptoApp section="doctors" doctorId={id} /></Suspense>;
}

export default function DoctorPage({ params }: { params: Promise<{ id: string }> }) {
  return <Suspense fallback={null}><DoctorContent params={params} /></Suspense>;
}