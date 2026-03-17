// login.tsx
"use client" 
import { useEffect, useState } from "react" 
import { Eye, EyeOff, Mail } from "lucide-react" 
import type { Screen } from "@/types/navigation" 
import Image from "next/image" 
import { loginUser, loginWithGoogle } from "@/lib/auth"
import { useAuth } from "@/context/AuthContext"
import { useRouter } from "next/navigation"
import { screenToPath } from "@/types/navigation"

export default function LoginPage() { 
  const { user, loading } = useAuth()
  const router = useRouter()
  const navigate = (screen: Screen) => router.push(screenToPath(screen))
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [formData, setFormData] = useState({
    email: "",
    password: ""
  })

  useEffect(() => {
    if (!loading && user) {
      router.replace(screenToPath("home"))
    }
  }, [loading, user, router])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.id]: e.target.value
    })
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    const email = formData.email.trim().toLowerCase()
    const password = formData.password

    if (!email || !password) {
      setError("Email dan password harus diisi")
      return
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError("Format email tidak valid")
      return
    }

    setIsLoading(true)

    try {
      await loginUser(email, password)
      navigate("home")
    } catch (error: any) {
      console.error("Login error:", error)
      if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') {
        setError("Email atau password salah")
      } else if (error.code === 'auth/invalid-email') {
        setError("Format email tidak valid")
      } else if (error.code === 'auth/too-many-requests') {
        setError("Terlalu banyak percobaan. Coba lagi nanti")
      } else {
        setError("Gagal masuk. Silakan coba lagi.")
      }
    } finally {
      setIsLoading(false)
    }
  }

  const handleGoogleLogin = async () => {
    setError("")
    setIsLoading(true)

    try {
      const user = await loginWithGoogle()

      if (user) {
        navigate("home")
      }
    } catch (error: any) {
      console.error("Google login error:", error)

      if (error.code === "auth/popup-closed-by-user") {
        setError("Login Google dibatalkan")
      } else if (error.code === "auth/account-exists-with-different-credential") {
        setError("Email ini sudah terdaftar dengan metode login lain")
      } else if (error.code === "auth/popup-blocked") {
        setError("Popup Google diblokir browser. Izinkan popup lalu coba lagi")
      } else {
        setError("Gagal masuk dengan Google. Silakan coba lagi.")
      }
    } finally {
      setIsLoading(false)
    }
  }

  return ( 
    <div className="flex flex-col min-h-screen bg-background px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-12">
      {/* Logo */}
      <div className="flex flex-col items-center pt-4 sm:pt-6 pb-6 sm:pb-8"> 
        <Image
          src="/logo.png"
          alt="BeresinAja"
          width={180}
          height={48}
          priority
          loading="eager"
        /> 
      </div> 

      {/* Title */}
      <h1 className="text-xl sm:text-2xl font-bold text-foreground text-center mb-6 sm:mb-8">Masuk</h1> 

      {/* Form Card */}
      <div className="w-full max-w-md mx-auto">
        <form onSubmit={handleLogin} className="bg-card rounded-2xl shadow-sm border border-border p-4 sm:p-6 flex flex-col gap-4 sm:gap-5">
          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl text-sm">
              {error}
            </div>
          )}

          {/* Email */}
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
                autoComplete="email"
                inputMode="email"
                className="flex-1 bg-transparent text-sm sm:text-base text-foreground placeholder:text-muted-foreground outline-none disabled:opacity-50" 
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
                type="button"
                onClick={() => navigate("forgotPassword")} 
                className="text-xs sm:text-sm text-primary font-medium hover:underline"
                disabled={isLoading}
              > 
                Lupa password? 
              </button> 
            </div> 
            <div className="flex items-center gap-2 border border-border rounded-xl px-3 py-2.5 sm:py-3 bg-background focus-within:border-primary transition-colors"> 
              <svg className="w-4 h-4 sm:w-5 sm:h-5 text-muted-foreground shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"> 
                <rect x="3" y="11" width="18" height="11" rx="2" /> 
                <path d="M7 11V7a5 5 0 0 1 10 0v4" /> 
              </svg> 
              <input 
                id="password" 
                type={showPassword ? "text" : "password"} 
                placeholder="Password"
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
                {showPassword ? <EyeOff className="w-4 h-4 sm:w-5 sm:h-5" /> : <Eye className="w-4 h-4 sm:w-5 sm:h-5" />} 
              </button> 
            </div> 
          </div> 

          {/* Login Button */}
          <button 
            type="submit"
            disabled={isLoading}
            className="w-full bg-primary text-primary-foreground font-semibold text-sm sm:text-base rounded-xl sm:rounded-2xl py-3 sm:py-3.5 mt-1 hover:opacity-90 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed" 
          > 
            {isLoading ? "Memproses..." : "Masuk Sekarang"}
          </button> 

          {/* Divider */}
          <div className="flex items-center gap-2 sm:gap-3"> 
            <div className="flex-1 h-px bg-border" /> 
            <span className="text-xs text-muted-foreground whitespace-nowrap">atau masuk cepat</span> 
            <div className="flex-1 h-px bg-border" /> 
          </div> 

          {/* Google Login */}
          <button 
            type="button"
            onClick={handleGoogleLogin}
            className="w-full border border-border rounded-xl sm:rounded-2xl py-2.5 sm:py-3 text-primary font-semibold text-xs sm:text-sm hover:bg-accent transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
            disabled={isLoading}
          > 
            <svg className="w-4 h-4 sm:w-5 sm:h-5" viewBox="0 0 24 24"> 
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" /> 
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" /> 
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" /> 
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" /> 
            </svg> 
            Masuk dengan Google 
          </button> 
        </form>
      </div> 

      {/* Register Link */}
      <div className="flex-1 flex items-end justify-center pb-4 sm:pb-6 lg:pb-8 mt-6 sm:mt-8"> 
        <p className="text-xs sm:text-sm text-muted-foreground text-center"> 
          Belum punya akun?{" "} 
          <button 
            onClick={() => navigate("register")} 
            className="text-primary font-semibold hover:underline"
            disabled={isLoading}
          > 
            Daftar Gratis 
          </button> 
        </p> 
      </div> 
    </div> 
  ) 
}
