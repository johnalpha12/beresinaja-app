"use client"

import { useEffect, useState, type ComponentType } from "react"
import { useRouter } from "next/navigation"
import {
  ArrowLeft,
  Star,
  MapPin,
  Shield,
  Clock,
  Wrench,
  Award,
  ThumbsUp,
  Share2,
  Heart,
  CheckCircle2,
  Calendar,
  TrendingUp,
} from "lucide-react"
import { PrimaryButton } from "@/components/ui/PrimaryButton"
import { OutlineButton } from "@/components/ui/OutlineButton"
import { StatusChip } from "@/components/ui/StatusChip"
import { PageLoader } from "@/components/ui/PageLoader"
import { useAuth } from "@/context/AuthContext"
import { db } from "@/lib/firebase"
import { doc, getDoc, setDoc } from "firebase/firestore"
import {
  screenToPath,
  type Screen,
} from "@/types/navigation"

type AchievementIconKey =
  | "Award"
  | "ThumbsUp"
  | "CheckCircle2"
  | "TrendingUp"

type TechnicianSkill = {
  name: string
  level: "Beginner" | "Advanced" | "Expert"
  jobs: number
}

type TechnicianService = {
  name: string
  price: string
  duration: string
}

type WorkingHour = {
  day: string
  hours: string
}

type TechnicianReview = {
  id: string
  name: string
  rating: number
  date: string
  comment: string
  service: string
  avatar: string
}

type TechnicianAchievement = {
  iconKey: AchievementIconKey
  label: string
  description: string
}

type TechnicianDetail = {
  id: string
  name: string
  photo: string
  specialization: string
  rating: number
  totalReviews: number
  totalJobs: number
  responseTime: string
  completionRate: string
  experience: string
  location: string
  distance: string
  verified: boolean
  availability: string
  availabilityNote: string
  joinDate: string
  skills: TechnicianSkill[]
  services: TechnicianService[]
  workingHours: WorkingHour[]
  reviews: TechnicianReview[]
  achievements: TechnicianAchievement[]
}

const achievementIconMap: Record<AchievementIconKey, ComponentType<{ className?: string }>> = {
  Award,
  ThumbsUp,
  CheckCircle2,
  TrendingUp,
}

type Props = {
  technicianId: string
}

export default function TechnicianDetailView({ technicianId }: Props) {
  const router = useRouter()
  const navigate = (screen: Screen) => router.push(screenToPath(screen))
  const [technician, setTechnician] = useState<TechnicianDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [liked, setLiked] = useState(false)
  const { user } = useAuth()

  const startChat = async () => {
    if (!user || !technician) return;
    const techUid = technician.id;
    const chatId = [user.uid, techUid].sort().join('_');
    const chatRef = doc(db, "chats", chatId);
    const snap = await getDoc(chatRef);
    if (!snap.exists()) {
      await setDoc(chatRef, {
        participants: [user.uid, techUid],
        participantNames: {
          [user.uid]: user.email?.split("@")[0] || user.displayName || "Pelanggan",
          [techUid]: technician.name || "Teknisi",
        },
        lastMessage: "Percakapan baru dibuat",
        lastMessageTime: Date.now(),
        unreadCount: { [techUid]: 0, [user.uid]: 0 }
      });
    }
    router.push(`/chat/${chatId}`);
  };

  useEffect(() => {
    async function loadTechnician() {
      if (!technicianId) {
        setTechnician(null)
        setError("ID teknisi tidak valid.")
        setLoading(false)
        return
      }

      try {
        setLoading(true)
        setError("")

        const response = await fetch(
          `/api/technicians/${encodeURIComponent(technicianId)}`,
          {
            cache: "no-store",
          }
        )

        if (!response.ok) {
          throw new Error("Data teknisi tidak ditemukan.")
        }

        const data = (await response.json()) as TechnicianDetail
        setTechnician(data)
      } catch (loadError) {
        console.error("Failed to load technician detail:", loadError)
        setTechnician(null)
        setError(
          loadError instanceof Error
            ? loadError.message
            : "Gagal memuat detail teknisi."
        )
      } finally {
        setLoading(false)
      }
    }

    loadTechnician()
  }, [technicianId])

  const handleShare = async () => {
    try {
      if (navigator.share && technician) {
        await navigator.share({
          title: technician.name,
          text: technician.specialization,
          url: window.location.href,
        })
        return
      }

      if (navigator.clipboard) {
        await navigator.clipboard.writeText(window.location.href)
      }
    } catch (shareError) {
      console.error("Share failed:", shareError)
    }
  }

  if (loading) {
    return <PageLoader message="Memuat detail teknisi..." />
  }

  if (!technician) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center px-6">
        <div className="max-w-md w-full bg-white rounded-2xl border border-[#E5E7EB] p-6 text-center">
          <h1 className="text-lg text-[#4A4A4A] mb-2">Detail teknisi belum tersedia</h1>
          <p className="text-sm text-[#6B6B6B] mb-5">
            {error || "Silakan cek data Firebase untuk halaman ini."}
          </p>
          <PrimaryButton
            label="Kembali ke Daftar Teknisi"
            onClick={() => navigate("teknisi")}
          />
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col">
      <div className="sticky top-0 bg-white border-b border-[#E5E7EB] px-6 py-4 flex items-center justify-between z-10">
        <button
          onClick={() => navigate("teknisi")}
          className="text-[#0288D1] hover:bg-[#0288D1]/5 p-2 rounded-full -ml-2"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="flex items-center gap-2">
          <button onClick={handleShare} className="p-2 hover:bg-[#F8FAFC] rounded-full">
            <Share2 className="w-5 h-5 text-[#4A4A4A]" />
          </button>
          <button onClick={() => setLiked((prev) => !prev)} className="p-2 hover:bg-[#F8FAFC] rounded-full">
            <Heart
              className={`w-5 h-5 ${
                liked ? "fill-red-500 text-red-500" : "text-[#4A4A4A]"
              }`}
            />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto pb-32">
        <div className="bg-gradient-to-br from-[#0288D1] to-[#4FC3F7] p-6">
          <div className="flex gap-4 items-start">
            <div className="relative">
              <div className="w-24 h-24 rounded-2xl bg-white flex items-center justify-center text-4xl font-semibold shadow-lg">
                {technician.photo}
              </div>
              {technician.verified && (
                <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-[#10B981] rounded-full flex items-center justify-center border-2 border-white shadow-md">
                  <Shield className="w-4 h-4 text-white" />
                </div>
              )}
            </div>
            <div className="flex-1 text-white">
              <h1 className="text-xl mb-1">{technician.name}</h1>
              <p className="text-sm text-white/90 mb-3">{technician.specialization}</p>
              <div className="flex flex-wrap items-center gap-3 text-sm">
                <div className="flex items-center gap-1 bg-white/20 rounded-full px-3 py-1">
                  <Star className="w-4 h-4 fill-yellow-300 text-yellow-300" />
                  <span>{technician.rating}</span>
                  <span className="text-white/80">({technician.totalReviews})</span>
                </div>
                <div className="bg-white/20 rounded-full px-3 py-1">
                  {technician.totalJobs} pekerjaan
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="p-6 space-y-6">
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-white rounded-xl p-4 border border-[#E5E7EB] text-center">
              <Clock className="w-5 h-5 text-[#0288D1] mx-auto mb-2" />
              <div className="text-xs text-[#6B6B6B] mb-1">Response Time</div>
              <div className="text-sm text-[#4A4A4A]">{technician.responseTime}</div>
            </div>
            <div className="bg-white rounded-xl p-4 border border-[#E5E7EB] text-center">
              <CheckCircle2 className="w-5 h-5 text-[#0288D1] mx-auto mb-2" />
              <div className="text-xs text-[#6B6B6B] mb-1">Completion Rate</div>
              <div className="text-sm text-[#4A4A4A]">{technician.completionRate}</div>
            </div>
            <div className="bg-white rounded-xl p-4 border border-[#E5E7EB] text-center">
              <Award className="w-5 h-5 text-[#0288D1] mx-auto mb-2" />
              <div className="text-xs text-[#6B6B6B] mb-1">Pengalaman</div>
              <div className="text-sm text-[#4A4A4A]">{technician.experience}</div>
            </div>
          </div>

          <div className="bg-gradient-to-r from-[#10B981]/5 to-[#10B981]/10 border border-[#10B981]/20 rounded-xl p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[#10B981] flex items-center justify-center">
                <Calendar className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1">
                <h4 className="text-[#4A4A4A] mb-0.5">{technician.availability}</h4>
                <p className="text-sm text-[#6B6B6B]">{technician.availabilityNote}</p>
              </div>
              <StatusChip
                statusText={technician.verified ? "Verified" : "Unverified"}
                statusType={technician.verified ? "completed" : "pending"}
                className="text-xs px-2 py-1"
              />
            </div>
          </div>

          <div>
            <h3 className="text-[#4A4A4A] mb-4">Pencapaian</h3>
            <div className="grid grid-cols-2 gap-3">
              {technician.achievements.map((achievement) => {
                const Icon = achievementIconMap[achievement.iconKey] || Award

                return (
                  <div
                    key={achievement.label}
                    className="bg-white rounded-xl p-4 border border-[#E5E7EB]"
                  >
                    <Icon className="w-5 h-5 text-[#0288D1] mb-2" />
                    <h4 className="text-sm text-[#4A4A4A] mb-0.5">{achievement.label}</h4>
                    <p className="text-xs text-[#6B6B6B]">{achievement.description}</p>
                  </div>
                )
              })}
            </div>
          </div>

          <div>
            <h3 className="text-[#4A4A4A] mb-3">Tentang</h3>
            <div className="bg-white rounded-2xl p-5 border border-[#E5E7EB] space-y-3 text-sm">
              <div className="flex items-center gap-3">
                <MapPin className="w-5 h-5 text-[#0288D1] flex-shrink-0" />
                <div>
                  <div className="text-[#4A4A4A]">{technician.location}</div>
                  <div className="text-xs text-[#6B6B6B]">{technician.distance}</div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Calendar className="w-5 h-5 text-[#0288D1] flex-shrink-0" />
                <div className="text-[#6B6B6B]">{technician.joinDate}</div>
              </div>
              <div className="flex items-center gap-3">
                <Shield className="w-5 h-5 text-[#0288D1] flex-shrink-0" />
                <div className="text-[#6B6B6B]">Terverifikasi BeresinAja</div>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-[#4A4A4A] mb-3">Keahlian</h3>
            <div className="bg-white rounded-2xl p-5 border border-[#E5E7EB]">
              <div className="space-y-4">
                {technician.skills.map((skill, index) => (
                  <div
                    key={skill.name}
                    className={`pb-4 ${
                      index < technician.skills.length - 1
                        ? "border-b border-[#E5E7EB]"
                        : ""
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Wrench className="w-4 h-4 text-[#0288D1]" />
                        <span className="text-sm text-[#4A4A4A]">{skill.name}</span>
                      </div>
                      <span className="text-xs text-[#0288D1] bg-[#0288D1]/10 px-2 py-1 rounded-full">
                        {skill.level}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-1.5 bg-[#E5E7EB] rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-[#0288D1] to-[#4FC3F7] rounded-full"
                          style={{
                            width:
                              skill.level === "Expert"
                                ? "95%"
                                : skill.level === "Advanced"
                                  ? "80%"
                                  : "60%",
                          }}
                        />
                      </div>
                      <span className="text-xs text-[#6B6B6B]">{skill.jobs} job</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-[#4A4A4A] mb-3">Layanan & Harga</h3>
            <div className="bg-white rounded-2xl overflow-hidden border border-[#E5E7EB]">
              {technician.services.map((service, index) => (
                <div
                  key={service.name}
                  className={`p-4 ${
                    index < technician.services.length - 1
                      ? "border-b border-[#E5E7EB]"
                      : ""
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <h4 className="text-sm text-[#4A4A4A]">{service.name}</h4>
                    <span className="text-[#0288D1]">{service.price}</span>
                  </div>
                  <div className="flex items-center gap-1 text-xs text-[#6B6B6B]">
                    <Clock className="w-3 h-3" />
                    <span>Estimasi: {service.duration}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-[#4A4A4A] mb-3">Jam Kerja</h3>
            <div className="bg-white rounded-xl p-4 border border-[#E5E7EB] space-y-2">
              {technician.workingHours.map((schedule) => (
                <div key={schedule.day} className="flex justify-between text-sm">
                  <span className="text-[#6B6B6B]">{schedule.day}</span>
                  <span className="text-[#4A4A4A]">{schedule.hours}</span>
                </div>
              ))}
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-[#4A4A4A]">Ulasan Pelanggan</h3>
              <button className="text-sm text-[#0288D1]">
                Lihat Semua ({technician.totalReviews})
              </button>
            </div>
            <div className="space-y-4">
              {technician.reviews.map((review) => (
                <div
                  key={review.id}
                  className="bg-white rounded-xl p-5 border border-[#E5E7EB]"
                >
                  <div className="flex items-start gap-3 mb-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#0288D1] to-[#4FC3F7] flex items-center justify-center text-sm font-semibold flex-shrink-0">
                      {review.avatar}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <h4 className="text-sm text-[#4A4A4A]">{review.name}</h4>
                        <span className="text-xs text-[#6B6B6B]">{review.date}</span>
                      </div>
                      <div className="flex items-center gap-1 mb-2">
                        {[...Array(5)].map((_, index) => (
                          <Star
                            key={`${review.id}-${index}`}
                            className={`w-3 h-3 ${
                              index < review.rating
                                ? "fill-yellow-400 text-yellow-400"
                                : "text-[#E5E7EB]"
                            }`}
                          />
                        ))}
                      </div>
                      <p className="text-xs text-[#0288D1] mb-2">{review.service}</p>
                      <p className="text-sm text-[#6B6B6B] leading-relaxed">
                        {review.comment}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-gradient-to-r from-[#0288D1]/5 to-[#4FC3F7]/5 border border-[#0288D1]/20 rounded-xl p-4">
            <div className="flex items-start gap-3">
              <Shield className="w-5 h-5 text-[#0288D1] flex-shrink-0 mt-0.5" />
              <div className="text-sm">
                <h4 className="text-[#4A4A4A] mb-1">Teknisi Terverifikasi</h4>
                <p className="text-xs text-[#6B6B6B] leading-relaxed">
                  Teknisi ini telah melalui proses verifikasi ketat oleh BeresinAja.
                  Dilindungi garansi platform untuk keamanan transaksi Anda.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-[#E5E7EB] p-6 safe-area-bottom">
        <div className="flex gap-3 max-w-md mx-auto">
          <OutlineButton
            label="Chat"
            className="flex-1"
            onClick={startChat}
          />
          <div className="flex-[2]">
            <PrimaryButton
              label="Booking Sekarang"
              onClick={() => router.push(`/booking-servis?techId=${technicianId}`)}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
