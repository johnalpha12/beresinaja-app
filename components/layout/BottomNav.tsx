import { Home, ShoppingBag, MapPin, User } from "lucide-react"
import type { Screen } from "@/app/page"

interface Props {
  active: "home" | "marketplace" | "tracking" | "profile"
  navigate: (s: Screen) => void
}

const items = [
  { key: "home" as const, label: "Beranda", icon: Home },
  { key: "marketplace" as const, label: "Belanja", icon: ShoppingBag },
  { key: "tracking" as const, label: "Tracking", icon: MapPin },
  { key: "profile" as const, label: "Profil", icon: User },
]

export default function BottomNav({ active, navigate }: Props) {
  return (
    <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[430px] bg-card border-t border-border z-50" aria-label="Navigasi utama">
      <div className="flex items-center justify-around py-2 px-2">
        {items.map(({ key, label, icon: Icon }) => {
          const isActive = active === key
          return (
            <button
              key={key}
              onClick={() => navigate(key)}
              className="flex flex-col items-center gap-0.5 px-4 py-1.5 rounded-xl transition-colors"
              aria-current={isActive ? "page" : undefined}
            >
              <div className={`w-6 h-6 flex items-center justify-center rounded-xl transition-colors ${isActive ? "text-primary" : "text-muted-foreground"}`}>
                <Icon className="w-5 h-5" />
              </div>
              <span className={`text-[10px] font-medium transition-colors ${isActive ? "text-primary" : "text-muted-foreground"}`}>
                {label}
              </span>
            </button>
          )
        })}
      </div>
    </nav>
  )
}
