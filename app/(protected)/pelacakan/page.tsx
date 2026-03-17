"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import {
  ArrowLeft,
  Phone,
  MessageCircle,
  Clock,
  MapPin,
  Smartphone,
  Check,
} from "lucide-react"
import { screenToPath, type Screen } from "@/types/navigation"
import BottomNav from "@/components/layout/BottomNav"
import { PageLoader } from "@/components/ui/PageLoader"

type TrackingStep = {
  step: number
  label: string
  date: string | null
  desc: string | null
  status: "done" | "active" | "pending"
}

type TrackingData = {
  orderId: string
  statusBadge: string
  statusLabel: string
  deviceName: string
  deviceIssue: string
  eta: string
  pickupType: string
  technicianRating: string
  technicianCompleted: string
  steps: TrackingStep[]
}

export default function PelacakanPage() {
  const router = useRouter()
  const navigate = (screen: Screen) => router.push(screenToPath(screen))
  const [tracking, setTracking] = useState<TrackingData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadTracking() {
      try {
        setLoading(true)
        const response = await fetch("/api/orders/sample", {
          cache: "no-store",
        })

        if (!response.ok) {
          throw new Error("Gagal memuat data pelacakan.")
        }

        const data = (await response.json()) as { tracking?: TrackingData }
        setTracking(data.tracking || null)
      } catch (error) {
        console.error("Failed to load tracking data:", error)
      } finally {
        setLoading(false)
      }
    }

    loadTracking()
  }, [])

  if (loading) {
    return <PageLoader message="Memuat pelacakan servis..." />
  }

  return (
    <div
      className="min-h-screen bg-[#F5F7FA]"
      style={{
        paddingBottom: "calc(140px + env(safe-area-inset-bottom))",
      }}
    >
      <header className="sticky top-0 z-50 bg-background border-b border-border px-4 md:px-6 lg:px-8 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate("home")}>
            <ArrowLeft className="w-5 h-5 text-primary" />
          </button>

          <div>
            <h1 className="text-base md:text-lg font-bold">Tracking Servis</h1>
            <p className="text-xs text-muted-foreground">Order #{tracking?.orderId || "-"}</p>
          </div>
        </div>

        <span className="bg-secondary text-primary text-xs font-semibold px-3 py-1.5 rounded-full border border-primary/20">
          {tracking?.statusBadge || "-"}
        </span>
      </header>

      <main className="max-w-5xl mx-auto px-4 md:px-6 lg:px-8 space-y-4 mt-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-card rounded-2xl border border-border p-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-[#F5F7FA] rounded-xl flex items-center justify-center">
                <Smartphone className="w-5 h-5 text-primary" />
              </div>

              <div>
                <p className="text-sm font-bold">{tracking?.deviceName || "-"}</p>
                <p className="text-xs text-muted-foreground">
                  {tracking?.deviceIssue || "-"}
                </p>

                <div className="flex flex-wrap gap-3 mt-2">
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Clock className="w-3 h-3" />
                    ETA: {tracking?.eta || "-"}
                  </div>

                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <MapPin className="w-3 h-3" />
                    {tracking?.pickupType || "-"}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-card rounded-2xl border border-border p-4 flex justify-between items-center">
            <div>
              <p className="text-sm font-semibold">Teknisi Anda</p>
              <p className="text-xs text-muted-foreground">
                {tracking?.technicianRating || "-"} {"\u2022"} {tracking?.technicianCompleted || "-"}
              </p>
            </div>

            <div className="flex gap-2">
              <button className="w-9 h-9 rounded-full bg-secondary border border-primary/20 flex items-center justify-center">
                <Phone className="w-4 h-4 text-primary" />
              </button>

              <button className="w-9 h-9 rounded-full bg-secondary border border-primary/20 flex items-center justify-center">
                <MessageCircle className="w-4 h-4 text-primary" />
              </button>
            </div>
          </div>
        </div>

        <div className="bg-card rounded-2xl border border-border p-5">
          <h2 className="text-sm font-bold mb-6">Status Pengerjaan</h2>

          <div className="relative">
            {(tracking?.steps || []).map((item, index) => (
              <div
                key={item.step}
                className="flex gap-4 relative pb-8 last:pb-0"
              >
                {index !== (tracking?.steps || []).length - 1 && (
                  <div className="absolute left-4 top-8 w-0.5 h-full bg-border" />
                )}

                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold z-10 ${
                    item.status === "done"
                      ? "bg-primary text-white"
                      : item.status === "active"
                        ? "bg-primary text-white"
                        : "bg-white border-2 border-border text-muted-foreground"
                  }`}
                >
                  {item.status === "done" ? <Check className="w-4 h-4" /> : item.step}
                </div>

                <div>
                  <p
                    className={`text-sm font-semibold ${
                      item.status === "active"
                        ? "text-primary"
                        : item.status === "done"
                          ? "text-foreground"
                          : "text-muted-foreground"
                    }`}
                  >
                    {item.label}
                  </p>

                  {item.date && (
                    <p className="text-xs text-muted-foreground mt-1">
                      {item.date}
                    </p>
                  )}

                  {item.desc && (
                    <p className="text-xs text-muted-foreground mt-1">
                      {item.desc}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-6">
          <button className="w-full bg-primary text-white text-sm font-semibold py-3 rounded-xl shadow-md hover:opacity-90 transition">
            Konfirmasi Biaya Servis
          </button>
        </div>
      </main>

      <BottomNav active="tracking" navigate={navigate} />
    </div>
  )
}
