"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import {
  screenToPath,
  technicianDetailPath,
} from "@/types/navigation"
import { PrimaryButton } from "@/components/ui/PrimaryButton"
import { PageLoader } from "@/components/ui/PageLoader"

export default function DetailTeknisiRedirectPage() {
  const router = useRouter()
  const [error, setError] = useState("")

  useEffect(() => {
    async function redirectToDefaultTechnician() {
      try {
        setError("")

        const response = await fetch("/api/technicians/default", {
          cache: "no-store",
        })

        if (!response.ok) {
          throw new Error("Konfigurasi detail teknisi belum tersedia.")
        }

        const { technicianId } = (await response.json()) as {
          technicianId?: string
        }

        if (!technicianId?.trim()) {
          throw new Error("technicianId belum diset di content/detail-teknisi.")
        }

        router.replace(technicianDetailPath(technicianId))
      } catch (loadError) {
        console.error("Failed to redirect technician detail page:", loadError)
        setError(
          loadError instanceof Error
            ? loadError.message
            : "Gagal membuka detail teknisi."
        )
      }
    }

    redirectToDefaultTechnician()
  }, [router])

  if (!error) {
    return <PageLoader message="Membuka detail teknisi..." />
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center px-6">
      <div className="max-w-md w-full bg-white rounded-2xl border border-[#E5E7EB] p-6 text-center">
        <h1 className="text-lg text-[#4A4A4A] mb-2">Detail teknisi belum tersedia</h1>
        <p className="text-sm text-[#6B6B6B] mb-5">{error}</p>
        <PrimaryButton
          label="Buka Daftar Teknisi"
          onClick={() => router.push(screenToPath("teknisi"))}
        />
      </div>
    </div>
  )
}
