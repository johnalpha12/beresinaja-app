"use client"

import { useRouter } from "next/navigation"
import { screenToPath, type Screen } from "@/types/navigation"

export default function TeknisiPage() {
  const router = useRouter()
  const navigate = (screen: Screen) => router.push(screenToPath(screen))

  return (
    <div className="min-h-screen bg-background px-5 lg:px-10 py-8 lg:py-12">
      <h1 className="text-2xl font-bold text-foreground mb-2">Teknisi</h1>
      <p className="text-sm text-muted-foreground mb-6">
        Halaman daftar teknisi akan segera tersedia.
      </p>
      <button
        onClick={() => navigate("home")}
        className="bg-primary text-primary-foreground font-semibold text-sm rounded-2xl px-5 py-3 hover:opacity-90 transition-opacity"
      >
        Kembali ke Home
      </button>
    </div>
  )
}
