import { NextRequest, NextResponse } from "next/server"
import { getAdminAuth, getAdminDb } from "@/lib/firebase-admin"
import type { UserData, UserRole } from "@/types/user"

export const runtime = "nodejs"

const defaultStats = {
  services: 0,
  transactions: 0,
  sellItems: 0,
}

const defaultPremium = {
  isActive: false,
  expiresAt: null,
  benefits: [
    "Gratis jemput-antar unlimited",
    "Garansi extended 60 hari",
    "Prioritas servis lebih cepat",
  ],
}

type AuthenticatedUser = {
  uid: string
  email?: string | null
  name?: string | null
}

function formatFallbackName(email?: string | null) {
  const emailName = email?.split("@")[0]?.trim()

  if (!emailName) {
    return "Pengguna"
  }

  return emailName
    .split(/[._-]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ")
}

function getBearerToken(request: NextRequest) {
  const authorization = request.headers.get("authorization") || ""

  if (!authorization.startsWith("Bearer ")) {
    return ""
  }

  return authorization.slice("Bearer ".length).trim()
}

function decodeJwtPayload(token: string) {
  const [, payload = ""] = token.split(".")

  if (!payload) {
    throw new Error("Firebase ID token tidak valid.")
  }

  const normalizedPayload = payload.replace(/-/g, "+").replace(/_/g, "/")
  const paddedPayload = normalizedPayload.padEnd(
    Math.ceil(normalizedPayload.length / 4) * 4,
    "="
  )

  return JSON.parse(
    Buffer.from(paddedPayload, "base64").toString("utf8")
  ) as Record<string, unknown>
}

async function resolveAuthenticatedUser(token: string): Promise<AuthenticatedUser> {
  try {
    const adminAuth = getAdminAuth()
    const decodedToken = await adminAuth.verifyIdToken(token)

    return {
      uid: decodedToken.uid,
      email: decodedToken.email ?? null,
      name: decodedToken.name ?? null,
    }
  } catch (error) {
    if (process.env.NODE_ENV !== "development") {
      throw error
    }

    const payload = decodeJwtPayload(token)
    const uid =
      (typeof payload.user_id === "string" && payload.user_id) ||
      (typeof payload.sub === "string" && payload.sub) ||
      ""

    if (!uid) {
      throw error
    }

    console.warn(
      "Profile API: using decoded Firebase token payload fallback in development."
    )

    return {
      uid,
      email: typeof payload.email === "string" ? payload.email : null,
      name: typeof payload.name === "string" ? payload.name : null,
    }
  }
}

function normalizeCreatedAt(value: unknown) {
  return typeof value === "number" ? value : Date.now()
}

function normalizeStats(value: Partial<UserData>["stats"]) {
  return {
    services: typeof value?.services === "number" ? value.services : 0,
    transactions: typeof value?.transactions === "number" ? value.transactions : 0,
    sellItems: typeof value?.sellItems === "number" ? value.sellItems : 0,
  }
}

function normalizePremium(value: Partial<UserData>["premium"]) {
  return {
    isActive: value?.isActive === true,
    expiresAt: typeof value?.expiresAt === "number" ? value.expiresAt : null,
    benefits:
      value?.benefits?.filter(
        (benefit): benefit is string => typeof benefit === "string"
      ) ?? defaultPremium.benefits,
  }
}

function toFirestoreProfile(
  profile: UserData & {
    city?: string
  }
) {
  return Object.fromEntries(
    Object.entries(profile).filter(([, value]) => value !== undefined)
  ) as UserData
}

export async function POST(request: NextRequest) {
  const token = getBearerToken(request)

  if (!token) {
    return NextResponse.json(
      { error: "Token autentikasi tidak ditemukan." },
      { status: 401 }
    )
  }

  const body = (await request.json().catch(() => ({}))) as Partial<{
    fullName: string
    email: string
    phone: string
    role: UserRole
  }>

  let authenticatedUser: AuthenticatedUser

  try {
    authenticatedUser = await resolveAuthenticatedUser(token)
  } catch (error) {
    console.error("Profile API auth error:", error)

    return NextResponse.json(
      { error: "Token autentikasi tidak valid." },
      { status: 401 }
    )
  }

  try {
    const adminDb = getAdminDb()
    const userRef = adminDb.collection("users").doc(authenticatedUser.uid)
    const snapshot = await userRef.get()
    const existing = snapshot.exists
      ? (snapshot.data() as Partial<UserData>)
      : {}

    const profile = toFirestoreProfile({
      uid: authenticatedUser.uid,
      fullName:
        body.fullName?.trim() ||
        existing.fullName ||
        authenticatedUser.name ||
        formatFallbackName(authenticatedUser.email),
      email: body.email ?? existing.email ?? authenticatedUser.email ?? "",
      phone: body.phone ?? existing.phone ?? "",
      role: body.role ?? existing.role ?? "pengguna",
      createdAt: normalizeCreatedAt(existing.createdAt),
      city: typeof existing.city === "string" ? existing.city : undefined,
      stats: normalizeStats(existing.stats ?? defaultStats),
      premium: normalizePremium(existing.premium ?? defaultPremium),
    })

    await userRef.set(profile, { merge: true })

    return NextResponse.json({ profile })
  } catch (error) {
    console.error("Profile API data error:", error)

    return NextResponse.json(
      {
        error: "Gagal menyimpan profil pengguna.",
        ...(process.env.NODE_ENV === "development" &&
        error instanceof Error
          ? { details: error.message }
          : {}),
      },
      { status: 500 }
    )
  }
}
