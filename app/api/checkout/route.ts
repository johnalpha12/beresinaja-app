import { NextRequest, NextResponse } from "next/server"
import { getAdminDb, getAdminAuth, isFirebaseAdminConfigError } from "@/lib/firebase-admin"
import type { StoreDashboardOrder, StoreDashboardData } from "@/types/dashboard"
import { normalizeStoreDashboard } from "@/lib/dashboard-defaults"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

function getBearerToken(request: NextRequest) {
  const authorization = request.headers.get("authorization") || ""
  if (!authorization.startsWith("Bearer ")) {
    return ""
  }
  return authorization.slice("Bearer ".length).trim()
}

export async function POST(request: NextRequest) {
  try {
    const adminDb = getAdminDb()
    const adminAuth = getAdminAuth()

    const body = await request.json()
    const { productId, productName, quantity, totalPrice, paymentMethod } = body

    if (!productId) {
      return NextResponse.json({ error: "Product ID required." }, { status: 400 })
    }

    // Try finding the user to log as buyer (from token if available)
    const token = getBearerToken(request)
    let buyerName = "Guest User"
    let buyerAvatar = "👤"
    
    if (token) {
      try {
        const decodedToken = await adminAuth.verifyIdToken(token)
        if (decodedToken.name) {
          buyerName = decodedToken.name
          buyerAvatar = decodedToken.name.charAt(0).toUpperCase()
        } else if (decodedToken.email) {
          buyerName = decodedToken.email.split("@")[0]
          buyerAvatar = buyerName.charAt(0).toUpperCase()
        }
      } catch (e) {
        // Just ignore if token invalid
      }
    }

    // Get the product to find the store owner
    const productSnap = await adminDb.collection("products").doc(productId).get()
    
    if (!productSnap.exists) {
      return NextResponse.json({ error: "Product not found." }, { status: 404 })
    }

    const productData = productSnap.data() || {}
    const storeUid = productData.storeUid

    if (!storeUid) {
      // Products without a specific store, no store to notify
      return NextResponse.json({ success: true, warning: "Product has no storeUid" })
    }

    const docRef = adminDb.collection("storeDashboards").doc(storeUid)
    const storeSnap = await docRef.get()
    
    let dashboardData: Partial<StoreDashboardData> = storeSnap.exists ? storeSnap.data() as StoreDashboardData : {}
    dashboardData = normalizeStoreDashboard(dashboardData, dashboardData.summary?.name || "Toko")

    const orderDateFormatted = new Date().toLocaleDateString("id-ID", {
      day: "numeric",
      month: "short",
      year: "numeric"
    })

    const newOrder: StoreDashboardOrder = {
      id: `ORD-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      customerName: buyerName,
      customerAvatar: buyerAvatar,
      productName: productName || productData.name || "Produk",
      quantity: quantity || 1,
      totalPrice: totalPrice || `Rp ${new Intl.NumberFormat("id-ID").format(productData.price || 0)}`,
      orderDate: orderDateFormatted,
      status: "pending"
    }

    // Save for the store
    await docRef.set({
      ...dashboardData,
      pendingOrders: [newOrder, ...(dashboardData.pendingOrders || [])],
      stats: dashboardData.stats?.map(stat => 
        stat.label === "Pesanan" || stat.label === "Order" 
          ? { ...stat, value: String(Number(stat.value) + 1), subvalue: "baru" }
          : stat
      )
    }, { merge: true })

    // Save public order document for success page
    await adminDb.collection("orders").doc(newOrder.id).set({
      orderId: newOrder.id,
      productName: newOrder.productName,
      variant: productData.conditionBadge || "Baru",
      totalAmount: typeof totalPrice === "number" ? totalPrice : productData.price || 0,
      estimatedDelivery: "3-5 Hari",
      paymentMethod: paymentMethod || "Transfer Bank",
      status: "pending",
      storeUid: storeUid
    })

    return NextResponse.json({ success: true, orderId: newOrder.id })
    
  } catch (error) {
    console.error("Checkout API error:", error)
    return NextResponse.json(
      { error: "Gagal memproses checkout." },
      { status: 500 }
    )
  }
}
