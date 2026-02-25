// app/page.tsx
"use client"

import { useState } from "react"
import { AnimatePresence } from "framer-motion" // opsional, untuk animasi

// Import screens
import SplashScreen from "@/app/splash-screen/page"
import LoginScreen from "@/app/auth/login/page"
import RegisterScreen from "@/app/auth/register/page"
import HomeScreen from "@/app/main/home/page"
import ServisPerangkatScreen from "@/app/main/servis/perangkat/page"
import ServisKomputerScreen from "@/app/main/servis/komputer/page"
import MarketplaceScreen from "@/app/main/marketplace/page"
import ProductDetailScreen from "@/app/produk-detail/page"
import TrackingScreen from "@/app/main/tracking/page"
import ProfileScreen from "@/app/main/profile/page"
import ChatAIScreen from "@/app/main/chat-ai/page"
import JualBarangScreen from "@/app/main/jual-barang/page"

// Hooks
import { useSplashTimeout } from "@/hooks/useSplashTimeout"

export type Screen =
  | "splash"
  | "login"
  | "register"
  | "home"
  | "servis-perangkat"
  | "servis-komputer"
  | "marketplace"
  | "product-detail"
  | "tracking"
  | "profile"
  | "chat-ai"
  | "jual-barang"

export default function AppContainer() {
  const [currentScreen, setCurrentScreen] = useState<Screen>("splash")

  const navigate = (screen: Screen) => {
    setCurrentScreen(screen)
  }

  // Handle splash screen timeout
  const isSplashComplete = useSplashTimeout(() => {
    navigate("login")
  })

  return (
    <main className="min-h-screen flex items-center justify-center bg-[#E8EDF2]">
      <div className="relative w-full max-w-[430px] min-h-screen bg-background overflow-hidden shadow-2xl">
        <AnimatePresence mode="wait">
          <ScreenRenderer 
            key={currentScreen}
            screen={currentScreen} 
            navigate={navigate}
          />
        </AnimatePresence>
      </div>
    </main>
  )
}

// Komponen terpisah untuk render screen
function ScreenRenderer({ 
  screen, 
  navigate
}: { 
  screen: Screen
  navigate: (screen: Screen) => void
}) {
  switch (screen) {
    case "splash":
      return <SplashScreen />
    case "login":
      return <LoginScreen navigate={navigate} />
    case "register":
      return <RegisterScreen navigate={navigate} />
    case "home":
      return <HomeScreen navigate={navigate} />
    case "servis-perangkat":
      return <ServisPerangkatScreen navigate={navigate} />
    case "servis-komputer":
      return <ServisKomputerScreen navigate={navigate} />
    case "marketplace":
      return <MarketplaceScreen navigate={navigate} />
    case "product-detail":
      return <ProductDetailScreen navigate={navigate} />
    case "tracking":
      return <TrackingScreen navigate={navigate} />
    case "profile":
      return <ProfileScreen navigate={navigate} />
    case "chat-ai":
      return <ChatAIScreen navigate={navigate} />
    case "jual-barang":
      return <JualBarangScreen navigate={navigate} />
    default:
      return <HomeScreen navigate={navigate} />
  }
}
