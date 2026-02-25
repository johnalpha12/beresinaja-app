"use client"

import { useState } from "react"
import { ArrowLeft, Search, SlidersHorizontal, Star, MapPin, ShieldCheck } from "lucide-react"
import type { Screen } from "@/app/page"
import BottomNav from "../../../components/layout/BottomNav"

interface Props {
  navigate: (s: Screen) => void
}

const categories = ["Semua", "HP", "Laptop", "Printer", "CCTV", "Aksesoris"]
const conditions = ["Semua", "Baru", "Bekas"]

const products = [
  {
    id: 1,
    name: "iPhone 14 Pro Max",
    price: "Rp 18.500.000",
    rating: 4.9,
    reviews: 234,
    seller: "iBox Official",
    distance: "1.2 km",
    badge: "Baru",
    category: "HP",
    condition: "Baru",
  },
  {
    id: 2,
    name: "MacBook Air M2",
    price: "Rp 16.999.000",
    rating: 5,
    reviews: 189,
    seller: "Apple Authorized Reseller",
    distance: "0.8 km",
    badge: "Baru",
    category: "Laptop",
    condition: "Baru",
  },
  {
    id: 3,
    name: "Samsung Galaxy S23 Ultra",
    price: "Rp 14.500.000",
    rating: 4.8,
    reviews: 312,
    seller: "Samsung Store",
    distance: "2.1 km",
    badge: null,
    category: "HP",
    condition: "Bekas",
  },
  {
    id: 4,
    name: "HP LaserJet Pro",
    price: "Rp 3.200.000",
    rating: 4.6,
    reviews: 87,
    seller: "Print Center",
    distance: "1.5 km",
    badge: "Baru",
    category: "Printer",
    condition: "Baru",
  },
]

// Simple product placeholder icons
const ProductIcon = ({ category }: { category: string }) => {
  const icons: Record<string, string> = {
    HP: "📱",
    Laptop: "💻",
    Printer: "🖨️",
    CCTV: "📷",
    Aksesoris: "🎧",
  }
  return (
    <span className="text-4xl" role="img" aria-label={category}>
      {icons[category] || "📦"}
    </span>
  )
}

export default function MarketplaceScreen({ navigate }: Props) {
  const [activeCategory, setActiveCategory] = useState("Semua")
  const [activeCondition, setActiveCondition] = useState("Semua")

  const filtered = products.filter((p) => {
    const catMatch = activeCategory === "Semua" || p.category === activeCategory
    const condMatch = activeCondition === "Semua" || p.condition === activeCondition
    return catMatch && condMatch
  })

  return (
    <div className="flex flex-col min-h-screen bg-[#F5F7FA]">
      {/* Header */}
      <header className="flex items-center gap-3 px-4 pt-10 pb-4 bg-background border-b border-border">
        <button
          onClick={() => navigate("home")}
          aria-label="Kembali"
          className="text-primary"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-base font-bold text-foreground flex-1 text-center pr-5">Marketplace</h1>
      </header>

      <div className="flex-1 overflow-y-auto pb-24 flex flex-col gap-0">
        {/* Search */}
        <div className="bg-background px-4 py-3">
          <div className="flex items-center gap-2 bg-[#F5F7FA] rounded-full px-4 py-2.5 border border-border">
            <Search className="w-4 h-4 text-muted-foreground shrink-0" />
            <input
              type="text"
              placeholder="Cari produk..."
              className="flex-1 bg-transparent text-sm placeholder:text-muted-foreground outline-none"
              aria-label="Cari produk"
            />
            <button aria-label="Filter">
              <SlidersHorizontal className="w-4 h-4 text-muted-foreground" />
            </button>
          </div>
        </div>

        {/* Category Chips */}
        <div className="bg-background px-4 pb-3 flex gap-2 overflow-x-auto scrollbar-hide">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`shrink-0 px-4 py-1.5 rounded-full text-sm font-medium border transition-all ${
                activeCategory === cat
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-background text-foreground border-border hover:border-primary/40"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Condition Chips */}
        <div className="bg-background px-4 pb-3 flex gap-2">
          {conditions.map((cond) => (
            <button
              key={cond}
              onClick={() => setActiveCondition(cond)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium border transition-all ${
                activeCondition === cond
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-background text-foreground border-border hover:border-primary/40"
              }`}
            >
              {cond}
            </button>
          ))}
        </div>

        {/* Verified badge */}
        <div className="mx-4 mb-3 bg-secondary border border-primary/20 rounded-2xl px-4 py-3 flex items-center gap-3">
          <ShieldCheck className="w-5 h-5 text-primary shrink-0" />
          <div>
            <p className="text-sm font-semibold text-foreground">Semua produk terverifikasi</p>
            <p className="text-xs text-muted-foreground">Dilindungi garansi platform BeresinAja.</p>
          </div>
        </div>

        {/* Product Grid */}
        <div className="grid grid-cols-2 gap-3 px-4">
          {filtered.map((product) => (
            <button
              key={product.id}
              onClick={() => navigate("product-detail")}
              className="bg-card rounded-2xl border border-border overflow-hidden hover:shadow-md hover:border-primary/30 transition-all text-left"
            >
              {/* Product Image Area */}
              <div className="relative bg-[#F5F7FA] flex items-center justify-center h-36">
                <ProductIcon category={product.category} />
                {product.badge && (
                  <span className="absolute top-2 right-2 bg-secondary text-primary text-[10px] font-semibold px-2 py-0.5 rounded-full border border-primary/20">
                    {product.badge}
                  </span>
                )}
              </div>
              {/* Product Info */}
              <div className="p-3">
                <p className="text-sm font-semibold text-foreground leading-tight">{product.name}</p>
                <p className="text-sm font-bold text-primary mt-1">{product.price}</p>
                <div className="flex items-center gap-1 mt-1">
                  <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                  <span className="text-xs text-muted-foreground">{product.rating} ({product.reviews})</span>
                </div>
                <p className="text-xs text-muted-foreground mt-0.5">{product.seller}</p>
                <div className="flex items-center gap-1 mt-0.5">
                  <MapPin className="w-2.5 h-2.5 text-muted-foreground" />
                  <span className="text-xs text-muted-foreground">{product.distance}</span>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      <BottomNav active="marketplace" navigate={navigate} />
    </div>
  )
}
