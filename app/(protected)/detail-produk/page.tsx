"use client"

import { ArrowLeft, MapPin, Share2, Heart, Star, ShieldCheck } from "lucide-react"
import { useEffect, useState, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import type { Screen } from "@/types/navigation"
import { screenToPath } from "@/types/navigation"
import { StatusChip } from "@/components/ui/StatusChip"
import { PageLoader } from "@/components/ui/PageLoader"
import { useAuth } from "@/context/AuthContext"
import { db } from "@/lib/firebase"
import { doc, getDoc, setDoc } from "firebase/firestore"
import { useCart } from "@/components/context/CartContext"
type ProductDetail = {
  name: string
  price: number
  rating: number
  reviews: number
  sold: number
  conditionBadge?: string | null
  description: string
  specs: { label: string; value: string }[]
  store: {
    name: string
    rating: number
    distance: string
    responseTime: string
    successRate: string
    verified: boolean
  }
  storeUid?: string
}

function DetailProdukContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const productIdQuery = searchParams.get("id")
  const navigate = (screen: Screen) => router.push(screenToPath(screen))
  const { user } = useAuth()
  const [liked, setLiked] = useState(false)
  const [product, setProduct] = useState<ProductDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const { addToCart } = useCart()

  const handleAddToCart = () => {
    if (!product) return;
    addToCart({
      id: productIdQuery || "p1",
      name: product.name,
      variant: product.conditionBadge || "Baru",
      price: product.price,
      quantity: 1,
      image: "📱",
    });
    router.push("/keranjang")
  }

  const startChat = async () => {
    if (!user || !product?.storeUid) return;
    const storeUid = product.storeUid;
    const chatId = [user.uid, storeUid].sort().join('_');
    const chatRef = doc(db, "chats", chatId);
    const snap = await getDoc(chatRef);
    if (!snap.exists()) {
      await setDoc(chatRef, {
        participants: [user.uid, storeUid],
        participantNames: {
          [user.uid]: user.email?.split("@")[0] || user.displayName || "Pembeli",
          [storeUid]: product.store?.name || "Toko",
        },
        lastMessage: "Percakapan baru dibuat",
        lastMessageTime: Date.now(),
        unreadCount: { [storeUid]: 0, [user.uid]: 0 }
      });
    }
    router.push(`/chat/${chatId}`);
  };

  useEffect(() => {
    async function loadProduct() {
      try {
        setLoading(true)
        const configResponse = await fetch("/api/content/product-detail", {
          cache: "no-store",
        })

        const configData = configResponse.ok
          ? ((await configResponse.json()) as { productId?: string })
          : null

        const targetId = productIdQuery || configData?.productId || "p1"

        const productResponse = await fetch(
          `/api/products/${encodeURIComponent(targetId)}`,
          {
            cache: "no-store",
          }
        )

        if (productResponse.ok) {
          const productData = (await productResponse.json()) as ProductDetail
          setProduct(productData)
        }
      } catch (error) {
        console.error("Failed to load product detail:", error)
      } finally {
        setLoading(false)
      }
    }

    loadProduct()
  }, [productIdQuery])

  const formatPrice = (price: number) =>
    new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(price)

  if (loading) {
    return <PageLoader message="Memuat detail produk..." />
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* HEADER */}
      <header className="flex items-center justify-between px-4 md:px-8 lg:px-16 py-4 border-b border-border">
        <button
          onClick={() => navigate("marketplace")}
          className="text-primary"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-4">
          <button onClick={() => router.push("/keranjang")} className="relative text-foreground hover:text-primary transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5"><circle cx="8" cy="21" r="1"/><circle cx="19" cy="21" r="1"/><path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12"/></svg>
          </button>
          <button>
            <Share2 className="w-5 h-5 text-foreground" />
          </button>

          <button onClick={() => setLiked(!liked)}>
            <Heart
              className={`w-5 h-5 transition-colors ${
                liked ? "fill-red-500 text-red-500" : "text-foreground"
              }`}
            />
          </button>
        </div>
      </header>

      {/* CONTENT */}
      <main className="flex-1 px-4 md:px-8 lg:px-16 py-6">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* LEFT - IMAGE */}
          <div className="relative bg-[#F0F2F5] rounded-2xl flex items-center justify-center aspect-square">
            <span className="text-7xl md:text-8xl">📱</span>

            {product?.conditionBadge && (
              <span className="absolute top-4 right-4 bg-secondary text-primary text-xs font-semibold px-3 py-1 rounded-full border border-primary/20">
                {product.conditionBadge}
              </span>
            )}
          </div>

          {/* RIGHT - DETAIL */}
          <div className="flex flex-col gap-6">
            {/* NAME & PRICE */}
            <div>
              <h1 className="text-xl md:text-2xl font-bold">
                {product?.name || "Produk"}
              </h1>

              <p className="text-2xl md:text-3xl font-bold text-primary mt-2">
                {product ? formatPrice(product.price) : "-"}
              </p>

              <div className="flex flex-wrap items-center gap-3 mt-2">
                <div className="flex items-center gap-1">
                  <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  <span className="text-sm text-muted-foreground">
                    {product ? `${product.rating} (${product.reviews} ulasan)` : "-"}
                  </span>
                </div>
                <span className="text-sm text-muted-foreground">
                  {product ? `\u2022 Terjual ${product.sold}` : ""}
                </span>
              </div>
            </div>

            {/* VERIFIED */}
            <div className="bg-secondary border border-primary/20 rounded-2xl p-4 flex gap-3">
              <ShieldCheck className="w-5 h-5 text-primary shrink-0 mt-1" />
              <div>
                <p className="font-semibold text-sm">
                  Dijamin 100% Original
                </p>
                <p className="text-xs text-muted-foreground">
                  Produk diverifikasi BeresinAja. Garansi uang kembali jika barang tidak sesuai.
                </p>
              </div>
            </div>

            {/* SPECS */}
            <section>
              <h2 className="font-semibold mb-3">Spesifikasi</h2>

              <div className="bg-card border border-border rounded-2xl divide-y divide-border">
                {product?.specs?.map((spec) => (
                  <div
                    key={spec.label}
                    className="flex justify-between px-4 py-3"
                  >
                    <span className="text-sm text-muted-foreground">
                      {spec.label}
                    </span>
                    <span className="text-sm font-medium">
                      {spec.value}
                    </span>
                  </div>
                ))}
              </div>
            </section>

            {/* DESCRIPTION */}
            <section>
              <h2 className="font-semibold mb-2">Deskripsi</h2>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {product?.description || "-"}
              </p>
            </section>

            <section>
              <div>
                <h3 className="text-[#4A4A4A] mb-3">Informasi Toko</h3>
                <div className="bg-white rounded-2xl p-5 shadow-sm border border-[#E5E7EB]">
                  <div className="flex items-start gap-4 mb-4">
                    <div className="w-14 h-14 rounded-full bg-gradient-to-br from-[#0288D1] to-[#4FC3F7] flex items-center justify-center text-white flex-shrink-0 text-xl">
                      📱
                    </div>
                    <div className="flex-1">
                      <h4 className="text-[#4A4A4A] mb-1">{product?.store?.name || "-"}</h4>
                      <div className="flex items-center gap-2 text-xs text-[#6B6B6B] mb-2">
                        <div className="flex items-center gap-1">
                          <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                          <span>{product?.store?.rating ?? "-"}</span>
                        </div>
                        <span>\u2022</span>
                        <div className="flex items-center gap-1">
                          <MapPin className="w-3 h-3" />
                          <span>{product?.store?.distance || "-"}</span>
                        </div>
                      </div>
                      <StatusChip
                        statusText={product?.store?.verified ? "Verified Seller" : "Unverified"}
                        statusType={product?.store?.verified ? "completed" : "pending"}
                        className="text-xs px-2 py-1"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 pt-4 border-t border-[#E5E7EB]">
                    <div>
                      <div className="text-xs text-[#6B6B6B] mb-1">Response Time</div>
                      <div className="text-sm text-[#4A4A4A]">{product?.store?.responseTime || "-"}</div>
                    </div>
                    <div>
                      <div className="text-xs text-[#6B6B6B] mb-1">Tingkat Keberhasilan</div>
                      <div className="text-sm text-[#4A4A4A]">{product?.store?.successRate || "-"}</div>
                    </div>
                  </div>

                  <button className="w-full mt-4 py-2 rounded-full border border-[#0288D1] text-[#0288D1] hover:bg-[#0288D1]/5 transition-colors text-sm">
                    Lihat Toko
                  </button>
                </div>
              </div>
            </section>
          </div>
        </div>
      </main>

      {/* BOTTOM ACTION */}
      <div className="sticky bottom-0 bg-background border-t border-border px-4 md:px-8 lg:px-16 py-4">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row gap-4">
          <button 
            onClick={startChat}
            className="flex-1 border-2 border-primary text-primary font-semibold rounded-xl py-3 hover:bg-secondary transition px-2 text-sm"
          >
            Chat
          </button>

          <button 
            onClick={handleAddToCart}
            className="flex-1 border-2 border-primary text-primary font-semibold rounded-xl py-3 hover:bg-secondary transition px-2 text-sm"
          >
            + Keranjang
          </button>

          <button
            onClick={() => router.push(`/checkout?productId=${productIdQuery || "p1"}`)}
            className="flex-[2] bg-primary text-primary-foreground font-semibold rounded-xl py-3 hover:opacity-90 transition px-2 text-sm"
          >
            Beli Sekarang
          </button>
        </div>
      </div>
    </div>
  )
}

export default function DetailProdukPage() {
  return (
    <Suspense fallback={<PageLoader message="Memuat detail produk..." />}>
      <DetailProdukContent />
    </Suspense>
  )
}
