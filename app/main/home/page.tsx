"use client"

import { Bell, MessageCircle, Search, Wrench, ShoppingBag, DollarSign, MapPin, ChevronRight } from "lucide-react"
import type { Screen } from "@/app/page"
import BottomNav from "../../../components/layout/BottomNav"

interface Props {
  navigate: (s: Screen) => void
}

const services = [
  { key: "servis-perangkat" as Screen, label: "Servis Perangkat", icon: Wrench },
  { key: "marketplace" as Screen, label: "Beli Barang", icon: ShoppingBag },
  { key: "jual-barang" as Screen, label: "Jual Barang", icon: DollarSign },
  { key: "tracking" as Screen, label: "Track Status", icon: MapPin },
]

export default function HomeScreen({ navigate }: Props) {
  return (
    <div className="flex flex-col min-h-screen bg-[#F5F7FA]">
      {/* Header */}
      <header className="bg-background px-4 pt-10 pb-3">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-bold text-sm relative">
              J
              <span className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-primary rounded-full border-2 border-background flex items-center justify-center">
                <svg className="w-2 h-2 text-primary-foreground" viewBox="0 0 12 12" fill="none" aria-hidden="true">
                  <path d="M2 6l3 3 5-5" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </span>
            </div>
            <div>
              <p className="text-sm font-bold text-foreground leading-tight">John Alpha</p>
              <p className="text-xs text-muted-foreground">Medan</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate("chat-ai")}
              aria-label="Pesan"
              className="text-primary"
            >
              <MessageCircle className="w-5 h-5" />
            </button>
            <button aria-label="Notifikasi" className="relative text-primary">
              <Bell className="w-5 h-5" />
              <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-primary rounded-full" aria-hidden="true" />
            </button>
          </div>
        </div>

        {/* Search */}
        <div className="flex items-center gap-2 bg-[#F5F7FA] rounded-full px-4 py-2.5 border border-border">
          <Search className="w-4 h-4 text-muted-foreground shrink-0" />
          <input
            type="text"
            placeholder="Cari teknisi, toko, atau produk..."
            className="flex-1 bg-transparent text-sm placeholder:text-muted-foreground outline-none"
            aria-label="Cari teknisi, toko, atau produk"
          />
        </div>
      </header>

      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto pb-24 px-4 pt-4 flex flex-col gap-5">
        {/* Promo Banner */}
        <div
          className="rounded-2xl p-5 relative overflow-hidden"
          style={{ background: "linear-gradient(135deg, #2196F3 0%, #29B6F6 100%)" }}
        >
          <span className="inline-block bg-white/20 text-white text-xs font-medium px-3 py-1 rounded-full mb-2">Promo Spesial</span>
          <h2 className="text-white text-xl font-bold leading-snug mb-1">Gratis Jemput-Antar!</h2>
          <p className="text-white/80 text-xs mb-4 leading-relaxed">Untuk servis pertama kamu. Berlaku hingga akhir bulan.</p>
          <button className="bg-white text-primary text-sm font-semibold px-5 py-2 rounded-full hover:opacity-90 transition-opacity">
            Pakai Sekarang
          </button>
          {/* Decorative circles */}
          <div className="absolute -right-4 -top-4 w-24 h-24 bg-white/10 rounded-full" aria-hidden="true" />
          <div className="absolute -right-2 bottom-0 w-16 h-16 bg-white/10 rounded-full" aria-hidden="true" />
        </div>

        {/* Services */}
        <section>
          <h2 className="text-sm font-bold text-foreground mb-3">Layanan Kami</h2>
          <div className="grid grid-cols-2 gap-3">
            {services.map(({ key, label, icon: Icon }) => (
              <button
                key={key}
                onClick={() => navigate(key)}
                className="bg-card rounded-2xl border border-border p-4 flex flex-col items-center gap-2 hover:border-primary/30 hover:shadow-sm transition-all"
              >
                <div className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center">
                  <Icon className="w-5 h-5 text-primary" />
                </div>
                <span className="text-xs font-medium text-foreground text-center">{label}</span>
              </button>
            ))}
          </div>
        </section>

        {/* Active Service */}
        <section>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-bold text-foreground">Servis Aktif</h2>
            <button
              onClick={() => navigate("tracking")}
              className="text-xs text-primary font-medium"
            >
              Lihat Detail
            </button>
          </div>
          <div className="bg-card rounded-2xl border border-border p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-foreground">Ganti LCD iPhone 13 Pro</p>
                <p className="text-xs text-muted-foreground mt-0.5">Teknisi: Ahmad - Sedang diperbaiki</p>
              </div>
              <div className="flex flex-col items-end gap-1">
                <span className="bg-secondary text-primary text-xs font-semibold px-3 py-1 rounded-full">Dikerjakan</span>
                <span className="text-xs text-muted-foreground">ETA: 2 jam lagi</span>
              </div>
            </div>
          </div>
        </section>
      </div>

      <BottomNav active="home" navigate={navigate} />
    </div>
  )
}
