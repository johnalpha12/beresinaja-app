import { Home, ShoppingBag, MapPin, User } from "lucide-react"
import type { Screen } from "@/types/navigation"

type BottomNavScreen = Extract<Screen, "home" | "marketplace" | "tracking" | "profile">

interface Props {
  active: BottomNavScreen
  navigate: (s: Screen) => void
}

const items = [
  { key: "home" as const, label: "Beranda", icon: Home },
  { key: "marketplace" as const, label: "Belanja", icon: ShoppingBag },
  { key: "tracking" as const, label: "Tracking", icon: MapPin },
  { key: "profile" as const, label: "Profil", icon: User },
] satisfies ReadonlyArray<{
  key: BottomNavScreen
  label: string
  icon: typeof Home
}>

export default function BottomNav({ active, navigate }: Props) {
  return (
    <nav
      className="
        fixed bottom-0 left-0 right-0
        bg-background/95 backdrop-blur-md
        border-t border-border
        z-50
      "
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
      aria-label="Navigasi utama"
    >
      <div className="max-w-7xl mx-auto flex items-center justify-around py-2">
        {items.map(({ key, label, icon: Icon }) => {
          const isActive = active === key

          return (
            <button
              key={key}
              onClick={() => navigate(key)}
              className="relative flex flex-col items-center gap-1 px-4 py-2 transition-all"
              aria-current={isActive ? "page" : undefined}
            >
              {/* Active Indicator */}
              {isActive && (
                <span className="absolute -top-1 h-1 w-6 bg-primary rounded-full" />
              )}

              <Icon
                className={`w-5 h-5 transition-colors ${
                  isActive ? "text-primary" : "text-muted-foreground"
                }`}
              />

              <span
                className={`text-[11px] font-medium transition-colors ${
                  isActive ? "text-primary" : "text-muted-foreground"
                }`}
              >
                {label}
              </span>
            </button>
          )
        })}
      </div>
    </nav>
  )
}
