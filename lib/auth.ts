import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  User,
  onAuthStateChanged,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithRedirect,
} from "firebase/auth"
import { doc, getDoc, setDoc } from "firebase/firestore"
import { auth, db } from "./firebase"

type UserRole = "pengguna" | "teknisi"

const defaultStats = {
  services: 0,
  transactions: 0,
  sellItems: 0,
}

const defaultPremium = {
  isActive: false,
  expiresAt: null,
  benefits: [
    "Gratis jemput-antar unlimited",
    "Garansi extended 60 hari",
    "Prioritas servis lebih cepat",
  ],
}

function formatFallbackName(email?: string | null) {
  const emailName = email?.split("@")[0]?.trim()

  if (!emailName) {
    return "Pengguna"
  }

  return emailName
    .split(/[._-]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ")
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
  const userRef = doc(db, "users", user.uid)
  const snapshot = await getDoc(userRef)

  if (snapshot.exists()) {
    return
  }

  await setDoc(userRef, {
    uid: user.uid,
    fullName:
      overrides.fullName?.trim() ||
      user.displayName?.trim() ||
      formatFallbackName(user.email),
    email: overrides.email ?? user.email ?? "",
    phone: overrides.phone ?? "",
    role: overrides.role ?? "pengguna",
    createdAt: Date.now(),
    stats: defaultStats,
    premium: defaultPremium,
  })
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
    await ensureUserProfile(userCredential.user)
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
