"use client"

import { ArrowLeft, Share2, Heart, Star, ShieldCheck } from "lucide-react"
import { useState } from "react"
import type { Screen } from "@/app/page"

interface Props {
  navigate: (s: Screen) => void
}

const specs = [
  { label: "Merek", value: "Apple" },
  { label: "Model", value: "iPhone 14 Pro Max" },
  { label: "Warna", value: "Deep Purple" },
  { label: "Penyimpanan", value: "256 GB" },
  { label: "RAM", value: "6 GB" },
  { label: "Kondisi", value: "Baru" },
]

export default function ProductDetailScreen({ navigate }: Props) {
  const [liked, setLiked] = useState(false)

  return (
    <div className="flex flex-col min-h-screen bg-background">
      {/* Header actions */}
      <header className="flex items-center justify-between px-4 pt-10 pb-3 bg-background">
        <button
          onClick={() => navigate("marketplace")}
          aria-label="Kembali"
          className="text-primary"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="flex items-center gap-3">
          <button aria-label="Bagikan">
            <Share2 className="w-5 h-5 text-foreground" />
          </button>
          <button
            aria-label={liked ? "Hapus dari favorit" : "Tambah ke favorit"}
            onClick={() => setLiked(!liked)}
          >
            <Heart className={`w-5 h-5 transition-colors ${liked ? "fill-red-500 text-red-500" : "text-foreground"}`} />
          </button>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto pb-24">
        {/* Product Image */}
        <div className="relative bg-[#F0F2F5] mx-0 flex items-center justify-center h-64">
          <span className="text-8xl" role="img" aria-label="iPhone 14 Pro Max">📱</span>
          <span className="absolute top-4 right-4 bg-secondary text-primary text-xs font-semibold px-3 py-1 rounded-full border border-primary/20">
            Baru
          </span>
        </div>

        <div className="px-4 pt-4 flex flex-col gap-4">
          {/* Name & Price */}
          <div>
            <h1 className="text-lg font-bold text-foreground">iPhone 14 Pro Max</h1>
            <p className="text-2xl font-bold text-primary mt-1">Rp 18.500.000</p>
            <div className="flex items-center gap-3 mt-1.5">
              <div className="flex items-center gap-1">
                <Star className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" />
                <span className="text-sm text-muted-foreground">4.9 (1234 ulasan)</span>
              </div>
              <span className="text-muted-foreground text-sm">• Terjual 234</span>
            </div>
          </div>

          {/* Verified Badge */}
          <div className="bg-secondary border border-primary/20 rounded-2xl px-4 py-3 flex items-start gap-3">
            <ShieldCheck className="w-4 h-4 text-primary shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-foreground">Dijamin 100% Original</p>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Produk ini diverifikasi BeresinAja. Garansi uang kembali jika barang tidak sesuai.
              </p>
            </div>
          </div>

          {/* Specs */}
          <section>
            <h2 className="text-sm font-bold text-foreground mb-3">Spesifikasi</h2>
            <div className="bg-card border border-border rounded-2xl overflow-hidden">
              {specs.map((spec, idx) => (
                <div
                  key={spec.label}
                  className={`flex items-center justify-between px-4 py-3 ${
                    idx < specs.length - 1 ? "border-b border-border" : ""
                  }`}
                >
                  <span className="text-sm text-muted-foreground">{spec.label}</span>
                  <span className="text-sm font-medium text-foreground">{spec.value}</span>
                </div>
              ))}
            </div>
          </section>

          {/* Description */}
          <section>
            <h2 className="text-sm font-bold text-foreground mb-2">Deskripsi</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              iPhone 14 Pro Max baru, belum pernah dipakai. Lengkap dengan dus, charger, dan aksesoris original. 
              Garansi resmi Apple 1 tahun. Bisa COD di area Medan.
            </p>
          </section>
        </div>
      </div>

      {/* Bottom Action */}
      <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[430px] bg-background border-t border-border px-4 py-3 flex gap-3">
        <button className="flex-1 border-2 border-primary text-primary font-semibold text-sm rounded-2xl py-3 hover:bg-secondary transition-colors">
          Chat Toko
        </button>
        <button className="flex-1 bg-primary text-primary-foreground font-semibold text-sm rounded-2xl py-3 hover:opacity-90 transition-opacity">
          Beli Sekarang
        </button>
      </div>
    </div>
  )
}
