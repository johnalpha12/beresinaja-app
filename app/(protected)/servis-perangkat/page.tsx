"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import {
  ArrowLeft,
  Search,
  Monitor,
  Laptop,
  Printer,
  Smartphone,
  Video,
  ChevronRight,
} from "lucide-react"
import { normalizeScreen, screenToPath, type Screen, type ScreenLike } from "@/types/navigation"
import { PageLoader } from "@/components/ui/PageLoader"

type CategoryItem = {
  key: ScreenLike
  label: string
  iconKey: string
}

type ServisPerangkatContent = {
  categories: CategoryItem[]
  generalServices: string[]
  promo: { title: string; description: string }
}

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  Monitor,
  Laptop,
  Printer,
  Smartphone,
  Video,
}

export default function ServisPerangkatPage() {
  const router = useRouter()
  const navigate = (screen: Screen) => router.push(screenToPath(screen))
  const [content, setContent] = useState<ServisPerangkatContent | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadContent() {
      try {
        setLoading(true)
        const response = await fetch("/api/content/servis-perangkat", {
          cache: "no-store",
        })

        if (!response.ok) {
          throw new Error("Gagal memuat konten servis perangkat.")
        }

        const data = (await response.json()) as ServisPerangkatContent
        setContent(data)
      } catch (error) {
        console.error("Failed to load servis perangkat content:", error)
      } finally {
        setLoading(false)
      }
    }

    loadContent()
  }, [])

  if (loading) {
    return <PageLoader message="Memuat layanan servis perangkat..." />
  }

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <header className="flex items-center gap-3 px-4 lg:px-10 pt-10 pb-4 bg-background border-b border-border">
        <button
          onClick={() => navigate("home")}
          aria-label="Kembali"
          className="text-foreground"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-base font-bold text-foreground flex-1 text-center pr-5">
          Servis Perangkat
        </h1>
      </header>

      <div className="flex-1 overflow-y-auto pb-6 px-4 lg:px-10 pt-4 flex flex-col gap-4">
        <div className="flex items-center gap-2 bg-[#F5F7FA] rounded-full px-4 py-2.5 border border-border">
          <Search className="w-4 h-4 text-muted-foreground shrink-0" />
          <input
            type="text"
            placeholder="Cari perangkat atau keluhan servis..."
            className="flex-1 bg-transparent text-sm placeholder:text-muted-foreground outline-none"
            aria-label="Cari perangkat atau keluhan servis"
          />
        </div>

        {content?.promo && (
          <div
            className="rounded-2xl p-4"
            style={{ background: "linear-gradient(135deg, #2196F3 0%, #29B6F6 100%)" }}
          >
            <p className="text-white font-semibold text-sm">{content.promo.title}</p>
            <p className="text-white/80 text-xs mt-0.5">{content.promo.description}</p>
          </div>
        )}

        <section>
          <h2 className="text-sm font-bold text-foreground mb-3">Kategori Perangkat</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {(content?.categories || []).map(({ key, label, iconKey }, idx) => {
              const Icon = iconMap[iconKey] || Monitor
              return (
                <button
                  key={`${label}-${idx}`}
                  onClick={() => navigate(normalizeScreen(key))}
                  className="bg-card rounded-2xl border border-border p-4 flex flex-col items-center gap-2 hover:border-primary/40 hover:shadow-sm transition-all"
                >
                  <div className="w-12 h-12 rounded-2xl bg-primary flex items-center justify-center">
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <span className="text-xs font-medium text-foreground">{label}</span>
                </button>
              )
            })}
          </div>
        </section>

        <section>
          <h2 className="text-sm font-bold text-foreground mb-3">Layanan Umum</h2>
          <div className="flex flex-col gap-2">
            {(content?.generalServices || []).map((service) => (
              <button
                key={service}
                onClick={() => navigate("servisKomputer")}
                className="bg-card rounded-2xl border border-border px-4 py-3.5 flex items-center justify-between hover:border-primary/30 hover:shadow-sm transition-all"
              >
                <span className="text-sm text-foreground">{service}</span>
                <ChevronRight className="w-4 h-4 text-muted-foreground" />
              </button>
            ))}
          </div>
        </section>
      </div>
    </div>
  )
}
