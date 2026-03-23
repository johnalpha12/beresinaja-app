"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import {
  Bell,
  Menu,
  TrendingUp,
  Package,
  ShoppingCart,
  DollarSign,
  Eye,
  Star,
  ChevronRight,
  Plus,
  Settings,
  BarChart3,
  Box,
} from "lucide-react"
import { PageLoader } from "@/components/ui/PageLoader"
import { StatusChip } from "@/components/ui/StatusChip"
import { PrimaryButton } from "@/components/ui/PrimaryButton"
import { useAuth } from "@/context/AuthContext"
import { buildAuthHeaders } from "@/lib/auth"
import { screenToPath } from "@/types/navigation"
import type {
  StoreDashboardData,
  StoreDashboardOrder,
  StoreDashboardProduct,
} from "@/types/dashboard"
import AddProductScreen from "@/components/AddProductScreen"

const storeStatMeta = [
  { icon: ShoppingCart, color: "#0288D1" },
  { icon: DollarSign, color: "#10B981" },
  { icon: Package, color: "#8B5CF6" },
  { icon: Star, color: "#F59E0B" },
] as const

type StoreDashboardResponse = {
  error?: string
  dashboard?: StoreDashboardData
}

export default function StoreHomePage() {
  const router = useRouter()
  const { user, userData, loading: authLoading } = useAuth()
  const [activeTab, setActiveTab] = useState<"products" | "orders">("orders")
  const [dashboard, setDashboard] = useState<StoreDashboardData | null>(null)
  const [dashboardLoading, setDashboardLoading] = useState(false)
  const [dashboardError, setDashboardError] = useState("")
  const [actionLoading, setActionLoading] = useState("")
  const [actionError, setActionError] = useState("")
  const [isAddingProduct, setIsAddingProduct] = useState(false)

  useEffect(() => {
    if (authLoading || !userData?.role) {
      return
    }

    if (userData.role === "pengguna") {
      router.replace(screenToPath("home"))
      return
    }

    if (userData.role === "teknisi") {
      router.replace("/beranda-teknisi")
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

        const data = (await response.json().catch(() => ({}))) as StoreDashboardResponse

        if (
          !response.ok ||
          !data.dashboard ||
          data.dashboard.role !== "toko"
        ) {
          throw new Error(data.error || "Gagal memuat dashboard toko.")
        }

        if (!isMounted) {
          return
        }

        setDashboard(data.dashboard)
      } catch (error) {
        console.error("Store dashboard error:", error)

        if (!isMounted) {
          return
        }

        setDashboard(null)
        setDashboardError("Gagal memuat data beranda toko.")
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

  if (authLoading || dashboardLoading || userData?.role !== "toko") {
    return <PageLoader message="Menyiapkan beranda toko..." />
  }

  if (!dashboard) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center px-6">
        <div className="max-w-md rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700">
          {dashboardError || "Data beranda toko belum tersedia."}
        </div>
      </div>
    )
  }

  const storeData = dashboard.summary
  const stats = dashboard.stats
  const pendingOrders = dashboard.pendingOrders
  const topProducts = dashboard.topProducts

  const getOrderStatusType = (status: StoreDashboardOrder["status"]) => {
    switch (status) {
      case "completed":
        return "completed" as const
      case "shipped":
      case "processing":
        return "in-progress" as const
      case "pending":
      default:
        return "pending" as const
    }
  }

  const getOrderStatusText = (status: StoreDashboardOrder["status"]) => {
    switch (status) {
      case "completed":
        return "Selesai"
      case "shipped":
        return "Dikirim"
      case "processing":
        return "Diproses"
      case "pending":
      default:
        return "Menunggu"
    }
  }

  const getProductStatusType = (status: StoreDashboardProduct["status"]) => {
    switch (status) {
      case "active":
        return "completed" as const
      case "low-stock":
      case "out-of-stock":
      default:
        return "pending" as const
    }
  }

  const getProductStatusText = (status: StoreDashboardProduct["status"]) => {
    switch (status) {
      case "active":
        return "Aktif"
      case "low-stock":
        return "Stok Menipis"
      case "out-of-stock":
      default:
        return "Stok Habis"
    }
  }

  const mutateStoreDashboard = async (
    payload:
      | { action: "store.addProduct"; productData?: any }
      | { action: "store.processOrder"; orderId: string }
  ) => {
    if (!user) {
      return
    }

    try {
      setActionLoading(payload.action === "store.addProduct" ? "add-product" : payload.orderId)
      setActionError("")

      const response = await fetch("/api/dashboard", {
        method: "POST",
        headers: await buildAuthHeaders(user),
        body: JSON.stringify(payload),
      })

      const data = (await response.json().catch(() => ({}))) as StoreDashboardResponse

      if (!response.ok || !data.dashboard || data.dashboard.role !== "toko") {
        throw new Error(data.error || "Gagal memperbarui dashboard toko.")
      }

      setDashboard(data.dashboard)
    } catch (error) {
      console.error("Store dashboard mutation error:", error)
      setActionError("Perubahan belum tersimpan ke Firebase. Coba lagi.")
    } finally {
      setActionLoading("")
    }
  }

  if (isAddingProduct) {
    return (
      <AddProductScreen 
        onBack={() => setIsAddingProduct(false)}
        onSuccess={async (productData) => {
          await mutateStoreDashboard({ action: "store.addProduct", productData })
          setIsAddingProduct(false)
        }}
      />
    )
  }

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
            {storeData.logo}
          </div>
          <div className="flex-1 text-white">
            <h1 className="text-xl mb-1">{storeData.name}</h1>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1">
                <Star className="w-4 h-4 fill-yellow-300 text-yellow-300" />
                <span className="text-sm">{storeData.rating}</span>
              </div>
              <span className="text-sm text-white/90">
                {storeData.totalProducts} produk
              </span>
            </div>
          </div>
          <div
            className={`w-3 h-3 rounded-full animate-pulse shadow-lg ${
              storeData.storeStatus === "open" ? "bg-[#10B981]" : "bg-[#EF4444]"
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
              <p className="text-xl text-white">{storeData.todaySales}</p>
            </div>
            <div className="pl-4">
              <div className="flex items-center gap-2 mb-1">
                <TrendingUp className="w-4 h-4 text-white/80" />
                <span className="text-xs text-white/80">Bulan Ini</span>
              </div>
              <p className="text-xl text-white">{storeData.monthlySales}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="px-6 -mt-4 mb-6">
        <div className="grid grid-cols-4 gap-3">
          {stats.map((stat, index) => {
            const meta = storeStatMeta[index] || storeStatMeta[0]
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

      <div className="px-6 mb-6">
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => setIsAddingProduct(true)}
            disabled={actionLoading !== ""}
            className="bg-gradient-to-br from-[#0288D1] to-[#4FC3F7] text-white rounded-2xl p-4 flex items-center justify-center gap-2 shadow-md hover:shadow-lg transition-shadow disabled:opacity-60"
          >
            <Plus className="w-5 h-5" />
            <span className="text-sm">
              {actionLoading === "add-product" ? "Menyimpan..." : "Tambah Produk"}
            </span>
          </button>
          <button className="bg-white text-[#0288D1] border-2 border-[#0288D1] rounded-2xl p-4 flex items-center justify-center gap-2 hover:bg-[#0288D1]/5 transition-colors">
            <BarChart3 className="w-5 h-5" />
            <span className="text-sm">Lihat Statistik</span>
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

      <div className="px-6 mb-4">
        <div className="bg-white rounded-full p-1 flex border border-[#E5E7EB]">
          <button
            onClick={() => setActiveTab("orders")}
            className={`flex-1 py-2.5 rounded-full text-sm transition-all ${
              activeTab === "orders"
                ? "bg-[#0288D1] text-white shadow-md"
                : "text-[#6B6B6B] hover:bg-[#F8FAFC]"
            }`}
          >
            Pesanan Masuk ({pendingOrders.length})
          </button>
          <button
            onClick={() => setActiveTab("products")}
            className={`flex-1 py-2.5 rounded-full text-sm transition-all ${
              activeTab === "products"
                ? "bg-[#0288D1] text-white shadow-md"
                : "text-[#6B6B6B] hover:bg-[#F8FAFC]"
            }`}
          >
            Produk Terlaris
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-6 pb-6">
        {activeTab === "orders" ? (
          <div className="space-y-4">
            {pendingOrders.map((order) => (
              <div
                key={order.id}
                className="bg-white rounded-2xl p-5 border border-[#E5E7EB] shadow-sm hover:border-[#0288D1] hover:shadow-md transition-all"
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
                  <StatusChip
                    statusText={getOrderStatusText(order.status)}
                    statusType={getOrderStatusType(order.status)}
                    className="text-xs px-2.5 py-1"
                  />
                </div>

                <div className="bg-[#F8FAFC] rounded-xl p-4 mb-3">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-sm text-[#4A4A4A]">{order.productName}</h4>
                    <span className="text-xs text-[#6B6B6B]">{order.quantity}x</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-[#6B6B6B]">{order.orderDate}</span>
                    <span className="text-sm text-[#0288D1]">{order.totalPrice}</span>
                  </div>
                </div>

                {order.status === "pending" && (
                  <div className="flex gap-3">
                    <PrimaryButton
                      label={actionLoading === order.id ? "Menyimpan..." : "Proses Pesanan"}
                      onClick={() =>
                        void mutateStoreDashboard({
                          action: "store.processOrder",
                          orderId: order.id,
                        })
                      }
                      disabled={actionLoading !== "" && actionLoading !== order.id}
                    />
                  </div>
                )}

                {order.status === "processing" && (
                  <button className="w-full flex items-center justify-between p-3 rounded-xl bg-[#0288D1]/5 text-[#0288D1] hover:bg-[#0288D1]/10 transition-colors">
                    <span className="text-sm">Lihat Detail Pesanan</span>
                    <ChevronRight className="w-5 h-5" />
                  </button>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            {topProducts.map((product) => (
              <div
                key={product.id}
                className="bg-white rounded-2xl p-5 border border-[#E5E7EB] shadow-sm hover:border-[#0288D1] hover:shadow-md transition-all"
              >
                <div className="flex gap-4">
                  <div className="w-20 h-20 rounded-xl bg-gradient-to-br from-[#0288D1]/10 to-[#4FC3F7]/10 flex items-center justify-center text-xl text-[#0288D1] flex-shrink-0">
                    {product.image}
                  </div>

                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <h3 className="text-sm text-[#4A4A4A] mb-1">{product.name}</h3>
                        <p className="text-[#0288D1] mb-2">{product.price}</p>
                      </div>
                      <StatusChip
                        statusText={getProductStatusText(product.status)}
                        statusType={getProductStatusType(product.status)}
                        className="text-xs px-2 py-1 ml-2"
                      />
                    </div>

                    <div className="grid grid-cols-3 gap-3 mb-3">
                      <div>
                        <div className="flex items-center gap-1 text-xs text-[#6B6B6B] mb-0.5">
                          <Box className="w-3 h-3" />
                          <span>Stok</span>
                        </div>
                        <p
                          className={`text-sm ${
                            product.stock === 0
                              ? "text-red-600"
                              : product.stock < 5
                                ? "text-orange-600"
                                : "text-[#4A4A4A]"
                          }`}
                        >
                          {product.stock}
                        </p>
                      </div>
                      <div>
                        <div className="flex items-center gap-1 text-xs text-[#6B6B6B] mb-0.5">
                          <ShoppingCart className="w-3 h-3" />
                          <span>Terjual</span>
                        </div>
                        <p className="text-sm text-[#4A4A4A]">{product.sold}</p>
                      </div>
                      <div>
                        <div className="flex items-center gap-1 text-xs text-[#6B6B6B] mb-0.5">
                          <Eye className="w-3 h-3" />
                          <span>Views</span>
                        </div>
                        <p className="text-sm text-[#4A4A4A]">{product.views}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                      <span className="text-sm text-[#4A4A4A]">{product.rating}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
