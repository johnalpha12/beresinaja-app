"use client"

import { ArrowLeft, Search, Monitor, Laptop, Printer, Smartphone, Video, ChevronRight } from "lucide-react"
import type { Screen } from "@/app/page"

interface Props {
  navigate: (s: Screen) => void
}

const categories = [
  { key: "servis-komputer" as Screen, label: "Komputer", icon: Monitor },
  { key: "servis-komputer" as Screen, label: "Laptop", icon: Laptop },
  { key: "servis-komputer" as Screen, label: "Printer", icon: Printer },
  { key: "servis-komputer" as Screen, label: "HP", icon: Smartphone },
  { key: "servis-komputer" as Screen, label: "CCTV", icon: Video },
]

const generalServices = [
  "Ganti LCD / Layar Rusak",
  "Servis Baterai / Tidak Mau Ngecas",
  "Perbaikan Motherboard",
  "Upgrade RAM / Storage",
  "Install Ulang OS",
  "Pembersihan Hardware",
]

export default function ServisPerangkatScreen({ navigate }: Props) {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      {/* Header */}
      <header className="flex items-center gap-3 px-4 pt-10 pb-4 bg-background border-b border-border">
        <button
          onClick={() => navigate("home")}
          aria-label="Kembali"
          className="text-foreground"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-base font-bold text-foreground flex-1 text-center pr-5">Servis Perangkat</h1>
      </header>

      <div className="flex-1 overflow-y-auto pb-6 px-4 pt-4 flex flex-col gap-4">
        {/* Search */}
        <div className="flex items-center gap-2 bg-[#F5F7FA] rounded-full px-4 py-2.5 border border-border">
          <Search className="w-4 h-4 text-muted-foreground shrink-0" />
          <input
            type="text"
            placeholder="Cari perangkat atau keluhan servis..."
            className="flex-1 bg-transparent text-sm placeholder:text-muted-foreground outline-none"
            aria-label="Cari perangkat atau keluhan servis"
          />
        </div>

        {/* Promo Banner */}
        <div
          className="rounded-2xl p-4"
          style={{ background: "linear-gradient(135deg, #2196F3 0%, #29B6F6 100%)" }}
        >
          <p className="text-white font-semibold text-sm">Promo Spesial!</p>
          <p className="text-white/80 text-xs mt-0.5">Dapatkan Diskon 10% untuk servis pertama kamu!</p>
        </div>

        {/* Device Categories */}
        <section>
          <h2 className="text-sm font-bold text-foreground mb-3">Kategori Perangkat</h2>
          <div className="grid grid-cols-2 gap-3">
            {categories.map(({ key, label, icon: Icon }, idx) => (
              <button
                key={`${label}-${idx}`}
                onClick={() => navigate(key)}
                className="bg-card rounded-2xl border border-border p-4 flex flex-col items-center gap-2 hover:border-primary/40 hover:shadow-sm transition-all"
              >
                <div className="w-12 h-12 rounded-2xl bg-primary flex items-center justify-center">
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <span className="text-xs font-medium text-foreground">{label}</span>
              </button>
            ))}
          </div>
        </section>

        {/* General Services */}
        <section>
          <h2 className="text-sm font-bold text-foreground mb-3">Layanan Umum</h2>
          <div className="flex flex-col gap-2">
            {generalServices.map((service) => (
              <button
                key={service}
                onClick={() => navigate("servis-komputer")}
                className="bg-card rounded-2xl border border-border px-4 py-3.5 flex items-center justify-between hover:border-primary/30 hover:shadow-sm transition-all"
              >
                <span className="text-sm text-foreground">{service}</span>
                <ChevronRight className="w-4 h-4 text-muted-foreground" />
              </button>
            ))}
          </div>
        </section>
      </div>
    </div>
  )
}
