"use client"

import { ArrowLeft, Phone, MessageCircle, Clock, MapPin } from "lucide-react"
import type { Screen } from "@/app/page"
import BottomNav from "../../../components/layout/BottomNav"


interface Props {
  navigate: (s: Screen) => void
}

const steps = [
  {
    step: 1,
    label: "Perangkat Dijemput",
    date: "27 Okt, 09:15",
    desc: "Kurir dalam perjalanan ke lokasi kamu",
    status: "done",
  },
  {
    step: 2,
    label: "Sedang Diperiksa",
    date: "27 Okt, 10:30",
    desc: "Teknisi memeriksa kondisi perangkat",
    status: "done",
  },
  {
    step: 3,
    label: "Menunggu Konfirmasi Biaya",
    date: null,
    desc: "Estimasi: Rp 850.000 - LCD Original",
    status: "active",
  },
  {
    step: 4,
    label: "Sedang Diperbaiki",
    date: null,
    desc: null,
    status: "pending",
  },
  {
    step: 5,
    label: "Selesai & Siap Diantar",
    date: null,
    desc: null,
    status: "pending",
  },
]

export default function TrackingScreen({ navigate }: Props) {
  return (
    <div className="flex flex-col min-h-screen bg-[#F5F7FA]">
      {/* Header */}
      <header className="flex items-center justify-between px-4 pt-10 pb-4 bg-background border-b border-border">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate("home")}
            aria-label="Kembali"
            className="text-primary"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-base font-bold text-foreground">Tracking Servis</h1>
            <p className="text-xs text-muted-foreground">Order #BA-2510-8374</p>
          </div>
        </div>
        <span className="bg-secondary text-primary text-xs font-semibold px-3 py-1.5 rounded-full border border-primary/20">
          Dikerjakan
        </span>
      </header>

      <div className="flex-1 overflow-y-auto pb-24 px-4 pt-4 flex flex-col gap-4">
        {/* Device Info Card */}
        <div className="bg-card rounded-2xl border border-border p-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-[#F5F7FA] rounded-xl flex items-center justify-center shrink-0">
              <span className="text-xl" role="img" aria-label="iPhone 13 Pro">📱</span>
            </div>
            <div>
              <p className="text-sm font-bold text-foreground">iPhone 13 Pro</p>
              <p className="text-xs text-muted-foreground">Ganti LCD - Layar pecah</p>
              <div className="flex items-center gap-3 mt-1">
                <div className="flex items-center gap-1">
                  <Clock className="w-3 h-3 text-muted-foreground" />
                  <span className="text-xs text-muted-foreground">ETA: 2 jam lagi</span>
                </div>
                <div className="flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-muted-foreground" />
                  <span className="text-xs text-muted-foreground">Jemput-Antar</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Technician Card */}
        <div className="bg-card rounded-2xl border border-border p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-foreground">Teknisi Anda</p>
              <p className="text-xs text-muted-foreground mt-0.5">Rating 4.9 · 567 servis berhasil</p>
            </div>
            <div className="flex items-center gap-2">
              <button
                aria-label="Hubungi teknisi"
                className="w-9 h-9 rounded-full bg-secondary border border-primary/20 flex items-center justify-center"
              >
                <Phone className="w-4 h-4 text-primary" />
              </button>
              <button
                aria-label="Chat teknisi"
                className="w-9 h-9 rounded-full bg-secondary border border-primary/20 flex items-center justify-center"
              >
                <MessageCircle className="w-4 h-4 text-primary" />
              </button>
            </div>
          </div>
        </div>

        {/* Status Timeline */}
        <div className="bg-card rounded-2xl border border-border p-4">
          <h2 className="text-sm font-bold text-foreground mb-4">Status Pengerjaan</h2>
          <div className="flex flex-col gap-0">
            {steps.map(({ step, label, date, desc, status }, idx) => (
              <div key={step} className="flex gap-3">
                {/* Timeline indicator */}
                <div className="flex flex-col items-center">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 z-10 text-xs font-bold transition-colors ${
                      status === "done"
                        ? "bg-primary text-primary-foreground"
                        : status === "active"
                        ? "bg-primary text-primary-foreground"
                        : "bg-background border-2 border-border text-muted-foreground"
                    }`}
                  >
                    {status === "done" ? (
                      <svg className="w-4 h-4" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                        <path d="M3 8l3.5 3.5 6.5-7" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    ) : (
                      step
                    )}
                  </div>
                  {idx < steps.length - 1 && (
                    <div
                      className={`w-0.5 h-10 transition-colors ${
                        status === "done" ? "bg-primary" : "bg-border"
                      }`}
                    />
                  )}
                </div>

                {/* Content */}
                <div className="flex-1 pb-4">
                  <p
                    className={`text-sm font-semibold leading-tight transition-colors ${
                      status === "active" ? "text-primary" : status === "done" ? "text-foreground" : "text-muted-foreground"
                    }`}
                  >
                    {label}
                  </p>
                  {date && <p className="text-xs text-muted-foreground mt-0.5">{date}</p>}
                  {desc && <p className="text-xs text-muted-foreground mt-0.5">{desc}</p>}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Confirm Cost Button */}
        <button className="w-full bg-primary text-primary-foreground font-semibold text-sm rounded-2xl py-3.5 hover:opacity-90 transition-opacity">
          Konfirmasi Biaya Servis
        </button>
      </div>

      <BottomNav active="tracking" navigate={navigate} />
    </div>
  )
}
