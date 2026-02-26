"use client"

import { useRouter } from "next/navigation"
import MarketplaceScreen from "@/app/main/marketplace/page"
import { screenToPath, type Screen } from "@/types/navigation"

export default function MarketplacePage() {
  const router = useRouter()
  const navigate = (screen: Screen) => router.push(screenToPath(screen))

  return <MarketplaceScreen navigate={navigate} />
}
