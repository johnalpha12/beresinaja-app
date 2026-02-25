"use client"

import { useState } from "react"
import { Eye, EyeOff, Mail, Phone, User } from "lucide-react"
import type { Screen } from "@/app/page"
import BeresinAjaLogo from "../../../components/layout/BeresinAjaLogo"

interface Props {
  navigate: (s: Screen) => void
}

export default function RegisterScreen({ navigate }: Props) {
  const [showPassword, setShowPassword] = useState(false)
  const [role, setRole] = useState<"pengguna" | "teknisi">("pengguna")

  return (
    <div className="flex flex-col min-h-screen bg-background px-5 py-8 overflow-y-auto">
      {/* Logo */}
      <div className="flex flex-col items-center pt-4 pb-6">
        <BeresinAjaLogo size={52} />
        <span className="text-[#37474F] text-sm font-semibold mt-1">BeresinAja.</span>
      </div>

      <h1 className="text-2xl font-bold text-foreground text-center mb-6">Register</h1>

      {/* Form Card */}
      <div className="bg-card rounded-2xl shadow-sm border border-border p-6 flex flex-col gap-5">
        <p className="text-sm font-semibold text-foreground text-center">Buat Akun Baru</p>

        {/* Full Name */}
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-foreground" htmlFor="fullname">Nama Lengkap</label>
          <div className="flex items-center gap-2 border border-border rounded-xl px-3 py-2.5 bg-background focus-within:border-primary transition-colors">
            <User className="w-4 h-4 text-muted-foreground shrink-0" />
            <input
              id="fullname"
              type="text"
              placeholder="Nama lengkap"
              className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground outline-none"
            />
          </div>
        </div>

        {/* Email */}
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-foreground" htmlFor="reg-email">Email</label>
          <div className="flex items-center gap-2 border border-border rounded-xl px-3 py-2.5 bg-background focus-within:border-primary transition-colors">
            <Mail className="w-4 h-4 text-muted-foreground shrink-0" />
            <input
              id="reg-email"
              type="email"
              placeholder="Email"
              className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground outline-none"
            />
          </div>
        </div>

        {/* Phone */}
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-foreground" htmlFor="phone">Nomor HP (Wajib)</label>
          <div className="flex items-center gap-2 border border-border rounded-xl px-3 py-2.5 bg-background focus-within:border-primary transition-colors">
            <Phone className="w-4 h-4 text-muted-foreground shrink-0" />
            <input
              id="phone"
              type="tel"
              placeholder="08xx xxxx xxxx"
              className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground outline-none"
            />
          </div>
        </div>

        {/* Password */}
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-foreground" htmlFor="reg-password">Password</label>
          <div className="flex items-center gap-2 border border-border rounded-xl px-3 py-2.5 bg-background focus-within:border-primary transition-colors">
            <svg className="w-4 h-4 text-muted-foreground shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
              <rect x="3" y="11" width="18" height="11" rx="2" />
              <path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
            <input
              id="reg-password"
              type={showPassword ? "text" : "password"}
              placeholder="Minimal 8 karakter"
              className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground outline-none"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              aria-label={showPassword ? "Sembunyikan password" : "Tampilkan password"}
            >
              {showPassword ? <EyeOff className="w-4 h-4 text-muted-foreground" /> : <Eye className="w-4 h-4 text-muted-foreground" />}
            </button>
          </div>
        </div>

        {/* Role selector */}
        <div className="flex flex-col gap-2">
          <p className="text-sm font-medium text-foreground">Daftar sebagai:</p>
          <div className="flex gap-3">
            <button
              onClick={() => setRole("pengguna")}
              className={`flex-1 rounded-2xl border-2 px-4 py-3 text-left transition-all ${
                role === "pengguna"
                  ? "border-primary bg-secondary"
                  : "border-border bg-background"
              }`}
            >
              <p className={`text-sm font-semibold ${role === "pengguna" ? "text-primary" : "text-foreground"}`}>Pengguna</p>
              <p className="text-xs text-muted-foreground">Butuh servis</p>
            </button>
            <button
              onClick={() => setRole("teknisi")}
              className={`flex-1 rounded-2xl border-2 px-4 py-3 text-left transition-all ${
                role === "teknisi"
                  ? "border-primary bg-secondary"
                  : "border-border bg-background"
              }`}
            >
              <p className={`text-sm font-semibold ${role === "teknisi" ? "text-primary" : "text-foreground"}`}>Teknisi/Toko</p>
              <p className="text-xs text-muted-foreground">Layanan servis</p>
            </button>
          </div>
        </div>

        {/* Submit */}
        <button
          onClick={() => navigate("home")}
          className="w-full bg-primary text-primary-foreground font-semibold text-base rounded-2xl py-3.5 mt-1 hover:opacity-90 active:scale-[0.98] transition-all"
        >
          Daftar &amp; Lanjutkan
        </button>
      </div>

      {/* Login link */}
      <div className="flex items-center justify-center pb-8 mt-6">
        <p className="text-sm text-muted-foreground">
          Sudah punya akun?{" "}
          <button onClick={() => navigate("login")} className="text-primary font-semibold">
            Masuk
          </button>
        </p>
      </div>
    </div>
  )
}
