"use client"

import { useState, useRef, useEffect } from "react"
import { X, Send, Bot } from "lucide-react"
import type { Screen } from "@/app/page"

interface Props {
  navigate: (s: Screen) => void
}

interface Message {
  id: number
  text: string
  sender: "bot" | "user"
  time: string
}

const quickReplies = ["Harga servis?", "Teknisi terdekat?", "Cara tracking?"]

const botReplies: Record<string, string> = {
  "Harga servis?": "Harga servis bervariasi tergantung perangkat dan jenis kerusakan. Mulai dari Rp 50.000 untuk servis ringan hingga Rp 1.500.000 untuk ganti LCD iPhone terbaru. Mau cek estimasi untuk perangkat tertentu?",
  "Teknisi terdekat?": "Ada 12 teknisi aktif di area Medan dalam radius 5 km. Teknisi terdekat adalah Ahmad (rating 4.9, 2.1 km) dan Budi (rating 4.8, 2.8 km). Mau langsung pesan?",
  "Cara tracking?": "Kamu bisa tracking status servis di menu Tracking. Klik tab 'Tracking' di bawah, lalu pilih order aktifmu. Kamu akan melihat status real-time dari pengambilan hingga pengiriman barang.",
}

function formatTime(date: Date) {
  return date.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })
}

export default function ChatAIScreen({ navigate }: Props) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      text: "Halo! Saya Asisten BeresinAja. Ada yang bisa saya bantu? Anda bisa bertanya tentang servis, teknisi, harga, atau produk yang tersedia.",
      sender: "bot",
      time: formatTime(new Date()),
    },
  ])
  const [input, setInput] = useState("")
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const sendMessage = (text: string) => {
    if (!text.trim()) return
    const userMsg: Message = {
      id: Date.now(),
      text: text.trim(),
      sender: "user",
      time: formatTime(new Date()),
    }
    setMessages((prev) => [...prev, userMsg])
    setInput("")

    setTimeout(() => {
      const reply =
        botReplies[text.trim()] ||
        "Terima kasih atas pertanyaanmu! Tim BeresinAja akan segera membantu. Untuk pertanyaan lebih lanjut, hubungi kami di 0800-BERESIN."
      const botMsg: Message = {
        id: Date.now() + 1,
        text: reply,
        sender: "bot",
        time: formatTime(new Date()),
      }
      setMessages((prev) => [...prev, botMsg])
    }, 800)
  }

  return (
    <div className="flex flex-col min-h-screen bg-background">
      {/* Header */}
      <header
        className="flex items-center justify-between px-4 pt-10 pb-4"
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

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 flex flex-col gap-3">
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
        <div ref={bottomRef} />
      </div>

      {/* Quick Replies */}
      <div className="px-4 pb-2 flex gap-2 overflow-x-auto scrollbar-hide">
        {quickReplies.map((reply) => (
          <button
            key={reply}
            onClick={() => sendMessage(reply)}
            className="shrink-0 border border-primary text-primary text-xs font-medium px-4 py-2 rounded-full hover:bg-secondary transition-colors"
          >
            {reply}
          </button>
        ))}
      </div>

      {/* Input Area */}
      <div className="px-4 pb-6 pt-2 flex items-center gap-3">
        <div className="flex-1 flex items-center bg-[#F5F7FA] border border-border rounded-full px-4 py-2.5 focus-within:border-primary transition-colors">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && sendMessage(input)}
            placeholder="Ketik pertanyaan Anda..."
            className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground outline-none"
            aria-label="Ketik pesan"
          />
        </div>
        <button
          onClick={() => sendMessage(input)}
          aria-label="Kirim pesan"
          className="w-11 h-11 bg-primary rounded-full flex items-center justify-center shrink-0 hover:opacity-90 active:scale-95 transition-all"
        >
          <Send className="w-4 h-4 text-white" />
        </button>
      </div>
    </div>
  )
}
