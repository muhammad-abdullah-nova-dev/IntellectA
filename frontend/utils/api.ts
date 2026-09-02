import type { ChatResponse, ImageChatPayload } from "@/types/chat"
import { clearAuth, getAuthHeaders } from "@/lib/auth"

const V2_URL =
  process.env.NEXT_PUBLIC_BACKEND_V2_URL || "http://127.0.0.1:8000"

interface ChatMessage {
  role: "user" | "assistant"
  content: string
}

async function handleAuthError(response: Response): Promise<void> {
  if (response.status === 401 && typeof window !== "undefined") {
    clearAuth()
    window.location.href = "/login"
    throw new Error("Session expired. Please sign in again.")
  }
}

export const chatApi = {
  async sendMessage(
    messages: ChatMessage[],
    signal?: AbortSignal,
    options?: { sessionId?: string }
  ): Promise<ChatResponse> {
    const lastUser = [...messages].reverse().find((m) => m.role === "user")
    if (!lastUser?.content?.trim()) {
      throw new Error("No message to send")
    }

    try {
      const response = await fetch(`${V2_URL}/api/v2/chat`, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify({
          message: lastUser.content,
          session_id: options?.sessionId,
        }),
        signal,
      })

      await handleAuthError(response)

      if (!response.ok) {
        const err = await response.json().catch(() => ({}))
        throw new Error(err.detail || err.error || `HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      return {
        response: data.response,
        message: data.response,
        agent: data.agent,
      }
    } catch (error) {
      if (error instanceof Error && error.name === "AbortError") {
        throw error
      }
      console.error("API Error:", error)
      throw error instanceof Error
        ? error
        : new Error("Failed to send message to backend")
    }
  },

  async sendImageMessage(
    payload: ImageChatPayload,
    signal?: AbortSignal,
    options?: { sessionId?: string }
  ): Promise<ChatResponse> {
    try {
      const response = await fetch(`${V2_URL}/api/v2/chat/image`, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify({
          image: payload.image,
          mimeType: payload.mimeType,
          text: payload.text,
          session_id: options?.sessionId,
        }),
        signal,
      })

      await handleAuthError(response)

      if (!response.ok) {
        const err = await response.json().catch(() => ({}))
        throw new Error(err.detail || err.error || `HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      return {
        response: data.response,
        message: data.response,
        agent: data.agent,
        image_summary: data.metadata?.image_summary,
        reason: data.metadata?.reason,
      }
    } catch (error) {
      if (error instanceof Error && error.name === "AbortError") {
        throw error
      }
      console.error("Image API Error:", error)
      throw error instanceof Error
        ? error
        : new Error("Failed to send image to backend")
    }
  },
}
