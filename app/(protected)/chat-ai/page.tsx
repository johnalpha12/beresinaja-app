"use client"

import { useState, useRef, useEffect } from "react"
import { useRouter } from "next/navigation"
import { X, Send, Bot } from "lucide-react"
import { screenToPath, type Screen } from "@/types/navigation"
import { PageLoader } from "@/components/ui/PageLoader"

interface Message {
  id: number
  text: string
  sender: "bot" | "user"
  time: string
}

function formatTime(date: Date) {
  return date.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })
}

export default function ChatAiPage() {
  const router = useRouter()
  const navigate = (screen: Screen) => router.push(screenToPath(screen))
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      text: "Halo! Saya Asisten BeresinAja. Ada yang bisa saya bantu? Anda bisa bertanya tentang servis, teknisi, harga, atau produk yang tersedia.",
      sender: "bot",
      time: formatTime(new Date()),
    },
  ])
  const [input, setInput] = useState("")
  const [quickReplies, setQuickReplies] = useState<string[]>([])
  const [isSending, setIsSending] = useState(false)
  const [error, setError] = useState("")
  const [previousResponseId, setPreviousResponseId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  useEffect(() => {
    async function loadChat() {
      try {
        setLoading(true)
        const response = await fetch("/api/content/chat", {
          cache: "no-store",
        })

        if (!response.ok) {
          throw new Error("Gagal memuat quick replies chat.")
        }

        const data = (await response.json()) as {
          quickReplies?: string[]
        }
        setQuickReplies(data.quickReplies || [])
      } catch (error) {
        console.error("Failed to load chat content:", error)
      } finally {
        setLoading(false)
      }
    }

    loadChat()
  }, [])

  if (loading) {
    return <PageLoader message="Menyiapkan asisten..." />
  }

  const sendMessage = async (text: string) => {
    const trimmedText = text.trim()

    if (!trimmedText || isSending) return

    setError("")

    const userMsg: Message = {
      id: Date.now(),
      text: trimmedText,
      sender: "user",
      time: formatTime(new Date()),
    }

    setMessages((prev) => [...prev, userMsg])
    setInput("")
    setIsSending(true)

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: trimmedText,
          previousResponseId,
        }),
      })

      const data = (await response.json()) as {
        text?: string
        error?: string
        responseId?: string | null
      }

      if (!response.ok || !data.text) {
        throw new Error(data.error || "Gagal mendapatkan balasan.")
      }

      setPreviousResponseId(data.responseId ?? null)

      const botMsg: Message = {
        id: Date.now() + 1,
        text: data.text,
        sender: "bot",
        time: formatTime(new Date()),
      }

      setMessages((prev) => [...prev, botMsg])
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Gagal terhubung ke layanan chat."

      setError(message)
    } finally {
      setIsSending(false)
    }
  }

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <header
        className="flex items-center justify-between px-4 lg:px-10 pt-10 pb-4"
        style={{ background: "linear-gradient(135deg, #2196F3 0%, #29B6F6 100%)" }}
      >
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center">
            <Bot className="w-5 h-5 text-white" />
          </div>
          <div>
            <p className="text-sm font-bold text-white">Asisten BeresinAja</p>
            <p className="text-xs text-white/80">Selalu siap membantu Anda</p>
          </div>
        </div>
        <button
          onClick={() => navigate("home")}
          aria-label="Tutup chat"
          className="text-white/80 hover:text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </header>

      <div className="flex-1 overflow-y-auto px-4 lg:px-10 py-4 flex flex-col gap-3">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-[80%] rounded-2xl px-4 py-3 shadow-sm ${
                msg.sender === "user"
                  ? "bg-primary text-primary-foreground rounded-br-sm"
                  : "bg-card border border-border text-foreground rounded-bl-sm"
              }`}
            >
              <p className="text-sm leading-relaxed">{msg.text}</p>
              <p
                className={`text-[10px] mt-1.5 text-right ${
                  msg.sender === "user" ? "text-white/70" : "text-muted-foreground"
                }`}
              >
                {msg.time}
              </p>
            </div>
          </div>
        ))}
        {isSending && (
          <div className="flex justify-start">
            <div className="max-w-[80%] rounded-2xl rounded-bl-sm px-4 py-3 shadow-sm bg-card border border-border text-foreground">
              <p className="text-sm leading-relaxed text-muted-foreground">
                Asisten sedang mengetik...
              </p>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      <div className="px-4 lg:px-10 pb-2 flex gap-2 overflow-x-auto scrollbar-hide">
        {quickReplies.map((reply) => (
          <button
            key={reply}
            onClick={() => sendMessage(reply)}
            className="shrink-0 border border-primary text-primary text-xs font-medium px-4 py-2 rounded-full hover:bg-secondary transition-colors"
            disabled={isSending}
          >
            {reply}
          </button>
        ))}
      </div>

      {error && (
        <div className="px-4 lg:px-10 pb-2">
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
            {error}
          </div>
        </div>
      )}

      <div className="px-4 lg:px-10 pb-6 pt-2 flex items-center gap-3">
        <div className="flex-1 flex items-center bg-[#F5F7FA] border border-border rounded-full px-4 py-2.5 focus-within:border-primary transition-colors">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                void sendMessage(input)
              }
            }}
            placeholder="Ketik pertanyaan Anda..."
            className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground outline-none"
            aria-label="Ketik pesan"
            disabled={isSending}
          />
        </div>
        <button
          onClick={() => void sendMessage(input)}
          aria-label="Kirim pesan"
          className="w-11 h-11 bg-primary rounded-full flex items-center justify-center shrink-0 hover:opacity-90 active:scale-95 transition-all disabled:opacity-50"
          disabled={isSending || !input.trim()}
        >
          <Send className="w-4 h-4 text-white" />
        </button>
      </div>
    </div>
  )
}
