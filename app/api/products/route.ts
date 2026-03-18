import { NextResponse } from "next/server"
import { getAdminDb, isFirebaseAdminConfigError } from "@/lib/firebase-admin"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

export async function GET() {
  try {
    const adminDb = getAdminDb()
    const snap = await adminDb.collection("products").get()

    const products = snap.docs.map((productDoc) => ({
      id: productDoc.id,
      ...productDoc.data(),
    }))

    return NextResponse.json({ products })
  } catch (error) {
    console.error("Products API error:", error)

    return NextResponse.json(
      {
        error: isFirebaseAdminConfigError(error)
          ? "Firebase Admin belum dikonfigurasi di server deploy."
          : "Gagal memuat daftar produk.",
      },
      { status: 500 }
    )
  }
}
