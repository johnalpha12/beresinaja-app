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
import { screenToPath } from "@/types/navigation"
import { useUserData } from "@/hooks/useUserData"

type Product = {
  id: string
  name: string
  image: string
  price: string
  stock: number
  sold: number
  views: number
  rating: number
  status: "active" | "low-stock" | "out-of-stock"
}

type Order = {
  id: string
  customerName: string
  customerAvatar: string
  productName: string
  quantity: number
  totalPrice: string
  status: "pending" | "processing" | "shipped" | "completed"
  orderDate: string
}

export default function StoreHomePage() {
  const router = useRouter()
  const { userData, loading } = useUserData()
  const [activeTab, setActiveTab] = useState<"products" | "orders">("orders")

  useEffect(() => {
    if (loading || !userData?.role) {
      return
    }

    if (userData.role === "pengguna") {
      router.replace(screenToPath("home"))
      return
    }

    if (userData.role === "teknisi") {
      router.replace("/beranda-teknisi")
    }
  }, [loading, router, userData?.role])

  if (loading || userData?.role !== "toko") {
    return <PageLoader message="Menyiapkan beranda toko..." />
  }

  const storeData = {
    name: userData.fullName || "TechStore Official",
    logo: "🏪",
    rating: 4.8,
    totalProducts: 156,
    todaySales: "Rp 15.750.000",
    monthlySales: "Rp 248.500.000",
    storeStatus: "open" as const,
  }

  const stats = [
    { label: "Hari Ini", value: "24", subvalue: "pesanan", icon: ShoppingCart, color: "#0288D1" },
    { label: "Penjualan", value: "15.7jt", subvalue: "hari ini", icon: DollarSign, color: "#10B981" },
    { label: "Produk", value: "156", subvalue: "aktif", icon: Package, color: "#8B5CF6" },
    { label: "Rating", value: "4.8", subvalue: "1.2k ulasan", icon: Star, color: "#F59E0B" },
  ]

  const pendingOrders: Order[] = [
    {
      id: "ORD-20240318-101",
      customerName: "Siti Nurhaliza",
      customerAvatar: "👩",
      productName: "iPhone 13 Pro 256GB",
      quantity: 1,
      totalPrice: "Rp 13.500.000",
      status: "pending",
      orderDate: "18 Mar 2024, 10:30",
    },
    {
      id: "ORD-20240318-102",
      customerName: "Budi Santoso",
      customerAvatar: "👨",
      productName: "AirPods Pro 2nd Gen",
      quantity: 2,
      totalPrice: "Rp 7.998.000",
      status: "pending",
      orderDate: "18 Mar 2024, 11:15",
    },
    {
      id: "ORD-20240318-103",
      customerName: "Diana Putri",
      customerAvatar: "👩💼",
      productName: "Samsung Galaxy S24 Ultra",
      quantity: 1,
      totalPrice: "Rp 18.999.000",
      status: "processing",
      orderDate: "18 Mar 2024, 09:45",
    },
  ]

  const topProducts: Product[] = [
    {
      id: "PROD-001",
      name: "iPhone 13 Pro 256GB",
      image: "📱",
      price: "Rp 13.500.000",
      stock: 12,
      sold: 45,
      views: 1250,
      rating: 4.9,
      status: "active",
    },
    {
      id: "PROD-002",
      name: "Samsung Galaxy S24 Ultra",
      image: "📱",
      price: "Rp 18.999.000",
      stock: 3,
      sold: 28,
      views: 980,
      rating: 4.8,
      status: "low-stock",
    },
    {
      id: "PROD-003",
      name: "MacBook Pro M3 14 inch",
      image: "💻",
      price: "Rp 29.999.000",
      stock: 0,
      sold: 15,
      views: 756,
      rating: 5,
      status: "out-of-stock",
    },
    {
      id: "PROD-004",
      name: "AirPods Pro 2nd Gen",
      image: "🎧",
      price: "Rp 3.999.000",
      stock: 24,
      sold: 89,
      views: 2340,
      rating: 4.9,
      status: "active",
    },
  ]

  const getOrderStatusType = (status: Order["status"]) => {
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

  const getOrderStatusText = (status: Order["status"]) => {
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

  const getProductStatusType = (status: Product["status"]) => {
    switch (status) {
      case "active":
        return "completed" as const
      case "low-stock":
      case "out-of-stock":
      default:
        return "pending" as const
    }
  }

  const getProductStatusText = (status: Product["status"]) => {
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

      <div className="px-6 mb-6">
        <div className="grid grid-cols-2 gap-3">
          <button className="bg-gradient-to-br from-[#0288D1] to-[#4FC3F7] text-white rounded-2xl p-4 flex items-center justify-center gap-2 shadow-md hover:shadow-lg transition-shadow">
            <Plus className="w-5 h-5" />
            <span className="text-sm">Tambah Produk</span>
          </button>
          <button className="bg-white text-[#0288D1] border-2 border-[#0288D1] rounded-2xl p-4 flex items-center justify-center gap-2 hover:bg-[#0288D1]/5 transition-colors">
            <BarChart3 className="w-5 h-5" />
            <span className="text-sm">Lihat Statistik</span>
          </button>
        </div>
      </div>

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
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#0288D1] to-[#4FC3F7] flex items-center justify-center text-2xl">
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
                    <PrimaryButton label="Proses Pesanan" onClick={() => {}} />
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
                  <div className="w-20 h-20 rounded-xl bg-gradient-to-br from-[#0288D1]/10 to-[#4FC3F7]/10 flex items-center justify-center text-4xl flex-shrink-0">
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
