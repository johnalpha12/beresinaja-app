import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  User,
  onAuthStateChanged,
} from "firebase/auth"
import { doc, setDoc } from "firebase/firestore"
import { auth, db } from "./firebase"

/* REGISTER */
export async function registerUser(
  email: string,
  password: string,
  fullName: string,
  phone: string,
  role: "pengguna" | "teknisi"
) {
  const userCredential = await createUserWithEmailAndPassword(
    auth,
    email,
    password
  )

  const user = userCredential.user

  await setDoc(doc(db, "users", user.uid), {
    uid: user.uid,
    fullName,
    email,
    phone,
    role,
    createdAt: Date.now(),
    stats: {
      services: 0,
      transactions: 0,
      sellItems: 0,
    },
    premium: {
      isActive: false,
      expiresAt: null,
      benefits: [
        "Gratis jemput-antar unlimited",
        "Garansi extended 60 hari",
        "Prioritas servis lebih cepat",
      ],
    },
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

/* LOGOUT */
export async function logoutUser() {
  await signOut(auth)
}

/* LISTENER */
export function subscribeToAuthChanges(callback: (user: User | null) => void) {
  return onAuthStateChanged(auth, callback)
}
