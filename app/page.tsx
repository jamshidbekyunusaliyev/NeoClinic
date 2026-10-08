import { Suspense } from "react";
import { PrescriptoApp } from "./components/prescripto-app";

export default function Home() {
  return <Suspense><PrescriptoApp /></Suspense>;
}