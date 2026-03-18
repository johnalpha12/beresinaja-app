import { NextResponse } from "next/server"
import { getAdminDb } from "@/lib/firebase-admin"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

export async function GET() {
  try {
    const adminDb = getAdminDb()
    const snap = await adminDb.collection("technicians").get()

    const technicians = snap.docs
      .map((technicianDoc) => {
        const data = technicianDoc.data() as {
          name: string
          photo: string
          specialization: string
          rating: number
          totalJobs: number
          responseTime: string
          location: string
          verified: boolean
        }

        return {
          id: technicianDoc.id,
          name: data.name,
          photo: data.photo,
          specialization: data.specialization,
          rating: data.rating,
          totalJobs: data.totalJobs,
          responseTime: data.responseTime,
          location: data.location,
          verified: data.verified,
        }
      })
      .sort((left, right) => {
        if (right.rating !== left.rating) {
          return right.rating - left.rating
        }

        return right.totalJobs - left.totalJobs
      })

    return NextResponse.json({ technicians })
  } catch (error) {
    console.error("Technicians API error:", error)

    return NextResponse.json(
      { error: "Gagal memuat daftar teknisi." },
      { status: 500 }
    )
  }
}
