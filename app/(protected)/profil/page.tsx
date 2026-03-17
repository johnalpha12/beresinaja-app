"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import {
  ArrowLeft,
  User,
  Mail,
  Phone,
  History,
  ChevronRight,
  Settings,
  LogOut,
  Crown,
} from "lucide-react"
import { screenToPath, type Screen } from "@/types/navigation"
import BottomNav from "@/components/layout/BottomNav"
import { useAuth } from "@/context/AuthContext"
import { useUserData } from "@/hooks/useUserData"

export default function ProfilPage() {
  const router = useRouter()
  const navigate = (screen: Screen) => router.push(screenToPath(screen))
  const { user, logout } = useAuth()
  const { userData, loading } = useUserData()
  const [isLoggingOut, setIsLoggingOut] = useState(false)
  const [historyCounts, setHistoryCounts] = useState<{
    services: number
    transactions: number
  } | null>(null)

  const handleLogout = async () => {
    try {
      setIsLoggingOut(true)
      await logout()
      navigate("login")
    } catch (error) {
      console.error("Logout error:", error)
      alert("Gagal keluar. Silakan coba lagi.")
    } finally {
      setIsLoggingOut(false)
    }
  }

  const formatMemberSince = (timestamp?: number) => {
    if (!timestamp) return "Member Baru"
    const date = new Date(timestamp)
    const months = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt", "Nov", "Des"]
    return `${months[date.getMonth()]} ${date.getFullYear()}`
  }

  const stats = userData?.stats || { services: 0, transactions: 0, sellItems: 0 }
  const premiumBenefits =
    userData?.premium?.benefits || [
      "Gratis jemput-antar unlimited",
      "Garansi extended 60 hari",
      "Prioritas servis lebih cepat",
    ]
  const displayStats = {
    services: historyCounts?.services ?? stats.services,
    transactions: historyCounts?.transactions ?? stats.transactions,
    sellItems: stats.sellItems,
  }

  useEffect(() => {
    let isMounted = true

    async function loadHistoryCounts() {
      try {
        const [serviceResponse, transactionResponse] = await Promise.all([
          fetch("/api/content/service-history", {
            cache: "no-store",
          }),
          fetch("/api/content/transaction-history", {
            cache: "no-store",
          }),
        ])

        const [serviceData, transactionData] = await Promise.all([
          serviceResponse.ok
            ? ((await serviceResponse.json()) as { records?: unknown[] })
            : { records: [] },
          transactionResponse.ok
            ? ((await transactionResponse.json()) as { records?: unknown[] })
            : { records: [] },
        ])

        if (!isMounted) {
          return
        }

        setHistoryCounts({
          services: Array.isArray(serviceData.records)
            ? serviceData.records.length
            : stats.services,
          transactions: Array.isArray(transactionData.records)
            ? transactionData.records.length
            : stats.transactions,
        })
      } catch (error) {
        console.error("Failed to load profile history counts:", error)
      }
    }

    void loadHistoryCounts()

    return () => {
      isMounted = false
    }
  }, [stats.services, stats.transactions])

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((word) => word[0])
      .join("")
      .toUpperCase()
      .slice(0, 2)
  }

  if (loading) {
    return (
      <div className="flex flex-col min-h-screen bg-[#F5F7FA]">
        <div
          className="px-4 sm:px-6 lg:px-10 pt-8 sm:pt-10 pb-6 sm:pb-8"
          style={{ background: "linear-gradient(135deg, #2196F3 0%, #29B6F6 100%)" }}
        >
          <div className="flex items-center gap-3">
            <button onClick={() => navigate("home")} aria-label="Kembali" className="text-white hover:opacity-80">
              <ArrowLeft className="w-5 h-5 sm:w-6 sm:h-6" />
            </button>
            <h1 className="text-base sm:text-lg font-bold text-white">Profil Saya</h1>
          </div>
        </div>
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-muted-foreground">Memuat profil...</p>
          </div>
        </div>
        <BottomNav active="profile" navigate={navigate} />
      </div>
    )
  }

  return (
    <div className="flex flex-col min-h-screen bg-[#F5F7FA]">
      <div
        className="px-4 sm:px-6 lg:px-10 pt-8 sm:pt-10 pb-6 sm:pb-8"
        style={{ background: "linear-gradient(135deg, #2196F3 0%, #29B6F6 100%)" }}
      >
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate("home")}
            aria-label="Kembali"
            className="text-white hover:opacity-80 transition-opacity"
          >
            <ArrowLeft className="w-5 h-5 sm:w-6 sm:h-6" />
          </button>
          <h1 className="text-base sm:text-lg font-bold text-white">Profil Saya</h1>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto pb-24 flex flex-col gap-4 sm:gap-5 -mt-4">
        <div className="mx-4 sm:mx-6 lg:mx-10 bg-card rounded-2xl border border-border p-4 sm:p-5">
          <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-4">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-primary flex items-center justify-center shrink-0">
                {userData?.fullName ? (
                  <span className="text-primary-foreground font-bold text-lg sm:text-xl">
                    {getInitials(userData.fullName)}
                  </span>
                ) : (
                  <User className="w-6 h-6 sm:w-8 sm:h-8 text-primary-foreground" />
                )}
              </div>
              <div className="sm:hidden">
                <p className="text-base font-bold text-foreground">{userData?.fullName || "Pengguna"}</p>
                <p className="text-xs text-muted-foreground">
                  Member sejak {formatMemberSince(userData?.createdAt)}
                </p>
              </div>
            </div>
            <div className="hidden sm:block flex-1">
              <p className="text-base font-bold text-foreground">{userData?.fullName || "Pengguna"}</p>
              <p className="text-xs text-muted-foreground">
                Member sejak {formatMemberSince(userData?.createdAt)}
              </p>
            </div>
            <span className="inline-block sm:ml-auto bg-secondary text-primary text-xs font-semibold px-3 py-1.5 rounded-full border border-primary/20 whitespace-nowrap">
              {userData?.role === "teknisi" ? "Teknisi/Toko" : "Member Premium"}
            </span>
          </div>

          <div className="h-px bg-border mb-4" />

          <div className="grid grid-cols-3 gap-2 sm:gap-4">
            {[
              { value: String(displayStats.services), label: "Servis" },
              { value: String(displayStats.transactions), label: "Transaksi" },
              { value: String(displayStats.sellItems), label: "Jual Barang" },
            ].map(({ value, label }) => (
              <div key={label} className="flex flex-col items-center gap-0.5 p-2 sm:p-0">
                <span className="text-lg sm:text-xl font-bold text-primary">{value}</span>
                <span className="text-xs sm:text-sm text-muted-foreground text-center">{label}</span>
              </div>
            ))}
          </div>
        </div>

        {userData?.role !== "teknisi" && (
          <div className="mx-4 sm:mx-6 lg:mx-10 bg-secondary border border-primary/20 rounded-2xl p-4 sm:p-5">
            <div className="flex items-center gap-2 mb-2">
              <Crown className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-500" />
              <p className="text-sm sm:text-base font-bold text-foreground">Member Premium</p>
            </div>
            <p className="text-xs sm:text-sm text-muted-foreground mb-3">
              {userData?.premium?.isActive && userData?.premium?.expiresAt
                ? `Berlaku hingga ${new Date(userData.premium.expiresAt).toLocaleDateString("id-ID", {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                  })}`
                : "Member Standard"}
            </p>
            <ul className="flex flex-col gap-2">
              {premiumBenefits.map((benefit) => (
                <li key={benefit} className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary shrink-0" aria-hidden="true" />
                  <span className="text-xs sm:text-sm text-foreground">{benefit}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="mx-4 sm:mx-6 lg:mx-10">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2 px-1">Akun</p>
          <div className="bg-card rounded-2xl border border-border divide-y divide-border">
            {[
              { icon: User, label: "Nama Lengkap", sub: userData?.fullName || "-" },
              { icon: Mail, label: "Email", sub: userData?.email || user?.email || "-" },
              { icon: Phone, label: "Nomor HP", sub: userData?.phone || "-" },
            ].map(({ icon: Icon, label, sub }) => (
              <div key={label} className="flex items-center gap-3 px-4 py-3.5 sm:px-5 sm:py-4">
                <Icon className="w-4 h-4 sm:w-5 sm:h-5 text-primary shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm sm:text-base font-medium text-foreground">{label}</p>
                  <p className="text-xs sm:text-sm text-muted-foreground truncate">{sub}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="mx-4 sm:mx-6 lg:mx-10">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2 px-1">Layanan</p>
          <div className="bg-card rounded-2xl border border-border divide-y divide-border">
            {[
              {
                icon: History,
                label: "Riwayat Servis",
                sub: `${displayStats.services} servis`,
                nav: "serviceHistory" as Screen,
              },
              {
                icon: History,
                label: "Riwayat Transaksi",
                sub: `${displayStats.transactions} transaksi`,
                nav: "transactionHistory" as Screen,
              },
              { icon: Settings, label: "Pengaturan", sub: null, nav: "home" as Screen },
            ].map(({ icon: Icon, label, sub, nav }) => (
              <button
                key={label}
                onClick={() => navigate(nav)}
                className="w-full flex items-center gap-3 px-4 py-3.5 sm:px-5 sm:py-4 hover:bg-muted/50 transition-colors text-left"
              >
                <Icon className="w-4 h-4 sm:w-5 sm:h-5 text-primary shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm sm:text-base font-medium text-foreground">{label}</p>
                  {sub && <p className="text-xs sm:text-sm text-muted-foreground">{sub}</p>}
                </div>
                <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5 text-muted-foreground shrink-0" />
              </button>
            ))}
          </div>
        </div>

        <div className="mx-4 sm:mx-6 lg:mx-10">
          <button
            onClick={handleLogout}
            disabled={isLoggingOut}
            className="w-full bg-red-50 border border-red-200 text-red-500 font-semibold text-sm sm:text-base rounded-2xl py-3.5 sm:py-4 px-4 flex items-center justify-center gap-2 hover:bg-red-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoggingOut ? (
              <>
                <div className="w-4 h-4 border-2 border-red-500 border-t-transparent rounded-full animate-spin"></div>
                Keluar...
              </>
            ) : (
              <>
                <LogOut className="w-4 h-4 sm:w-5 sm:h-5" />
                Keluar
              </>
            )}
          </button>
        </div>

        {userData?.role === "teknisi" && (
          <div className="mx-4 sm:mx-6 lg:mx-10 text-center">
            <p className="text-xs text-muted-foreground">
              Anda terdaftar sebagai Teknisi/Toko
            </p>
          </div>
        )}
      </div>

      <BottomNav active="profile" navigate={navigate} />
    </div>
  )
}
