"use client"

import { useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import {
  ArrowLeft,
  Calendar,
  ChevronRight,
  Package,
  Search,
  ShoppingBag,
  TrendingDown,
  TrendingUp,
  Star,
  X,
} from "lucide-react"
import { StatusChip } from "@/components/ui/StatusChip"
import { PageLoader } from "@/components/ui/PageLoader"
import { screenToPath, type Screen } from "@/types/navigation"
import { useAuth } from "@/context/AuthContext"
import { buildAuthHeaders } from "@/lib/auth"

type TransactionType = "purchase" | "sale" | "service"
type TransactionStatus = "success" | "pending" | "cancelled" | "shipped" | "processing"

type TransactionRecord = {
  id: string
  type: TransactionType
  title: string
  subtitle: string
  date: string
  amount: string
  status: TransactionStatus
  paymentMethod: string
  quantity?: number
  isReviewed?: boolean
  rating?: number
  storeUid?: string
}

type TransactionHistoryContent = {
  records?: TransactionRecord[]
}

const defaultFilters = [
  { id: "all", label: "Semua" },
  { id: "purchase", label: "Pembelian" },
  { id: "sale", label: "Penjualan" },
  { id: "service", label: "Servis" },
] as const

type TransactionFilter = (typeof defaultFilters)[number]["id"]

function parseCurrency(amount: string) {
  const numeric = amount.replace(/[^\d]/g, "")
  return Number.parseInt(numeric || "0", 10)
}

function formatCompactRupiah(amount: number) {
  if (amount >= 1_000_000) {
    return `Rp ${Number((amount / 1_000_000).toFixed(1))}jt`
  }

  if (amount >= 1_000) {
    return `Rp ${Number((amount / 1_000).toFixed(1))}rb`
  }

  return `Rp ${amount}`
}

export default function RiwayatTransaksiPage() {
  const router = useRouter()
  const { user, loading: authLoading } = useAuth()
  const navigate = (screen: Screen) => router.push(screenToPath(screen))
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedFilter, setSelectedFilter] = useState<TransactionFilter>("all")
  const [transactions, setTransactions] = useState<TransactionRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  // Review state
  const [reviewModalOpen, setReviewModalOpen] = useState(false)
  const [reviewTarget, setReviewTarget] = useState<TransactionRecord | null>(null)
  const [reviewRating, setReviewRating] = useState(5)
  const [reviewComment, setReviewComment] = useState("")
  const [isSubmittingReview, setIsSubmittingReview] = useState(false)

  useEffect(() => {
    let isMounted = true

    async function loadTransactionHistory() {
      if (authLoading) return
      if (!user) {
        setError("Silakan login kembali.")
        setLoading(false)
        return
      }

      try {
        setLoading(true)
        setError("")

        const response = await fetch("/api/orders", {
          cache: "no-store",
          headers: await buildAuthHeaders(user)
        })

        if (!response.ok) {
          throw new Error("Gagal memuat riwayat transaksi.")
        }

        const data = await response.json()

        if (!isMounted) {
          return
        }

        const mappedRecords: TransactionRecord[] = (data.orders || []).map((o: any) => ({
          id: o.id,
          type: "purchase", // All current actual orders are from marketplace.
          title: o.items?.[0]?.name || "Pembelian Produk",
          subtitle: o.storeName || "Toko",
          date: new Date(o.createdAt || Date.now()).toLocaleDateString("id-ID", { day: 'numeric', month: 'short', year: 'numeric' }),
          amount: o.totalAmount ? `Rp ${new Intl.NumberFormat("id-ID").format(o.totalAmount)}` : "Rp 0",
          status: o.status === "shipped" ? "shipped" : o.status === "completed" ? "success" : "processing",
          paymentMethod: o.paymentMethod || "Transfer Virtual Account",
          quantity: o.items?.[0]?.quantity || 1,
          isReviewed: o.reviewed || false,
          rating: o.rating || 0,
          storeUid: o.storeUid || ""
        }))

        setTransactions(mappedRecords)
      } catch (nextError) {
        console.error("Failed to load transaction history:", nextError)

        if (!isMounted) {
          return
        }

        setError("Riwayat transaksi belum bisa dimuat.")
        setTransactions([])
      } finally {
        if (isMounted) {
          setLoading(false)
        }
      }
    }

    void loadTransactionHistory()

    return () => {
      isMounted = false
    }
  }, [user, authLoading])

  const filteredTransactions = useMemo(() => {
    return transactions.filter((transaction) => {
      const query = searchQuery.trim().toLowerCase()
      const matchesSearch =
        !query ||
        transaction.title.toLowerCase().includes(query) ||
        transaction.subtitle.toLowerCase().includes(query)

      if (selectedFilter === "all") {
        return matchesSearch
      }

      return matchesSearch && transaction.type === selectedFilter
    })
  }, [searchQuery, selectedFilter, transactions])

  const filterOptions = useMemo(() => {
    return defaultFilters.map((filter) => ({
      ...filter,
      count:
        filter.id === "all"
          ? transactions.length
          : transactions.filter((transaction) => transaction.type === filter.id).length,
    }))
  }, [transactions])

  const totalIncome = useMemo(() => {
    return transactions
      .filter((transaction) => transaction.type === "sale" && transaction.status === "success")
      .reduce((sum, transaction) => sum + parseCurrency(transaction.amount), 0)
  }, [transactions])

  const totalExpense = useMemo(() => {
    return transactions
      .filter(
        (transaction) =>
          (transaction.type === "purchase" || transaction.type === "service") &&
          transaction.status === "success"
      )
      .reduce((sum, transaction) => sum + parseCurrency(transaction.amount), 0)
  }, [transactions])

  function getStatusType(status: TransactionStatus) {
    switch (status) {
      case "success":
        return "completed" as const
      case "shipped":
      case "processing":
        return "in-progress" as const
      case "pending":
      case "cancelled":
        return "pending" as const
    }
  }

  function getStatusText(status: TransactionStatus) {
    switch (status) {
      case "success":
        return "Berhasil"
      case "shipped":
        return "Dikirim"
      case "processing":
        return "Diproses"
      case "pending":
        return "Menunggu"
      case "cancelled":
        return "Dibatalkan"
    }
  }

  function getTypeIcon(type: TransactionType) {
    switch (type) {
      case "purchase":
        return ShoppingBag
      case "sale":
        return TrendingUp
      case "service":
        return Package
    }
  }

  function getTypeColor(type: TransactionType) {
    switch (type) {
      case "purchase":
        return "#0288D1"
      case "sale":
        return "#10B981"
      case "service":
        return "#4FC3F7"
    }
  }

  function handleTransactionClick(type: TransactionType) {
    if (type === "service") {
      navigate("tracking")
      return
    }

    if (type === "sale") {
      navigate("jualBarang")
      return
    }

    navigate("marketplace")
  }

  const submitReview = async () => {
    if (!reviewTarget || !user) return;
    try {
      setIsSubmittingReview(true);
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: await buildAuthHeaders(user),
        body: JSON.stringify({
          type: "product",
          orderId: reviewTarget.id,
          targetId: reviewTarget.storeUid || "dummyProduct",
          rating: reviewRating,
          comment: reviewComment
        })
      });
      
      if (res.ok) {
        setTransactions(prev => prev.map(t => 
          t.id === reviewTarget.id ? { ...t, isReviewed: true, rating: reviewRating } : t
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
            <h1 className="text-[#4A4A4A]">Riwayat Transaksi</h1>
            <p className="text-xs text-[#6B6B6B]">{transactions.length} total transaksi</p>
          </div>
        </div>

        <div className="px-6 pb-4">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#6B6B6B]" />
            <input
              type="text"
              placeholder="Cari transaksi..."
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

      <div className="bg-white border-b border-[#E5E7EB] px-6 py-4">
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-gradient-to-br from-[#10B981]/5 to-[#10B981]/10 rounded-xl p-4 border border-[#10B981]/20">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="w-4 h-4 text-[#10B981]" />
              <span className="text-xs text-[#6B6B6B]">Total Pemasukan</span>
            </div>
            <p className="text-lg text-[#10B981]">{formatCompactRupiah(totalIncome)}</p>
          </div>
          <div className="bg-gradient-to-br from-[#0288D1]/5 to-[#0288D1]/10 rounded-xl p-4 border border-[#0288D1]/20">
            <div className="flex items-center gap-2 mb-2">
              <TrendingDown className="w-4 h-4 text-[#0288D1]" />
              <span className="text-xs text-[#6B6B6B]">Total Pengeluaran</span>
            </div>
            <p className="text-lg text-[#0288D1]">{formatCompactRupiah(totalExpense)}</p>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto pb-32">
        <div className="p-6 space-y-4">
          {loading ? (
            <PageLoader message="Memuat riwayat transaksi..." fullScreen={false} />
          ) : error ? (
            <div className="bg-white rounded-2xl border border-[#E5E7EB] p-8 text-center">
              <p className="text-sm text-[#EF4444]">{error}</p>
            </div>
          ) : filteredTransactions.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-20 h-20 bg-[#E5E7EB] rounded-full flex items-center justify-center mx-auto mb-4">
                <ShoppingBag className="w-10 h-10 text-[#6B6B6B]" />
              </div>
              <h3 className="text-[#4A4A4A] mb-2">Tidak Ada Transaksi</h3>
              <p className="text-sm text-[#6B6B6B]">Belum ada riwayat transaksi yang cocok</p>
            </div>
          ) : (
            filteredTransactions.map((transaction) => {
              const TypeIcon = getTypeIcon(transaction.type)
              const typeColor = getTypeColor(transaction.type)

              return (
                <div
                  key={transaction.id}
                  className="w-full bg-white rounded-2xl p-5 border border-[#E5E7EB] hover:border-[#0288D1] hover:shadow-md transition-all text-left"
                >
                  <div 
                    className="flex gap-4 cursor-pointer"
                    onClick={() => handleTransactionClick(transaction.type)}
                  >
                    <div
                      className="w-14 h-14 rounded-xl flex items-center justify-center flex-shrink-0"
                      style={{ backgroundColor: `${typeColor}15` }}
                    >
                      <TypeIcon className="w-6 h-6" style={{ color: typeColor }} />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between mb-1">
                        <div className="flex-1 min-w-0 pr-2">
                          <h3 className="text-sm text-[#4A4A4A] mb-0.5 truncate">
                            {transaction.title}
                          </h3>
                          <p className="text-xs text-[#6B6B6B] truncate">
                            {transaction.subtitle}
                          </p>
                        </div>
                        <StatusChip
                          statusText={getStatusText(transaction.status)}
                          statusType={getStatusType(transaction.status)}
                          className="text-xs px-2 py-1 flex-shrink-0"
                        />
                      </div>

                      <div className="flex items-center gap-2 mt-3 mb-2">
                        <Calendar className="w-3 h-3 text-[#6B6B6B]" />
                        <span className="text-xs text-[#6B6B6B]">{transaction.date}</span>
                        {transaction.quantity ? (
                          <span className="text-xs text-[#6B6B6B]">
                            {transaction.quantity}x item
                          </span>
                        ) : null}
                      </div>

                      <div className="flex items-center justify-between pt-2 border-t border-[#E5E7EB]">
                        <div>
                          <p className="text-xs text-[#6B6B6B] mb-0.5">
                            {transaction.paymentMethod}
                          </p>
                          <p
                            className="text-sm"
                            style={{
                              color: transaction.type === "sale" ? "#10B981" : "#0288D1",
                            }}
                          >
                            {transaction.type === "sale" ? "+" : "-"} {transaction.amount}
                          </p>
                        </div>
                        <div className="flex items-center gap-3">
                          {transaction.rating && transaction.isReviewed ? (
                            <div className="flex items-center gap-1">
                              <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                              <span className="text-sm text-[#4A4A4A]">{transaction.rating}.0</span>
                            </div>
                          ) : transaction.status === "success" && !transaction.isReviewed ? (
                            <button 
                              onClick={(e) => {
                                e.stopPropagation();
                                setReviewTarget(transaction);
                                setReviewRating(5);
                                setReviewComment("");
                                setReviewModalOpen(true);
                              }}
                              className="text-xs bg-[#0288D1] text-white px-3 py-1.5 rounded-full hover:bg-[#0288D1]/90"
                            >
                              Beri Ulasan
                            </button>
                          ) : null}
                          <button onClick={() => handleTransactionClick(transaction.type)}>
                            <ChevronRight className="w-5 h-5 text-[#9CA3AF]" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )
            })
          )}
        </div>
      </div>

      {reviewModalOpen && reviewTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-2xl w-full max-w-sm overflow-hidden select-none animate-in fade-in zoom-in-95 duration-200">
            <div className="px-6 py-4 flex items-center justify-between border-b border-[#E5E7EB]">
              <h3 className="font-semibold text-[#4A4A4A]">Ulas Produk Toko</h3>
              <button onClick={() => setReviewModalOpen(false)} className="text-[#9CA3AF] hover:bg-[#F8FAFC] p-1 rounded-full">
                <X className="w-5 h-5"/>
              </button>
            </div>
            <div className="p-6 space-y-4">
               <div>
                  <p className="text-sm text-[#6B6B6B] mb-2 text-center">Bagaimana kualitas <span className="font-semibold text-[#4A4A4A]">{reviewTarget.title}</span>?</p>
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
                   placeholder="Bagaimana pelayanan dan kualitas barang ini?"
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
            <p className="text-xs text-[#6B6B6B] mb-1">Total</p>
            <p className="text-lg text-[#4A4A4A]">{transactions.length}</p>
          </div>
          <div>
            <p className="text-xs text-[#6B6B6B] mb-1">Pembelian</p>
            <p className="text-lg text-[#0288D1]">
              {transactions.filter((transaction) => transaction.type === "purchase").length}
            </p>
          </div>
          <div>
            <p className="text-xs text-[#6B6B6B] mb-1">Penjualan</p>
            <p className="text-lg text-[#10B981]">
              {transactions.filter((transaction) => transaction.type === "sale").length}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
