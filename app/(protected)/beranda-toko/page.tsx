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
  Pencil,
  Trash2,
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
import { StoreStatsScreen } from "@/components/StoreStatsScreen"
import { NotificationScreen } from "@/components/NotificationScreen"

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
  const [isViewingStats, setIsViewingStats] = useState(false)
  const [isViewingNotifications, setIsViewingNotifications] = useState(false)
  
  const [processingOrder, setProcessingOrder] = useState<StoreDashboardOrder | null>(null)
  const [trackingNumber, setTrackingNumber] = useState("")

  const [isWithdrawing, setIsWithdrawing] = useState(false)
  const [withdrawAmount, setWithdrawAmount] = useState("")

  const [editingProduct, setEditingProduct] = useState<StoreDashboardProduct | null>(null)
  const [editForm, setEditForm] = useState({ name: "", price: "", stock: "" })

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
      | { action: "store.processOrder"; orderId: string; trackingNumber?: string }
      | { action: "store.editProduct"; productData: any }
      | { action: "store.deleteProduct"; productData: { id: string } }
  ) => {
    if (!user) {
      return
    }

    try {
      setActionLoading(
        payload.action === "store.addProduct"
          ? "add-product"
          : ("orderId" in payload ? payload.orderId : null) ||
            ("productData" in payload ? payload.productData?.id : null) ||
            "unknown"
      )
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

  if (isViewingStats && dashboard) {
    return (
      <StoreStatsScreen 
        dashboardData={dashboard}
        onBack={() => setIsViewingStats(false)}
      />
    )
  }

  if (isViewingNotifications) {
    return <NotificationScreen role="toko" onBack={() => setIsViewingNotifications(false)} />
  }

  const handleWithdraw = async () => {
    if (!withdrawAmount || isNaN(Number(withdrawAmount)) || Number(withdrawAmount) <= 0) {
      alert("Masukkan nominal tarik saldo yang valid.")
      return
    }
    setActionLoading("withdraw")
    // Simulasi tarik saldo
    setTimeout(() => {
      alert(`Berhasil menarik saldo sebesar Rp ${Number(withdrawAmount).toLocaleString("id-ID")}`)
      setIsWithdrawing(false)
      setWithdrawAmount("")
      setActionLoading("")
    }, 1500)
  }

  const handleEditProductClick = (product: StoreDashboardProduct) => {
    const rawPrice = product.price.replace(/\D/g, "")
    setEditForm({ name: product.name, price: rawPrice, stock: product.stock.toString() })
    setEditingProduct(product)
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col relative">
      {editingProduct && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-6 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-xl">
            <h3 className="text-xl font-bold text-[#4A4A4A] mb-4">Edit Produk</h3>
            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-xs font-semibold text-[#6B6B6B] mb-1 uppercase">Nama Produk</label>
                <input 
                  type="text" 
                  value={editForm.name} 
                  onChange={(e) => setEditForm({ ...editForm, name: e.target.value })} 
                  className="w-full bg-[#F8FAFC] border border-[#E5E7EB] rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#0288D1]/20 focus:border-[#0288D1]"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#6B6B6B] mb-1 uppercase">Harga (Rp)</label>
                <input 
                  type="number" 
                  value={editForm.price} 
                  onChange={(e) => setEditForm({ ...editForm, price: e.target.value })} 
                  className="w-full bg-[#F8FAFC] border border-[#E5E7EB] rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#0288D1]/20 focus:border-[#0288D1]"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#6B6B6B] mb-1 uppercase">Stok</label>
                <input 
                  type="number" 
                  value={editForm.stock} 
                  onChange={(e) => setEditForm({ ...editForm, stock: e.target.value })} 
                  className="w-full bg-[#F8FAFC] border border-[#E5E7EB] rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#0288D1]/20 focus:border-[#0288D1]"
                />
              </div>
            </div>
            
            <div className="flex gap-3">
              <button 
                onClick={() => setEditingProduct(null)}
                className="flex-1 py-3 px-4 rounded-xl border border-[#E5E7EB] text-[#4A4A4A] font-medium text-sm hover:bg-[#F8FAFC]"
              >
                Batal
              </button>
              <button 
                disabled={actionLoading !== ""}
                onClick={async () => {
                  await mutateStoreDashboard({ 
                    action: "store.editProduct", 
                    productData: {
                      id: editingProduct.id,
                      name: editForm.name,
                      price: editForm.price,
                      stock: editForm.stock
                    }
                  })
                  setEditingProduct(null)
                }}
                className="flex-1 py-3 px-4 rounded-xl bg-gradient-to-br from-[#0288D1] to-[#4FC3F7] text-white font-medium text-sm hover:shadow-lg disabled:opacity-50"
              >
                {actionLoading !== "" ? "Menyimpan..." : "Simpan"}
              </button>
            </div>
          </div>
        </div>
      )}

      {processingOrder && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-6 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-xl">
            <div className="w-12 h-12 rounded-full bg-[#0288D1]/10 flex items-center justify-center text-[#0288D1] mb-4">
              <Package className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-[#4A4A4A] mb-1">Kirim Pesanan</h3>
            <p className="text-sm text-[#6B6B6B] mb-5">
              Masukkan nomor resi pengiriman untuk <span className="font-semibold text-[#4A4A4A]">{processingOrder.productName}</span>.
            </p>
            
            <div className="mb-6">
              <label className="block text-xs font-semibold text-[#6B6B6B] mb-2 uppercase tracking-wider">
                Nomor Resi
              </label>
              <input 
                type="text" 
                value={trackingNumber} 
                onChange={(e) => setTrackingNumber(e.target.value)} 
                placeholder="Contoh: RESI-12345678" 
                className="w-full bg-[#F8FAFC] border border-[#E5E7EB] rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#0288D1]/20 focus:border-[#0288D1] transition-all"
              />
            </div>
            
            <div className="flex gap-3">
              <button 
                onClick={() => {
                  setProcessingOrder(null)
                  setTrackingNumber("")
                }}
                className="flex-1 py-3 px-4 rounded-xl border border-[#E5E7EB] text-[#4A4A4A] font-medium text-sm hover:bg-[#F8FAFC] transition-colors"
              >
                Batal
              </button>
              <button 
                disabled={!trackingNumber.trim() || actionLoading !== ""}
                onClick={async () => {
                  await mutateStoreDashboard({ 
                    action: "store.processOrder", 
                    orderId: processingOrder.id, 
                    trackingNumber 
                  })
                  setProcessingOrder(null)
                  setTrackingNumber("")
                }}
                className="flex-1 py-3 px-4 rounded-xl bg-gradient-to-br from-[#0288D1] to-[#4FC3F7] text-white font-medium text-sm hover:shadow-lg disabled:opacity-50 transition-all"
              >
                {actionLoading === processingOrder.id ? "Memproses..." : "Kirim"}
              </button>
            </div>
          </div>
        </div>
      )}

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
                <span className="text-xs text-white/80">Bulan Ini (Tersedia)</span>
              </div>
              <p className="text-xl text-white">{storeData.monthlySales}</p>
            </div>
          </div>
          <button 
            onClick={() => setIsWithdrawing(true)}
            className="w-full mt-4 bg-white/20 hover:bg-white/30 text-white rounded-xl py-2.5 text-sm font-medium transition-colors border border-white/20 flex items-center justify-center gap-2"
          >
            <DollarSign className="w-4 h-4" />
            Tarik Saldo
          </button>
        </div>
      </div>

      {isWithdrawing && (
        <div className="fixed inset-0 z-[60] bg-black/50 backdrop-blur-sm flex items-center justify-center p-6 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-xl">
            <h3 className="text-xl font-bold text-[#4A4A4A] mb-2">Tarik Saldo</h3>
            <p className="text-sm text-[#6B6B6B] mb-5">
              Masukkan nominal saldo yang ingin ditarik ke rekening terdaftar Anda. (Maksimal: {storeData.monthlySales})
            </p>
            
            <div className="mb-6">
              <label className="block text-xs font-semibold text-[#6B6B6B] mb-2 uppercase tracking-wider">
                Nominal Penarikan (Rp)
              </label>
              <input 
                type="number" 
                value={withdrawAmount} 
                onChange={(e) => setWithdrawAmount(e.target.value)} 
                placeholder="Contoh: 500000" 
                className="w-full bg-[#F8FAFC] border border-[#E5E7EB] rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#0288D1]/20 focus:border-[#0288D1] transition-all"
              />
            </div>
            
            <div className="flex gap-3">
              <button 
                onClick={() => {
                  setIsWithdrawing(false)
                  setWithdrawAmount("")
                }}
                className="flex-1 py-3 px-4 rounded-xl border border-[#E5E7EB] text-[#4A4A4A] font-medium text-sm hover:bg-[#F8FAFC] transition-colors"
              >
                Batal
              </button>
              <button 
                disabled={actionLoading !== ""}
                onClick={handleWithdraw}
                className="flex-1 py-3 px-4 rounded-xl bg-gradient-to-br from-[#10B981] to-[#34D399] text-white font-medium text-sm hover:shadow-lg disabled:opacity-50 transition-all"
              >
                {actionLoading === "withdraw" ? "Memproses..." : "Tarik Sekarang"}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="px-6 -mt-4 mb-6 relative z-10">
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
          <button 
            onClick={() => setIsViewingStats(true)}
            className="bg-white text-[#0288D1] border-2 border-[#0288D1] rounded-2xl p-4 flex items-center justify-center gap-2 hover:bg-[#0288D1]/5 transition-colors"
          >
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
                      label="Proses Pesanan"
                      onClick={() => setProcessingOrder(order)}
                      disabled={actionLoading !== ""}
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

                    <div className="flex items-center justify-between mt-3">
                      <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                        <span className="text-sm text-[#4A4A4A]">{product.rating}</span>
                      </div>
                      <div className="flex gap-2">
                        <button 
                          disabled={actionLoading !== ""}
                          onClick={() => handleEditProductClick(product)}
                          className="p-2 bg-[#0288D1]/10 text-[#0288D1] rounded-lg hover:bg-[#0288D1]/20 transition-colors disabled:opacity-50"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button 
                          disabled={actionLoading !== ""}
                          onClick={() => {
                            if (window.confirm("Apakah Anda yakin ingin menghapus produk ini?")) {
                              void mutateStoreDashboard({ action: "store.deleteProduct", productData: { id: product.id } })
                            }
                          }}
                          className="p-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors disabled:opacity-50"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
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
