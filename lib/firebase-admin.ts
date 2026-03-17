import "server-only"

import fs from "fs"
import path from "path"
import {
  cert,
  getApps,
  initializeApp,
  type ServiceAccount,
} from "firebase-admin/app"
import { getAuth } from "firebase-admin/auth"
import { getFirestore } from "firebase-admin/firestore"

function loadServiceAccount() {
  const serviceAccountPath =
    process.env.FIREBASE_ADMINSDK_PATH ||
    path.join(process.cwd(), "firebase-adminsdk.json")

  if (!fs.existsSync(serviceAccountPath)) {
    throw new Error(
      `Firebase Admin service account not found at ${serviceAccountPath}.`
    )
  }

  return JSON.parse(
    fs.readFileSync(serviceAccountPath, "utf8")
  ) as ServiceAccount
}

const adminApp =
  getApps()[0] ||
  initializeApp({
    credential: cert(loadServiceAccount()),
  })

export const adminDb = getFirestore(adminApp)
export const adminAuth = getAuth(adminApp)
