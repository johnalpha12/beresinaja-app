import { NextRequest, NextResponse } from "next/server"
import { getAdminDb, getAdminAuth } from "@/lib/firebase-admin"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

function getBearerToken(request: NextRequest) {
  const authorization = request.headers.get("authorization") || ""
  if (!authorization.startsWith("Bearer ")) return ""
  return authorization.slice("Bearer ".length).trim()
}

export async function POST(request: NextRequest) {
  try {
    const token = getBearerToken(request)
    if (!token) {
      return NextResponse.json({ error: "Token autentikasi tidak ditemukan." }, { status: 401 })
    }

    const adminAuth = getAdminAuth()
    const decodedToken = await adminAuth.verifyIdToken(token)
    const userId = decodedToken.uid
    
    // Attempt to get user name
    let userName = decodedToken.name || decodedToken.email?.split("@")[0] || "Pelanggan"

    const adminDb = getAdminDb()
    const userSnap = await adminDb.collection("users").doc(userId).get()
    if (userSnap.exists) {
      const data = userSnap.data()
      if (data?.fullName) userName = data.fullName
    }

    const body = await request.json()
    // type: "product" | "service"
    const { type, orderId, targetId, rating, comment } = body

    if (!orderId || !targetId || !rating) {
      return NextResponse.json({ error: "Data ulasan tidak lengkap." }, { status: 400 })
    }

    const reviewRef = adminDb.collection("reviews").doc()
    
    const reviewData = {
      id: reviewRef.id,
      userId,
      userName,
      type,
      orderId,
      targetId, // productId or technicianId
      rating: Number(rating),
      comment: comment || "",
      createdAt: new Date().toISOString()
    }

    const batch = adminDb.batch()
    batch.set(reviewRef, reviewData)

    if (type === "service") {
      // Mark serviceOrder as reviewed
      const serviceOrderRef = adminDb.collection("serviceOrders").doc(orderId)
      batch.update(serviceOrderRef, { rating: Number(rating), reviewed: true })

      // Update technician rating if wanted (optional complex math, simplifying by just pushing it)
      // Usually we need to read all reviews to avg, but for now we just store it
      // Let's notify technician
      batch.set(adminDb.collection("notifications").doc(), {
        userId: targetId,
        type: "review",
        title: "Ulasan Bintang Baru",
        message: `${userName} memberikan bintang ${rating} untuk servis Anda: "${comment}".`,
        isRead: false,
        createdAt: new Date()
      })
    } else if (type === "product") {
      // Mark store order as reviewed
      const orderRef = adminDb.collection("orders").doc(orderId)
      batch.update(orderRef, { rating: Number(rating), reviewed: true })
      
      // We don't have storeUid directly here unless we fetch product
      const productSnap = await adminDb.collection("products").doc(targetId).get()
      if (productSnap.exists) {
        const pData = productSnap.data()
        if (pData?.storeUid) {
          batch.set(adminDb.collection("notifications").doc(), {
            userId: pData.storeUid,
            type: "review",
            title: "Ulasan Bintang Baru",
            message: `${userName} memberikan bintang ${rating} untuk produk ${pData.name}.`,
            isRead: false,
            createdAt: new Date()
          })
        }
      }
    }

    await batch.commit()

    return NextResponse.json({ success: true, reviewId: reviewRef.id })

  } catch (error) {
    console.error("Review API error:", error)
    return NextResponse.json(
      { error: "Gagal menyimpan ulasan." },
      { status: 500 }
    )
  }
}
