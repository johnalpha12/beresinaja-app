// hooks/useUserData.ts
import { useEffect, useState } from "react"
import { doc, getDoc } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { useAuth } from "@/context/AuthContext"

interface UserData {
  uid: string
  fullName: string
  email: string
  phone: string
  role: "pengguna" | "teknisi"
  createdAt: number
  city?: string
  stats?: {
    services: number
    transactions: number
    sellItems: number
  }
  premium?: {
    isActive: boolean
    expiresAt: number | null
    benefits: string[]
  }
}

export function useUserData() {
  const { user } = useAuth()
  const [userData, setUserData] = useState<UserData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchUserData() {
      if (!user) {
        setUserData(null)
        setLoading(false)
        return
      }

      try {
        const snapshot = await getDoc(doc(db, "users", user.uid))
        if (snapshot.exists()) {
          setUserData(snapshot.data() as UserData)
        }
      } catch (error) {
        console.error("Error fetching user data:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchUserData()
  }, [user])

  return { userData, loading }
}
