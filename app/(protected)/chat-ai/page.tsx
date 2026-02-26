"use client"

import { useRouter } from "next/navigation"
import ChatAIScreen from "@/app/(protected)/main/chat-ai/page"
import { screenToPath, type Screen } from "@/types/navigation"

export default function ChatAIPage() {
  const router = useRouter()
  const navigate = (screen: Screen) => router.push(screenToPath(screen))

  return <ChatAIScreen navigate={navigate} />
}
