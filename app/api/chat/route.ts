import { NextRequest, NextResponse } from "next/server"

export const runtime = "nodejs"

type ChatHistoryItem = {
  role?: "user" | "model"
  text?: string
}

type GeminiResponse = {
  candidates?: Array<{
    content?: {
      parts?: Array<{
        text?: string
      }>
    }
  }>
  promptFeedback?: {
    blockReason?: string
  }
  error?: {
    message?: string
  }
}

type FetchErrorCause = {
  code?: string
}

const SYSTEM_INSTRUCTION =
  "Anda adalah Asisten BeresinAja. Jawab dalam Bahasa Indonesia yang ringkas, jelas, dan membantu. Fokus pada servis perangkat, marketplace, teknisi, pesanan, dan penggunaan aplikasi BeresinAja. Jika informasi spesifik tidak tersedia, katakan dengan jujur dan beri langkah berikutnya yang masuk akal."

function extractText(response: GeminiResponse) {
  if (!Array.isArray(response.candidates)) {
    return ""
  }

  return response.candidates
    .flatMap((candidate) => {
      if (!Array.isArray(candidate.content?.parts)) {
        return []
      }

      return candidate.content.parts
        .filter((part) => typeof part.text === "string")
        .map((part) => part.text as string)
    })
    .join("\n")
    .trim()
}

function normalizeHistory(history: ChatHistoryItem[] | undefined) {
  if (!Array.isArray(history)) {
    return []
  }

  return history
    .filter(
      (item) =>
        (item.role === "user" || item.role === "model") &&
        typeof item.text === "string" &&
        item.text.trim()
    )
    .map((item) => ({
      role: item.role as "user" | "model",
      parts: [{ text: item.text!.trim() }],
    }))
}

function getNetworkErrorMessage(error: unknown) {
  if (!(error instanceof Error)) {
    return null
  }

  const cause = error.cause as FetchErrorCause | undefined

  if (cause?.code === "UND_ERR_CONNECT_TIMEOUT") {
    return "Server tidak bisa terhubung ke Gemini API. Koneksi ke generativelanguage.googleapis.com:443 timeout. Cek koneksi internet, firewall, antivirus, proxy, atau VPN pada mesin server."
  }

  if (error.message === "fetch failed") {
    return "Server gagal menghubungi Gemini API. Cek koneksi internet, firewall, proxy, atau VPN pada mesin server."
  }

  return null
}

export async function POST(request: NextRequest) {
  const geminiApiKey = process.env.GEMINI_API_KEY?.trim()
  const geminiModel = process.env.GEMINI_MODEL?.trim() || "gemini-2.5-flash"

  if (!geminiApiKey) {
    return NextResponse.json(
      { error: "GEMINI_API_KEY belum diset di environment server." },
      { status: 500 }
    )
  }

  try {
    const body = (await request.json()) as {
      message?: string
      history?: ChatHistoryItem[]
    }

    const message = body.message?.trim()
    const history = normalizeHistory(body.history)

    if (!message) {
      return NextResponse.json(
        { error: "Pesan tidak boleh kosong." },
        { status: 400 }
      )
    }

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(
        geminiModel
      )}:generateContent`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-goog-api-key": geminiApiKey,
        },
        body: JSON.stringify({
          system_instruction: {
            parts: [{ text: SYSTEM_INSTRUCTION }],
          },
          contents: [...history, { role: "user", parts: [{ text: message }] }],
          generationConfig: {
            maxOutputTokens: 300,
          },
        }),
      }
    )

    const data = (await response.json()) as GeminiResponse

    if (!response.ok) {
      return NextResponse.json(
        { error: data.error?.message || "Gagal mengambil respons dari Gemini." },
        { status: response.status }
      )
    }

    const text = extractText(data)

    if (!text) {
      return NextResponse.json(
        {
          error:
            data.promptFeedback?.blockReason
              ? `Permintaan diblokir oleh Gemini (${data.promptFeedback.blockReason}).`
              : "Model Gemini tidak mengembalikan teks respons.",
        },
        { status: 502 }
      )
    }

    return NextResponse.json({
      text,
    })
  } catch (error) {
    console.error("Chat API error:", error)

    const networkErrorMessage = getNetworkErrorMessage(error)

    if (networkErrorMessage) {
      return NextResponse.json(
        { error: networkErrorMessage },
        { status: 503 }
      )
    }

    return NextResponse.json(
      { error: "Terjadi kesalahan saat memproses chat." },
      { status: 500 }
    )
  }
}
