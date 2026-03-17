import { NextResponse } from "next/server"
import { adminDb } from "@/lib/firebase-admin"

export const runtime = "nodejs"

export async function GET() {
  try {
    const configSnap = await adminDb.collection("content").doc("detail-teknisi").get()

    if (!configSnap.exists) {
      return NextResponse.json(
        { error: "Dokumen content/detail-teknisi tidak ditemukan." },
        { status: 404 }
      )
    }

    const data = configSnap.data() as {
      technicianId?: string
    }

    if (!data.technicianId) {
      return NextResponse.json(
        { error: "technicianId belum diset di content/detail-teknisi." },
        { status: 400 }
      )
    }

    return NextResponse.json({ technicianId: data.technicianId })
  } catch (error) {
    console.error("Default technician API error:", error)

    return NextResponse.json(
      { error: "Gagal memuat teknisi default." },
      { status: 500 }
    )
  }
}
