import {
  createUserWithEmailAndPassword,
  getRedirectResult,
  signInWithEmailAndPassword,
  signOut,
  User,
  onAuthStateChanged,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithRedirect,
} from "firebase/auth"
import { auth } from "./firebase"
import type { UserData, UserRole } from "@/types/user"

type ProfileApiResponse = {
  error?: string
  profile?: UserData
}

async function buildAuthHeaders(user: User, forceRefresh = false) {
  const token = await user.getIdToken(forceRefresh)

  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  }
}

async function requestUserProfile(
  user: User,
  overrides: Partial<{
    fullName: string
    email: string
    phone: string
    role: UserRole
  }>,
  forceRefresh = false
) {
  const response = await fetch("/api/me/profile", {
    method: "POST",
    headers: await buildAuthHeaders(user, forceRefresh),
    body: JSON.stringify(overrides),
  })

  const data = (await response.json().catch(() => ({}))) as ProfileApiResponse

  return { response, data }
}

export async function ensureUserProfile(
  user: User,
  overrides: Partial<{
    fullName: string
    email: string
    phone: string
    role: UserRole
  }> = {}
) {
  let { response, data } = await requestUserProfile(user, overrides)

  if (response.status === 401) {
    ;({ response, data } = await requestUserProfile(user, overrides, true))
  }

  if (!response.ok || !data.profile) {
    throw new Error(data.error || "Gagal memastikan profil pengguna.")
  }

  return data.profile
}

export async function completeGoogleRedirectLogin() {
  const result = await getRedirectResult(auth)

  return result?.user || null
}

/* REGISTER */
export async function registerUser(
  email: string,
  password: string,
  fullName: string,
  phone: string,
  role: UserRole
) {
  const userCredential = await createUserWithEmailAndPassword(
    auth,
    email,
    password
  )

  const user = userCredential.user

  await ensureUserProfile(user, {
    fullName,
    email,
    phone,
    role,
  })

  return user
}

/* LOGIN */
export async function loginUser(email: string, password: string) {
  const userCredential = await signInWithEmailAndPassword(
    auth,
    email,
    password
  )
  return userCredential.user
}

/* GOOGLE LOGIN */
export async function loginWithGoogle() {
  const provider = new GoogleAuthProvider()
  provider.setCustomParameters({ prompt: "select_account" })

  try {
    const userCredential = await signInWithPopup(auth, provider)
    return userCredential.user
  } catch (error) {
    const firebaseError = error as { code?: string }

    if (
      firebaseError.code === "auth/popup-blocked" ||
      firebaseError.code === "auth/operation-not-supported-in-this-environment"
    ) {
      await signInWithRedirect(auth, provider)
      return null
    }

    throw error
  }
}

/* LOGOUT */
export async function logoutUser() {
  await signOut(auth)
}

/* LISTENER */
export function subscribeToAuthChanges(callback: (user: User | null) => void) {
  return onAuthStateChanged(auth, callback)
}
