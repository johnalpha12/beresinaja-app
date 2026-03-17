import { NextRequest, NextResponse } from "next/server"

export const runtime = "nodejs"

type OpenAIResponse = {
  id?: string
  output?: Array<{
    type?: string
    content?: Array<{
      type?: string
      text?: string
    }>
  }>
  error?: {
    message?: string
  }
}

function extractText(response: OpenAIResponse) {
  if (!Array.isArray(response.output)) {
    return ""
  }

  return response.output
    .flatMap((item) => {
      if (item.type !== "message" || !Array.isArray(item.content)) {
        return []
      }

      return item.content
        .filter((content) => content.type === "output_text" && typeof content.text === "string")
        .map((content) => content.text as string)
    })
    .join("\n")
    .trim()
}

export async function POST(request: NextRequest) {
  const openaiApiKey = process.env.OPENAI_API_KEY

  if (!openaiApiKey) {
    return NextResponse.json(
      { error: "OPENAI_API_KEY belum diset di environment server." },
      { status: 500 }
    )
  }

  try {
    const body = (await request.json()) as {
      message?: string
      previousResponseId?: string | null
    }

    const message = body.message?.trim()

    if (!message) {
      return NextResponse.json(
        { error: "Pesan tidak boleh kosong." },
        { status: 400 }
      )
    }

    const response = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${openaiApiKey}`,
      },
      body: JSON.stringify({
        model: process.env.OPENAI_MODEL || "gpt-4o-mini",
        instructions:
          "Anda adalah Asisten BeresinAja. Jawab dalam Bahasa Indonesia yang ringkas, jelas, dan membantu. Fokus pada servis perangkat, marketplace, teknisi, pesanan, dan penggunaan aplikasi BeresinAja. Jika informasi spesifik tidak tersedia, katakan dengan jujur dan beri langkah berikutnya yang masuk akal.",
        input: message,
        previous_response_id: body.previousResponseId ?? undefined,
        max_output_tokens: 300,
      }),
    })

    const data = (await response.json()) as OpenAIResponse

    if (!response.ok) {
      return NextResponse.json(
        { error: data.error?.message || "Gagal mengambil respons dari OpenAI." },
        { status: response.status }
      )
    }

    const text = extractText(data)

    if (!text) {
      return NextResponse.json(
        { error: "Model tidak mengembalikan teks respons." },
        { status: 502 }
      )
    }

    return NextResponse.json({
      text,
      responseId: data.id ?? null,
    })
  } catch (error) {
    console.error("Chat API error:", error)

    return NextResponse.json(
      { error: "Terjadi kesalahan saat memproses chat." },
      { status: 500 }
    )
  }
}
