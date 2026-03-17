import { NextResponse } from "next/server"
import { adminDb } from "@/lib/firebase-admin"

export const runtime = "nodejs"

type RouteContext = {
  params: Promise<{
    id: string
  }>
}

export async function GET(_request: Request, context: RouteContext) {
  try {
    const { id } = await context.params
    const orderId = decodeURIComponent(id)
    const snap = await adminDb.collection("orders").doc(orderId).get()

    if (!snap.exists) {
      return NextResponse.json(
        { error: `Dokumen orders/${orderId} tidak ditemukan.` },
        { status: 404 }
      )
    }

    return NextResponse.json({
      id: snap.id,
      ...snap.data(),
    })
  } catch (error) {
    console.error("Orders API error:", error)

    return NextResponse.json(
      { error: "Gagal memuat data pesanan." },
      { status: 500 }
    )
  }
}
