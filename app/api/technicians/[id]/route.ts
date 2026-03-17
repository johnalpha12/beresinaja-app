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
    const technicianId = decodeURIComponent(id)
    const technicianSnap = await adminDb
      .collection("technicians")
      .doc(technicianId)
      .get()

    if (!technicianSnap.exists) {
      return NextResponse.json(
        { error: "Data teknisi tidak ditemukan." },
        { status: 404 }
      )
    }

    return NextResponse.json({
      id: technicianSnap.id,
      ...technicianSnap.data(),
    })
  } catch (error) {
    console.error("Technician detail API error:", error)

    return NextResponse.json(
      { error: "Gagal memuat detail teknisi." },
      { status: 500 }
    )
  }
}
