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
import { screenToPath } from "@/types/navigation"
import { useUserData } from "@/hooks/useUserData"

type ServiceOrder = {
  id: string
  customerName: string
  customerAvatar: string
  serviceType: string
  deviceName: string
  issues: string[]
  location: string
  distance: string
  scheduledTime: string
  estimatedPrice: string
  status: "pending" | "accepted" | "in-progress" | "completed"
  priority: "normal" | "urgent"
}

export default function TechnicianHomePage() {
  const router = useRouter()
  const { userData, loading } = useUserData()
  const [activeTab, setActiveTab] = useState<"pending" | "active" | "history">(
    "pending"
  )

  useEffect(() => {
    if (loading || !userData?.role) {
      return
    }

    if (userData.role === "pengguna") {
      router.replace(screenToPath("home"))
      return
    }

    if (userData.role === "toko") {
      router.replace("/beranda-toko")
    }
  }, [loading, router, userData?.role])

  if (loading || userData?.role !== "teknisi") {
    return <PageLoader message="Menyiapkan beranda teknisi..." />
  }

  const technicianData = {
    name: userData.fullName || "Ahmad Hidayat",
    photo: "👨🔧",
    rating: 4.9,
    completedJobs: 532,
    todayEarnings: "Rp 850.000",
    monthlyEarnings: "Rp 12.500.000",
    availabilityStatus: "online" as const,
  }

  const stats = [
    { label: "Hari Ini", value: "3", subvalue: "order", icon: Calendar, color: "#0288D1" },
    { label: "Minggu Ini", value: "18", subvalue: "order", icon: TrendingUp, color: "#10B981" },
    { label: "Rating", value: "4.9", subvalue: "248 ulasan", icon: Star, color: "#F59E0B" },
    { label: "Response", value: "99%", subvalue: "< 15 menit", icon: Clock, color: "#8B5CF6" },
  ]

  const pendingOrders: ServiceOrder[] = [
    {
      id: "ORD-20240318-001",
      customerName: "Siti Nurhaliza",
      customerAvatar: "👩",
      serviceType: "Ganti LCD",
      deviceName: "iPhone 13 Pro",
      issues: ["LCD pecah", "Touchscreen tidak responsif"],
      location: "Kebayoran Baru, Jakarta Selatan",
      distance: "2.3 km",
      scheduledTime: "Hari ini, 14:00",
      estimatedPrice: "Rp 1.250.000",
      status: "pending",
      priority: "urgent",
    },
    {
      id: "ORD-20240318-002",
      customerName: "Budi Santoso",
      customerAvatar: "👨",
      serviceType: "Service Laptop",
      deviceName: "ASUS ROG",
      issues: ["Laptop lemot", "Sering restart"],
      location: "Senopati, Jakarta Selatan",
      distance: "3.8 km",
      scheduledTime: "Hari ini, 16:00",
      estimatedPrice: "Rp 350.000",
      status: "pending",
      priority: "normal",
    },
    {
      id: "ORD-20240318-003",
      customerName: "Diana Putri",
      customerAvatar: "👩💼",
      serviceType: "Ganti Baterai",
      deviceName: "Samsung Galaxy S22",
      issues: ["Baterai kembung", "Cepat panas"],
      location: "Kemang, Jakarta Selatan",
      distance: "1.5 km",
      scheduledTime: "Besok, 10:00",
      estimatedPrice: "Rp 450.000",
      status: "pending",
      priority: "normal",
    },
  ]

  const activeOrders: ServiceOrder[] = [
    {
      id: "ORD-20240318-004",
      customerName: "Eko Prasetyo",
      customerAvatar: "👨💼",
      serviceType: "Install Ulang Windows",
      deviceName: "Lenovo ThinkPad",
      issues: ["Windows error", "Blue screen"],
      location: "Blok M, Jakarta Selatan",
      distance: "1.2 km",
      scheduledTime: "Sedang berlangsung",
      estimatedPrice: "Rp 250.000",
      status: "in-progress",
      priority: "normal",
    },
  ]

  const handleAcceptOrder = (orderId: string) => {
    console.log("Accept order:", orderId)
  }

  const handleRejectOrder = (orderId: string) => {
    console.log("Reject order:", orderId)
  }

  const orders =
    activeTab === "pending"
      ? pendingOrders
      : activeTab === "active"
        ? activeOrders
        : []

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col">
      <div className="bg-gradient-to-br from-[#0288D1] to-[#4FC3F7] px-6 pt-6 pb-8">
        <div className="flex items-center justify-between mb-6">
          <button className="text-white p-2 hover:bg-white/10 rounded-full -ml-2">
            <Menu className="w-6 h-6" />
          </button>
          <div className="flex items-center gap-3">
            <button className="text-white p-2 hover:bg-white/10 rounded-full relative">
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
          <div className="w-16 h-16 rounded-2xl bg-white flex items-center justify-center text-4xl shadow-lg">
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
          {stats.map((stat) => {
            const Icon = stat.icon

            return (
              <div
                key={stat.label}
                className="bg-white rounded-xl p-3 shadow-md border border-[#E5E7EB]"
              >
                <Icon className="w-5 h-5 mb-2 mx-auto" style={{ color: stat.color }} />
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
            Order Baru ({pendingOrders.length})
          </button>
          <button
            onClick={() => setActiveTab("active")}
            className={`flex-1 py-2.5 rounded-full text-sm transition-all ${
              activeTab === "active"
                ? "bg-[#0288D1] text-white shadow-md"
                : "text-[#6B6B6B] hover:bg-[#F8FAFC]"
            }`}
          >
            Sedang Aktif ({activeOrders.length})
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
            {orders.map((order) => (
              <div
                key={order.id}
                className="bg-white rounded-2xl p-5 border border-[#E5E7EB] shadow-sm"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#0288D1] to-[#4FC3F7] flex items-center justify-center text-2xl">
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
                      label="Tolak"
                      onClick={() => handleRejectOrder(order.id)}
                      className="flex-1"
                    />
                    <div className="flex-[2]">
                      <PrimaryButton
                        label="Terima Order"
                        onClick={() => handleAcceptOrder(order.id)}
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
