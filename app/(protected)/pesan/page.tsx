"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, Search, MessageSquare } from "lucide-react"
import { useAuth } from "@/context/AuthContext"
import { db } from "@/lib/firebase"
import { collection, query, where, onSnapshot, orderBy } from "firebase/firestore"
import { PageLoader } from "@/components/ui/PageLoader"

interface ChatPreview {
  id: string;
  participants: string[];
  participantNames: Record<string, string>;
  lastMessage: string;
  lastMessageTime: number;
  unreadCount?: Record<string, number>;
}

export default function InboxPage() {
  const router = useRouter()
  const { user, loading } = useAuth()
  const [chats, setChats] = useState<ChatPreview[]>([])
  const [searchQuery, setSearchQuery] = useState("")

  useEffect(() => {
    if (!user) return;
    
    // We listen to chats where this user is a participant
    const q = query(
      collection(db, "chats"),
      where("participants", "array-contains", user.uid),
      orderBy("lastMessageTime", "desc")
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const chatList: ChatPreview[] = [];
      snapshot.forEach(doc => {
        chatList.push({ id: doc.id, ...doc.data() } as ChatPreview);
      });
      setChats(chatList);
    });

    return () => unsubscribe();
  }, [user]);

  if (loading) return <PageLoader message="Memuat pesan..." />
  if (!user) return <div className="p-8 text-center">Silakan login terlebih dahulu.</div>

  const filteredChats = chats.filter(chat => {
    const otherId = chat.participants.find(id => id !== user.uid) || "";
    const otherName = chat.participantNames[otherId] || "Pengguna";
    return otherName.toLowerCase().includes(searchQuery.toLowerCase());
  });

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col">
      <div className="sticky top-0 bg-white border-b border-[#E5E7EB] z-10">
        <div className="px-6 py-4 flex items-center">
          <button onClick={() => router.back()} className="text-[#0288D1] p-2 -ml-2">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-[#4A4A4A] ml-2 font-semibold">Pesan</h1>
        </div>
        
        <div className="px-6 pb-4">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#6B6B6B]" />
            <input
              type="text"
              placeholder="Cari pesan..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-12 pl-12 pr-4 rounded-full border border-[#E5E7EB] bg-[#F8FAFC] focus:border-[#0288D1] focus:bg-white outline-none transition-colors"
            />
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {chats.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-12 text-center h-full text-[#6B6B6B]">
            <MessageSquare className="w-12 h-12 mb-4 opacity-20" />
            <p>Belum ada pesan masuk.</p>
          </div>
        ) : (
          <div className="divide-y divide-[#E5E7EB]">
            {filteredChats.map(chat => {
              const otherId = chat.participants.find(id => id !== user.uid) || "";
              const otherName = chat.participantNames[otherId] || "Pengguna";
              const unread = chat.unreadCount?.[user.uid] || 0;
              const timeString = new Date(chat.lastMessageTime || Date.now()).toLocaleTimeString("id-ID", { hour: '2-digit', minute: '2-digit' });

              return (
                <button
                  key={chat.id}
                  onClick={() => router.push(`/chat/${chat.id}`)}
                  className="w-full p-4 bg-white hover:bg-[#F8FAFC] flex gap-3 text-left transition-colors"
                >
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#0288D1] to-[#4FC3F7] text-white flex items-center justify-center text-lg font-bold flex-shrink-0">
                    {otherName.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-center mb-1">
                      <h3 className="font-semibold text-[#4A4A4A] truncate pr-2">{otherName}</h3>
                      <span className="text-xs text-[#9CA3AF] whitespace-nowrap">{timeString}</span>
                    </div>
                    <p className={`text-sm truncate ${unread > 0 ? "text-[#4A4A4A] font-medium" : "text-[#6B6B6B]"}`}>
                      {chat.lastMessage || "Mulai percakapan"}
                    </p>
                  </div>
                  {unread > 0 && (
                    <div className="w-5 h-5 rounded-full bg-[#EF4444] text-white text-[10px] flex items-center justify-center flex-shrink-0 self-center">
                      {unread > 99 ? "99+" : unread}
                    </div>
                  )}
                </button>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
