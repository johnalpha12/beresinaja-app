"use client";

import { CheckCircle2, MapPin, Clock, ArrowRight } from "lucide-react";
import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { PrimaryButton } from "@/components/ui/PrimaryButton";
import { OutlineButton } from "@/components/ui/OutlineButton";
import { PageLoader } from "@/components/ui/PageLoader";
import { screenToPath } from "@/types/navigation";

type OrderInfo = {
  orderId: string;
  productName: string;
  variant: string;
  totalAmount: number;
  estimatedDelivery: string;
  paymentMethod: string;
};

function PesananBerhasilContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const orderIdQuery = searchParams.get("orderId");
  const [orderInfo, setOrderInfo] = useState<OrderInfo | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadOrder() {
      try {
        setLoading(true);
        const endpoint = orderIdQuery ? `/api/orders/${orderIdQuery}` : "/api/orders/sample";
        const response = await fetch(endpoint, {
          cache: "no-store",
        });

        if (!response.ok) {
          throw new Error("Gagal memuat data pesanan.");
        }

        const data = await response.json();
        setOrderInfo(orderIdQuery ? data : (data.summary || null));
      } catch (error) {
        console.error("Failed to load order success data:", error);
      } finally {
        setLoading(false);
      }
    }

    loadOrder();
  }, []);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(price);
  };

  if (loading) {
    return <PageLoader message="Memuat ringkasan pesanan..." />;
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col items-center justify-center p-6">
      <div className="max-w-md w-full">
        {/* Success Icon & Message */}
        <div className="text-center mb-8">
          <div className="w-24 h-24 bg-gradient-to-br from-[#0288D1] to-[#4FC3F7] rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg shadow-[#0288D1]/30">
            <CheckCircle2 className="w-12 h-12 text-white" />
          </div>
          <h1 className="text-2xl text-[#4A4A4A] mb-2">Pesanan Berhasil!</h1>
          <p className="text-[#6B6B6B]">
            Terima kasih telah berbelanja di BeresinAja
          </p>
        </div>

        {/* Order Details Card */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-[#E5E7EB] mb-6 space-y-5">
          <div className="pb-4 border-b border-[#E5E7EB]">
            <div className="text-xs text-[#6B6B6B] mb-1">Nomor Pesanan</div>
            <div className="text-[#0288D1] flex items-center justify-between">
              <span>{orderInfo?.orderId || "-"}</span>
              <button className="text-xs px-3 py-1 bg-[#0288D1]/10 rounded-full hover:bg-[#0288D1]/20 transition-colors">
                Salin
              </button>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#F8FAFC] to-[#E5E7EB] flex items-center justify-center flex-shrink-0">
                <MapPin className="w-5 h-5 text-[#6B6B6B]" />
              </div>
              <div className="flex-1">
                <h3 className="text-[#4A4A4A] mb-0.5">{orderInfo?.productName || "-"}</h3>
                <p className="text-sm text-[#6B6B6B]">{orderInfo?.variant || "-"}</p>
              </div>
            </div>

            <div className="pt-4 border-t border-[#E5E7EB] space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-[#6B6B6B]">Total Pembayaran</span>
                <span className="text-[#0288D1]">{formatPrice(orderInfo?.totalAmount || 0)}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-[#6B6B6B]">Metode Pembayaran</span>
                <span className="text-[#4A4A4A]">{orderInfo?.paymentMethod || "-"}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Next Steps */}
        <div className="bg-gradient-to-r from-[#0288D1]/5 to-[#4FC3F7]/5 border border-[#0288D1]/20 rounded-2xl p-5 mb-6">
          <h3 className="text-[#4A4A4A] mb-4 flex items-center gap-2">
            <Clock className="w-5 h-5 text-[#0288D1]" />
            Langkah Selanjutnya
          </h3>
          <div className="space-y-3 text-sm">
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-[#0288D1] text-white flex items-center justify-center flex-shrink-0 text-xs">
                1
              </div>
              <div className="flex-1 pt-0.5">
                <p className="text-[#4A4A4A]">Selesaikan Pembayaran</p>
                <p className="text-xs text-[#6B6B6B] mt-0.5">
                  Instruksi pembayaran telah dikirim ke email Anda
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-[#0288D1] text-white flex items-center justify-center flex-shrink-0 text-xs">
                2
              </div>
              <div className="flex-1 pt-0.5">
                <p className="text-[#4A4A4A]">Penjual Akan Proses Pesanan</p>
                <p className="text-xs text-[#6B6B6B] mt-0.5">
                  Setelah pembayaran dikonfirmasi (maks. 2 jam)
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-[#0288D1] text-white flex items-center justify-center flex-shrink-0 text-xs">
                3
              </div>
              <div className="flex-1 pt-0.5">
                <p className="text-[#4A4A4A]">Paket Akan Dikirim</p>
                <p className="text-xs text-[#6B6B6B] mt-0.5">
                  Estimasi tiba: {orderInfo?.estimatedDelivery || "-"}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* CTAs */}
        <div className="space-y-3">
          <PrimaryButton
            label="Lacak Pesanan"
            onClick={() => router.push(screenToPath("tracking"))}
          />
          <OutlineButton
            label="Kembali ke Beranda"
            onClick={() => router.push(screenToPath("home"))}
          />
        </div>

        {/* Help Text */}
        <div className="text-center mt-6">
          <p className="text-xs text-[#6B6B6B] mb-2">
            Butuh bantuan dengan pesanan Anda?
          </p>
          <button className="text-[#0288D1] text-sm flex items-center gap-1 mx-auto hover:underline">
            <span>Hubungi Customer Service</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

export default function PesananBerhasilPage() {
  return (
    <Suspense fallback={<PageLoader message="Memuat ringkasan pesanan..." />}>
      <PesananBerhasilContent />
    </Suspense>
  )
}
