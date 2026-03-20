export type DashboardStat = {
  label: string
  value: string
  subvalue: string
}

export type StoreDashboardSummary = {
  name: string
  logo: string
  rating: number
  totalProducts: number
  todaySales: string
  monthlySales: string
  storeStatus: "open" | "closed"
}

export type StoreDashboardOrderStatus =
  | "pending"
  | "processing"
  | "shipped"
  | "completed"

export type StoreDashboardOrder = {
  id: string
  customerName: string
  customerAvatar: string
  productName: string
  quantity: number
  totalPrice: string
  status: StoreDashboardOrderStatus
  orderDate: string
}

export type StoreDashboardProductStatus =
  | "active"
  | "low-stock"
  | "out-of-stock"

export type StoreDashboardProduct = {
  id: string
  name: string
  image: string
  price: string
  stock: number
  sold: number
  views: number
  rating: number
  status: StoreDashboardProductStatus
}

export type StoreDashboardData = {
  role: "toko"
  summary: StoreDashboardSummary
  stats: DashboardStat[]
  pendingOrders: StoreDashboardOrder[]
  topProducts: StoreDashboardProduct[]
}

export type TechnicianDashboardSummary = {
  name: string
  photo: string
  rating: number
  completedJobs: number
  todayEarnings: string
  monthlyEarnings: string
  availabilityStatus: "online" | "offline"
}

export type TechnicianDashboardOrderStatus =
  | "pending"
  | "accepted"
  | "in-progress"
  | "completed"
  | "rejected"

export type TechnicianDashboardOrderPriority = "normal" | "urgent"

export type TechnicianDashboardOrder = {
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
  status: TechnicianDashboardOrderStatus
  priority: TechnicianDashboardOrderPriority
}

export type TechnicianDashboardData = {
  role: "teknisi"
  summary: TechnicianDashboardSummary
  stats: DashboardStat[]
  orders: {
    pending: TechnicianDashboardOrder[]
    active: TechnicianDashboardOrder[]
    history: TechnicianDashboardOrder[]
  }
}

export type BusinessDashboardData =
  | StoreDashboardData
  | TechnicianDashboardData
