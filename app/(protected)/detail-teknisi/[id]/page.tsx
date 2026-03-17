"use client"

import { useParams } from "next/navigation"
import TechnicianDetailView from "../TechnicianDetailView"

export default function DetailTeknisiByIdPage() {
  const params = useParams<{ id: string }>()
  const technicianId = Array.isArray(params.id) ? params.id[0] : params.id

  return <TechnicianDetailView technicianId={technicianId ?? ""} />
}
