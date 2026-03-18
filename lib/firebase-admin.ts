import "server-only"

import fs from "fs"
import path from "path"
import {
  cert,
  getApps,
  initializeApp,
  type App,
  type ServiceAccount,
} from "firebase-admin/app"
import { getAuth } from "firebase-admin/auth"
import { getFirestore } from "firebase-admin/firestore"

type ServiceAccountInput = ServiceAccount & {
  project_id?: string
  client_email?: string
  private_key?: string
}

function normalizeServiceAccount(account: ServiceAccountInput) {
  const projectId = account.projectId || account.project_id
  const clientEmail = account.clientEmail || account.client_email
  const privateKey = (account.privateKey || account.private_key || "").replace(
    /\\n/g,
    "\n"
  )

  if (!projectId || !clientEmail || !privateKey.trim()) {
    throw new Error(
      "Firebase Admin service account is missing project ID, client email, or private key."
    )
  }

  return {
    ...account,
    projectId,
    clientEmail,
    privateKey,
  } as ServiceAccount
}

function parseServiceAccount(rawValue: string, source: string) {
  try {
    return normalizeServiceAccount(JSON.parse(rawValue) as ServiceAccountInput)
  } catch (error) {
    throw new Error(
      `Firebase Admin service account from ${source} is not valid JSON.`,
      { cause: error }
    )
  }
}

function loadServiceAccountFromEnv() {
  const encodedJson = process.env.FIREBASE_ADMINSDK_JSON_BASE64?.trim()

  if (encodedJson) {
    return parseServiceAccount(
      Buffer.from(encodedJson, "base64").toString("utf8"),
      "FIREBASE_ADMINSDK_JSON_BASE64"
    )
  }

  const inlineJson = process.env.FIREBASE_ADMINSDK_JSON?.trim()

  if (inlineJson) {
    return parseServiceAccount(inlineJson, "FIREBASE_ADMINSDK_JSON")
  }

  const projectId =
    process.env.FIREBASE_PROJECT_ID?.trim() ||
    process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID?.trim()
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL?.trim()
  const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n")

  if (projectId && clientEmail && privateKey?.trim()) {
    return normalizeServiceAccount({
      projectId,
      clientEmail,
      privateKey,
    })
  }

  return null
}

function loadServiceAccountFromFile() {
  const serviceAccountPath =
    process.env.FIREBASE_ADMINSDK_PATH ||
    path.join(process.cwd(), "firebase-adminsdk.json")

  if (!fs.existsSync(serviceAccountPath)) {
    throw new Error(
      `Firebase Admin service account not found at ${serviceAccountPath}.`
    )
  }

  return parseServiceAccount(
    fs.readFileSync(serviceAccountPath, "utf8"),
    serviceAccountPath
  )
}

function loadServiceAccount() {
  return loadServiceAccountFromEnv() || loadServiceAccountFromFile()
}

let adminApp: App | null = null

function getAdminApp() {
  if (adminApp) {
    return adminApp
  }

  adminApp =
    getApps()[0] ||
    initializeApp({
      credential: cert(loadServiceAccount()),
    })

  return adminApp
}

export function getAdminDb() {
  return getFirestore(getAdminApp())
}

export function getAdminAuth() {
  return getAuth(getAdminApp())
}
