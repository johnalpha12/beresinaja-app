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
    const documentId = decodeURIComponent(id)
    const snap = await adminDb.collection("content").doc(documentId).get()

    if (!snap.exists) {
      return NextResponse.json(
        { error: `Dokumen content/${documentId} tidak ditemukan.` },
        { status: 404 }
      )
    }

    return NextResponse.json({
      id: snap.id,
      ...snap.data(),
    })
  } catch (error) {
    console.error("Content API error:", error)

    return NextResponse.json(
      { error: "Gagal memuat dokumen content." },
      { status: 500 }
    )
  }
}
