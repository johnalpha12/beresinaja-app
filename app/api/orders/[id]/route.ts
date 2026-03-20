import { NextRequest, NextResponse } from "next/server"
import { getAdminDb } from "@/lib/firebase-admin"
import {
  applyTrackingMutation,
  normalizeTrackingData,
} from "@/lib/service-tracking"
import type { OrderTrackingMutationAction } from "@/types/tracking"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

type RouteContext = {
  params: Promise<{
    id: string
  }>
}

export async function GET(_request: Request, context: RouteContext) {
  try {
    const adminDb = getAdminDb()
    const { id } = await context.params
    const orderId = decodeURIComponent(id)
    const snap = await adminDb.collection("orders").doc(orderId).get()

    if (!snap.exists) {
      return NextResponse.json(
        { error: `Dokumen orders/${orderId} tidak ditemukan.` },
        { status: 404 }
      )
    }

    const orderData = snap.data() || {}

    return NextResponse.json({
      id: snap.id,
      ...orderData,
      tracking: orderData.tracking
        ? normalizeTrackingData(orderData.tracking)
        : null,
    })
  } catch (error) {
    console.error("Orders API error:", error)

    return NextResponse.json(
      { error: "Gagal memuat data pesanan." },
      { status: 500 }
    )
  }
}

type TrackingMutationRequest = {
  action?: OrderTrackingMutationAction
}

export async function PATCH(request: NextRequest, context: RouteContext) {
  try {
    const adminDb = getAdminDb()
    const { id } = await context.params
    const orderId = decodeURIComponent(id)
    const body = (await request.json().catch(() => ({}))) as TrackingMutationRequest
    const action = body.action

    if (
      action !== "serviceCost.approve" &&
      action !== "serviceCost.reject"
    ) {
      return NextResponse.json(
        { error: "Aksi konfirmasi biaya servis tidak valid." },
        { status: 400 }
      )
    }

    const docRef = adminDb.collection("orders").doc(orderId)
    const snap = await docRef.get()

    if (!snap.exists) {
      return NextResponse.json(
        { error: `Dokumen orders/${orderId} tidak ditemukan.` },
        { status: 404 }
      )
    }

    const currentOrder = snap.data() || {}
    const tracking = applyTrackingMutation(currentOrder.tracking, action)

    await docRef.set(
      {
        tracking,
      },
      { merge: true }
    )

    return NextResponse.json({
      id: snap.id,
      ...currentOrder,
      tracking,
    })
  } catch (error) {
    console.error("Orders API mutation error:", error)
    const message =
      error instanceof Error
        ? error.message
        : "Gagal memperbarui konfirmasi biaya servis."
    const status =
      /belum tersedia|sudah diproses|tidak ditemukan|tidak valid/i.test(message)
        ? 400
        : 500

    return NextResponse.json(
      { error: message },
      { status }
    )
  }
}
