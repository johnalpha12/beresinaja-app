"use client"

import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { ArrowLeft, Clock, MapPin, Wrench, Calendar, ChevronRight } from "lucide-react"
import { PageLoader } from "@/components/ui/PageLoader"
import { PrimaryButton } from "@/components/ui/PrimaryButton"
import { OutlineButton } from "@/components/ui/OutlineButton"

type TechnicianService = {
  name: string
  price: string
  duration: string
}

type TechnicianBrief = {
  id: string
  name: string
  photo: string
  specialization: string
  rating: number
  services: TechnicianService[]
}

export default function BookingServisPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const techId = searchParams.get("techId")

  const [technician, setTechnician] = useState<TechnicianBrief | null>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState("")

  const [formData, setFormData] = useState({
    serviceType: "",
    deviceName: "",
    issues: "",
    location: "",
    scheduleDate: "",
    scheduleTime: "",
  })

  useEffect(() => {
    if (!techId) {
      setError("ID Teknisi tidak valid")
      setLoading(false)
      return
    }

    async function loadTech() {
      try {
        const response = await fetch(`/api/technicians/${encodeURIComponent(techId!)}`)
        if (!response.ok) throw new Error("Gagal mengambil data teknisi")
        const data = await response.json()
        setTechnician(data)
        if (data.services && data.services.length > 0) {
          setFormData(prev => ({ ...prev, serviceType: data.services[0].name }))
        }
      } catch (err) {
        setError("Gagal memuat data teknisi.")
      } finally {
        setLoading(false)
      }
    }
    loadTech()
  }, [techId])

  const handleBook = async () => {
    if (!formData.serviceType || !formData.deviceName || !formData.issues || !formData.location || !formData.scheduleDate || !formData.scheduleTime) {
      alert("Mohon lengkapi semua field terlebih dahulu.")
      return
    }

    try {
      setSubmitting(true)
      const selectedService = technician?.services.find(s => s.name === formData.serviceType)
      const expectedPrice = selectedService ? selectedService.price : "Menunggu Pengecekan"

      const response = await fetch("/api/services/book", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          technicianId: techId,
          technicianName: technician?.name,
          technicianAvatar: technician?.photo,
          serviceType: formData.serviceType,
          deviceName: formData.deviceName,
          issues: formData.issues.split("\n").filter(i => i.trim() !== ""),
          location: formData.location,
          scheduledTime: `${formData.scheduleDate} ${formData.scheduleTime}`,
          estimatedPrice: expectedPrice,
        })
      })

      const data = await response.json()
      if (!response.ok) {
        throw new Error(data.error || "Gagal membuat pesanan servis")
      }

      router.push(`/pesanan-berhasil?serviceOrderId=${data.orderId}`)
    } catch (err) {
      alert(err instanceof Error ? err.message : "Terjadi kesalahan saat memesan")
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) return <PageLoader message="Memuat form pemesanan..." />

  if (error || !technician) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex flex-col items-center justify-center p-6 text-center">
        <h2 className="text-xl font-bold text-[#4A4A4A] mb-2">Terjadi Kesalahan</h2>
        <p className="text-[#6B6B6B] mb-6">{error}</p>
        <PrimaryButton label="Kembali" onClick={() => router.back()} />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col pb-24">
      {/* Header */}
      <div className="sticky top-0 bg-white border-b border-[#E5E7EB] z-10 px-6 py-4 flex items-center gap-3">
        <button onClick={() => router.back()} className="p-2 hover:bg-[#F8FAFC] rounded-full -ml-2 text-[#0288D1]">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-lg font-bold text-[#4A4A4A]">Booking Servis</h1>
      </div>

      <div className="p-6 space-y-6">
        {/* Technician Info */}
        <div className="bg-white rounded-2xl p-4 border border-[#E5E7EB] flex items-center gap-4">
          <div className="w-14 h-14 rounded-full bg-gradient-to-br from-[#0288D1]/10 to-[#4FC3F7]/10 flex items-center justify-center text-xl text-[#0288D1] font-semibold">
            {technician.photo}
          </div>
          <div>
            <h2 className="font-bold text-[#4A4A4A]">{technician.name}</h2>
            <p className="text-sm text-[#6B6B6B]">{technician.specialization}</p>
          </div>
        </div>

        {/* Booking Form */}
        <div className="space-y-5">
          <div>
            <label className="block text-sm font-semibold text-[#4A4A4A] mb-2 flex items-center gap-2">
              <Wrench className="w-4 h-4 text-[#0288D1]" /> Pilih Layanan
            </label>
            <select
              value={formData.serviceType}
              onChange={(e) => setFormData({ ...formData, serviceType: e.target.value })}
              className="w-full bg-white border border-[#E5E7EB] rounded-xl px-4 py-3 text-sm text-[#4A4A4A] focus:outline-none focus:border-[#0288D1] focus:ring-1 focus:ring-[#0288D1]"
            >
              {technician.services.map(srv => (
                <option key={srv.name} value={srv.name}>{srv.name} - {srv.price}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-[#4A4A4A] mb-2 flex items-center gap-2">
              <Wrench className="w-4 h-4 text-[#0288D1]" /> Nama Perangkat
            </label>
            <input
              type="text"
              placeholder="Contoh: iPhone 13 Pro, AC Panasonic 1/2 PK"
              value={formData.deviceName}
              onChange={(e) => setFormData({ ...formData, deviceName: e.target.value })}
              className="w-full bg-white border border-[#E5E7EB] rounded-xl px-4 py-3 text-sm text-[#4A4A4A] focus:outline-none focus:border-[#0288D1] focus:ring-1 focus:ring-[#0288D1]"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-[#4A4A4A] mb-2">Detail Keluhan (pisahkan dengan enter)</label>
            <textarea
              placeholder="1. Layar retak&#10;2. Touchscreen kadang tidak responsif"
              rows={3}
              value={formData.issues}
              onChange={(e) => setFormData({ ...formData, issues: e.target.value })}
              className="w-full bg-white border border-[#E5E7EB] rounded-xl px-4 py-3 text-sm text-[#4A4A4A] focus:outline-none focus:border-[#0288D1] focus:ring-1 focus:ring-[#0288D1]"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-[#4A4A4A] mb-2 flex items-center gap-2">
              <MapPin className="w-4 h-4 text-[#0288D1]" /> Lokasi Anda
            </label>
            <textarea
              placeholder="Jalan, Nomor Rumah, Patokan"
              rows={2}
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              className="w-full bg-white border border-[#E5E7EB] rounded-xl px-4 py-3 text-sm text-[#4A4A4A] focus:outline-none focus:border-[#0288D1] focus:ring-1 focus:ring-[#0288D1]"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-[#4A4A4A] mb-2 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-[#0288D1]" /> Jadwal Kedatangan
            </label>
            <div className="grid grid-cols-2 gap-3">
              <input
                type="date"
                value={formData.scheduleDate}
                onChange={(e) => setFormData({ ...formData, scheduleDate: e.target.value })}
                className="w-full bg-white border border-[#E5E7EB] rounded-xl px-4 py-3 text-sm text-[#4A4A4A] focus:outline-none focus:border-[#0288D1] focus:ring-1 focus:ring-[#0288D1]"
              />
              <input
                type="time"
                value={formData.scheduleTime}
                onChange={(e) => setFormData({ ...formData, scheduleTime: e.target.value })}
                className="w-full bg-white border border-[#E5E7EB] rounded-xl px-4 py-3 text-sm text-[#4A4A4A] focus:outline-none focus:border-[#0288D1] focus:ring-1 focus:ring-[#0288D1]"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Footer CTA */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-[#E5E7EB] p-4 safe-area-bottom">
        <PrimaryButton
          label={submitting ? "Memproses..." : "Konfirmasi Booking"}
          disabled={submitting}
          onClick={handleBook}
        />
      </div>
    </div>
  )
}
