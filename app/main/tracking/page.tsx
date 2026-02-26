"use client";

import { ArrowLeft, Phone, MessageCircle, Clock, MapPin } from "lucide-react";
import type { Screen } from "@/types/navigation";
import BottomNav from "../../../components/layout/BottomNav";

interface Props {
  navigate: (s: Screen) => void;
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
];

export default function TrackingScreen({ navigate }: Props) {
  return (
    <div
      className="min-h-screen bg-[#F5F7FA]"
      style={{
        paddingBottom: "calc(140px + env(safe-area-inset-bottom))",
      }}
    >
      {/* HEADER */}
      <header className="sticky top-0 z-50 bg-background border-b border-border px-4 md:px-6 lg:px-8 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate("home")}>
            <ArrowLeft className="w-5 h-5 text-primary" />
          </button>

          <div>
            <h1 className="text-base md:text-lg font-bold">Tracking Servis</h1>
            <p className="text-xs text-muted-foreground">Order #BA-2510-8374</p>
          </div>
        </div>

        <span className="bg-secondary text-primary text-xs font-semibold px-3 py-1.5 rounded-full border border-primary/20">
          Dikerjakan
        </span>
      </header>

      <main className="max-w-5xl mx-auto px-4 md:px-6 lg:px-8 space-y-4 mt-4">
        {/* INFO GRID */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Device */}
          <div className="bg-card rounded-2xl border border-border p-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-[#F5F7FA] rounded-xl flex items-center justify-center">
                <span className="text-xl">📱</span>
              </div>

              <div>
                <p className="text-sm font-bold">iPhone 13 Pro</p>
                <p className="text-xs text-muted-foreground">
                  Ganti LCD - Layar pecah
                </p>

                <div className="flex flex-wrap gap-3 mt-2">
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Clock className="w-3 h-3" />
                    ETA: 2 jam lagi
                  </div>

                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <MapPin className="w-3 h-3" />
                    Jemput-Antar
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Technician */}
          <div className="bg-card rounded-2xl border border-border p-4 flex justify-between items-center">
            <div>
              <p className="text-sm font-semibold">Teknisi Anda</p>
              <p className="text-xs text-muted-foreground">
                Rating 4.9 · 567 servis berhasil
              </p>
            </div>

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

        {/* TIMELINE */}
        <div className="bg-card rounded-2xl border border-border p-5">
          <h2 className="text-sm font-bold mb-6">Status Pengerjaan</h2>

          <div className="relative">
            {steps.map((item, index) => (
              <div
                key={item.step}
                className="flex gap-4 relative pb-8 last:pb-0"
              >
                {/* LINE */}
                {index !== steps.length - 1 && (
                  <div className="absolute left-4 top-8 w-0.5 h-full bg-border" />
                )}

                {/* CIRCLE */}
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold z-10 ${
                    item.status === "done"
                      ? "bg-primary text-white"
                      : item.status === "active"
                        ? "bg-primary text-white"
                        : "bg-white border-2 border-border text-muted-foreground"
                  }`}
                >
                  {item.status === "done" ? "✓" : item.step}
                </div>

                {/* TEXT */}
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
        {/* CONFIRM BUTTON (SCROLLABLE) */}
        <div className="mt-6">
          <button className="w-full bg-primary text-white text-sm font-semibold py-3 rounded-xl shadow-md hover:opacity-90 transition">
            Konfirmasi Biaya Servis
          </button>
        </div>
      </main>

      <BottomNav active="tracking" navigate={navigate} />
    </div>
  );
}
