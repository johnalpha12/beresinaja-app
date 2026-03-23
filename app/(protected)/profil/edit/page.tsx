"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, User, Loader2, Save, Image as ImageIcon } from "lucide-react"
import { useAuth } from "@/context/AuthContext"
import { db } from "@/lib/firebase"
import { doc, updateDoc } from "firebase/firestore"
import { useUserData } from "@/hooks/useUserData"

export default function EditProfilPage() {
  const router = useRouter()
  const { user } = useAuth()
  const { userData, loading: userDataLoading } = useUserData()
  
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState("")
  
  const [form, setForm] = useState({
    fullName: "",
    phone: "",
    address: "",
    avatarUrl: "",
  })

  useEffect(() => {
    if (userData) {
      setForm({
        fullName: userData.fullName || "",
        phone: userData.phone || "",
        address: userData.address || "",
        avatarUrl: userData.avatarUrl || "",
      })
    }
  }, [userData])

  const handleSave = async () => {
    if (!user) return
    if (!form.fullName.trim()) {
      setError("Nama lengkap tidak boleh kosong.")
      return
    }

    try {
      setIsSaving(true)
      setError("")

      const userRef = doc(db, "users", user.uid)
      await updateDoc(userRef, {
        fullName: form.fullName.trim(),
        phone: form.phone.trim(),
        address: form.address.trim(),
        avatarUrl: form.avatarUrl.trim(),
      })

      router.back()
    } catch (err) {
      console.error("Failed to update profile", err)
      setError("Gagal menyimpan profil. Silakan coba lagi.")
    } finally {
      setIsSaving(false)
    }
  }

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((word) => word[0])
      .join("")
      .toUpperCase()
      .slice(0, 2)
  }

  if (userDataLoading) {
    return (
      <div className="flex flex-col min-h-screen bg-[#F5F7FA]">
        <div className="flex-1 flex items-center justify-center">
          <Loader2 className="w-8 h-8 text-primary animate-spin" />
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col min-h-screen bg-[#F5F7FA]">
      <div className="sticky top-0 bg-white border-b border-[#E5E7EB] px-4 py-4 flex items-center justify-between z-10">
        <div className="flex items-center">
          <button
            onClick={() => router.back()}
            className="text-[#0288D1] hover:bg-[#0288D1]/5 p-2 rounded-full -ml-2"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="ml-3 text-[#4A4A4A] font-bold text-lg">Edit Profil</h1>
        </div>
      </div>

      <div className="p-4 sm:p-6 lg:p-10 max-w-2xl mx-auto w-full space-y-6">
        <div className="bg-white rounded-2xl border border-border p-5 shadow-sm text-center">
          <div className="relative inline-block mb-3">
            <div className="w-24 h-24 rounded-full bg-primary flex items-center justify-center overflow-hidden border-4 border-[#F5F7FA]">
              {form.avatarUrl ? (
                <img src={form.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
              ) : form.fullName ? (
                <span className="text-white font-bold text-3xl">
                  {getInitials(form.fullName)}
                </span>
              ) : (
                <User className="w-12 h-12 text-white" />
              )}
            </div>
          </div>
          <p className="text-xs text-[#6B6B6B]">Anda dapat memasukkan URL foto avatar di bawah.</p>
        </div>

        {error && (
          <div className="p-4 rounded-xl border border-red-200 bg-red-50 text-red-700 text-sm">
            {error}
          </div>
        )}

        <div className="bg-white rounded-2xl border border-border p-5 shadow-sm space-y-4">
          <label className="block">
            <span className="text-xs font-semibold text-[#6B6B6B] uppercase">URL Foto Profil</span>
            <div className="relative mt-1">
              <input
                type="text"
                value={form.avatarUrl}
                onChange={(e) => setForm({ ...form, avatarUrl: e.target.value })}
                placeholder="https://example.com/photo.jpg"
                className="w-full bg-[#F5F7FA] border border-[#E5E7EB] rounded-xl px-10 py-3 text-sm text-[#4A4A4A] outline-none focus:border-primary focus:ring-1 focus:ring-primary"
              />
              <ImageIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9CA3AF]" />
            </div>
          </label>

          <label className="block">
            <span className="text-xs font-semibold text-[#6B6B6B] uppercase">Nama Lengkap</span>
            <input
              type="text"
              value={form.fullName}
              onChange={(e) => setForm({ ...form, fullName: e.target.value })}
              className="mt-1 w-full bg-[#F5F7FA] border border-[#E5E7EB] rounded-xl px-4 py-3 text-sm text-[#4A4A4A] outline-none focus:border-primary focus:ring-1 focus:ring-primary"
            />
          </label>

          <label className="block">
            <span className="text-xs font-semibold text-[#6B6B6B] uppercase">Email <span className="text-[10px] font-normal lowercase">(Hanya Baca)</span></span>
            <input
              type="email"
              value={user?.email || ""}
              disabled
              className="mt-1 w-full bg-slate-100 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-500 cursor-not-allowed"
            />
          </label>

          <label className="block">
            <span className="text-xs font-semibold text-[#6B6B6B] uppercase">Nomor HP</span>
            <input
              type="text"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              placeholder="08xxxxxxxxxx"
              className="mt-1 w-full bg-[#F5F7FA] border border-[#E5E7EB] rounded-xl px-4 py-3 text-sm text-[#4A4A4A] outline-none focus:border-primary focus:ring-1 focus:ring-primary"
            />
          </label>

          <label className="block">
            <span className="text-xs font-semibold text-[#6B6B6B] uppercase">Alamat Lengkap</span>
            <textarea
              value={form.address}
              onChange={(e) => setForm({ ...form, address: e.target.value })}
              rows={3}
              placeholder="Jalan, RT/RW, Kota"
              className="mt-1 w-full bg-[#F5F7FA] border border-[#E5E7EB] rounded-xl px-4 py-3 text-sm text-[#4A4A4A] outline-none focus:border-primary focus:ring-1 focus:ring-primary resize-none"
            />
          </label>
        </div>

        <button
          onClick={handleSave}
          disabled={isSaving}
          className="w-full bg-gradient-to-r from-primary to-[#4FC3F7] text-white font-semibold rounded-xl py-4 flex items-center justify-center gap-2 hover:opacity-90 disabled:opacity-50 transition"
        >
          {isSaving ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <>
              <Save className="w-5 h-5" />
              Simpan Perubahan
            </>
          )}
        </button>
      </div>
    </div>
  )
}
