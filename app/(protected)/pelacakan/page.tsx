"use client"

import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import {
  ArrowLeft,
  Phone,
  MessageCircle,
  Clock,
  MapPin,
  Smartphone,
  Check,
  Loader2,
} from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { screenToPath, type Screen } from "@/types/navigation"
import BottomNav from "@/components/layout/BottomNav"
import { PageLoader } from "@/components/ui/PageLoader"
import {
  formatRupiah,
  normalizeTrackingData,
} from "@/lib/service-tracking"
import type {
  OrderTrackingMutationAction,
  TrackingData,
} from "@/types/tracking"

const TRACKING_ENDPOINT = "/api/orders/sample"

export default function PelacakanPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const orderId = searchParams.get("orderId")
  const navigate = (screen: Screen) => router.push(screenToPath(screen))
  const [tracking, setTracking] = useState<TrackingData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [actionError, setActionError] = useState("")
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [pendingAction, setPendingAction] =
    useState<OrderTrackingMutationAction | null>(null)

  useEffect(() => {
    async function loadTracking() {
      try {
        setLoading(true)
        setError("")
        const endpoint = orderId ? `/api/orders/${orderId}` : "/api/orders/sample"
        const response = await fetch(endpoint, {
          cache: "no-store",
        })

        if (!response.ok) {
          throw new Error("Gagal memuat data pelacakan.")
        }

        const data = (await response.json()) as { tracking?: TrackingData }
        setTracking(data.tracking ? normalizeTrackingData(data.tracking) : null)
      } catch (error) {
        console.error("Failed to load tracking data:", error)
        setError("Data pelacakan belum bisa dimuat.")
      } finally {
        setLoading(false)
      }
    }

    void loadTracking()
  }, [orderId])

  const serviceCostConfirmation = tracking?.serviceCostConfirmation || null
  const isAwaitingConfirmation = serviceCostConfirmation?.status === "pending"
  const isApproved = serviceCostConfirmation?.status === "approved"
  const isRejected = serviceCostConfirmation?.status === "rejected"
  const isSubmitting = pendingAction !== null

  async function handleServiceCostAction(action: OrderTrackingMutationAction) {
    try {
      setPendingAction(action)
      setActionError("")
      const endpoint = orderId ? `/api/orders/${orderId}` : "/api/orders/sample"
      const response = await fetch(endpoint, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ action }),
      })

      const data = (await response.json()) as {
        error?: string
        tracking?: TrackingData
      }

      if (!response.ok) {
        throw new Error(data.error || "Gagal memperbarui konfirmasi biaya servis.")
      }

      setTracking(data.tracking ? normalizeTrackingData(data.tracking) : null)
      setIsDialogOpen(false)
    } catch (nextError) {
      console.error("Failed to mutate service cost confirmation:", nextError)
      setActionError(
        nextError instanceof Error
          ? nextError.message
          : "Gagal memperbarui konfirmasi biaya servis."
      )
    } finally {
      setPendingAction(null)
    }
  }

  if (loading) {
    return <PageLoader message="Memuat pelacakan servis..." />
  }

  return (
    <div
      className="min-h-screen bg-[#F5F7FA]"
      style={{
        paddingBottom: "calc(140px + env(safe-area-inset-bottom))",
      }}
    >
      <header className="sticky top-0 z-50 bg-background border-b border-border px-4 md:px-6 lg:px-8 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate("home")}>
            <ArrowLeft className="w-5 h-5 text-primary" />
          </button>

          <div>
            <h1 className="text-base md:text-lg font-bold">Tracking Servis</h1>
            <p className="text-xs text-muted-foreground">Order #{tracking?.orderId || "-"}</p>
          </div>
        </div>

        <span className="bg-secondary text-primary text-xs font-semibold px-3 py-1.5 rounded-full border border-primary/20">
          {tracking?.statusBadge || "-"}
        </span>
      </header>

      <main className="max-w-5xl mx-auto px-4 md:px-6 lg:px-8 space-y-4 mt-4">
        {error ? (
          <div className="bg-red-50 border border-red-200 text-red-700 rounded-2xl px-4 py-3 text-sm">
            {error}
          </div>
        ) : null}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-card rounded-2xl border border-border p-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-[#F5F7FA] rounded-xl flex items-center justify-center">
                <Smartphone className="w-5 h-5 text-primary" />
              </div>

              <div>
                <p className="text-sm font-bold">{tracking?.deviceName || "-"}</p>
                <p className="text-xs text-muted-foreground">
                  {tracking?.deviceIssue || "-"}
                </p>

                <div className="flex flex-wrap gap-3 mt-2">
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Clock className="w-3 h-3" />
                    ETA: {tracking?.eta || "-"}
                  </div>

                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <MapPin className="w-3 h-3" />
                    {tracking?.pickupType || "-"}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-card rounded-2xl border border-border p-4 flex justify-between items-center">
            {tracking?.courier || tracking?.receiptNumber ? (
              <div>
                <p className="text-sm font-semibold">Kurir Pengiriman</p>
                <p className="text-xs text-muted-foreground">
                  {tracking?.courier || "Kurir Reguler"} {"\u2022"} Resi: {tracking?.receiptNumber || "-"}
                </p>
              </div>
            ) : (
              <div>
                <p className="text-sm font-semibold">Teknisi Anda</p>
                <p className="text-xs text-muted-foreground">
                  {tracking?.technicianRating || "-"} {"\u2022"} {tracking?.technicianCompleted || "-"}
                </p>
              </div>
            )}

            <div className="flex gap-2">
              <button className="w-9 h-9 rounded-full bg-secondary border border-primary/20 flex items-center justify-center">
                <Phone className="w-4 h-4 text-primary" />
              </button>

              <button className="w-9 h-9 rounded-full bg-secondary border border-primary/20 flex items-center justify-center">
                <MessageCircle className="w-4 h-4 text-primary" />
              </button>
            </div>
          </div>
        </div>

        <div className="bg-card rounded-2xl border border-border p-5">
          <h2 className="text-sm font-bold mb-6">Status Pengerjaan</h2>

          <div className="relative">
            {(tracking?.steps || []).map((item, index) => (
              <div
                key={item.step}
                className="flex gap-4 relative pb-8 last:pb-0"
              >
                {index !== (tracking?.steps || []).length - 1 && (
                  <div className="absolute left-4 top-8 w-0.5 h-full bg-border" />
                )}

                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold z-10 ${
                    item.status === "done"
                      ? "bg-primary text-white"
                      : item.status === "active"
                        ? "bg-primary text-white"
                        : "bg-white border-2 border-border text-muted-foreground"
                  }`}
                >
                  {item.status === "done" ? <Check className="w-4 h-4" /> : item.step}
                </div>

                <div>
                  <p
                    className={`text-sm font-semibold ${
                      item.status === "active"
                        ? "text-primary"
                        : item.status === "done"
                          ? "text-foreground"
                          : "text-muted-foreground"
                    }`}
                  >
                    {item.label}
                  </p>

                  {item.date && (
                    <p className="text-xs text-muted-foreground mt-1">
                      {item.date}
                    </p>
                  )}

                  {item.desc && (
                    <p className="text-xs text-muted-foreground mt-1">
                      {item.desc}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {serviceCostConfirmation ? (
          <div className="bg-card rounded-2xl border border-border p-5">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <h2 className="text-sm font-bold">
                  {serviceCostConfirmation.title}
                </h2>
                <p className="text-xs text-muted-foreground mt-1">
                  {serviceCostConfirmation.note}
                </p>
              </div>

              <span
                className={`inline-flex w-fit rounded-full px-3 py-1 text-xs font-semibold ${
                  isApproved
                    ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                    : isRejected
                      ? "bg-amber-50 text-amber-700 border border-amber-200"
                      : "bg-secondary text-primary border border-primary/20"
                }`}
              >
                {isApproved
                  ? "Disetujui"
                  : isRejected
                    ? "Ditolak"
                    : "Menunggu Persetujuan"}
              </span>
            </div>

            <div className="mt-5 space-y-3">
              {serviceCostConfirmation.lineItems.map((item) => (
                <div
                  key={item.label}
                  className="flex items-center justify-between text-sm"
                >
                  <span className="text-muted-foreground">{item.label}</span>
                  <span className="font-medium">{formatRupiah(item.amount)}</span>
                </div>
              ))}

              <div className="flex items-center justify-between text-sm pt-3 border-t border-border">
                <span className="text-muted-foreground">Subtotal</span>
                <span className="font-medium">
                  {formatRupiah(serviceCostConfirmation.subtotal)}
                </span>
              </div>

              {serviceCostConfirmation.discount > 0 ? (
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Diskon</span>
                  <span className="font-medium text-emerald-600">
                    -{formatRupiah(serviceCostConfirmation.discount)}
                  </span>
                </div>
              ) : null}

              <div className="flex items-center justify-between rounded-xl bg-[#F5F7FA] px-4 py-3">
                <span className="text-sm font-semibold">Total Estimasi</span>
                <span className="text-base font-bold text-primary">
                  {formatRupiah(serviceCostConfirmation.total)}
                </span>
              </div>
            </div>

            {actionError ? (
              <div className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {actionError}
              </div>
            ) : null}

            {isAwaitingConfirmation ? (
              <div className="mt-5">
                <button
                  onClick={() => {
                    setActionError("")
                    setIsDialogOpen(true)
                  }}
                  className="w-full bg-primary text-white text-sm font-semibold py-3 rounded-xl shadow-md hover:opacity-90 transition"
                >
                  Konfirmasi Biaya Servis
                </button>
              </div>
            ) : isApproved ? (
              <div className="mt-5 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
                Biaya servis sudah Anda setujui
                {serviceCostConfirmation.approvedAt
                  ? ` pada ${serviceCostConfirmation.approvedAt}.`
                  : "."}
              </div>
            ) : (
              <div className="mt-5 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700">
                Estimasi biaya telah ditolak
                {serviceCostConfirmation.rejectedAt
                  ? ` pada ${serviceCostConfirmation.rejectedAt}.`
                  : "."}{" "}
                Tim support akan menghubungi Anda.
              </div>
            )}
          </div>
        ) : null}
      </main>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-md" showCloseButton={!isSubmitting}>
          <DialogHeader>
            <DialogTitle>Konfirmasi biaya servis</DialogTitle>
            <DialogDescription>
              Periksa kembali rincian biaya sebelum Anda menyetujui atau menolak estimasi.
            </DialogDescription>
          </DialogHeader>

          {serviceCostConfirmation ? (
            <div className="space-y-3">
              {serviceCostConfirmation.lineItems.map((item) => (
                <div
                  key={`dialog-${item.label}`}
                  className="flex items-center justify-between text-sm"
                >
                  <span className="text-muted-foreground">{item.label}</span>
                  <span className="font-medium">{formatRupiah(item.amount)}</span>
                </div>
              ))}

              <div className="flex items-center justify-between border-t border-border pt-3 text-sm">
                <span className="text-muted-foreground">Subtotal</span>
                <span className="font-medium">
                  {formatRupiah(serviceCostConfirmation.subtotal)}
                </span>
              </div>

              {serviceCostConfirmation.discount > 0 ? (
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Diskon</span>
                  <span className="font-medium text-emerald-600">
                    -{formatRupiah(serviceCostConfirmation.discount)}
                  </span>
                </div>
              ) : null}

              <div className="flex items-center justify-between rounded-xl bg-[#F5F7FA] px-4 py-3">
                <span className="text-sm font-semibold">Total</span>
                <span className="text-base font-bold text-primary">
                  {formatRupiah(serviceCostConfirmation.total)}
                </span>
              </div>

              {actionError ? (
                <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                  {actionError}
                </div>
              ) : null}

              <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
                <button
                  onClick={() => setIsDialogOpen(false)}
                  disabled={isSubmitting}
                  className="rounded-xl border border-border px-4 py-3 text-sm font-medium text-foreground hover:bg-accent disabled:cursor-not-allowed disabled:opacity-60"
                >
                  Nanti Saja
                </button>

                <button
                  onClick={() => void handleServiceCostAction("serviceCost.reject")}
                  disabled={isSubmitting}
                  className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-semibold text-amber-700 hover:bg-amber-100 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {pendingAction === "serviceCost.reject" ? (
                    <span className="inline-flex items-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Memproses...
                    </span>
                  ) : (
                    "Tolak"
                  )}
                </button>

                <button
                  onClick={() => void handleServiceCostAction("serviceCost.approve")}
                  disabled={isSubmitting}
                  className="rounded-xl bg-primary px-4 py-3 text-sm font-semibold text-white hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {pendingAction === "serviceCost.approve" ? (
                    <span className="inline-flex items-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Memproses...
                    </span>
                  ) : (
                    "Setujui"
                  )}
                </button>
              </div>
            </div>
          ) : null}
        </DialogContent>
      </Dialog>

      <BottomNav active="tracking" navigate={navigate} />
    </div>
  )
}
