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

const AUTH_STATE_TIMEOUT_MS = 5000
const PENDING_PROFILE_BOOTSTRAP_KEY = "beresinaja.pending-profile-bootstrap"
let authTransitionQueue = Promise.resolve()

type ProfileOverrides = Partial<{
  fullName: string
  email: string
  phone: string
  role: UserRole
}>

type PendingProfileBootstrap = Required<Pick<ProfileOverrides, "email">> &
  ProfileOverrides

type ProfileApiResponse = {
  error?: string
  profile?: UserData
}

function normalizeEmail(value?: string | null) {
  return value?.trim().toLowerCase() || ""
}

function getSessionStorage() {
  if (typeof window === "undefined") {
    return null
  }

  return window.sessionStorage
}

function readPendingProfileBootstrap() {
  const storage = getSessionStorage()

  if (!storage) {
    return null
  }

  const rawValue = storage.getItem(PENDING_PROFILE_BOOTSTRAP_KEY)

  if (!rawValue) {
    return null
  }

  try {
    const parsedValue = JSON.parse(rawValue) as PendingProfileBootstrap

    if (!normalizeEmail(parsedValue.email)) {
      return null
    }

    return parsedValue
  } catch {
    storage.removeItem(PENDING_PROFILE_BOOTSTRAP_KEY)
    return null
  }
}

function writePendingProfileBootstrap(overrides: PendingProfileBootstrap) {
  const storage = getSessionStorage()

  if (!storage) {
    return
  }

  storage.setItem(
    PENDING_PROFILE_BOOTSTRAP_KEY,
    JSON.stringify({
      ...overrides,
      email: normalizeEmail(overrides.email),
    })
  )
}

function clearPendingProfileBootstrap() {
  const storage = getSessionStorage()

  if (!storage) {
    return
  }

  storage.removeItem(PENDING_PROFILE_BOOTSTRAP_KEY)
}

function resolveProfileOverrides(user: User, overrides: ProfileOverrides) {
  const pendingProfile = readPendingProfileBootstrap()
  const userEmail = normalizeEmail(user.email)
  const overrideEmail = normalizeEmail(overrides.email)
  const targetEmail = overrideEmail || userEmail

  if (
    !pendingProfile ||
    !targetEmail ||
    normalizeEmail(pendingProfile.email) !== targetEmail
  ) {
    return overrides
  }

  return {
    fullName: overrides.fullName ?? pendingProfile.fullName,
    email: overrides.email ?? pendingProfile.email ?? user.email ?? "",
    phone: overrides.phone ?? pendingProfile.phone,
    role: overrides.role ?? pendingProfile.role,
  }
}

function clearPendingProfileBootstrapIfApplied(
  user: User,
  profile: UserData,
  overrides: ProfileOverrides
) {
  const pendingProfile = readPendingProfileBootstrap()

  if (!pendingProfile) {
    return
  }

  const pendingEmail = normalizeEmail(pendingProfile.email)
  const userEmail = normalizeEmail(user.email)
  const profileEmail = normalizeEmail(profile.email)

  if (!pendingEmail || ![userEmail, profileEmail].includes(pendingEmail)) {
    return
  }

  if (pendingProfile.role && profile.role !== pendingProfile.role) {
    return
  }

  if (
    overrides.role &&
    pendingProfile.role &&
    overrides.role !== pendingProfile.role
  ) {
    return
  }

  clearPendingProfileBootstrap()
}

function runAuthTransition<T>(operation: () => Promise<T>) {
  const task = authTransitionQueue.catch(() => undefined).then(operation)

  authTransitionQueue = task.then(
    () => undefined,
    () => undefined
  )

  return task
}

async function waitForAuthState(targetUid: string | null) {
  if ((auth.currentUser?.uid ?? null) === targetUid) {
    return
  }

  await new Promise<void>((resolve, reject) => {
    let isSettled = false
    let unsubscribe = () => {}
    const timeoutId = globalThis.setTimeout(() => {
      if (isSettled) {
        return
      }

      isSettled = true
      unsubscribe()
      reject(new Error("Perubahan status login Firebase melebihi batas waktu."))
    }, AUTH_STATE_TIMEOUT_MS)

    unsubscribe = onAuthStateChanged(
      auth,
      (nextUser) => {
        if (isSettled || (nextUser?.uid ?? null) !== targetUid) {
          return
        }

        isSettled = true
        globalThis.clearTimeout(timeoutId)
        unsubscribe()
        resolve()
      },
      (error) => {
        if (isSettled) {
          return
        }

        isSettled = true
        globalThis.clearTimeout(timeoutId)
        unsubscribe()
        reject(error)
      }
    )
  })
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
  overrides: ProfileOverrides,
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
  overrides: ProfileOverrides = {}
) {
  const resolvedOverrides = resolveProfileOverrides(user, overrides)

  let { response, data } = await requestUserProfile(user, resolvedOverrides)

  if (response.status === 401) {
    ;({
      response,
      data,
    } = await requestUserProfile(user, resolvedOverrides, true))
  }

  if (!response.ok || !data.profile) {
    throw new Error(data.error || "Gagal memastikan profil pengguna.")
  }

  clearPendingProfileBootstrapIfApplied(user, data.profile, resolvedOverrides)

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
  return runAuthTransition(async () => {
    writePendingProfileBootstrap({
      fullName,
      email,
      phone,
      role,
    })

    let hasCreatedUser = false

    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      )

      hasCreatedUser = true

      const user = userCredential.user

      const profile = await ensureUserProfile(user, {
        fullName,
        email,
        phone,
        role,
      })

      if (profile.role !== role) {
        throw new Error(
          `Role profil tidak sesuai. Diharapkan ${role}, tetapi tersimpan ${profile.role}.`
        )
      }

      await signOut(auth)
      await waitForAuthState(null)

      return user
    } catch (error) {
      if (!hasCreatedUser) {
        clearPendingProfileBootstrap()
      }

      throw error
    }
  })
}

/* LOGIN */
export async function loginUser(email: string, password: string) {
  return runAuthTransition(async () => {
    const userCredential = await signInWithEmailAndPassword(
      auth,
      email,
      password
    )

    await waitForAuthState(userCredential.user.uid)

    return userCredential.user
  })
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
  await runAuthTransition(async () => {
    await signOut(auth)
    await waitForAuthState(null)
  })
}

/* LISTENER */
export function subscribeToAuthChanges(callback: (user: User | null) => void) {
  return onAuthStateChanged(auth, callback)
}
