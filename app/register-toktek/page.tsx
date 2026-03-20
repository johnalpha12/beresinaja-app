"use client"

import { useState } from "react"
import { Eye, EyeOff, Mail, Phone, Store, UserCog } from "lucide-react"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { registerUser } from "@/lib/auth"
import { screenToPath, type Screen } from "@/types/navigation"
import type { UserRole } from "@/types/user"

type BusinessRole = Extract<UserRole, "toko" | "teknisi">

export default function RegisterToktekPage() {
  const router = useRouter()
  const navigate = (screen: Screen) => router.push(screenToPath(screen))
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    password: "",
  })
  const [role, setRole] = useState<BusinessRole | null>(null)
  const [agreeTerms, setAgreeTerms] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.id]: e.target.value,
    })
  }

  const handleRoleSelect = (nextRole: BusinessRole) => {
    setRole(nextRole)

    if (error) {
      setError("")
    }
  }

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    const fullName = formData.fullName.trim()
    const email = formData.email.trim().toLowerCase()
    const phone = formData.phone.trim()
    const password = formData.password

    if (!fullName || !email || !phone || !password) {
      setError("Semua field harus diisi")
      return
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError("Format email tidak valid")
      return
    }

    if (!role) {
      setError("Pilih daftar sebagai toko atau teknisi terlebih dahulu")
      return
    }

    if (!agreeTerms) {
      setError("Anda harus menyetujui Syarat & Ketentuan")
      return
    }

    if (password.length < 8) {
      setError("Password minimal 8 karakter")
      return
    }

    setIsLoading(true)

    try {
      await registerUser(email, password, fullName, phone, role)
      router.replace(screenToPath("login"))
    } catch (error: any) {
      console.error("Registration error:", error)

      if (error.code === "auth/email-already-in-use") {
        setError("Email sudah terdaftar")
      } else if (error.code === "auth/invalid-email") {
        setError("Format email tidak valid")
      } else if (error.code === "auth/weak-password") {
        setError("Password terlalu lemah")
      } else {
        setError("Gagal mendaftar. Silakan coba lagi.")
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex flex-col min-h-screen bg-background px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-12 overflow-y-auto">
      <div className="flex flex-col items-center pt-2 sm:pt-4 pb-4 sm:pb-6">
        <Image
          src="/logo.png"
          alt="BeresinAja"
          width={180}
          height={48}
          priority
          loading="eager"
        />
      </div>

      <h1 className="text-xl sm:text-2xl font-bold text-foreground text-center mb-4 sm:mb-6">
        Register Toko / Teknisi
      </h1>

      <div className="w-full max-w-md mx-auto">
        <form
          onSubmit={handleRegister}
          className="bg-card rounded-2xl shadow-sm border border-border p-4 sm:p-6 flex flex-col gap-4 sm:gap-5"
        >
          <p className="text-sm sm:text-base font-semibold text-foreground text-center">
            Buat Akun Mitra
          </p>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl text-sm">
              {error}
            </div>
          )}

          <div className="rounded-xl border border-border bg-background px-4 py-3 text-sm text-muted-foreground">
            Halaman ini khusus untuk pendaftaran toko dan teknisi. Login tetap menggunakan halaman login utama.
          </div>

          <div className="flex flex-col gap-2 sm:gap-3">
            <p className="text-xs sm:text-sm font-medium text-foreground">Daftar sebagai:</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
              <button
                type="button"
                onClick={() => handleRoleSelect("toko")}
                disabled={isLoading}
                className={`rounded-xl sm:rounded-2xl border-2 px-3 sm:px-4 py-3 text-left transition-all ${
                  role === "toko"
                    ? "border-primary bg-secondary"
                    : "border-border bg-background hover:bg-accent/50"
                } disabled:opacity-50`}
              >
                <Store
                  className={`mb-2 w-5 h-5 ${
                    role === "toko" ? "text-primary" : "text-muted-foreground"
                  }`}
                />
                <p
                  className={`text-sm sm:text-base font-semibold ${
                    role === "toko" ? "text-primary" : "text-foreground"
                  }`}
                >
                  Toko
                </p>
                <p className="text-xs sm:text-sm text-muted-foreground">Untuk akun pemilik toko</p>
              </button>

              <button
                type="button"
                onClick={() => handleRoleSelect("teknisi")}
                disabled={isLoading}
                className={`rounded-xl sm:rounded-2xl border-2 px-3 sm:px-4 py-3 text-left transition-all ${
                  role === "teknisi"
                    ? "border-primary bg-secondary"
                    : "border-border bg-background hover:bg-accent/50"
                } disabled:opacity-50`}
              >
                <UserCog
                  className={`mb-2 w-5 h-5 ${
                    role === "teknisi" ? "text-primary" : "text-muted-foreground"
                  }`}
                />
                <p
                  className={`text-sm sm:text-base font-semibold ${
                    role === "teknisi" ? "text-primary" : "text-foreground"
                  }`}
                >
                  Teknisi
                </p>
                <p className="text-xs sm:text-sm text-muted-foreground">Untuk akun teknisi lapangan</p>
              </button>
            </div>
            {!role && (
              <p className="text-xs text-muted-foreground">
                Pilih salah satu peran terlebih dahulu sebelum mendaftar.
              </p>
            )}
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs sm:text-sm font-medium text-foreground" htmlFor="fullName">
              Nama Lengkap
            </label>
            <div className="flex items-center gap-2 border border-border rounded-xl px-3 py-2.5 sm:py-3 bg-background focus-within:border-primary transition-colors">
              <UserCog className="w-4 h-4 sm:w-5 sm:h-5 text-muted-foreground shrink-0" />
              <input
                id="fullName"
                type="text"
                placeholder={
                  role === "toko"
                    ? "Nama pemilik / nama toko"
                    : role === "teknisi"
                      ? "Nama teknisi"
                      : "Nama lengkap"
                }
                value={formData.fullName}
                onChange={handleChange}
                disabled={isLoading}
                className="flex-1 bg-transparent text-sm sm:text-base text-foreground placeholder:text-muted-foreground outline-none disabled:opacity-50"
              />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs sm:text-sm font-medium text-foreground" htmlFor="email">
              Email
            </label>
            <div className="flex items-center gap-2 border border-border rounded-xl px-3 py-2.5 sm:py-3 bg-background focus-within:border-primary transition-colors">
              <Mail className="w-4 h-4 sm:w-5 sm:h-5 text-muted-foreground shrink-0" />
              <input
                id="email"
                type="email"
                placeholder="Email"
                value={formData.email}
                onChange={handleChange}
                disabled={isLoading}
                className="flex-1 bg-transparent text-sm sm:text-base text-foreground placeholder:text-muted-foreground outline-none disabled:opacity-50"
              />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs sm:text-sm font-medium text-foreground" htmlFor="phone">
              Nomor HP
            </label>
            <div className="flex items-center gap-2 border border-border rounded-xl px-3 py-2.5 sm:py-3 bg-background focus-within:border-primary transition-colors">
              <Phone className="w-4 h-4 sm:w-5 sm:h-5 text-muted-foreground shrink-0" />
              <input
                id="phone"
                type="tel"
                placeholder="08xx xxxx xxxx"
                value={formData.phone}
                onChange={handleChange}
                disabled={isLoading}
                className="flex-1 bg-transparent text-sm sm:text-base text-foreground placeholder:text-muted-foreground outline-none disabled:opacity-50"
              />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs sm:text-sm font-medium text-foreground" htmlFor="password">
              Password
            </label>
            <div className="flex items-center gap-2 border border-border rounded-xl px-3 py-2.5 sm:py-3 bg-background focus-within:border-primary transition-colors">
              <svg
                className="w-4 h-4 sm:w-5 sm:h-5 text-muted-foreground shrink-0"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <rect x="3" y="11" width="18" height="11" rx="2" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="Minimal 8 karakter"
                value={formData.password}
                onChange={handleChange}
                disabled={isLoading}
                className="flex-1 bg-transparent text-sm sm:text-base text-foreground placeholder:text-muted-foreground outline-none disabled:opacity-50"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="text-muted-foreground hover:text-foreground transition-colors"
                disabled={isLoading}
              >
                {showPassword ? (
                  <EyeOff className="w-4 h-4 sm:w-5 sm:h-5" />
                ) : (
                  <Eye className="w-4 h-4 sm:w-5 sm:h-5" />
                )}
              </button>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Minimal 8 karakter dengan huruf dan angka
            </p>
          </div>

          <div className="flex items-start gap-2 mt-2">
            <input
              type="checkbox"
              id="terms"
              checked={agreeTerms}
              onChange={(e) => setAgreeTerms(e.target.checked)}
              disabled={isLoading}
              className="mt-1 w-4 h-4 rounded border-border text-primary focus:ring-primary disabled:opacity-50"
            />
            <label htmlFor="terms" className="text-xs text-muted-foreground">
              Saya menyetujui{" "}
              <button type="button" className="text-primary font-medium hover:underline">
                Syarat & Ketentuan
              </button>{" "}
              dan{" "}
              <button type="button" className="text-primary font-medium hover:underline">
                Kebijakan Privasi
              </button>
            </label>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-primary text-primary-foreground font-semibold text-sm sm:text-base rounded-xl sm:rounded-2xl py-3 sm:py-3.5 mt-2 hover:opacity-90 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? "Memproses..." : "Daftar Mitra"}
          </button>
        </form>
      </div>

      <div className="flex items-center justify-center pb-4 sm:pb-6 lg:pb-8 mt-4 sm:mt-6">
        <p className="text-xs sm:text-sm text-muted-foreground text-center">
          Sudah punya akun?{" "}
          <button
            onClick={() => navigate("login")}
            className="text-primary font-semibold hover:underline"
            disabled={isLoading}
          >
            Masuk
          </button>
        </p>
      </div>
    </div>
  )
}
