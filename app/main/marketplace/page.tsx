"use client"

import { useState } from "react"
import {
  ArrowLeft,
  Search,
  SlidersHorizontal,
  Star,
  MapPin,
  ShieldCheck,
} from "lucide-react"
import type { Screen } from "@/types/navigation"
import BottomNav from "../../../components/layout/BottomNav"

interface Props {
  navigate: (s: Screen) => void
}

const categories = ["Semua", "HP", "Laptop", "Printer", "CCTV", "Aksesoris"]
const conditions = ["Semua", "Baru", "Bekas"]

type Product = {
  id: number
  name: string
  price: string
  rating: number
  reviews: number
  seller: string
  distance: string
  badge: string | null
  category: string
  condition: string
}

const products: Product[] = [
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

// PRODUCT ICON
const ProductIcon = ({ category }: { category: string }) => {
  const icons: Record<string, string> = {
    HP: "📱",
    Laptop: "💻",
    Printer: "🖨️",
    CCTV: "📷",
    Aksesoris: "🎧",
  }

  return (
    <span className="text-4xl md:text-5xl" role="img">
      {icons[category] || "📦"}
    </span>
  )
}

export default function MarketplaceScreen({ navigate }: Props) {
  const [activeCategory, setActiveCategory] = useState("Semua")
  const [activeCondition, setActiveCondition] = useState("Semua")

  const filtered = products.filter((p) => {
    const catMatch =
      activeCategory === "Semua" || p.category === activeCategory
    const condMatch =
      activeCondition === "Semua" || p.condition === activeCondition
    return catMatch && condMatch
  })

  return (
    <div className="min-h-screen bg-[#F5F7FA] pb-28">

      {/* HEADER */}
      <header className="sticky top-0 z-50 bg-background border-b border-border px-4 md:px-6 lg:px-8 py-4 flex items-center gap-3">
        <button onClick={() => navigate("home")}>
          <ArrowLeft className="w-5 h-5 text-primary" />
        </button>

        <h1 className="text-base md:text-lg font-bold flex-1 text-center pr-5">
          Marketplace
        </h1>
      </header>

      <main className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8 space-y-4 mt-4">

        {/* SEARCH */}
        <div className="flex items-center gap-2 bg-white rounded-full px-4 py-3 border border-border">
          <Search className="w-4 h-4 text-muted-foreground shrink-0" />
          <input
            type="text"
            placeholder="Cari produk..."
            className="flex-1 bg-transparent outline-none text-sm"
          />
          <SlidersHorizontal className="w-4 h-4 text-muted-foreground" />
        </div>

        {/* CATEGORY */}
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`shrink-0 px-4 py-2 rounded-full text-sm font-medium border transition ${
                activeCategory === cat
                  ? "bg-primary text-white border-primary"
                  : "bg-white border-border"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* CONDITION */}
        <div className="flex gap-2">
          {conditions.map((cond) => (
            <button
              key={cond}
              onClick={() => setActiveCondition(cond)}
              className={`px-4 py-2 rounded-full text-sm font-medium border transition ${
                activeCondition === cond
                  ? "bg-primary text-white border-primary"
                  : "bg-white border-border"
              }`}
            >
              {cond}
            </button>
          ))}
        </div>

        {/* VERIFIED */}
        <div className="bg-secondary border border-primary/20 rounded-2xl px-4 py-3 flex items-center gap-3">
          <ShieldCheck className="w-5 h-5 text-primary shrink-0" />
          <div>
            <p className="text-sm font-semibold">
              Semua produk terverifikasi
            </p>
            <p className="text-xs text-muted-foreground">
              Dilindungi garansi platform BeresinAja.
            </p>
          </div>
        </div>

        {/* GRID */}
        <div
          className="
          grid gap-4
          grid-cols-2
          sm:grid-cols-2
          md:grid-cols-3
          lg:grid-cols-4
        "
        >
          {filtered.map((product) => (
            <button
              key={product.id}
              onClick={() => navigate("product-detail")}
              className="bg-card rounded-2xl border border-border overflow-hidden hover:shadow-md transition text-left"
            >
              <div className="relative bg-[#F5F7FA] flex items-center justify-center aspect-square">
                <ProductIcon category={product.category} />
                {product.badge && (
                  <span className="absolute top-2 right-2 bg-secondary text-primary text-[10px] font-semibold px-2 py-1 rounded-full">
                    {product.badge}
                  </span>
                )}
              </div>

              <div className="p-3">
                <p className="text-sm font-semibold line-clamp-2">
                  {product.name}
                </p>

                <p className="text-sm font-bold text-primary mt-1">
                  {product.price}
                </p>

                <div className="flex items-center gap-1 mt-1">
                  <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                  <span className="text-xs text-muted-foreground">
                    {product.rating} ({product.reviews})
                  </span>
                </div>

                <p className="text-xs text-muted-foreground mt-1 truncate">
                  {product.seller}
                </p>

                <div className="flex items-center gap-1 mt-1">
                  <MapPin className="w-3 h-3 text-muted-foreground" />
                  <span className="text-xs text-muted-foreground">
                    {product.distance}
                  </span>
                </div>
              </div>
            </button>
          ))}
        </div>
      </main>

      <BottomNav active="marketplace" navigate={navigate} />
    </div>
  )
}
