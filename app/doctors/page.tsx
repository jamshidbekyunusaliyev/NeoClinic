import { Suspense } from "react";
import { PrescriptoApp } from "../components/prescripto-app";

export default function DoctorsPage() {
  return <Suspense><PrescriptoApp section="doctors" /></Suspense>;
}