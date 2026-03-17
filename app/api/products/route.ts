import { NextResponse } from "next/server"
import { adminDb } from "@/lib/firebase-admin"

export const runtime = "nodejs"

export async function GET() {
  try {
    const snap = await adminDb.collection("products").get()

    const products = snap.docs.map((productDoc) => ({
      id: productDoc.id,
      ...productDoc.data(),
    }))

    return NextResponse.json({ products })
  } catch (error) {
    console.error("Products API error:", error)

    return NextResponse.json(
      { error: "Gagal memuat daftar produk." },
      { status: 500 }
    )
  }
}
