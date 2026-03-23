"use client"

import { useEffect, useState, useRef } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, Send } from "lucide-react"
import { useAuth } from "@/context/AuthContext"
import { db } from "@/lib/firebase"
import { collection, query, orderBy, onSnapshot, addDoc, serverTimestamp, doc, getDoc, setDoc, updateDoc } from "firebase/firestore"
import { PageLoader } from "@/components/ui/PageLoader"

export default function ChatRoomPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const { user, loading } = useAuth()
  const [messages, setMessages] = useState<any[]>([])
  const [inputText, setInputText] = useState("")
  const [otherName, setOtherName] = useState("Memuat...")
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!user) return;
    
    // Load chat metadata logic
    const fetchMeta = async () => {
      const docRef = doc(db, "chats", params.id);
      const snap = await getDoc(docRef);
      if (snap.exists()) {
        const data = snap.data();
        const otherId = data.participants.find((id: string) => id !== user.uid);
        if (otherId) setOtherName(data.participantNames[otherId] || "Pengguna");
        
        // Reset unread count
        if (data.unreadCount && data.unreadCount[user.uid] > 0) {
           await updateDoc(docRef, {
             [`unreadCount.${user.uid}`]: 0
           });
        }
      }
    };
    fetchMeta();

    const q = query(
      collection(db, "chats", params.id, "messages"),
      orderBy("createdAt", "asc")
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const msgList: any[] = [];
      snapshot.forEach(d => {
        msgList.push({ id: d.id, ...d.data() });
      });
      setMessages(msgList);
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
      }, 100);
    });

    return () => unsubscribe();
  }, [user, params.id]);

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || !user) return;

    const textPayload = inputText.trim();
    setInputText("");

    const chatRef = doc(db, "chats", params.id);
    const snap = await getDoc(chatRef);
    let otherId = "";
    if (snap.exists()) {
      otherId = snap.data().participants.find((id: string) => id !== user.uid);
    }

    await addDoc(collection(db, "chats", params.id, "messages"), {
      text: textPayload,
      senderId: user.uid,
      createdAt: serverTimestamp()
    });

    if (otherId) {
      await updateDoc(chatRef, {
        lastMessage: textPayload,
        lastMessageTime: Date.now(),
        [`unreadCount.${otherId}`]: (snap.data()?.unreadCount?.[otherId] || 0) + 1
      });
    }
  };

  if (loading) return <PageLoader message="Memuat obrolan..." />
  if (!user) return <div className="p-8 text-center">Silakan login terlebih dahulu.</div>

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col h-screen">
      <div className="bg-white border-b border-[#E5E7EB] z-10 flex-shrink-0">
        <div className="px-4 py-4 flex items-center gap-3">
          <button onClick={() => router.back()} className="text-[#0288D1] p-1 rounded-full hover:bg-[#F8FAFC]">
            <ArrowLeft className="w-6 h-6" />
          </button>
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#0288D1] to-[#4FC3F7] text-white flex items-center justify-center font-bold">
            {otherName.charAt(0).toUpperCase()}
          </div>
          <div>
            <h1 className="text-[#4A4A4A] font-medium">{otherName}</h1>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-[#F4F7F9]">
        {messages.map((msg, index) => {
          const isMe = msg.senderId === user.uid;
          const timeString = msg.createdAt ? new Date(msg.createdAt.toMillis ? msg.createdAt.toMillis() : Date.now()).toLocaleTimeString("id-ID", { hour: '2-digit', minute: '2-digit' }) : "";
          
          return (
            <div key={msg.id || index} className={`flex flex-col ${isMe ? "items-end" : "items-start"}`}>
              <div className={`max-w-[75%] px-4 py-2 rounded-2xl shadow-sm ${isMe ? "bg-[#0288D1] text-white rounded-tr-sm" : "bg-white text-[#4A4A4A] border border-[#E5E7EB] rounded-tl-sm"}`}>
                <p className="text-[15px] leading-relaxed break-words">{msg.text}</p>
                <div className={`text-[10px] mt-1 text-right ${isMe ? "text-white/80" : "text-[#9CA3AF]"}`}>
                  {timeString}
                </div>
              </div>
            </div>
          )
        })}
        <div ref={messagesEndRef} />
      </div>

      <div className="bg-white border-t border-[#E5E7EB] p-3 flex-shrink-0">
        <form onSubmit={sendMessage} className="flex gap-2">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Ketik pesan..."
            className="flex-1 bg-[#F8FAFC] border border-[#E5E7EB] rounded-full px-5 py-3 outline-none focus:border-[#0288D1] transition-colors"
          />
          <button 
            type="submit"
            disabled={!inputText.trim()}
            className="w-12 h-12 flex items-center justify-center bg-[#0288D1] text-white rounded-full disabled:opacity-50 disabled:bg-[#9CA3AF]"
          >
            <Send className="w-5 h-5 ml-1" />
          </button>
        </form>
      </div>
    </div>
  )
}
