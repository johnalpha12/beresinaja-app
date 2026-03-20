import type {
  DashboardStat,
  StoreDashboardData,
  StoreDashboardOrder,
  StoreDashboardProduct,
  TechnicianDashboardData,
  TechnicianDashboardOrder,
} from "@/types/dashboard"

function getInitials(name: string, fallback: string) {
  const initials = name
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join("")

  return initials || fallback
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value)
}

function cloneStats(stats: DashboardStat[]) {
  return stats.map((item) => ({ ...item }))
}

function cloneStoreOrders(orders: StoreDashboardOrder[]) {
  return orders.map((item) => ({ ...item }))
}

function cloneStoreProducts(products: StoreDashboardProduct[]) {
  return products.map((item) => ({ ...item }))
}

function cloneTechnicianOrders(orders: TechnicianDashboardOrder[]) {
  return orders.map((item) => ({
    ...item,
    issues: [...item.issues],
  }))
}

export function createDefaultStoreDashboard(displayName: string): StoreDashboardData {
  const name = displayName.trim() || "Toko Mitra"

  return {
    role: "toko",
    summary: {
      name,
      logo: getInitials(name, "TM"),
      rating: 4.8,
      totalProducts: 4,
      todaySales: "Rp 15.750.000",
      monthlySales: "Rp 248.500.000",
      storeStatus: "open",
    },
    stats: [
      { label: "Hari Ini", value: "24", subvalue: "pesanan" },
      { label: "Penjualan", value: "15.7jt", subvalue: "hari ini" },
      { label: "Produk", value: "4", subvalue: "aktif" },
      { label: "Rating", value: "4.8", subvalue: "120 ulasan" },
    ],
    pendingOrders: [
      {
        id: "ORD-20240318-101",
        customerName: "Siti Nurhaliza",
        customerAvatar: "SN",
        productName: "iPhone 13 Pro 256GB",
        quantity: 1,
        totalPrice: "Rp 13.500.000",
        status: "pending",
        orderDate: "18 Mar 2024, 10:30",
      },
      {
        id: "ORD-20240318-102",
        customerName: "Budi Santoso",
        customerAvatar: "BS",
        productName: "AirPods Pro 2nd Gen",
        quantity: 2,
        totalPrice: "Rp 7.998.000",
        status: "pending",
        orderDate: "18 Mar 2024, 11:15",
      },
      {
        id: "ORD-20240318-103",
        customerName: "Diana Putri",
        customerAvatar: "DP",
        productName: "Samsung Galaxy S24 Ultra",
        quantity: 1,
        totalPrice: "Rp 18.999.000",
        status: "processing",
        orderDate: "18 Mar 2024, 09:45",
      },
    ],
    topProducts: [
      {
        id: "PROD-001",
        name: "iPhone 13 Pro 256GB",
        image: "HP",
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
        image: "HP",
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
        image: "LT",
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
        image: "AK",
        price: "Rp 3.999.000",
        stock: 24,
        sold: 89,
        views: 2340,
        rating: 4.9,
        status: "active",
      },
    ],
  }
}

export function createDefaultTechnicianDashboard(
  displayName: string
): TechnicianDashboardData {
  const name = displayName.trim() || "Teknisi Mitra"

  return {
    role: "teknisi",
    summary: {
      name,
      photo: getInitials(name, "TM"),
      rating: 4.9,
      completedJobs: 532,
      todayEarnings: "Rp 850.000",
      monthlyEarnings: "Rp 12.500.000",
      availabilityStatus: "online",
    },
    stats: [
      { label: "Hari Ini", value: "3", subvalue: "order" },
      { label: "Minggu Ini", value: "18", subvalue: "order" },
      { label: "Rating", value: "4.9", subvalue: "248 ulasan" },
      { label: "Response", value: "99%", subvalue: "< 15 menit" },
    ],
    orders: {
      pending: [
        {
          id: "ORD-20240318-001",
          customerName: "Siti Nurhaliza",
          customerAvatar: "SN",
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
          customerAvatar: "BS",
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
          customerAvatar: "DP",
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
      ],
      active: [
        {
          id: "ORD-20240318-004",
          customerName: "Eko Prasetyo",
          customerAvatar: "EP",
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
      ],
      history: [],
    },
  }
}

export function normalizeStoreDashboard(
  value: unknown,
  displayName: string
): StoreDashboardData {
  const fallback = createDefaultStoreDashboard(displayName)

  if (!isRecord(value)) {
    return fallback
  }

  return {
    role: "toko",
    summary: {
      ...fallback.summary,
      ...(isRecord(value.summary) ? value.summary : {}),
    },
    stats: Array.isArray(value.stats)
      ? (value.stats as DashboardStat[])
      : cloneStats(fallback.stats),
    pendingOrders: Array.isArray(value.pendingOrders)
      ? (value.pendingOrders as StoreDashboardOrder[])
      : cloneStoreOrders(fallback.pendingOrders),
    topProducts: Array.isArray(value.topProducts)
      ? (value.topProducts as StoreDashboardProduct[])
      : cloneStoreProducts(fallback.topProducts),
  }
}

export function normalizeTechnicianDashboard(
  value: unknown,
  displayName: string
): TechnicianDashboardData {
  const fallback = createDefaultTechnicianDashboard(displayName)
  const orderGroups = isRecord(value) && isRecord(value.orders) ? value.orders : {}

  return {
    role: "teknisi",
    summary: {
      ...fallback.summary,
      ...(isRecord(value) && isRecord(value.summary) ? value.summary : {}),
    },
    stats:
      isRecord(value) && Array.isArray(value.stats)
        ? (value.stats as DashboardStat[])
        : cloneStats(fallback.stats),
    orders: {
      pending: Array.isArray(orderGroups.pending)
        ? (orderGroups.pending as TechnicianDashboardOrder[])
        : cloneTechnicianOrders(fallback.orders.pending),
      active: Array.isArray(orderGroups.active)
        ? (orderGroups.active as TechnicianDashboardOrder[])
        : cloneTechnicianOrders(fallback.orders.active),
      history: Array.isArray(orderGroups.history)
        ? (orderGroups.history as TechnicianDashboardOrder[])
        : cloneTechnicianOrders(fallback.orders.history),
    },
  }
}
