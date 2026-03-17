"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import {
  ArrowLeft,
  ChevronRight,
  Clock,
  MapPin,
  ShieldCheck,
  Star,
} from "lucide-react"
import {
  screenToPath,
  technicianDetailPath,
  type Screen,
} from "@/types/navigation"
import { PageLoader } from "@/components/ui/PageLoader"

type Technician = {
  id: string
  name: string
  photo: string
  specialization: string
  rating: number
  totalJobs: number
  responseTime: string
  location: string
  verified: boolean
}

export default function TeknisiPage() {
  const router = useRouter()
  const navigate = (screen: Screen) => router.push(screenToPath(screen))
  const [technicians, setTechnicians] = useState<Technician[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    async function loadTechnicians() {
      try {
        setLoading(true)
        setError("")

        const response = await fetch("/api/technicians", {
          cache: "no-store",
        })

        if (!response.ok) {
          throw new Error("Gagal memuat daftar teknisi.")
        }

        const data = (await response.json()) as {
          technicians?: Technician[]
        }

        const items = (data.technicians || [])
          .sort((left, right) => {
            if (right.rating !== left.rating) {
              return right.rating - left.rating
            }

            return right.totalJobs - left.totalJobs
          })

        setTechnicians(items)
      } catch (loadError) {
        console.error("Failed to load technicians:", loadError)
        setError("Gagal memuat daftar teknisi.")
      } finally {
        setLoading(false)
      }
    }

    loadTechnicians()
  }, [])

  return (
    <div className="min-h-screen bg-[#F5F7FA]">
      <header className="sticky top-0 z-50 bg-white border-b border-[#E5E7EB] px-4 sm:px-6 lg:px-8 py-4 flex items-center gap-3">
        <button onClick={() => navigate("home")}>
          <ArrowLeft className="w-5 h-5 text-primary" />
        </button>

        <div className="flex-1">
          <h1 className="text-base sm:text-lg font-bold text-[#1F2937]">Daftar Teknisi</h1>
          <p className="text-xs sm:text-sm text-muted-foreground">
            Teknisi terverifikasi yang siap menerima booking.
          </p>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6 pb-12">
        {loading ? (
          <PageLoader message="Memuat daftar teknisi..." fullScreen={false} />
        ) : error ? (
          <div className="bg-white border border-[#E5E7EB] rounded-2xl p-6 text-center">
            <h2 className="text-lg text-[#1F2937] mb-2">Daftar teknisi belum tersedia</h2>
            <p className="text-sm text-[#6B6B6B] mb-5">{error}</p>
            <button
              onClick={() => navigate("home")}
              className="bg-primary text-white font-semibold text-sm rounded-2xl px-5 py-3 hover:opacity-90 transition-opacity"
            >
              Kembali ke Beranda
            </button>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            {technicians.map((technician) => (
              <button
                key={technician.id}
                onClick={() => router.push(technicianDetailPath(technician.id))}
                className="bg-white rounded-2xl border border-[#E5E7EB] p-5 text-left hover:shadow-md transition"
              >
                <div className="flex items-start gap-4">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#0288D1]/10 to-[#4FC3F7]/20 text-[#0288D1] flex items-center justify-center text-lg font-semibold shrink-0">
                    {technician.photo}
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <div>
                        <h2 className="text-base font-semibold text-[#1F2937]">
                          {technician.name}
                        </h2>
                        <p className="text-sm text-muted-foreground truncate">
                          {technician.specialization}
                        </p>
                      </div>

                      {technician.verified && (
                        <ShieldCheck className="w-5 h-5 text-primary shrink-0" />
                      )}
                    </div>

                    <div className="flex flex-wrap items-center gap-3 text-sm mb-3">
                      <span className="inline-flex items-center gap-1 text-[#1F2937]">
                        <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                        {technician.rating}
                      </span>
                      <span className="text-muted-foreground">
                        {technician.totalJobs} pekerjaan
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
                      <span className="inline-flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" />
                        {technician.responseTime}
                      </span>
                      <span className="inline-flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5" />
                        {technician.location}
                      </span>
                    </div>
                  </div>

                  <ChevronRight className="w-5 h-5 text-muted-foreground shrink-0 self-center" />
                </div>
              </button>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
