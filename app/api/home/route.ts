import { NextResponse } from "next/server"
import { getAdminDb, isFirebaseAdminConfigError } from "@/lib/firebase-admin"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

type TechnicianReference =
  | string
  | {
      id?: string | number
      name?: string
      rating?: number
      specialty?: string
      specialization?: string
      photo?: string
      verified?: boolean
    }

function normalizeTechnicianId(reference: TechnicianReference) {
  if (typeof reference === "string") {
    return reference
  }

  if (typeof reference.id === "string" && reference.id.trim()) {
    return reference.id
  }

  if (typeof reference.id === "number") {
    return String(reference.id)
  }

  return ""
}

function getFallbackTechnician(reference: TechnicianReference, technicianId: string) {
  if (typeof reference === "string") {
    return null
  }

  if (!reference.name || typeof reference.rating !== "number") {
    return null
  }

  return {
    id: technicianId,
    name: reference.name,
    rating: reference.rating,
    specialization:
      reference.specialization ||
      reference.specialty ||
      "Teknisi Berpengalaman",
    photo: reference.photo || reference.name.charAt(0).toUpperCase(),
    verified: reference.verified ?? false,
  }
}

export async function GET() {
  try {
    const adminDb = getAdminDb()
    const homeSnap = await adminDb.collection("content").doc("home").get()

    if (!homeSnap.exists) {
      return NextResponse.json(
        { error: "Dokumen content/home tidak ditemukan." },
        { status: 404 }
      )
    }

    const data = homeSnap.data() as {
      services?: unknown[]
      recommendedTechnicians?: TechnicianReference[]
      promo?: unknown
    }

    const technicianItems = await Promise.all(
      (data.recommendedTechnicians || []).map(async (reference) => {
        const technicianId = normalizeTechnicianId(reference)

        if (!technicianId) {
          return null
        }

        const technicianSnap = await adminDb
          .collection("technicians")
          .doc(technicianId)
          .get()

        if (!technicianSnap.exists) {
          return getFallbackTechnician(reference, technicianId)
        }

        const technician = technicianSnap.data() as {
          name: string
          rating: number
          specialization: string
          photo: string
          verified: boolean
        }

        return {
          id: technicianSnap.id,
          name: technician.name,
          rating: technician.rating,
          specialization: technician.specialization,
          photo: technician.photo,
          verified: technician.verified,
        }
      })
    )

    return NextResponse.json({
      services: data.services || [],
      promo: data.promo || null,
      recommendedTechnicians: technicianItems.filter(Boolean),
    })
  } catch (error) {
    console.error("Home API error:", error)

    return NextResponse.json(
      {
        error: isFirebaseAdminConfigError(error)
          ? "Firebase Admin belum dikonfigurasi di server deploy."
          : "Gagal memuat data beranda.",
      },
      { status: 500 }
    )
  }
}
