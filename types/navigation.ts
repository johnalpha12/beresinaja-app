import type { UserRole } from "@/types/user"

export type Screen =
  | "splash"
  | "login"
  | "register"
  | "forgotPassword"
  | "home"
  | "serviceHistory"
  | "transactionHistory"
  | "teknisi"
  | "teknisiDetail"
  | "servisPerangkat"
  | "servisKomputer"
  | "marketplace"
  | "productDetail"
  | "checkout"
  | "orderSuccess"
  | "tracking"
  | "profile"
  | "chatAi"
  | "jualBarang"

const LEGACY_SCREEN_ALIASES = {
  "forgot-password": "forgotPassword",
  "service-history": "serviceHistory",
  "transaction-history": "transactionHistory",
  "teknisi-detail": "teknisiDetail",
  "servis-perangkat": "servisPerangkat",
  "servis-komputer": "servisKomputer",
  "product-detail": "productDetail",
  "order-success": "orderSuccess",
  "chat-ai": "chatAi",
  "jual-barang": "jualBarang",
} as const

export type LegacyScreen = keyof typeof LEGACY_SCREEN_ALIASES
export type ScreenLike = Screen | LegacyScreen

export const SCREEN_PATHS: Record<Screen, string> = {
  splash: "/splash",
  login: "/login",
  register: "/register",
  forgotPassword: "/forgot-password",
  home: "/beranda",
  serviceHistory: "/riwayat-servis",
  transactionHistory: "/riwayat-transaksi",
  teknisi: "/teknisi",
  teknisiDetail: "/detail-teknisi",
  servisPerangkat: "/servis-perangkat",
  servisKomputer: "/servis-komputer",
  marketplace: "/marketplace",
  productDetail: "/detail-produk",
  checkout: "/checkout",
  orderSuccess: "/pesanan-berhasil",
  tracking: "/pelacakan",
  profile: "/profil",
  chatAi: "/chat-ai",
  jualBarang: "/jual-barang",
}

export function normalizeScreen(screen: ScreenLike): Screen {
  if (screen in LEGACY_SCREEN_ALIASES) {
    return LEGACY_SCREEN_ALIASES[screen as LegacyScreen]
  }

  return screen as Screen
}

export function screenToPath(screen: ScreenLike) {
  return SCREEN_PATHS[normalizeScreen(screen)]
}

export function homePathByRole(role?: UserRole) {
  if (role === "teknisi") {
    return "/beranda-teknisi"
  }

  if (role === "toko") {
    return "/beranda-toko"
  }

  return SCREEN_PATHS.home
}

export function technicianDetailPath(technicianId: string) {
  return `${SCREEN_PATHS.teknisiDetail}/${encodeURIComponent(technicianId)}`
}
