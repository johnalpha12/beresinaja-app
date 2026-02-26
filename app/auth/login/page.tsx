"use client"

import { useState } from "react"
import { Eye, EyeOff, Mail } from "lucide-react"
import type { Screen } from "@/types/navigation"
import BeresinAjaLogo from "../../../components/layout/BeresinAjaLogo"
import Image from "next/image"

interface Props {
  navigate: (s: Screen) => void
}

export default function LoginScreen({ navigate }: Props) {
  const [showPassword, setShowPassword] = useState(false)

  return (
    <div className="flex flex-col min-h-screen bg-background px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-12">
      {/* Logo - Responsive sizing */}
      <div className="flex flex-col items-center pt-4 sm:pt-6 pb-6 sm:pb-8">
        <Image src="/logo.png" alt="BeresinAja" width={180} height={48} /> 
      </div>

      {/* Title */}
      <h1 className="text-xl sm:text-2xl font-bold text-foreground text-center mb-6 sm:mb-8">Masuk</h1>

      {/* Form Card - Max width for larger screens */}
      <div className="w-full max-w-md mx-auto">
        <div className="bg-card rounded-2xl shadow-sm border border-border p-4 sm:p-6 flex flex-col gap-4 sm:gap-5">
          {/* Email / No HP */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs sm:text-sm font-medium text-foreground" htmlFor="email">
              Email atau No. HP
            </label>
            <div className="flex items-center gap-2 border border-border rounded-xl px-3 py-2.5 sm:py-3 bg-background focus-within:border-primary transition-colors">
              <Mail className="w-4 h-4 sm:w-5 sm:h-5 text-muted-foreground shrink-0" />
              <input
                id="email"
                type="text"
                placeholder="Email atau No. HP"
                className="flex-1 bg-transparent text-sm sm:text-base text-foreground placeholder:text-muted-foreground outline-none"
              />
            </div>
          </div>

          {/* Password */}
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs sm:text-sm font-medium text-foreground" htmlFor="password">
                Password
              </label>
              <button 
                onClick={() => navigate("forgot-password")}
                className="text-xs sm:text-sm text-primary font-medium hover:underline"
              >
                Lupa password?
              </button>
            </div>
            <div className="flex items-center gap-2 border border-border rounded-xl px-3 py-2.5 sm:py-3 bg-background focus-within:border-primary transition-colors">
              <svg className="w-4 h-4 sm:w-5 sm:h-5 text-muted-foreground shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                <rect x="3" y="11" width="18" height="11" rx="2" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                className="flex-1 bg-transparent text-sm sm:text-base text-foreground placeholder:text-muted-foreground outline-none"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="text-muted-foreground hover:text-foreground transition-colors"
                aria-label={showPassword ? "Sembunyikan password" : "Tampilkan password"}
              >
                {showPassword ? <EyeOff className="w-4 h-4 sm:w-5 sm:h-5" /> : <Eye className="w-4 h-4 sm:w-5 sm:h-5" />}
              </button>
            </div>
          </div>

          {/* Login Button */}
          <button
            onClick={() => navigate("home")}
            className="w-full bg-primary text-primary-foreground font-semibold text-sm sm:text-base rounded-xl sm:rounded-2xl py-3 sm:py-3.5 mt-1 hover:opacity-90 active:scale-[0.98] transition-all"
          >
            Masuk Sekarang
          </button>

          {/* Divider */}
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="flex-1 h-px bg-border" />
            <span className="text-xs text-muted-foreground whitespace-nowrap">atau masuk cepat</span>
            <div className="flex-1 h-px bg-border" />
          </div>

          {/* Google Login */}
          <button className="w-full border border-border rounded-xl sm:rounded-2xl py-2.5 sm:py-3 text-primary font-semibold text-xs sm:text-sm hover:bg-accent transition-colors flex items-center justify-center gap-2">
            <svg className="w-4 h-4 sm:w-5 sm:h-5" viewBox="0 0 24 24" aria-hidden="true">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
            </svg>
            Masuk dengan Google
          </button>
        </div>
      </div>

      {/* Register Link - Fixed at bottom for mobile */}
      <div className="flex-1 flex items-end justify-center pb-4 sm:pb-6 lg:pb-8 mt-6 sm:mt-8">
        <p className="text-xs sm:text-sm text-muted-foreground text-center">
          Belum punya akun?{" "}
          <button
            onClick={() => navigate("register")}
            className="text-primary font-semibold hover:underline"
          >
            Daftar Gratis
          </button>
        </p>
      </div>
    </div>
  )
}