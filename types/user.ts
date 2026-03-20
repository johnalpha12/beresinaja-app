export type UserRole = "pengguna" | "teknisi" | "toko"

export type UserStats = {
  services: number
  transactions: number
  sellItems: number
}

export type UserPremium = {
  isActive: boolean
  expiresAt: number | null
  benefits: string[]
}

export type UserData = {
  uid: string
  fullName: string
  email: string
  phone: string
  role: UserRole
  createdAt: number
  city?: string
  stats?: UserStats
  premium?: UserPremium
}
