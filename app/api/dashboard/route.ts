import { NextRequest, NextResponse } from "next/server"
import {
  getAdminAuth,
  getAdminDb,
  isFirebaseAdminConfigError,
} from "@/lib/firebase-admin"
import {
  normalizeStoreDashboard,
  normalizeTechnicianDashboard,
} from "@/lib/dashboard-defaults"
import type {
  StoreDashboardData,
  StoreDashboardProduct,
  TechnicianDashboardData,
  TechnicianDashboardOrder,
} from "@/types/dashboard"
import type { UserData } from "@/types/user"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

type AuthenticatedUser = {
  uid: string
  email?: string | null
  name?: string | null
}

type DashboardActionRequest =
  | {
      action?: "store.addProduct",
      productData?: any
    }
  | {
      action?: "store.processOrder"
      orderId?: string
    }
  | {
      action?: "technician.acceptOrder"
      orderId?: string
    }
  | {
      action?: "technician.rejectOrder"
      orderId?: string
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

async function resolveDashboardContext(token: string) {
  const authenticatedUser = await resolveAuthenticatedUser(token)
  const adminDb = getAdminDb()
  const userRef = adminDb.collection("users").doc(authenticatedUser.uid)
  const userSnap = await userRef.get()

  if (!userSnap.exists) {
    throw new Error("PROFILE_NOT_FOUND")
  }

  const profile = userSnap.data() as Partial<UserData>
  const displayName = resolveDisplayName(profile, authenticatedUser)

  return {
    adminDb,
    authenticatedUser,
    profile,
    displayName,
  }
}

function updateStoreProductStat(
  stats: StoreDashboardData["stats"],
  totalProducts: number
) {
  return stats.map((stat) =>
    stat.label === "Produk"
      ? { ...stat, value: String(totalProducts), subvalue: "aktif" }
      : stat
  )
}

function createStoreProductDraft(
  dashboard: StoreDashboardData,
  productId: string
): StoreDashboardProduct {
  const totalProducts = dashboard.summary.totalProducts + 1

  return {
    id: productId,
    name: `Produk Baru ${totalProducts}`,
    image: "NB",
    price: `Rp ${new Intl.NumberFormat("id-ID").format(1250000 + totalProducts * 50000)}`,
    stock: 10,
    sold: 0,
    views: 0,
    rating: dashboard.summary.rating,
    status: "active",
  }
}

function moveTechnicianOrder(
  dashboard: TechnicianDashboardData,
  orderId: string,
  target: "active" | "history",
  status: TechnicianDashboardOrder["status"]
) {
  const targetOrder = dashboard.orders.pending.find((order) => order.id === orderId)

  if (!targetOrder) {
    return null
  }

  const nextOrder = {
    ...targetOrder,
    status,
  }

  return {
    ...dashboard,
    orders: {
      pending: dashboard.orders.pending.filter((order) => order.id !== orderId),
      active:
        target === "active"
          ? [nextOrder, ...dashboard.orders.active]
          : dashboard.orders.active,
      history:
        target === "history"
          ? [nextOrder, ...dashboard.orders.history]
          : dashboard.orders.history,
    },
  }
}

export async function GET(request: NextRequest) {
  const token = getBearerToken(request)

  if (!token) {
    return NextResponse.json(
      { error: "Token autentikasi tidak ditemukan." },
      { status: 401 }
    )
  }

  let authenticatedUser: AuthenticatedUser

  try {
    authenticatedUser = await resolveAuthenticatedUser(token)
  } catch (error) {
    console.error("Dashboard API auth error:", error)

    return NextResponse.json(
      {
        error: isFirebaseAdminConfigError(error)
          ? "Firebase Admin belum dikonfigurasi di server deploy."
          : "Token autentikasi tidak valid.",
      },
      { status: isFirebaseAdminConfigError(error) ? 500 : 401 }
    )
  }

  try {
    const adminDb = getAdminDb()
    const userRef = adminDb.collection("users").doc(authenticatedUser.uid)
    const userSnap = await userRef.get()

    if (!userSnap.exists) {
      return NextResponse.json(
        { error: "Profil pengguna belum ditemukan." },
        { status: 404 }
      )
    }

    const profile = userSnap.data() as Partial<UserData>
    const displayName = resolveDisplayName(profile, authenticatedUser)

    if (profile.role === "toko") {
      const docRef = adminDb.collection("storeDashboards").doc(authenticatedUser.uid)
      const docSnap = await docRef.get()
      const dashboard = normalizeStoreDashboard(docSnap.data(), displayName)

      await docRef.set(dashboard, { merge: true })

      return NextResponse.json({ dashboard })
    }

    if (profile.role === "teknisi") {
      const docRef = adminDb
        .collection("technicianDashboards")
        .doc(authenticatedUser.uid)
      const docSnap = await docRef.get()
      const dashboard = normalizeTechnicianDashboard(docSnap.data(), displayName)

      await docRef.set(dashboard, { merge: true })

      return NextResponse.json({ dashboard })
    }

    return NextResponse.json(
      { error: "Dashboard hanya tersedia untuk akun toko dan teknisi." },
      { status: 403 }
    )
  } catch (error) {
    console.error("Dashboard API data error:", error)

    return NextResponse.json(
      {
        error: isFirebaseAdminConfigError(error)
          ? "Firebase Admin belum dikonfigurasi di server deploy."
          : "Gagal memuat dashboard.",
      },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  const token = getBearerToken(request)

  if (!token) {
    return NextResponse.json(
      { error: "Token autentikasi tidak ditemukan." },
      { status: 401 }
    )
  }

  const body = (await request.json().catch(() => ({}))) as DashboardActionRequest

  try {
    const { adminDb, authenticatedUser, profile, displayName } =
      await resolveDashboardContext(token)

    if (profile.role === "toko") {
      const docRef = adminDb.collection("storeDashboards").doc(authenticatedUser.uid)
      const docSnap = await docRef.get()
      let dashboard = normalizeStoreDashboard(docSnap.data(), displayName)

      if (body.action === "store.addProduct") {
        const productData = body.productData || {}
        const productRef = adminDb.collection("products").doc()
        const totalProducts = dashboard.summary.totalProducts + 1

        const nextProduct: StoreDashboardProduct = {
          id: productRef.id,
          name: productData.name || `Produk Baru ${totalProducts}`,
          image: "📱",
          price: `Rp ${new Intl.NumberFormat("id-ID").format(Number(productData.price) || 0)}`,
          stock: Number(productData.stock) || 0,
          sold: 0,
          views: 0,
          rating: dashboard.summary.rating,
          status: "active",
        }

        dashboard = {
          ...dashboard,
          summary: {
            ...dashboard.summary,
            totalProducts,
          },
          stats: updateStoreProductStat(dashboard.stats, totalProducts),
          topProducts: [nextProduct, ...dashboard.topProducts],
        }

        await productRef.set({
          name: nextProduct.name,
          price: Number(productData.price) || 0,
          rating: nextProduct.rating,
          reviews: 0,
          sold: nextProduct.sold,
          conditionBadge: productData.condition === "new" ? "Baru" : "Bekas",
          description: productData.description || `Produk baru dari ${dashboard.summary.name}.`,
          specs: productData.specifications
            ? productData.specifications.map((s: any) => ({ label: s.key, value: s.value }))
            : [
                { label: "Kategori", value: productData.category || "Aksesoris" },
              ],
          store: {
            name: dashboard.summary.name,
            rating: dashboard.summary.rating,
            distance: "0 km",
            responseTime: "< 1 jam",
            successRate: "100%",
            verified: true,
          },
          storeUid: authenticatedUser.uid,
          seller: dashboard.summary.name,
          distance: "0 km",
          badge: productData.condition === "new" ? "Baru" : "Bekas",
          category: productData.category || "Aksesoris",
          condition: productData.condition || "new",
          imageEmoji: nextProduct.image,
        })
      } else if (body.action === "store.processOrder") {
        const orderId = body.orderId?.trim()

        if (!orderId) {
          return NextResponse.json(
            { error: "Order ID wajib diisi." },
            { status: 400 }
          )
        }

        const hasOrder = dashboard.pendingOrders.some((order) => order.id === orderId)

        if (!hasOrder) {
          return NextResponse.json(
            { error: "Pesanan toko tidak ditemukan." },
            { status: 404 }
          )
        }

        dashboard = {
          ...dashboard,
          pendingOrders: dashboard.pendingOrders.map((order) =>
            order.id === orderId
              ? { ...order, status: "processing" }
              : order
          ),
        }
      } else {
        return NextResponse.json(
          { error: "Aksi dashboard toko tidak valid." },
          { status: 400 }
        )
      }

      await docRef.set(dashboard, { merge: true })

      return NextResponse.json({ dashboard })
    }

    if (profile.role === "teknisi") {
      const docRef = adminDb
        .collection("technicianDashboards")
        .doc(authenticatedUser.uid)
      const docSnap = await docRef.get()
      let dashboard = normalizeTechnicianDashboard(docSnap.data(), displayName)

      if (body.action === "technician.acceptOrder") {
        const orderId = body.orderId?.trim()

        if (!orderId) {
          return NextResponse.json(
            { error: "Order ID wajib diisi." },
            { status: 400 }
          )
        }

        const nextDashboard = moveTechnicianOrder(
          dashboard,
          orderId,
          "active",
          "accepted"
        )

        if (!nextDashboard) {
          return NextResponse.json(
            { error: "Order teknisi tidak ditemukan." },
            { status: 404 }
          )
        }

        dashboard = nextDashboard
      } else if (body.action === "technician.rejectOrder") {
        const orderId = body.orderId?.trim()

        if (!orderId) {
          return NextResponse.json(
            { error: "Order ID wajib diisi." },
            { status: 400 }
          )
        }

        const nextDashboard = moveTechnicianOrder(
          dashboard,
          orderId,
          "history",
          "rejected"
        )

        if (!nextDashboard) {
          return NextResponse.json(
            { error: "Order teknisi tidak ditemukan." },
            { status: 404 }
          )
        }

        dashboard = nextDashboard
      } else {
        return NextResponse.json(
          { error: "Aksi dashboard teknisi tidak valid." },
          { status: 400 }
        )
      }

      await docRef.set(dashboard, { merge: true })

      return NextResponse.json({ dashboard })
    }

    return NextResponse.json(
      { error: "Dashboard hanya tersedia untuk akun toko dan teknisi." },
      { status: 403 }
    )
  } catch (error) {
    console.error("Dashboard API mutation error:", error)

    if (error instanceof Error && error.message === "PROFILE_NOT_FOUND") {
      return NextResponse.json(
        { error: "Profil pengguna belum ditemukan." },
        { status: 404 }
      )
    }

    return NextResponse.json(
      {
        error: isFirebaseAdminConfigError(error)
          ? "Firebase Admin belum dikonfigurasi di server deploy."
          : "Gagal memperbarui dashboard.",
      },
      { status: 500 }
    )
  }
}
