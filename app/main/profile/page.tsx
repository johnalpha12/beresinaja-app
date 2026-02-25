"use client"

import { ArrowLeft, User, Mail, Phone, History, ChevronRight, Settings, LogOut, Crown } from "lucide-react"
import type { Screen } from "@/app/page"
import BottomNav from "../../../components/layout/BottomNav"


interface Props {
  navigate: (s: Screen) => void
}

export default function ProfileScreen({ navigate }: Props) {
  return (
    <div className="flex flex-col min-h-screen bg-[#F5F7FA]">
      {/* Blue Header Area */}
      <div
        className="px-4 pt-10 pb-8"
        style={{ background: "linear-gradient(135deg, #2196F3 0%, #29B6F6 100%)" }}
      >
        <div className="flex items-center gap-3 mb-0">
          <button
            onClick={() => navigate("home")}
            aria-label="Kembali"
            className="text-white"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-base font-bold text-white">Profil Saya</h1>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto pb-24 flex flex-col gap-4 -mt-4">
        {/* Profile Card */}
        <div className="mx-4 bg-card rounded-2xl border border-border p-5">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-16 h-16 rounded-full bg-primary flex items-center justify-center shrink-0">
              <User className="w-8 h-8 text-primary-foreground" />
            </div>
            <div>
              <p className="text-base font-bold text-foreground">John Alpha</p>
              <p className="text-xs text-muted-foreground">Member sejak Desember 2025</p>
              <span className="inline-block mt-1.5 bg-secondary text-primary text-xs font-semibold px-3 py-1 rounded-full border border-primary/20">
                Member Premium
              </span>
            </div>
          </div>

          <div className="h-px bg-border mb-4" />

          {/* Stats */}
          <div className="grid grid-cols-3 gap-2">
            {[
              { value: "8", label: "Servis" },
              { value: "12", label: "Transaksi" },
              { value: "10", label: "Jual Barang" },
            ].map(({ value, label }) => (
              <div key={label} className="flex flex-col items-center gap-0.5">
                <span className="text-lg font-bold text-primary">{value}</span>
                <span className="text-xs text-muted-foreground">{label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Premium Card */}
        <div className="mx-4 bg-secondary border border-primary/20 rounded-2xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <Crown className="w-4 h-4 text-yellow-500" />
            <p className="text-sm font-bold text-foreground">Member Premium</p>
          </div>
          <p className="text-xs text-muted-foreground mb-3">Berlaku hingga 27 Des 2025</p>
          <ul className="flex flex-col gap-1.5">
            {[
              "Gratis jemput-antar unlimited",
              "Garansi extended 60 hari",
              "Prioritas servis lebih cepat",
            ].map((benefit) => (
              <li key={benefit} className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-primary shrink-0" aria-hidden="true" />
                <span className="text-xs text-foreground">{benefit}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Account Section */}
        <div className="mx-4">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2 px-1">Akun</p>
          <div className="bg-card rounded-2xl border border-border overflow-hidden">
            {[
              { icon: User, label: "Data Pribadi", sub: "John  Alpha" },
              { icon: Mail, label: "Email", sub: "JohnSigma@email.com" },
              { icon: Phone, label: "Nomor HP", sub: "+62 812 3456 7890" },
            ].map(({ icon: Icon, label, sub }, idx, arr) => (
              <div
                key={label}
                className={`flex items-center gap-3 px-4 py-3.5 ${idx < arr.length - 1 ? "border-b border-border" : ""}`}
              >
                <Icon className="w-4 h-4 text-primary shrink-0" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-foreground">{label}</p>
                  <p className="text-xs text-muted-foreground">{sub}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Service Section */}
        <div className="mx-4">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2 px-1">Layanan</p>
          <div className="bg-card rounded-2xl border border-border overflow-hidden">
            {[
              { icon: History, label: "Riwayat Servis", sub: "8 servis", nav: "tracking" as Screen },
              { icon: History, label: "Riwayat Transaksi", sub: "12 transaksi", nav: "marketplace" as Screen },
              { icon: Settings, label: "Pengaturan", sub: null, nav: "home" as Screen },
            ].map(({ icon: Icon, label, sub, nav }, idx, arr) => (
              <button
                key={label}
                onClick={() => navigate(nav)}
                className={`w-full flex items-center gap-3 px-4 py-3.5 hover:bg-muted/50 transition-colors ${idx < arr.length - 1 ? "border-b border-border" : ""}`}
              >
                <Icon className="w-4 h-4 text-primary shrink-0" />
                <div className="flex-1 text-left">
                  <p className="text-sm font-medium text-foreground">{label}</p>
                  {sub && <p className="text-xs text-muted-foreground">{sub}</p>}
                </div>
                <ChevronRight className="w-4 h-4 text-muted-foreground" />
              </button>
            ))}
          </div>
        </div>

        {/* Logout */}
        <div className="mx-4">
          <button
            onClick={() => navigate("login")}
            className="w-full bg-red-50 border border-red-200 text-red-500 font-semibold text-sm rounded-2xl py-3.5 flex items-center justify-center gap-2 hover:bg-red-100 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Keluar
          </button>
        </div>
      </div>

      <BottomNav active="profile" navigate={navigate} />
    </div>
  )
}
