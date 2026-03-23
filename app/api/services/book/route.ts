import { NextRequest, NextResponse } from "next/server"
import { getAdminDb, getAdminAuth } from "@/lib/firebase-admin"
import type { TechnicianDashboardOrder } from "@/types/dashboard"
import type { UserData } from "@/types/user"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

type AuthenticatedUser = {
  uid: string
  email?: string | null
  name?: string | null
}

function getBearerToken(request: NextRequest) {
  const authorization = request.headers.get("authorization") || ""
  if (!authorization.startsWith("Bearer ")) return ""
  return authorization.slice("Bearer ".length).trim()
}

function decodeJwtPayload(token: string) {
  const [, payload = ""] = token.split(".")
  if (!payload) throw new Error("Firebase ID token tidak valid.")
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
    if (!uid) throw error
    return {
      uid,
      email: typeof payload.email === "string" ? payload.email : null,
      name: typeof payload.name === "string" ? payload.name : null,
    }
  }
}

function resolveDisplayName(profile: Partial<UserData>, user: AuthenticatedUser) {
  return (
    profile.fullName?.trim() ||
    user.name?.trim() ||
    user.email?.split("@")[0]?.trim() ||
    "Mitra BeresinAja"
  )
}

export async function POST(request: NextRequest) {
  try {
    const token = getBearerToken(request)
    if (!token) {
      return NextResponse.json({ error: "Token autentikasi tidak ditemukan." }, { status: 401 })
    }

    const authenticatedUser = await resolveAuthenticatedUser(token)
    const adminDb = getAdminDb()
    
    // Get user profile for name
    const userSnap = await adminDb.collection("users").doc(authenticatedUser.uid).get()
    const profile = (userSnap.data() || {}) as Partial<UserData>
    const displayName = resolveDisplayName(profile, authenticatedUser)

    const body = await request.json()
    const { technicianId, serviceType, deviceName, issues, location, scheduledTime, estimatedPrice, technicianName } = body

    if (!technicianId) {
      return NextResponse.json({ error: "Technician ID required." }, { status: 400 })
    }

    const serviceOrderRef = adminDb.collection("serviceOrders").doc()
    
    const newOrder: TechnicianDashboardOrder = {
      id: serviceOrderRef.id,
      customerName: displayName,
      customerAvatar: displayName.charAt(0).toUpperCase(),
      serviceType: serviceType || "Perbaikan",
      deviceName: deviceName || "Perangkat Hape",
      issues: issues || [],
      location: location || "Lokasi Pengguna",
      distance: "2.5 km",
      scheduledTime: scheduledTime || "Secepatnya",
      estimatedPrice: estimatedPrice || "Cek di Lokasi",
      status: "pending",
      priority: "normal"
    }

    // Save to serviceOrders collection for public lookup & trackings
    await serviceOrderRef.set({
      ...newOrder,
      technicianId,
      technicianName: technicianName || "Teknisi",
      userId: authenticatedUser.uid,
      createdAt: new Date().toISOString()
    })

    // Add to technicianDashboards (array pending)
    const techDashRef = adminDb.collection("technicianDashboards").doc(technicianId)
    const techDashSnap = await techDashRef.get()
    if (techDashSnap.exists) {
      const data = techDashSnap.data()!
      await techDashRef.set({
        ...data,
        orders: {
          ...(data.orders || {}),
          pending: [newOrder, ...(data.orders?.pending || [])]
        }
      }, { merge: true })
    }

    // SEND NOTIFICATIONS
    const batch = adminDb.batch()
    
    // Notify Technician
    batch.set(adminDb.collection("notifications").doc(), {
      userId: technicianId,
      type: "service",
      title: "Panggilan Servis Baru Masuk!",
      message: `Order servis ${newOrder.serviceType} di ${newOrder.location}. Konfirmasi segera.`,
      isRead: false,
      actionText: "Lihat Detail",
      createdAt: new Date()
    })

    // Notify Buyer
    batch.set(adminDb.collection("notifications").doc(), {
      userId: authenticatedUser.uid,
      type: "service",
      title: "Pesanan Servis Berhasil",
      message: `Pesanan servis untuk teknisi ${technicianName || "Mitra"} berhasil dikirim dan menunggu konfirmasi.`,
      isRead: false,
      actionText: "Lacak Status",
      createdAt: new Date()
    })
    
    await batch.commit()

    return NextResponse.json({ success: true, orderId: serviceOrderRef.id })
  } catch (error) {
    console.error("Booking API error:", error)
    return NextResponse.json({ error: "Gagal membuat pesanan servis." }, { status: 500 })
  }
}
