"use client"

import { useEffect, useState, type ComponentType } from "react"
import { useRouter } from "next/navigation"
import {
  Bell,
  MessageCircle,
  Search,
  Wrench,
  ShoppingBag,
  DollarSign,
  MapPin,
  ChevronRight,
  Star,
  ShieldCheck,
} from "lucide-react"
import {
  normalizeScreen,
  screenToPath,
  technicianDetailPath,
  type Screen,
  type ScreenLike,
} from "@/types/navigation"
import BottomNav from "@/components/layout/BottomNav"
import { PageLoader } from "@/components/ui/PageLoader"
import { useUserData } from "@/hooks/useUserData"

type ServiceItem = {
  key: ScreenLike
  label: string
  iconKey: string
}

type Technician = {
  id: string
  name: string
  rating: number
  specialization: string
  photo: string
  verified: boolean
}

type Promo = {
  tag: string
  title: string
  description: string
  cta: string
}

const iconMap: Record<string, ComponentType<{ className?: string }>> = {
  Wrench,
  ShoppingBag,
  DollarSign,
  MapPin,
}

export default function BerandaPage() {
  const router = useRouter()
  const navigate = (screen: Screen) => router.push(screenToPath(screen))
  const { userData, loading: authLoading } = useUserData()
  const [services, setServices] = useState<ServiceItem[]>([])
  const [recommendedTechnicians, setRecommendedTechnicians] = useState<Technician[]>([])
  const [promo, setPromo] = useState<Promo | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!authLoading && userData?.role === "teknisi") {
      router.replace("/beranda-teknisi")
      return
    }

    if (!authLoading && userData?.role === "toko") {
      router.replace("/beranda-toko")
      return
    }

    if (authLoading || userData?.role !== "pengguna") {
      return
    }

    let isMounted = true

    async function loadContent() {
      try {
        setLoading(true)
        const response = await fetch("/api/home", {
          cache: "no-store",
        })

        if (!response.ok) {
          throw new Error("Gagal memuat data beranda.")
        }

        const data = (await response.json()) as {
          services?: ServiceItem[]
          recommendedTechnicians?: Technician[]
          promo?: Promo
        }

        if (!isMounted) {
          return
        }

        setServices(data.services || [])
        setPromo(data.promo || null)
        setRecommendedTechnicians(data.recommendedTechnicians || [])
      } catch (error) {
        console.error("Failed to load home content:", error)
      } finally {
        if (isMounted) {
          setLoading(false)
        }
      }
    }

    void loadContent()

    return () => {
      isMounted = false
    }
  }, [authLoading, router, userData?.role])

  const displayName = userData?.fullName || "Pengguna"
  const displayCity = userData?.city || "Medan"
  const isBusinessRole =
    userData?.role === "teknisi" || userData?.role === "toko"

  if (authLoading || loading || isBusinessRole) {
    return <PageLoader message="Memuat beranda..." />
  }

  return (
    <div className="min-h-screen bg-[#F5F7FA]">
      <header className="sticky top-0 z-50 bg-background shadow-sm px-4 sm:px-6 lg:px-8 pt-4 sm:pt-6 lg:pt-8 pb-3">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-bold relative">
                J
                <span className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-background" />
              </div>

              <div>
                <p className="font-bold">{displayName}</p>
                <p className="text-sm text-muted-foreground flex items-center gap-1">
                  <MapPin className="w-4 h-4" />
                  {displayCity}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => navigate("chatAi")}
                className="p-2 hover:bg-primary/10 rounded-full"
              >
                <MessageCircle className="w-6 h-6 text-primary" />
              </button>

              <button className="relative p-2 hover:bg-primary/10 rounded-full">
                <Bell className="w-6 h-6 text-primary" />
                <span className="absolute top-2 right-2 w-2.5 h-2.5 bg-red-500 rounded-full ring-2 ring-background" />
              </button>
            </div>
          </div>

          <div className="flex items-center gap-2 bg-white rounded-full px-4 py-3 border border-border focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20 transition-all">
            <Search className="w-5 h-5 text-muted-foreground" />
            <input
              type="text"
              placeholder="Cari teknisi, toko, atau produk..."
              className="w-full bg-transparent outline-none"
            />
          </div>
        </div>
      </header>

      <main className="pb-28 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto py-6 space-y-6">
        {promo && (
          <div
            className="rounded-2xl p-5 relative overflow-hidden"
            style={{ background: "linear-gradient(135deg, #2196F3 0%, #29B6F6 100%)" }}
          >
            <span className="inline-block bg-white/20 text-white text-xs px-3 py-1 rounded-full mb-2">
              {promo.tag}
            </span>

            <h2 className="text-white text-xl font-bold">
              {promo.title}
            </h2>

            <p className="text-white/80 text-xs mb-4 max-w-[250px]">
              {promo.description}
            </p>

            <button className="bg-white text-primary text-sm font-semibold px-5 py-2 rounded-full">
              {promo.cta}
            </button>
          </div>
        )}

        <section>
          <div className="flex justify-between mb-4">
            <h2 className="font-bold">Layanan Kami</h2>
            <button
              onClick={() => navigate("servisPerangkat")}
              className="text-primary text-sm flex items-center gap-1"
            >
              Lihat Semua <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {services.map(({ key, label, iconKey }) => {
              const Icon = iconMap[iconKey] || Wrench
              return (
                <button
                  key={key}
                  onClick={() => navigate(normalizeScreen(key))}
                  className="bg-card rounded-2xl border p-4 flex flex-col items-center gap-2 hover:shadow-md transition"
                >
                  <div className="w-12 h-12 rounded-xl bg-secondary flex items-center justify-center">
                    <Icon className="w-6 h-6 text-primary" />
                  </div>
                  <span className="text-sm font-medium text-center">
                    {label}
                  </span>
                </button>
              )
            })}
          </div>
        </section>

        <section>
          <div className="flex justify-between mb-4">
            <h2 className="font-bold">Teknisi Rekomendasi</h2>
            <button
              onClick={() => navigate("teknisi")}
              className="text-primary text-sm flex items-center gap-1"
            >
              Lihat Semua <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {recommendedTechnicians.map((tech) => (
              <button
                key={tech.id}
                onClick={() => router.push(technicianDetailPath(tech.id))}
                className="bg-card rounded-2xl border p-4 flex items-center gap-3 hover:shadow-md transition text-left"
              >
                <div className="w-12 h-12 rounded-full bg-secondary flex items-center justify-center font-semibold text-primary">
                  {tech.photo}
                </div>

                <div className="min-w-0 flex-1">
                  <p className="font-semibold">{tech.name}</p>
                  <div className="flex items-center gap-1 text-sm">
                    <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    {tech.rating}
                  </div>
                  <p className="text-xs text-muted-foreground truncate">
                    {tech.specialization}
                  </p>
                </div>

                {tech.verified && (
                  <ShieldCheck className="w-5 h-5 text-primary shrink-0" />
                )}
              </button>
            ))}
          </div>
        </section>
      </main>

      <BottomNav active="home" navigate={navigate} />
    </div>
  )
}
