import { useAuth } from "@/context/AuthContext"

export function useUserData() {
  const { userData, loading } = useAuth()

  return { userData, loading }
}
