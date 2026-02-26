export type Screen =
  | "splash"
  | "login"
  | "register"
  | "forgot-password"
  | "home"
  | "teknisi"
  | "teknisi-detail"
  | "servis-perangkat"
  | "servis-komputer"
  | "marketplace"
  | "product-detail"
  | "tracking"
  | "profile"
  | "chat-ai"
  | "jual-barang"

export const SCREEN_PATHS: Record<Screen, string> = {
  splash: "/splash",
  login: "/login",
  register: "/register",
  "forgot-password": "/forgot-password",
  home: "/home",
  teknisi: "/teknisi",
  "teknisi-detail": "/teknisi-detail",
  "servis-perangkat": "/servis-perangkat",
  "servis-komputer": "/servis-komputer",
  marketplace: "/marketplace",
  "product-detail": "/product-detail",
  tracking: "/tracking",
  profile: "/profile",
  "chat-ai": "/chat-ai",
  "jual-barang": "/jual-barang",
}

export function screenToPath(screen: Screen) {
  return SCREEN_PATHS[screen]
}
