"use client"

import { ArrowLeft, Search, Monitor, RefreshCw, MemoryStick, Wind, ChevronRight, Cpu } from "lucide-react"
import type { Screen } from "@/types/navigation"

interface Props {
  navigate: (s: Screen) => void
}

const services = [
  {
    icon: Monitor,
    title: "Ganti Power Supply",
    desc: "Perbaiki unit PSU rusak atau drop.",
  },
  {
    icon: RefreshCw,
    title: "Install Ulang Sistem Operasi",
    desc: "Windows / Linux / MacOS.",
  },
  {
    icon: MemoryStick,
    title: "Upgrade RAM / Storage",
    desc: "Tingkatkan performa komputer kamu.",
  },
  {
    icon: Wind,
    title: "Pembersihan Hardware",
    desc: "Hilangkan debu dan periksa kipas.",
  },
  {
    icon: Cpu,
    title: "Perbaikan Motherboard / CPU",
    desc: "Diagnosa dan perbaikan komponen utama.",
  },
]

export default function ServisKomputerScreen({ navigate }: Props) {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      {/* Header */}
      <header className="flex items-center gap-3 px-4 lg:px-10 pt-10 pb-4 bg-background border-b border-border">
        <button
          onClick={() => navigate("servis-perangkat")}
          aria-label="Kembali"
          className="text-foreground"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-base font-bold text-foreground flex-1 text-center pr-5">Servis Komputer</h1>
      </header>

      <div className="flex-1 overflow-y-auto pb-6 px-4 lg:px-10 pt-4 flex flex-col gap-4">
        {/* Search */}
        <div className="flex items-center gap-2 bg-[#F5F7FA] rounded-full px-4 py-2.5 border border-border">
          <Search className="w-4 h-4 text-muted-foreground shrink-0" />
          <input
            type="text"
            placeholder="Cari keluhan servis..."
            className="flex-1 bg-transparent text-sm placeholder:text-muted-foreground outline-none"
            aria-label="Cari keluhan servis"
          />
        </div>

        {/* Hero Card */}
        <div
          className="rounded-2xl p-5 relative overflow-hidden flex items-center justify-between"
          style={{ background: "linear-gradient(135deg, #2196F3 0%, #29B6F6 100%)" }}
        >
          <div>
            <p className="text-white font-bold text-base leading-snug">Layanan Perbaikan &amp;</p>
            <p className="text-white font-bold text-base leading-snug">Upgrade Komputer</p>
            <p className="text-white/80 text-xs mt-1.5">Pilih jenis servis sesuai kebutuhanmu.</p>
          </div>
          <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center shrink-0">
            <Monitor className="w-7 h-7 text-white" />
          </div>
        </div>

        {/* Service List */}
        <section>
          <h2 className="text-sm font-bold text-foreground mb-3">Jenis Layanan Servis</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {services.map(({ icon: Icon, title, desc }) => (
              <button
                key={title}
                className="bg-card rounded-2xl border border-border p-4 flex items-center gap-3 hover:border-primary/30 hover:shadow-sm transition-all text-left"
              >
                <div className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center shrink-0">
                  <Icon className="w-5 h-5 text-primary" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-foreground">{title}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{desc}</p>
                </div>
                <ChevronRight className="w-4 h-4 text-primary shrink-0" />
              </button>
            ))}
          </div>
        </section>
      </div>
    </div>
  )
}
