"use client"

import { useState } from "react"
import { Eye, EyeOff, Mail, Phone, User } from "lucide-react"
import type { Screen } from "@/types/navigation"
import Image from "next/image"

interface Props {
  navigate: (s: Screen) => void
}

export default function RegisterScreen({ navigate }: Props) {
  const [showPassword, setShowPassword] = useState(false)
  const [role, setRole] = useState<"pengguna" | "teknisi">("pengguna")

  return (
    <div className="flex flex-col min-h-screen bg-background px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-12 overflow-y-auto">
      {/* Logo - Responsive sizing */}
      <div className="flex flex-col items-center pt-2 sm:pt-4 pb-4 sm:pb-6">
             <Image src="/logo.png" alt="BeresinAja" width={180} height={48} /> 
      </div>

      <h1 className="text-xl sm:text-2xl font-bold text-foreground text-center mb-4 sm:mb-6">Register</h1>

      {/* Form Card - Max width for larger screens */}
      <div className="w-full max-w-md mx-auto">
        <div className="bg-card rounded-2xl shadow-sm border border-border p-4 sm:p-6 flex flex-col gap-4 sm:gap-5">
          <p className="text-sm sm:text-base font-semibold text-foreground text-center">Buat Akun Baru</p>

          {/* Full Name */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs sm:text-sm font-medium text-foreground" htmlFor="fullname">
              Nama Lengkap
            </label>
            <div className="flex items-center gap-2 border border-border rounded-xl px-3 py-2.5 sm:py-3 bg-background focus-within:border-primary transition-colors">
              <User className="w-4 h-4 sm:w-5 sm:h-5 text-muted-foreground shrink-0" />
              <input
                id="fullname"
                type="text"
                placeholder="Nama lengkap"
                className="flex-1 bg-transparent text-sm sm:text-base text-foreground placeholder:text-muted-foreground outline-none"
              />
            </div>
          </div>

          {/* Email */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs sm:text-sm font-medium text-foreground" htmlFor="reg-email">
              Email
            </label>
            <div className="flex items-center gap-2 border border-border rounded-xl px-3 py-2.5 sm:py-3 bg-background focus-within:border-primary transition-colors">
              <Mail className="w-4 h-4 sm:w-5 sm:h-5 text-muted-foreground shrink-0" />
              <input
                id="reg-email"
                type="email"
                placeholder="Email"
                className="flex-1 bg-transparent text-sm sm:text-base text-foreground placeholder:text-muted-foreground outline-none"
              />
            </div>
          </div>

          {/* Phone */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs sm:text-sm font-medium text-foreground" htmlFor="phone">
              Nomor HP <span className="text-xs text-red-500">*</span>
            </label>
            <div className="flex items-center gap-2 border border-border rounded-xl px-3 py-2.5 sm:py-3 bg-background focus-within:border-primary transition-colors">
              <Phone className="w-4 h-4 sm:w-5 sm:h-5 text-muted-foreground shrink-0" />
              <input
                id="phone"
                type="tel"
                placeholder="08xx xxxx xxxx"
                className="flex-1 bg-transparent text-sm sm:text-base text-foreground placeholder:text-muted-foreground outline-none"
              />
            </div>
          </div>

          {/* Password */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs sm:text-sm font-medium text-foreground" htmlFor="reg-password">
              Password
            </label>
            <div className="flex items-center gap-2 border border-border rounded-xl px-3 py-2.5 sm:py-3 bg-background focus-within:border-primary transition-colors">
              <svg className="w-4 h-4 sm:w-5 sm:h-5 text-muted-foreground shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                <rect x="3" y="11" width="18" height="11" rx="2" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
              <input
                id="reg-password"
                type={showPassword ? "text" : "password"}
                placeholder="Minimal 8 karakter"
                className="flex-1 bg-transparent text-sm sm:text-base text-foreground placeholder:text-muted-foreground outline-none"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="text-muted-foreground hover:text-foreground transition-colors"
                aria-label={showPassword ? "Sembunyikan password" : "Tampilkan password"}
              >
                {showPassword ? 
                  <EyeOff className="w-4 h-4 sm:w-5 sm:h-5" /> : 
                  <Eye className="w-4 h-4 sm:w-5 sm:h-5" />
                }
              </button>
            </div>
            <p className="text-xs text-muted-foreground mt-1">Minimal 8 karakter dengan huruf dan angka</p>
          </div>

          {/* Role selector */}
          <div className="flex flex-col gap-2 sm:gap-3">
            <p className="text-xs sm:text-sm font-medium text-foreground">Daftar sebagai:</p>
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
              <button
                onClick={() => setRole("pengguna")}
                className={`flex-1 rounded-xl sm:rounded-2xl border-2 px-3 sm:px-4 py-2.5 sm:py-3 text-left transition-all ${
                  role === "pengguna"
                    ? "border-primary bg-secondary"
                    : "border-border bg-background hover:bg-accent/50"
                }`}
              >
                <p className={`text-sm sm:text-base font-semibold ${role === "pengguna" ? "text-primary" : "text-foreground"}`}>
                  Pengguna
                </p>
                <p className="text-xs sm:text-sm text-muted-foreground">Butuh servis</p>
              </button>
              <button
                onClick={() => setRole("teknisi")}
                className={`flex-1 rounded-xl sm:rounded-2xl border-2 px-3 sm:px-4 py-2.5 sm:py-3 text-left transition-all ${
                  role === "teknisi"
                    ? "border-primary bg-secondary"
                    : "border-border bg-background hover:bg-accent/50"
                }`}
              >
                <p className={`text-sm sm:text-base font-semibold ${role === "teknisi" ? "text-primary" : "text-foreground"}`}>
                  Teknisi/Toko
                </p>
                <p className="text-xs sm:text-sm text-muted-foreground">Layanan servis</p>
              </button>
            </div>
          </div>

          {/* Terms and conditions */}
          <div className="flex items-start gap-2 mt-2">
            <input 
              type="checkbox" 
              id="terms" 
              className="mt-1 w-4 h-4 rounded border-border text-primary focus:ring-primary"
            />
            <label htmlFor="terms" className="text-xs text-muted-foreground">
              Saya menyetujui{" "}
              <button className="text-primary font-medium hover:underline">Syarat & Ketentuan</button>{" "}
              dan{" "}
              <button className="text-primary font-medium hover:underline">Kebijakan Privasi</button>
            </label>
          </div>

          {/* Submit */}
          <button
            onClick={() => navigate("home")}
            className="w-full bg-primary text-primary-foreground font-semibold text-sm sm:text-base rounded-xl sm:rounded-2xl py-3 sm:py-3.5 mt-2 hover:opacity-90 active:scale-[0.98] transition-all"
          >
            Daftar & Lanjutkan
          </button>
        </div>
      </div>

      {/* Login link */}
      <div className="flex items-center justify-center pb-4 sm:pb-6 lg:pb-8 mt-4 sm:mt-6">
        <p className="text-xs sm:text-sm text-muted-foreground text-center">
          Sudah punya akun?{" "}
          <button 
            onClick={() => navigate("login")} 
            className="text-primary font-semibold hover:underline"
          >
            Masuk
          </button>
        </p>
      </div>
    </div>
  )
}