"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import {
  ArrowLeft,
  Search,
  SlidersHorizontal,
  Star,
  MapPin,
  ShieldCheck,
} from "lucide-react"
import { screenToPath, type Screen } from "@/types/navigation"
import BottomNav from "@/components/layout/BottomNav"
import { PageLoader } from "@/components/ui/PageLoader"

type Product = {
  id: string
  name: string
  price: number
  rating: number
  reviews: number
  seller: string
  distance: string
  badge: string | null
  category: string
  condition: string
  imageEmoji?: string
}

const ProductIcon = ({ category }: { category: string }) => {
  const icons: Record<string, string> = {
    HP: "ðŸ“±",
    Laptop: "ðŸ’»",
    Printer: "ðŸ–¨ï¸",
    CCTV: "ðŸ“·",
    Aksesoris: "ðŸŽ§",
  }

  return (
    <span className="text-4xl md:text-5xl" role="img">
      {icons[category] || "ðŸ“¦"}
    </span>
  )
}

export default function MarketplacePage() {
  const router = useRouter()
  const navigate = (screen: Screen) => router.push(screenToPath(screen))
  const [categories, setCategories] = useState<string[]>([])
  const [conditions, setConditions] = useState<string[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [activeCategory, setActiveCategory] = useState("Semua")
  const [activeCondition, setActiveCondition] = useState("Semua")
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadContent() {
      try {
        setLoading(true)
        const [configResponse, productsResponse] = await Promise.all([
          fetch("/api/content/marketplace", {
            cache: "no-store",
          }),
          fetch("/api/products", {
            cache: "no-store",
          }),
        ])

        if (!configResponse.ok) {
          throw new Error("Gagal memuat konfigurasi marketplace.")
        }

        if (!productsResponse.ok) {
          throw new Error("Gagal memuat daftar produk.")
        }

        const configData = (await configResponse.json()) as {
          categories?: string[]
          conditions?: string[]
        }

        const productData = (await productsResponse.json()) as {
          products?: Product[]
        }

        setCategories(configData.categories || [])
        setConditions(configData.conditions || [])
        setProducts(productData.products || [])
      } catch (error) {
        console.error("Failed to load marketplace data:", error)
      } finally {
        setLoading(false)
      }
    }

    loadContent()
  }, [])

  const filtered = products.filter((p) => {
    const catMatch =
      activeCategory === "Semua" || p.category === activeCategory
    const condMatch =
      activeCondition === "Semua" || p.condition === activeCondition
    return catMatch && condMatch
  })

  const formatPrice = (price: number) =>
    new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(price)

  if (loading) {
    return <PageLoader message="Memuat marketplace..." />
  }

  return (
    <div className="min-h-screen bg-[#F5F7FA] pb-28">
      <header className="sticky top-0 z-50 bg-background border-b border-border px-4 md:px-6 lg:px-8 py-4 flex items-center gap-3">
        <button onClick={() => navigate("home")}>
          <ArrowLeft className="w-5 h-5 text-primary" />
        </button>

        <h1 className="text-base md:text-lg font-bold flex-1 text-center pr-5">
          Marketplace
        </h1>
      </header>

      <main className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8 space-y-4 mt-4">
        <div className="flex items-center gap-2 bg-white rounded-full px-4 py-3 border border-border">
          <Search className="w-4 h-4 text-muted-foreground shrink-0" />
          <input
            type="text"
            placeholder="Cari produk..."
            className="flex-1 bg-transparent outline-none text-sm"
          />
          <SlidersHorizontal className="w-4 h-4 text-muted-foreground" />
        </div>

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
              onClick={() => navigate("productDetail")}
              className="bg-card rounded-2xl border border-border overflow-hidden hover:shadow-md transition text-left"
            >
              <div className="relative bg-[#F5F7FA] flex items-center justify-center aspect-square">
                {product.imageEmoji ? (
                  <span className="text-4xl md:text-5xl">{product.imageEmoji}</span>
                ) : (
                  <ProductIcon category={product.category} />
                )}
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
                  {formatPrice(product.price)}
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
