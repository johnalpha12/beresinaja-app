"use client"

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, MapPin, Truck, Wallet, CreditCard, Building2, Plus, Edit2, Check } from "lucide-react";
import { PrimaryButton } from "@/components/ui/PrimaryButton";
import { PageLoader } from "@/components/ui/PageLoader";
import { screenToPath } from "@/types/navigation";

type ShippingMethod = "regular" | "express";
type PaymentMethod = "bank" | "ewallet" | "cod";

type CheckoutProduct = {
  name: string;
  variant: string;
  price: number;
  quantity: number;
  image: string;
};

type DeliveryAddress = {
  recipient: string;
  phone: string;
  address: string;
  area: string;
  postalCode: string;
};

type ShippingOption = {
  id: ShippingMethod;
  name: string;
  duration: string;
  price: number;
  description: string;
};

type PaymentOption = {
  id: PaymentMethod;
  name: string;
  iconKey: "bank" | "ewallet" | "cod";
  description: string;
};

export default function CheckoutPage() {
  const router = useRouter();
  const onBack = () => router.back();
  const onSuccess = () => router.push(screenToPath("orderSuccess"));
  const [shippingMethod, setShippingMethod] = useState<ShippingMethod>("regular");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("bank");
  const [isProcessing, setIsProcessing] = useState(false);

  const [product, setProduct] = useState<CheckoutProduct | null>(null);
  const [deliveryAddress, setDeliveryAddress] = useState<DeliveryAddress | null>(null);
  const [shippingOptions, setShippingOptions] = useState<ShippingOption[]>([]);
  const [paymentOptions, setPaymentOptions] = useState<PaymentOption[]>([]);
  const [platformFee, setPlatformFee] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadCheckout() {
      try {
        setLoading(true);
        const response = await fetch("/api/content/checkout", {
          cache: "no-store",
        });

        if (!response.ok) {
          throw new Error("Gagal memuat data checkout.");
        }

        const data = (await response.json()) as {
          product?: CheckoutProduct;
          deliveryAddress?: DeliveryAddress;
          shippingOptions?: ShippingOption[];
          paymentOptions?: PaymentOption[];
          platformFee?: number;
        };

        setProduct(data.product || null);
        setDeliveryAddress(data.deliveryAddress || null);
        setShippingOptions(data.shippingOptions || []);
        setPaymentOptions(data.paymentOptions || []);
        setPlatformFee(data.platformFee || 0);
      } catch (error) {
        console.error("Failed to load checkout data:", error);
      } finally {
        setLoading(false);
      }
    }

    loadCheckout();
  }, []);

  const selectedShipping = shippingOptions.find((opt) => opt.id === shippingMethod);
  const subtotal = (product?.price || 0) * (product?.quantity || 0);
  const shippingCost = selectedShipping?.price || 0;
  const total = subtotal + shippingCost + platformFee;

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(price);
  };

  const handleCheckout = () => {
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      onSuccess();
    }, 2000);
  };

  const iconMap = {
    bank: Building2,
    ewallet: Wallet,
    cod: CreditCard,
  } as const;

  if (loading) {
    return <PageLoader message="Memuat checkout..." />;
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col">
      {/* Header */}
      <div className="sticky top-0 bg-white border-b border-[#E5E7EB] px-6 py-4 flex items-center z-10">
        <button
          onClick={onBack}
          className="text-[#0288D1] hover:bg-[#0288D1]/5 p-2 rounded-full -ml-2"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="ml-3 text-[#4A4A4A]">Checkout</h1>
      </div>

      <div className="flex-1 overflow-y-auto pb-32">
        <div className="p-6 space-y-4">
          {/* Product Summary */}
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-[#E5E7EB]">
            <h2 className="text-[#4A4A4A] mb-4">Produk</h2>
            <div className="flex gap-4">
              <div className="w-20 h-20 bg-gradient-to-br from-[#F8FAFC] to-[#E5E7EB] rounded-xl flex items-center justify-center text-4xl flex-shrink-0">
                {product?.image || ""}
              </div>
              <div className="flex-1">
                <h3 className="text-[#4A4A4A] mb-1">{product?.name || "-"}</h3>
                <p className="text-sm text-[#6B6B6B] mb-2">{product?.variant || "-"}</p>
                <div className="flex justify-between items-center">
                  <span className="text-[#0288D1]">{formatPrice(product?.price || 0)}</span>
                  <span className="text-sm text-[#6B6B6B]">x{product?.quantity || 0}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Delivery Address */}
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-[#E5E7EB]">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <MapPin className="w-5 h-5 text-[#0288D1]" />
                <h2 className="text-[#4A4A4A]">Alamat Pengiriman</h2>
              </div>
              <button className="text-[#0288D1] text-sm flex items-center gap-1">
                <Edit2 className="w-4 h-4" />
                Ubah
              </button>
            </div>
            <div className="space-y-1">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-[#4A4A4A]">{deliveryAddress?.recipient || "-"}</p>
                  <p className="text-sm text-[#6B6B6B]">{deliveryAddress?.phone || "-"}</p>
                </div>
                <div className="px-2 py-1 bg-[#0288D1]/10 rounded-lg">
                  <span className="text-xs text-[#0288D1]">Utama</span>
                </div>
              </div>
              <p className="text-sm text-[#6B6B6B] mt-2">
                {deliveryAddress?.address || "-"}
              </p>
              <p className="text-sm text-[#6B6B6B]">
                {deliveryAddress?.area || "-"}, {deliveryAddress?.postalCode || "-"}
              </p>
            </div>
            <button className="w-full mt-4 py-2 rounded-full border border-[#E5E7EB] text-[#0288D1] hover:bg-[#0288D1]/5 transition-colors text-sm flex items-center justify-center gap-2">
              <Plus className="w-4 h-4" />
              Tambah Alamat Baru
            </button>
          </div>

          {/* Shipping Method */}
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-[#E5E7EB]">
            <div className="flex items-center gap-2 mb-4">
              <Truck className="w-5 h-5 text-[#0288D1]" />
              <h2 className="text-[#4A4A4A]">Metode Pengiriman</h2>
            </div>
            <div className="space-y-3">
              {shippingOptions.map((option) => (
                <button
                  key={option.id}
                  onClick={() => setShippingMethod(option.id)}
                  className={`
                    w-full p-4 rounded-xl border-2 transition-all text-left
                    ${shippingMethod === option.id
                      ? "border-[#0288D1] bg-[#0288D1]/5"
                      : "border-[#E5E7EB] hover:border-[#0288D1]/30"
                    }
                  `}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-[#4A4A4A]">{option.name}</h3>
                        {shippingMethod === option.id && (
                          <div className="w-5 h-5 rounded-full bg-[#0288D1] flex items-center justify-center">
                            <Check className="w-3 h-3 text-white" />
                          </div>
                        )}
                      </div>
                      <p className="text-sm text-[#6B6B6B] mb-1">{option.duration}</p>
                      <p className="text-xs text-[#6B6B6B]">{option.description}</p>
                    </div>
                    <div className="text-[#0288D1] ml-4">
                      {option.price === 0 ? "GRATIS" : formatPrice(option.price)}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Payment Method */}
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-[#E5E7EB]">
            <div className="flex items-center gap-2 mb-4">
              <Wallet className="w-5 h-5 text-[#0288D1]" />
              <h2 className="text-[#4A4A4A]">Metode Pembayaran</h2>
            </div>
            <div className="space-y-3">
              {paymentOptions.map((option) => {
                const Icon = iconMap[option.iconKey] || Wallet;
                return (
                  <button
                    key={option.id}
                    onClick={() => setPaymentMethod(option.id)}
                    className={`
                      w-full p-4 rounded-xl border-2 transition-all text-left
                      ${paymentMethod === option.id
                        ? "border-[#0288D1] bg-[#0288D1]/5"
                        : "border-[#E5E7EB] hover:border-[#0288D1]/30"
                      }
                    `}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`
                          w-10 h-10 rounded-full flex items-center justify-center
                          ${paymentMethod === option.id
                            ? "bg-[#0288D1]"
                            : "bg-[#E5E7EB]"
                          }
                        `}>
                          <Icon className={`w-5 h-5 ${paymentMethod === option.id ? "text-white" : "text-[#6B6B6B]"}`} />
                        </div>
                        <div>
                          <h3 className="text-[#4A4A4A] mb-0.5">{option.name}</h3>
                          <p className="text-xs text-[#6B6B6B]">{option.description}</p>
                        </div>
                      </div>
                      {paymentMethod === option.id && (
                        <div className="w-5 h-5 rounded-full bg-[#0288D1] flex items-center justify-center">
                          <Check className="w-3 h-3 text-white" />
                        </div>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Price Summary */}
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-[#E5E7EB]">
            <h2 className="text-[#4A4A4A] mb-4">Ringkasan Pembayaran</h2>
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-[#6B6B6B]">Subtotal Produk</span>
                <span className="text-[#4A4A4A]">{formatPrice(subtotal)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-[#6B6B6B]">Biaya Pengiriman</span>
                <span className="text-[#4A4A4A]">
                  {shippingCost === 0 ? (
                    <span className="text-[#10B981]">GRATIS</span>
                  ) : (
                    formatPrice(shippingCost)
                  )}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-[#6B6B6B]">Biaya Layanan</span>
                <span className="text-[#4A4A4A]">{formatPrice(platformFee)}</span>
              </div>
              <div className="border-t border-[#E5E7EB] pt-3 flex justify-between">
                <span className="text-[#4A4A4A]">Total Pembayaran</span>
                <span className="text-xl text-[#0288D1]">{formatPrice(total)}</span>
              </div>
            </div>
          </div>

          {/* Trust Badge */}
          <div className="bg-gradient-to-r from-[#0288D1]/5 to-[#4FC3F7]/5 border border-[#0288D1]/20 rounded-xl p-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-full bg-[#0288D1] flex items-center justify-center flex-shrink-0">
                <Check className="w-5 h-5 text-white" />
              </div>
              <div className="text-sm">
                <h4 className="text-[#4A4A4A] mb-1">Transaksi Aman & Terpercaya</h4>
                <p className="text-[#6B6B6B] text-xs leading-relaxed">
                  Uang Anda akan ditahan oleh platform hingga barang diterima dengan baik.
                  Garansi 100% uang kembali jika barang tidak sesuai.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom CTA */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-[#E5E7EB] p-6 safe-area-bottom">
        <div className="max-w-md mx-auto space-y-3">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-[#6B6B6B]">Total Pembayaran</span>
            <span className="text-xl text-[#0288D1]">{formatPrice(total)}</span>
          </div>
          <PrimaryButton
            label="Bayar Sekarang"
            onClick={handleCheckout}
            isLoading={isProcessing}
          />
          <p className="text-xs text-center text-[#6B6B6B]">
            Dengan melanjutkan, Anda menyetujui <span className="text-[#0288D1]">Syarat & Ketentuan</span> BeresinAja
          </p>
        </div>
      </div>
    </div>
  );
}
