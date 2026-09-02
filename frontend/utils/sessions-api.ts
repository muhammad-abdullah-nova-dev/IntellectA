import { getAuthHeaders } from "@/lib/auth"
import type { Chat, Message } from "@/types/chat"

const V2_URL =
  process.env.NEXT_PUBLIC_BACKEND_V2_URL || "http://127.0.0.1:8000"

export interface SessionSummary {
  id: string
  title: string | null
  subject: string | null
  status: string
  message_count: number
  created_at: string
  updated_at: string
}

export interface ServerMessage {
  id: string
  role: "user" | "assistant" | "system"
  content: string
  agent?: string | null
  intent?: string | null
  metadata?: Record<string, unknown>
  created_at: string
}

function toClientMessage(m: ServerMessage): Message {
  return {
    id: m.id,
    role: m.role === "assistant" ? "assistant" : "user",
    content: m.content,
    timestamp: new Date(m.created_at),
    agent: m.agent ?? undefined,
  }
}

export const sessionsApi = {
  async listSessions(): Promise<SessionSummary[]> {
    const res = await fetch(`${V2_URL}/api/v2/sessions`, {
      headers: getAuthHeaders(),
    })
    if (!res.ok) {
      throw new Error("Failed to load chat history")
    }
    return res.json()
  },

  async getSessionMessages(sessionId: string): Promise<Message[]> {
    const res = await fetch(
      `${V2_URL}/api/v2/sessions/${sessionId}/messages`,
      { headers: getAuthHeaders() }
    )
    if (!res.ok) {
      throw new Error("Failed to load messages")
    }
    const data = await res.json()
    return (data.messages as ServerMessage[]).map(toClientMessage)
  },

  async deleteSession(sessionId: string): Promise<void> {
    const res = await fetch(`${V2_URL}/api/v2/sessions/${sessionId}`, {
      method: "DELETE",
      headers: getAuthHeaders(),
    })
    if (!res.ok && res.status !== 404) {
      throw new Error("Failed to delete chat")
    }
  },

  summaryToChat(summary: SessionSummary, messages: Message[] = []): Chat {
    return {
      id: summary.id,
      title: summary.title || "New conversation",
      messages,
      createdAt: new Date(summary.created_at),
      updatedAt: new Date(summary.updated_at),
    }
  },
}
