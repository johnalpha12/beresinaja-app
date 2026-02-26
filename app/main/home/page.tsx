"use client"

import {
  Bell,
  MessageCircle,
  Search,
  Wrench,
  ShoppingBag,
  DollarSign,
  MapPin,
  ChevronRight,
  Star,
} from "lucide-react"
import type { Screen } from "@/types/navigation"
import BottomNav from "../../../components/layout/BottomNav"

interface Props {
  navigate: (s: Screen) => void
}

const services = [
  { key: "servis-perangkat" as Screen, label: "Servis Perangkat", icon: Wrench },
  { key: "marketplace" as Screen, label: "Beli Barang", icon: ShoppingBag },
  { key: "jual-barang" as Screen, label: "Jual Barang", icon: DollarSign },
  { key: "tracking" as Screen, label: "Track Status", icon: MapPin },
]

const recommendedTechnicians = [
  { id: 1, name: "Ahmad Teknisi", rating: 4.8, specialty: "iPhone Specialist" },
  { id: 2, name: "Budi Servis", rating: 4.9, specialty: "Samsung Expert" },
  { id: 3, name: "Citra Electronics", rating: 4.7, specialty: "Laptop & PC" },
  { id: 4, name: "Deni Repair", rating: 4.8, specialty: "All Brands" },
]

export default function HomeScreen({ navigate }: Props) {
  return (
    <div className="min-h-screen bg-[#F5F7FA]">

      {/* HEADER */}
      <header className="sticky top-0 z-50 bg-background shadow-sm px-4 sm:px-6 lg:px-8 pt-4 sm:pt-6 lg:pt-8 pb-3">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-bold relative">
                J
                <span className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-background" />
              </div>

              <div>
                <p className="font-bold">John Alpha</p>
                <p className="text-sm text-muted-foreground flex items-center gap-1">
                  <MapPin className="w-4 h-4" />
                  Medan
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => navigate("chat-ai")}
                className="p-2 hover:bg-primary/10 rounded-full"
              >
                <MessageCircle className="w-6 h-6 text-primary" />
              </button>

              <button className="relative p-2 hover:bg-primary/10 rounded-full">
                <Bell className="w-6 h-6 text-primary" />
                <span className="absolute top-2 right-2 w-2.5 h-2.5 bg-red-500 rounded-full ring-2 ring-background" />
              </button>
            </div>
          </div>

          {/* SEARCH */}
          <div className="flex items-center gap-2 bg-white rounded-full px-4 py-3 border border-border focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20 transition-all">
            <Search className="w-5 h-5 text-muted-foreground" />
            <input
              type="text"
              placeholder="Cari teknisi, toko, atau produk..."
              className="w-full bg-transparent outline-none"
            />
          </div>
        </div>
      </header>

      {/* CONTENT (SCROLL DI WINDOW) */}
      <main className="pb-28 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto py-6 space-y-6">

        {/* PROMO */}
        <div
          className="rounded-2xl p-5 relative overflow-hidden"
          style={{ background: "linear-gradient(135deg, #2196F3 0%, #29B6F6 100%)" }}
        >
          <span className="inline-block bg-white/20 text-white text-xs px-3 py-1 rounded-full mb-2">
            Promo Spesial
          </span>

          <h2 className="text-white text-xl font-bold">
            Gratis Jemput-Antar!
          </h2>

          <p className="text-white/80 text-xs mb-4 max-w-[250px]">
            Untuk servis pertama kamu. Berlaku hingga akhir bulan.
          </p>

          <button className="bg-white text-primary text-sm font-semibold px-5 py-2 rounded-full">
            Pakai Sekarang
          </button>
        </div>

        {/* SERVICES */}
        <section>
          <div className="flex justify-between mb-4">
            <h2 className="font-bold">Layanan Kami</h2>
            <button
              onClick={() => navigate("servis-perangkat")}
              className="text-primary text-sm flex items-center gap-1"
            >
              Lihat Semua <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {services.map(({ key, label, icon: Icon }) => (
              <button
                key={key}
                onClick={() => navigate(key)}
                className="bg-card rounded-2xl border p-4 flex flex-col items-center gap-2 hover:shadow-md transition"
              >
                <div className="w-12 h-12 rounded-xl bg-secondary flex items-center justify-center">
                  <Icon className="w-6 h-6 text-primary" />
                </div>
                <span className="text-sm font-medium text-center">
                  {label}
                </span>
              </button>
            ))}
          </div>
        </section>

        {/* TEKNISI */}
        <section>
          <div className="flex justify-between mb-4">
            <h2 className="font-bold">Teknisi Rekomendasi</h2>
            <button
              onClick={() => navigate("teknisi")}
              className="text-primary text-sm flex items-center gap-1"
            >
              Lihat Semua <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {recommendedTechnicians.map((tech) => (
              <button
                key={tech.id}
                onClick={() => navigate("teknisi-detail")}
                className="bg-card rounded-2xl border p-4 flex items-center gap-3 hover:shadow-md transition"
              >
                <div className="w-12 h-12 rounded-full bg-secondary flex items-center justify-center font-bold text-primary">
                  {tech.name.charAt(0)}
                </div>

                <div className="text-left">
                  <p className="font-semibold">{tech.name}</p>
                  <div className="flex items-center gap-1 text-sm">
                    <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    {tech.rating}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </section>

      </main>

      <BottomNav active="home" navigate={navigate} />
    </div>
  )
}