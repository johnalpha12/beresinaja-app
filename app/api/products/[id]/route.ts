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
    const productId = decodeURIComponent(id)
    const snap = await adminDb.collection("products").doc(productId).get()

    if (!snap.exists) {
      return NextResponse.json(
        { error: `Dokumen products/${productId} tidak ditemukan.` },
        { status: 404 }
      )
    }

    return NextResponse.json({
      id: snap.id,
      ...snap.data(),
    })
  } catch (error) {
    console.error("Product detail API error:", error)

    return NextResponse.json(
      { error: "Gagal memuat detail produk." },
      { status: 500 }
    )
  }
}
