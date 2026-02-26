"use client"

import { useRouter } from "next/navigation"
import JualBarangScreen from "@/app/main/jual-barang/page"
import { screenToPath, type Screen } from "@/types/navigation"

export default function JualBarangPage() {
  const router = useRouter()
  const navigate = (screen: Screen) => router.push(screenToPath(screen))

  return <JualBarangScreen navigate={navigate} />
}
