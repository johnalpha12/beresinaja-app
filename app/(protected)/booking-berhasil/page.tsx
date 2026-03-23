"use client"

import { CheckCircle2, Clock, Wrench } from "lucide-react"
import { useRouter, useSearchParams } from "next/navigation"
import { PrimaryButton } from "@/components/ui/PrimaryButton"
import { OutlineButton } from "@/components/ui/OutlineButton"
import { Suspense } from "react"
import { PageLoader } from "@/components/ui/PageLoader"
import { screenToPath } from "@/types/navigation"

function BookingBerhasilContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const orderId = searchParams.get("serviceOrderId")

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col items-center justify-center p-6 text-center">
      <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[#10B981] to-[#34D399] flex items-center justify-center text-white shadow-lg shadow-[#10B981]/20 mb-6">
        <CheckCircle2 className="w-10 h-10" />
      </div>

      <h1 className="text-2xl font-bold text-[#4A4A4A] mb-2">Booking Berhasil!</h1>
      <p className="text-sm text-[#6B6B6B] mb-8 max-w-sm">
        Teknisi telah menerima permintaan servis Anda. Harap tunggu konfirmasi atau lacak status pesanan Anda.
      </p>

      <div className="w-full max-w-sm bg-white rounded-2xl border border-[#E5E7EB] p-5 mb-8 text-left shadow-sm">
        <div className="flex items-center gap-3 mb-4 pb-4 border-b border-[#E5E7EB]">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#0288D1]/10 to-[#4FC3F7]/10 flex items-center justify-center">
            <Wrench className="w-5 h-5 text-[#0288D1]" />
          </div>
          <div>
            <p className="font-semibold text-[#4A4A4A]">ID Pesanan</p>
            <p className="text-xs text-[#0288D1]">{orderId}</p>
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-2 text-sm text-[#6B6B6B]">
              <Clock className="w-4 h-4" />
              <span>Status</span>
            </div>
            <span className="text-sm font-semibold text-[#F59E0B]">Menunggu Teknisi</span>
          </div>
        </div>
      </div>

      <div className="w-full max-w-sm space-y-3">
        <PrimaryButton
          label="Lihat Status Pekerjaan"
          onClick={() => router.push(screenToPath('serviceHistory'))}
        />
        <OutlineButton
          label="Kembali ke Beranda"
          onClick={() => router.push(screenToPath("home"))}
        />
      </div>
    </div>
  )
}

export default function BookingBerhasilPage() {
  return (
    <Suspense fallback={<PageLoader message="Memuat..." />}>
      <BookingBerhasilContent />
    </Suspense>
  )
}
