"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import {
  Bell,
  Menu,
  Star,
  TrendingUp,
  Clock,
  Wrench,
  MapPin,
  Calendar,
  ChevronRight,
  DollarSign,
  Settings,
} from "lucide-react"
import { PageLoader } from "@/components/ui/PageLoader"
import { PrimaryButton } from "@/components/ui/PrimaryButton"
import { OutlineButton } from "@/components/ui/OutlineButton"
import { useAuth } from "@/context/AuthContext"
import { buildAuthHeaders } from "@/lib/auth"
import { screenToPath } from "@/types/navigation"
import type {
  TechnicianDashboardData,
  TechnicianDashboardOrder,
} from "@/types/dashboard"
import { NotificationScreen } from "@/components/NotificationScreen"

const technicianStatMeta = [
  { icon: Calendar, color: "#0288D1" },
  { icon: TrendingUp, color: "#10B981" },
  { icon: Star, color: "#F59E0B" },
  { icon: Clock, color: "#8B5CF6" },
] as const

type TechnicianDashboardResponse = {
  error?: string
  dashboard?: TechnicianDashboardData
}

export default function TechnicianHomePage() {
  const router = useRouter()
  const { user, userData, loading: authLoading } = useAuth()
  const [activeTab, setActiveTab] = useState<"pending" | "active" | "history">(
    "pending"
  )
  const [dashboard, setDashboard] = useState<TechnicianDashboardData | null>(null)
  const [dashboardLoading, setDashboardLoading] = useState(false)
  const [dashboardError, setDashboardError] = useState("")
  const [actionLoading, setActionLoading] = useState("")
  const [actionError, setActionError] = useState("")
  const [isViewingNotifications, setIsViewingNotifications] = useState(false)

  useEffect(() => {
    if (authLoading || !userData?.role) {
      return
    }

    if (userData.role === "pengguna") {
      router.replace(screenToPath("home"))
      return
    }

    if (userData.role === "toko") {
      router.replace("/beranda-toko")
      return
    }

    if (!user) {
      return
    }

    const currentUser = user

    let isMounted = true

    async function loadDashboard() {
      try {
        setDashboardLoading(true)
        setDashboardError("")

        const response = await fetch("/api/dashboard", {
          cache: "no-store",
          headers: await buildAuthHeaders(currentUser),
        })

        const data = (await response.json().catch(() => ({}))) as TechnicianDashboardResponse

        if (
          !response.ok ||
          !data.dashboard ||
          data.dashboard.role !== "teknisi"
        ) {
          throw new Error(data.error || "Gagal memuat dashboard teknisi.")
        }

        if (!isMounted) {
          return
        }

        setDashboard(data.dashboard)
      } catch (error) {
        console.error("Technician dashboard error:", error)

        if (!isMounted) {
          return
        }

        setDashboard(null)
        setDashboardError("Gagal memuat data beranda teknisi.")
      } finally {
        if (isMounted) {
          setDashboardLoading(false)
        }
      }
    }

    void loadDashboard()

    return () => {
      isMounted = false
    }
  }, [authLoading, router, user, userData?.role])

  if (authLoading || dashboardLoading || userData?.role !== "teknisi") {
    return <PageLoader message="Menyiapkan beranda teknisi..." />
  }

  if (!dashboard) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center px-6">
        <div className="max-w-md rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700">
          {dashboardError || "Data beranda teknisi belum tersedia."}
        </div>
      </div>
    )
  }

  const technicianData = dashboard.summary
  const stats = dashboard.stats
  const orders =
    activeTab === "pending"
      ? dashboard.orders.pending
      : activeTab === "active"
        ? dashboard.orders.active
        : dashboard.orders.history

  const mutateTechnicianDashboard = async (
    payload:
      | { action: "technician.acceptOrder"; orderId: string }
      | { action: "technician.rejectOrder"; orderId: string }
  ) => {
    if (!user) {
      return
    }

    try {
      setActionLoading(`${payload.action}:${payload.orderId}`)
      setActionError("")

      const response = await fetch("/api/dashboard", {
        method: "POST",
        headers: await buildAuthHeaders(user),
        body: JSON.stringify(payload),
      })

      const data = (await response.json().catch(() => ({}))) as TechnicianDashboardResponse

      if (!response.ok || !data.dashboard || data.dashboard.role !== "teknisi") {
        throw new Error(data.error || "Gagal memperbarui dashboard teknisi.")
      }

      setDashboard(data.dashboard)
    } catch (error) {
      console.error("Technician dashboard mutation error:", error)
      setActionError("Perubahan belum tersimpan ke Firebase. Coba lagi.")
    } finally {
      setActionLoading("")
    }
  }

  if (isViewingNotifications) {
    return <NotificationScreen role="teknisi" onBack={() => setIsViewingNotifications(false)} />
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col">
      <div className="bg-gradient-to-br from-[#0288D1] to-[#4FC3F7] px-6 pt-6 pb-8">
        <div className="flex items-center justify-between mb-6">
          <button className="text-white p-2 hover:bg-white/10 rounded-full -ml-2">
            <Menu className="w-6 h-6" />
          </button>
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setIsViewingNotifications(true)}
              className="text-white p-2 hover:bg-white/10 rounded-full relative"
            >
              <Bell className="w-6 h-6" />
              <div className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
            </button>
            <button
              onClick={() => router.push(screenToPath("profile"))}
              className="text-white p-2 hover:bg-white/10 rounded-full"
            >
              <Settings className="w-6 h-6" />
            </button>
          </div>
        </div>

        <div className="flex items-center gap-4 mb-6">
          <div className="w-16 h-16 rounded-2xl bg-white flex items-center justify-center text-2xl shadow-lg">
            {technicianData.photo}
          </div>
          <div className="flex-1 text-white">
            <h1 className="text-xl mb-1">Halo, {technicianData.name}!</h1>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1">
                <Star className="w-4 h-4 fill-yellow-300 text-yellow-300" />
                <span className="text-sm">{technicianData.rating}</span>
              </div>
              <span className="text-sm text-white/90">
                {technicianData.completedJobs} job selesai
              </span>
            </div>
          </div>
          <div
            className={`w-3 h-3 rounded-full animate-pulse shadow-lg ${
              technicianData.availabilityStatus === "online"
                ? "bg-[#10B981]"
                : "bg-[#EF4444]"
            }`}
          />
        </div>

        <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 border border-white/20">
          <div className="grid grid-cols-2 divide-x divide-white/20">
            <div className="pr-4">
              <div className="flex items-center gap-2 mb-1">
                <DollarSign className="w-4 h-4 text-white/80" />
                <span className="text-xs text-white/80">Hari Ini</span>
              </div>
              <p className="text-xl text-white">{technicianData.todayEarnings}</p>
            </div>
            <div className="pl-4">
              <div className="flex items-center gap-2 mb-1">
                <TrendingUp className="w-4 h-4 text-white/80" />
                <span className="text-xs text-white/80">Bulan Ini</span>
              </div>
              <p className="text-xl text-white">{technicianData.monthlyEarnings}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="px-6 -mt-4 mb-6">
        <div className="grid grid-cols-4 gap-3">
          {stats.map((stat, index) => {
            const meta = technicianStatMeta[index] || technicianStatMeta[0]
            const Icon = meta.icon

            return (
              <div
                key={stat.label}
                className="bg-white rounded-xl p-3 shadow-md border border-[#E5E7EB]"
              >
                <Icon className="w-5 h-5 mb-2 mx-auto" style={{ color: meta.color }} />
                <div className="text-center">
                  <div className="text-lg text-[#4A4A4A] mb-0.5">{stat.value}</div>
                  <div className="text-xs text-[#6B6B6B]">{stat.label}</div>
                  <div className="text-[10px] text-[#9CA3AF] mt-0.5">{stat.subvalue}</div>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      <div className="px-6 mb-4">
        <div className="bg-white rounded-full p-1 flex border border-[#E5E7EB]">
          <button
            onClick={() => setActiveTab("pending")}
            className={`flex-1 py-2.5 rounded-full text-sm transition-all ${
              activeTab === "pending"
                ? "bg-[#0288D1] text-white shadow-md"
                : "text-[#6B6B6B] hover:bg-[#F8FAFC]"
            }`}
          >
            Order Baru ({dashboard.orders.pending.length})
          </button>
          <button
            onClick={() => setActiveTab("active")}
            className={`flex-1 py-2.5 rounded-full text-sm transition-all ${
              activeTab === "active"
                ? "bg-[#0288D1] text-white shadow-md"
                : "text-[#6B6B6B] hover:bg-[#F8FAFC]"
            }`}
          >
            Sedang Aktif ({dashboard.orders.active.length})
          </button>
          <button
            onClick={() => setActiveTab("history")}
            className={`flex-1 py-2.5 rounded-full text-sm transition-all ${
              activeTab === "history"
                ? "bg-[#0288D1] text-white shadow-md"
                : "text-[#6B6B6B] hover:bg-[#F8FAFC]"
            }`}
          >
            Riwayat
          </button>
        </div>
      </div>

      {actionError && (
        <div className="px-6 mb-4">
          <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {actionError}
          </div>
        </div>
      )}

      <div className="flex-1 overflow-y-auto px-6 pb-6">
        {orders.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-20 h-20 bg-[#E5E7EB] rounded-full flex items-center justify-center mx-auto mb-4">
              <Wrench className="w-10 h-10 text-[#6B6B6B]" />
            </div>
            <h3 className="text-[#4A4A4A] mb-2">Belum Ada Order</h3>
            <p className="text-sm text-[#6B6B6B]">
              {activeTab === "pending" && "Order baru akan muncul di sini"}
              {activeTab === "active" && "Tidak ada pekerjaan yang sedang berlangsung"}
              {activeTab === "history" && "Belum ada riwayat pekerjaan"}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order: TechnicianDashboardOrder) => (
              <div
                key={order.id}
                className="bg-white rounded-2xl p-5 border border-[#E5E7EB] shadow-sm"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#0288D1] to-[#4FC3F7] flex items-center justify-center text-lg text-white">
                      {order.customerAvatar}
                    </div>
                    <div>
                      <h3 className="text-[#4A4A4A] mb-0.5">{order.customerName}</h3>
                      <p className="text-xs text-[#6B6B6B]">{order.id}</p>
                    </div>
                  </div>
                  {order.priority === "urgent" && (
                    <div className="bg-red-50 text-red-600 text-xs px-3 py-1 rounded-full border border-red-200">
                      Urgent
                    </div>
                  )}
                </div>

                <div className="bg-[#F8FAFC] rounded-xl p-4 mb-4">
                  <div className="flex items-start gap-3 mb-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#0288D1]/10 to-[#4FC3F7]/10 flex items-center justify-center flex-shrink-0">
                      <Wrench className="w-5 h-5 text-[#0288D1]" />
                    </div>
                    <div className="flex-1">
                      <h4 className="text-sm text-[#4A4A4A] mb-0.5">{order.serviceType}</h4>
                      <p className="text-xs text-[#6B6B6B]">{order.deviceName}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-[#0288D1]">{order.estimatedPrice}</p>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2 mb-3">
                    {order.issues.map((issue) => (
                      <span
                        key={issue}
                        className="text-xs text-[#0288D1] bg-[#0288D1]/5 px-2 py-1 rounded-md"
                      >
                        {issue}
                      </span>
                    ))}
                  </div>

                  <div className="grid grid-cols-2 gap-3 pt-3 border-t border-[#E5E7EB]">
                    <div>
                      <div className="flex items-center gap-1 text-xs text-[#6B6B6B] mb-1">
                        <MapPin className="w-3 h-3" />
                        <span>Lokasi</span>
                      </div>
                      <p className="text-xs text-[#4A4A4A]">{order.location}</p>
                      <p className="text-xs text-[#0288D1]">{order.distance} dari Anda</p>
                    </div>
                    <div>
                      <div className="flex items-center gap-1 text-xs text-[#6B6B6B] mb-1">
                        <Clock className="w-3 h-3" />
                        <span>Jadwal</span>
                      </div>
                      <p className="text-xs text-[#4A4A4A]">{order.scheduledTime}</p>
                    </div>
                  </div>
                </div>

                {order.status === "pending" ? (
                  <div className="flex gap-3">
                    <OutlineButton
                      label={
                        actionLoading === `technician.rejectOrder:${order.id}`
                          ? "Menyimpan..."
                          : "Tolak"
                      }
                      onClick={() =>
                        void mutateTechnicianDashboard({
                          action: "technician.rejectOrder",
                          orderId: order.id,
                        })
                      }
                      disabled={actionLoading !== "" && actionLoading.includes(order.id)}
                      className="flex-1"
                    />
                    <div className="flex-[2]">
                      <PrimaryButton
                        label={
                          actionLoading === `technician.acceptOrder:${order.id}`
                            ? "Menyimpan..."
                            : "Terima Order"
                        }
                        onClick={() =>
                          void mutateTechnicianDashboard({
                            action: "technician.acceptOrder",
                            orderId: order.id,
                          })
                        }
                        disabled={actionLoading !== "" && actionLoading.includes(order.id)}
                      />
                    </div>
                  </div>
                ) : (
                  <button className="w-full flex items-center justify-between p-3 rounded-xl bg-[#0288D1]/5 text-[#0288D1] hover:bg-[#0288D1]/10 transition-colors">
                    <span className="text-sm">Lihat Detail Pekerjaan</span>
                    <ChevronRight className="w-5 h-5" />
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
