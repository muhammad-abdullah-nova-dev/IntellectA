import type { AuthResponse } from "@/types/auth"
import { clearAuth, getAuthHeaders, saveAuth } from "@/lib/auth"

const V2_URL =
  process.env.NEXT_PUBLIC_BACKEND_V2_URL || "http://127.0.0.1:8000"

async function parseAuthResponse(response: Response): Promise<AuthResponse> {
  const data = await response.json().catch(() => ({}))
  if (!response.ok) {
    throw new Error(data.detail || data.error || "Authentication failed")
  }
  return data
}

export const authApi = {
  async register(email: string, password: string, name?: string) {
    const response = await fetch(`${V2_URL}/api/v2/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password, name }),
    })
    const data = await parseAuthResponse(response)
    if (data.token && data.user) {
      saveAuth(data.token, data.user)
    }
    return data
  },

  async login(email: string, password: string) {
    const response = await fetch(`${V2_URL}/api/v2/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    })
    const data = await parseAuthResponse(response)
    if (data.token && data.user) {
      saveAuth(data.token, data.user)
    }
    return data
  },

  async loginWithGoogle(idToken: string) {
    const response = await fetch(`${V2_URL}/api/v2/auth/google`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id_token: idToken }),
    })
    const data = await parseAuthResponse(response)
    if (data.token && data.user) {
      saveAuth(data.token, data.user)
    }
    return data
  },

  async me() {
    const response = await fetch(`${V2_URL}/api/v2/auth/me`, {
      headers: getAuthHeaders(),
    })
    return parseAuthResponse(response)
  },

  logout() {
    clearAuth()
  },
}
