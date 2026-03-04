import { useState } from "react"
import LandingPage from "./LandingPage"
import Portal from "./Portal"

export default function App() {
  const path = window.location.pathname
  if (path.startsWith("/app")) return <Portal />
  return <LandingPage />
}