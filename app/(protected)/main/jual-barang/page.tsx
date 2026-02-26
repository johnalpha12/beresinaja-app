"use client"

import { useEffect, useState } from "react"
import { ArrowLeft, Camera, HelpCircle, MapPin } from "lucide-react"
import type { Screen } from "@/types/navigation"
import { doc, getDoc } from "firebase/firestore"
import { db } from "@/lib/firebase"

interface Props {
  navigate: (s: Screen) => void
}

export default function JualBarangScreen({ navigate }: Props) {
  const [condition, setCondition] = useState<"baru" | "bekas">("bekas")
  const [selectedCategory, setSelectedCategory] = useState("")
  const [categoryOpen, setCategoryOpen] = useState(false)
  const [categories, setCategories] = useState<string[]>([])

  useEffect(() => {
    async function loadContent() {
      try {
        const snap = await getDoc(doc(db, "content", "jual-barang"))
        if (snap.exists()) {
          const data = snap.data() as { categories?: string[] }
          setCategories(data.categories || [])
        }
      } catch (error) {
        console.error("Failed to load jual barang content:", error)
      }
    }

    loadContent()
  }, [])

  return (
    <div className="flex flex-col min-h-screen bg-background">
      {/* Header */}
      <header className="flex items-center justify-between px-4 lg:px-10 pt-10 pb-4 bg-background border-b border-border">
        <button
          onClick={() => navigate("home")}
          aria-label="Kembali"
          className="text-primary"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-base font-bold text-foreground">Daftar Jual</h1>
        <button aria-label="Bantuan">
          <HelpCircle className="w-5 h-5 text-muted-foreground" />
        </button>
      </header>

      <div className="flex-1 overflow-y-auto pb-24 px-4 lg:px-10 pt-5 flex flex-col gap-5">
        {/* Photo Upload */}
        <section>
          <p className="text-sm font-semibold text-foreground mb-2">Foto Barang</p>
          <div className="border-2 border-dashed border-border rounded-2xl p-8 flex flex-col items-center gap-2">
            <div className="w-12 h-12 rounded-full bg-secondary flex items-center justify-center">
              <Camera className="w-6 h-6 text-primary" />
            </div>
            <p className="text-sm text-muted-foreground text-center">Upload foto barang</p>
            <p className="text-xs text-muted-foreground">(maks. 5 gambar)</p>
          </div>
        </section>

        {/* Product Name */}
        <section>
          <label className="text-sm font-semibold text-foreground block mb-2" htmlFor="product-name">
            Nama Barang
          </label>
          <input
            id="product-name"
            type="text"
            placeholder="Contoh: RAM Corsair 16GB DDR4"
            className="w-full border border-border rounded-xl px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground bg-background focus:border-primary outline-none transition-colors"
          />
        </section>

        {/* Category */}
        <section className="relative">
          <label className="text-sm font-semibold text-foreground block mb-2" htmlFor="category">
            Kategori Barang
          </label>
          <button
            id="category"
            onClick={() => setCategoryOpen(!categoryOpen)}
            className="w-full border border-border rounded-xl px-4 py-3 text-sm flex items-center justify-between bg-background focus:border-primary outline-none transition-colors"
          >
            <span className={selectedCategory ? "text-foreground" : "text-muted-foreground"}>
              {selectedCategory || "Pilih kategori"}
            </span>
            <svg className={`w-4 h-4 text-muted-foreground transition-transform ${categoryOpen ? "rotate-180" : ""}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
              <path d="M6 9l6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
          {categoryOpen && (
            <div className="absolute z-10 w-full mt-1 bg-card border border-border rounded-xl shadow-lg overflow-hidden">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => {
                    setSelectedCategory(cat)
                    setCategoryOpen(false)
                  }}
                  className={`w-full text-left px-4 py-3 text-sm hover:bg-secondary transition-colors border-b border-border last:border-0 ${selectedCategory === cat ? "text-primary font-semibold" : "text-foreground"}`}
                >
                  {cat}
                </button>
              ))}
            </div>
          )}
        </section>

        {/* Description */}
        <section>
          <label className="text-sm font-semibold text-foreground block mb-2" htmlFor="desc">
            Deskripsi Barang
          </label>
          <textarea
            id="desc"
            rows={4}
            placeholder="Tulis kondisi, spesifikasi, dan kelengkapan barang."
            className="w-full border border-border rounded-xl px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground bg-background focus:border-primary outline-none transition-colors resize-none"
          />
        </section>

        {/* Price */}
        <section>
          <label className="text-sm font-semibold text-foreground block mb-2" htmlFor="price">
            Harga Barang
          </label>
          <input
            id="price"
            type="number"
            defaultValue={0}
            className="w-full border border-border rounded-xl px-4 py-3 text-sm text-foreground bg-background focus:border-primary outline-none transition-colors"
          />
          <p className="text-xs text-muted-foreground mt-1">Gunakan harga realistis sesuai kondisi.</p>
        </section>

        {/* Condition */}
        <section>
          <p className="text-sm font-semibold text-foreground mb-2">Kondisi Barang</p>
          <div className="flex gap-5">
            {(["baru", "bekas"] as const).map((c) => (
              <label key={c} className="flex items-center gap-2 cursor-pointer">
                <div
                  onClick={() => setCondition(c)}
                  className={`w-4 h-4 rounded-full border-2 flex items-center justify-center transition-colors cursor-pointer ${
                    condition === c ? "border-primary" : "border-border"
                  }`}
                >
                  {condition === c && (
                    <div className="w-2 h-2 rounded-full bg-primary" />
                  )}
                </div>
                <span className="text-sm text-foreground capitalize">{c === "baru" ? "Baru" : "Bekas"}</span>
              </label>
            ))}
          </div>
        </section>

        {/* Location */}
        <section>
          <label className="text-sm font-semibold text-foreground block mb-2" htmlFor="location">
            Lokasi Penjual
          </label>
          <div className="flex items-center gap-2 border border-border rounded-xl px-4 py-3 bg-background focus-within:border-primary transition-colors">
            <MapPin className="w-4 h-4 text-muted-foreground shrink-0" />
            <input
              id="location"
              type="text"
              placeholder="Masukkan kota atau daerah kamu"
              className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground outline-none"
            />
          </div>
          <button className="flex items-center gap-1.5 mt-2">
            <MapPin className="w-3.5 h-3.5 text-red-500" />
            <span className="text-xs text-red-500 font-medium">Gunakan Lokasi Saya</span>
          </button>
        </section>
      </div>

      {/* Submit */}
      <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[430px] sm:max-w-[540px] md:max-w-[720px] lg:max-w-[1100px] bg-background border-t border-border px-4 lg:px-10 py-3">
        <button className="w-full bg-primary text-primary-foreground font-semibold text-sm rounded-2xl py-3.5 hover:opacity-90 transition-opacity">
          Daftarkan Barang
        </button>
      </div>
    </div>
  )
}
