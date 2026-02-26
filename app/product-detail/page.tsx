"use client"

import { useRouter } from "next/navigation"
import ProductDetailScreen from "@/app/produk-detail/page"
import { screenToPath, type Screen } from "@/types/navigation"

export default function ProductDetailPage() {
  const router = useRouter()
  const navigate = (screen: Screen) => router.push(screenToPath(screen))

  return <ProductDetailScreen navigate={navigate} />
}
