"use client"

import { useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import {
  ArrowLeft,
  ChevronRight,
  Clock,
  MapPin,
  Search,
  Star,
  Wrench,
  X,
} from "lucide-react"
import { StatusChip } from "@/components/ui/StatusChip"
import { PageLoader } from "@/components/ui/PageLoader"
import { screenToPath, type Screen } from "@/types/navigation"
import { useAuth } from "@/context/AuthContext"
import { buildAuthHeaders } from "@/lib/auth"

type ServiceStatus = "completed" | "cancelled" | "ongoing"

type ServiceRecord = {
  id: string
  serviceType: string
  deviceName: string
  technician: string
  date: string
  status: ServiceStatus
  price: string
  rating?: number
  isReviewed?: boolean
  technicianId?: string
  location: string
  duration: string
  issues: string[]
}

type ServiceHistoryContent = {
  records?: ServiceRecord[]
}

const defaultFilters = [
  { id: "all", label: "Semua" },
  { id: "completed", label: "Selesai" },
  { id: "ongoing", label: "Berlangsung" },
  { id: "cancelled", label: "Dibatalkan" },
] as const

type ServiceFilter = (typeof defaultFilters)[number]["id"]

function parseCurrency(amount: string) {
  const numeric = amount.replace(/[^\d]/g, "")
  return Number.parseInt(numeric || "0", 10)
}

function formatCompactRupiah(amount: number) {
  if (amount >= 1_000_000) {
    return `Rp ${Number((amount / 1_000_000).toFixed(2))}jt`
  }

  if (amount >= 1_000) {
    return `Rp ${Number((amount / 1_000).toFixed(1))}rb`
  }

  return `Rp ${amount}`
}

export default function RiwayatServisPage() {
  const router = useRouter()
  const { user, loading: authLoading } = useAuth()
  const navigate = (screen: Screen) => router.push(screenToPath(screen))
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedFilter, setSelectedFilter] = useState<ServiceFilter>("all")
  const [services, setServices] = useState<ServiceRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  // Review state
  const [reviewModalOpen, setReviewModalOpen] = useState(false)
  const [reviewTarget, setReviewTarget] = useState<ServiceRecord | null>(null)
  const [reviewRating, setReviewRating] = useState(5)
  const [reviewComment, setReviewComment] = useState("")
  const [isSubmittingReview, setIsSubmittingReview] = useState(false)

  useEffect(() => {
    let isMounted = true

    async function loadServiceHistory() {
      if (authLoading) return
      if (!user) {
        setError("Silakan login untuk melihat riwayat")
        setLoading(false)
        return
      }

      try {
        setLoading(true)
        setError("")

        const response = await fetch("/api/serviceOrders", {
          cache: "no-store",
          headers: await buildAuthHeaders(user)
        })

        if (!response.ok) {
          throw new Error("Gagal memuat riwayat servis.")
        }

        const data = await response.json()

        if (!isMounted) {
          return
        }

        const mappedServices: ServiceRecord[] = (data.serviceOrders || []).map((o: any) => ({
          id: o.id,
          serviceType: o.serviceType || "Servis",
          deviceName: o.deviceName || "Perangkat",
          technician: o.technicianName || "Teknisi Mitra",
          date: new Date(o.createdAt || Date.now()).toLocaleDateString("id-ID", { day: 'numeric', month: 'short', year: 'numeric' }),
          status: (o.status === "accepted" || o.status === "in-progress" || o.status === "active") 
            ? "ongoing" 
            : o.status === "rejected" || o.status === "cancelled" 
              ? "cancelled" 
              : o.status === "completed" 
                ? "completed" 
                : "ongoing", // default fallback for pending
          price: o.estimatedPrice || "Rp 0",
          rating: o.rating || 0,
          isReviewed: o.reviewed || false,
          technicianId: o.technicianId || "",
          location: o.location || "Lokasi Pelanggan",
          duration: "Estimasi 1-2 Jam",
          issues: o.issues || []
        }))

        setServices(mappedServices)
      } catch (nextError) {
        console.error("Failed to load service history:", nextError)

        if (!isMounted) {
          return
        }

        setError("Riwayat servis belum bisa dimuat.")
        setServices([])
      } finally {
        if (isMounted) {
          setLoading(false)
        }
      }
    }

    void loadServiceHistory()

    return () => {
      isMounted = false
    }
  }, [user, authLoading])

  const filteredServices = useMemo(() => {
    return services.filter((service) => {
      const query = searchQuery.trim().toLowerCase()
      const matchesSearch =
        !query ||
        service.serviceType.toLowerCase().includes(query) ||
        service.deviceName.toLowerCase().includes(query) ||
        service.technician.toLowerCase().includes(query)

      if (selectedFilter === "all") {
        return matchesSearch
      }

      return matchesSearch && service.status === selectedFilter
    })
  }, [searchQuery, selectedFilter, services])

  const filterOptions = useMemo(() => {
    return defaultFilters.map((filter) => ({
      ...filter,
      count:
        filter.id === "all"
          ? services.length
          : services.filter((service) => service.status === filter.id).length,
    }))
  }, [services])

  const totalServiceCost = useMemo(() => {
    return services.reduce((sum, service) => sum + parseCurrency(service.price), 0)
  }, [services])

  function getStatusType(status: ServiceStatus) {
    switch (status) {
      case "completed":
        return "completed" as const
      case "ongoing":
        return "in-progress" as const
      case "cancelled":
        return "pending" as const
    }
  }

  function getStatusText(status: ServiceStatus) {
    switch (status) {
      case "completed":
        return "Selesai"
      case "ongoing":
        return "Berlangsung"
      case "cancelled":
        return "Dibatalkan"
    }
  }

  const submitReview = async () => {
    if (!reviewTarget || !user) return;
    try {
      setIsSubmittingReview(true);
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: await buildAuthHeaders(user),
        body: JSON.stringify({
          type: "service",
          orderId: reviewTarget.id,
          targetId: reviewTarget.technicianId,
          rating: reviewRating,
          comment: reviewComment
        })
      });
      
      if (res.ok) {
        setServices(prev => prev.map(s => 
          s.id === reviewTarget.id ? { ...s, isReviewed: true, rating: reviewRating } : s
        ));
        setReviewModalOpen(false);
      }
    } catch(e) {
      console.error(e);
    } finally {
      setIsSubmittingReview(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col">
      <div className="sticky top-0 bg-white border-b border-[#E5E7EB] z-10">
        <div className="px-6 py-4 flex items-center">
          <button
            onClick={() => navigate("profile")}
            className="text-[#0288D1] hover:bg-[#0288D1]/5 p-2 rounded-full -ml-2"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="ml-3">
            <h1 className="text-[#4A4A4A]">Riwayat Servis</h1>
            <p className="text-xs text-[#6B6B6B]">{services.length} total servis</p>
          </div>
        </div>

        <div className="px-6 pb-4">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#6B6B6B]" />
            <input
              type="text"
              placeholder="Cari servis, perangkat, atau teknisi..."
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              className="w-full h-12 pl-12 pr-4 rounded-full border border-[#E5E7EB] bg-[#F8FAFC] text-[#4A4A4A] placeholder:text-[#6B6B6B] focus:outline-none focus:border-[#0288D1] focus:bg-white transition-colors"
            />
          </div>
        </div>

        <div className="px-6 pb-4 flex gap-2 overflow-x-auto scrollbar-hide">
          {filterOptions.map((option) => (
            <button
              key={option.id}
              onClick={() => setSelectedFilter(option.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-full border-2 transition-all whitespace-nowrap ${
                selectedFilter === option.id
                  ? "border-[#0288D1] bg-[#0288D1]/5 text-[#0288D1]"
                  : "border-[#E5E7EB] bg-white text-[#6B6B6B] hover:border-[#0288D1]/30"
              }`}
            >
              <span className="text-sm">{option.label}</span>
              <span
                className={`text-xs px-2 py-0.5 rounded-full ${
                  selectedFilter === option.id ? "bg-[#0288D1]/20" : "bg-[#E5E7EB]"
                }`}
              >
                {option.count}
              </span>
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto pb-32">
        <div className="p-6 space-y-4">
          {loading ? (
            <PageLoader message="Memuat riwayat servis..." fullScreen={false} />
          ) : error ? (
            <div className="bg-white rounded-2xl border border-[#E5E7EB] p-8 text-center">
              <p className="text-sm text-[#EF4444]">{error}</p>
            </div>
          ) : filteredServices.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-20 h-20 bg-[#E5E7EB] rounded-full flex items-center justify-center mx-auto mb-4">
                <Wrench className="w-10 h-10 text-[#6B6B6B]" />
              </div>
              <h3 className="text-[#4A4A4A] mb-2">Tidak Ada Riwayat</h3>
              <p className="text-sm text-[#6B6B6B]">Belum ada riwayat servis yang cocok</p>
            </div>
          ) : (
            filteredServices.map((service) => (
              <div
                key={service.id}
                className="w-full bg-white rounded-2xl p-5 border border-[#E5E7EB] hover:border-[#0288D1] hover:shadow-md transition-all text-left"
              >
                <div 
                  className="flex items-start justify-between mb-3 cursor-pointer"
                  onClick={() => navigate("tracking")}
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#0288D1]/10 to-[#4FC3F7]/10 flex items-center justify-center flex-shrink-0">
                        <Wrench className="w-5 h-5 text-[#0288D1]" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-[#4A4A4A] text-sm mb-0.5">{service.serviceType}</h3>
                        <p className="text-xs text-[#6B6B6B]">{service.deviceName}</p>
                      </div>
                    </div>
                  </div>
                  <StatusChip
                    statusText={getStatusText(service.status)}
                    statusType={getStatusType(service.status)}
                    className="text-xs px-2.5 py-1 ml-2"
                  />
                </div>

                {service.issues.length > 0 ? (
                  <div className="mb-3 pl-12">
                    <div className="flex flex-wrap gap-1">
                      {service.issues.map((issue) => (
                        <span
                          key={`${service.id}-${issue}`}
                          className="text-xs text-[#0288D1] bg-[#0288D1]/5 px-2 py-1 rounded-md"
                        >
                          {issue}
                        </span>
                      ))}
                    </div>
                  </div>
                ) : null}

                <div className="grid grid-cols-2 gap-3 mb-3 pl-12">
                  <div>
                    <div className="flex items-center gap-1.5 text-xs text-[#6B6B6B] mb-0.5">
                      <MapPin className="w-3 h-3" />
                      <span>Teknisi</span>
                    </div>
                    <p className="text-sm text-[#4A4A4A]">{service.technician}</p>
                    <p className="text-xs text-[#6B6B6B] mt-1">{service.location}</p>
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5 text-xs text-[#6B6B6B] mb-0.5">
                      <Clock className="w-3 h-3" />
                      <span>Durasi</span>
                    </div>
                    <p className="text-sm text-[#4A4A4A]">{service.duration}</p>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-[#E5E7EB] pl-12">
                  <div>
                    <p className="text-xs text-[#6B6B6B] mb-0.5">{service.date}</p>
                    <p className="text-sm text-[#0288D1]">{service.price}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    {service.rating && service.isReviewed ? (
                      <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                        <span className="text-sm text-[#4A4A4A]">{service.rating}.0</span>
                      </div>
                    ) : service.status === "completed" && !service.isReviewed ? (
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          setReviewTarget(service);
                          setReviewRating(5);
                          setReviewComment("");
                          setReviewModalOpen(true);
                        }}
                        className="text-xs bg-[#0288D1] text-white px-3 py-1.5 rounded-full hover:bg-[#0288D1]/90"
                      >
                        Beri Ulasan
                      </button>
                    ) : null}
                    <button onClick={() => navigate("tracking")}>
                      <ChevronRight className="w-5 h-5 text-[#9CA3AF]" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {reviewModalOpen && reviewTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-2xl w-full max-w-sm overflow-hidden select-none animate-in fade-in zoom-in-95 duration-200">
            <div className="px-6 py-4 flex items-center justify-between border-b border-[#E5E7EB]">
              <h3 className="font-semibold text-[#4A4A4A]">Ulas Servis</h3>
              <button onClick={() => setReviewModalOpen(false)} className="text-[#9CA3AF] hover:bg-[#F8FAFC] p-1 rounded-full">
                <X className="w-5 h-5"/>
              </button>
            </div>
            <div className="p-6 space-y-4">
               <div>
                  <p className="text-sm text-[#6B6B6B] mb-2 text-center">Bagaimana performa <span className="font-semibold text-[#4A4A4A]">{reviewTarget.technician}</span>?</p>
                  <div className="flex justify-center gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button 
                        key={star}
                        onClick={() => setReviewRating(star)}
                        className="p-1 transition-transform active:scale-95"
                      >
                        <Star className={`w-8 h-8 ${reviewRating >= star ? "fill-yellow-400 text-yellow-400" : "text-[#E5E7EB]"}`} />
                      </button>
                    ))}
                  </div>
               </div>
               <div>
                 <textarea
                   value={reviewComment}
                   onChange={e => setReviewComment(e.target.value)}
                   placeholder="Bagaimana pelayanan teknisi ini?"
                   className="w-full h-24 p-3 text-sm text-[#4A4A4A] bg-[#F8FAFC] border border-[#E5E7EB] rounded-xl focus:border-[#0288D1] focus:bg-white outline-none resize-none transition-colors"
                 />
               </div>
               <button 
                 onClick={submitReview}
                 disabled={isSubmittingReview}
                 className="w-full bg-[#0288D1] text-white rounded-xl py-3 text-sm font-semibold hover:bg-[#0288D1]/90 disabled:opacity-50"
               >
                 {isSubmittingReview ? "Menyimpan..." : "Kirim Ulasan"}
               </button>
            </div>
          </div>
        </div>
      )}

      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-[#E5E7EB] px-6 py-4">
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <p className="text-xs text-[#6B6B6B] mb-1">Total Servis</p>
            <p className="text-lg text-[#4A4A4A]">{services.length}</p>
          </div>
          <div>
            <p className="text-xs text-[#6B6B6B] mb-1">Selesai</p>
            <p className="text-lg text-[#10B981]">
              {services.filter((service) => service.status === "completed").length}
            </p>
          </div>
          <div>
            <p className="text-xs text-[#6B6B6B] mb-1">Total Biaya</p>
            <p className="text-lg text-[#0288D1]">{formatCompactRupiah(totalServiceCost)}</p>
          </div>
        </div>
      </div>
    </div>
  )
}
