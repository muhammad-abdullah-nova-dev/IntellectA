import type { AuthUser } from "@/types/auth"

const TOKEN_KEY = "intellecta-token"
const USER_KEY = "intellecta-user"
const LEGACY_TOKEN_KEY = "ai-tutor-token"
const LEGACY_USER_KEY = "ai-tutor-user"

function migrateLegacyItem(newKey: string, legacyKey: string): void {
  if (typeof window === "undefined") return
  if (!localStorage.getItem(newKey)) {
    const legacy = localStorage.getItem(legacyKey)
    if (legacy) localStorage.setItem(newKey, legacy)
  }
}

export function getStoredToken(): string | null {
  if (typeof window === "undefined") return null
  migrateLegacyItem(TOKEN_KEY, LEGACY_TOKEN_KEY)
  return localStorage.getItem(TOKEN_KEY)
}

export function getStoredUser(): AuthUser | null {
  if (typeof window === "undefined") return null
  migrateLegacyItem(USER_KEY, LEGACY_USER_KEY)
  const raw = localStorage.getItem(USER_KEY)
  if (!raw) return null
  try {
    return JSON.parse(raw) as AuthUser
  } catch {
    return null
  }
}

export function saveAuth(token: string, user: AuthUser): void {
  localStorage.setItem(TOKEN_KEY, token)
  localStorage.setItem(USER_KEY, JSON.stringify(user))
}

export function clearAuth(): void {
  localStorage.removeItem(TOKEN_KEY)
  localStorage.removeItem(USER_KEY)
}

export function isAuthenticated(): boolean {
  return Boolean(getStoredToken())
}

export function getAuthHeaders(): HeadersInit {
  const token = getStoredToken()
  const headers: HeadersInit = {
    "Content-Type": "application/json",
  }
  if (token) {
    headers.Authorization = `Bearer ${token}`
  }
  return headers
}

export function chatsStorageKey(userId?: string | number): string {
  return userId ? `intellecta-chats-${userId}` : "intellecta-chats"
}

export function migrateLegacyChatsKey(userId?: string | number): void {
  if (typeof window === "undefined" || !userId) return
  migrateLegacyItem(`intellecta-chats-${userId}`, `ai-tutor-chats-${userId}`)
}

export const SIDEBAR_WIDTH_KEY = "intellecta-sidebar-width"
export const LEGACY_SIDEBAR_WIDTH_KEY = "ai-tutor-sidebar-width"
