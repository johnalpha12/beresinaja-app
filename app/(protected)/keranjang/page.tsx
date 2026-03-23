"use client"

import { useRouter } from "next/navigation"
import { ArrowLeft, Trash2, Plus, Minus, ShoppingBag } from "lucide-react"
import { useCart } from "@/components/context/CartContext"
import { PrimaryButton } from "@/components/ui/PrimaryButton"

export default function KeranjangPage() {
  const router = useRouter()
  const { items, removeFromCart, updateQuantity, totalPrice } = useCart()

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(price)
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col">
      <div className="sticky top-0 bg-white border-b border-[#E5E7EB] px-6 py-4 flex items-center justify-between z-10">
        <div className="flex items-center">
          <button
            onClick={() => router.back()}
            className="text-[#0288D1] hover:bg-[#0288D1]/5 p-2 rounded-full -ml-2"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="ml-3 text-[#4A4A4A] font-bold text-lg">Keranjang</h1>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto pb-32 p-4 md:p-6">
        {items.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-[#6B6B6B] mt-20">
            <div className="w-20 h-20 bg-[#E5E7EB] rounded-full flex items-center justify-center mb-4">
              <ShoppingBag className="w-10 h-10" />
            </div>
            <h2 className="text-[#4A4A4A] font-bold text-lg mb-2">
              Keranjang masih kosong
            </h2>
            <p className="text-sm">Silakan pilih produk terlebih dahulu.</p>
            <button
              onClick={() => router.push("/marketplace")}
              className="mt-6 text-[#0288D1] font-semibold hover:underline"
            >
              Cari Produk
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {items.map((item) => (
              <div
                key={item.id}
                className="bg-white rounded-2xl p-4 shadow-sm border border-[#E5E7EB] flex flex-col gap-3"
              >
                <div className="flex gap-4">
                  <div className="w-20 h-20 bg-gradient-to-br from-[#F8FAFC] to-[#E5E7EB] rounded-xl flex items-center justify-center text-4xl flex-shrink-0">
                    {item.image || "📱"}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-[#4A4A4A] font-medium truncate mb-1">
                      {item.name}
                    </h3>
                    <p className="text-xs text-[#6B6B6B] mb-2">{item.variant}</p>
                    <p className="text-[#0288D1] font-bold">
                      {formatPrice(item.price)}
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-[#E5E7EB]">
                  <button
                    onClick={() => removeFromCart(item.id)}
                    className="text-[#6B6B6B] hover:text-red-500 hover:bg-red-50 p-2 rounded-lg transition-colors flex items-center gap-1 text-sm"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span className="hidden sm:inline">Hapus</span>
                  </button>

                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      className="w-8 h-8 rounded-full border border-[#E5E7EB] flex items-center justify-center text-[#6B6B6B] hover:bg-[#F8FAFC]"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <span className="w-6 text-center font-medium text-[#4A4A4A]">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      className="w-8 h-8 rounded-full border border-[#0288D1] text-[#0288D1] flex items-center justify-center hover:bg-[#0288D1]/5"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {items.length > 0 && (
        <div className="sticky bottom-0 bg-white border-t border-[#E5E7EB] px-6 py-4 z-10">
          <div className="flex items-center justify-between mb-4">
            <span className="text-[#6B6B6B]">Total Harga</span>
            <span className="text-[#0288D1] font-bold text-lg">
              {formatPrice(totalPrice)}
            </span>
          </div>
          <PrimaryButton
            label="Lanjut Checkout"
            onClick={() => router.push("/checkout")}
            className="w-full"
          />
        </div>
      )}
    </div>
  )
}
