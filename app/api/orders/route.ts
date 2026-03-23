import { NextRequest, NextResponse } from "next/server"
import { getAdminDb, getAdminAuth } from "@/lib/firebase-admin"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

function getBearerToken(request: NextRequest) {
  const authorization = request.headers.get("authorization") || ""
  if (!authorization.startsWith("Bearer ")) return ""
  return authorization.slice("Bearer ".length).trim()
}

export async function GET(request: NextRequest) {
  try {
    const token = getBearerToken(request)
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const adminAuth = getAdminAuth()
    const decodedToken = await adminAuth.verifyIdToken(token)
    const userId = decodedToken.uid

    const adminDb = getAdminDb()
    const snapshot = await adminDb
      .collection("orders")
      .where("userId", "==", userId)
      .get()

    const orders = snapshot.docs
      .map(doc => ({
        id: doc.id,
        ...doc.data()
      }))
      .sort((a: any, b: any) => {
        const dateA = a.createdAt || 0
        const dateB = b.createdAt || 0
        return dateB - dateA
      })

    return NextResponse.json({ orders })
  } catch (error) {
    console.error("GET orders error:", error)
    return NextResponse.json({ error: "Failed to fetch orders" }, { status: 500 })
  }
}
