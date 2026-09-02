export interface Message {
  id: string
  role: "user" | "assistant"
  content: string
  timestamp: Date
  imageUrl?: string
  agent?: string
}

export interface Chat {
  id: string
  title: string
  messages: Message[]
  createdAt: Date
  updatedAt: Date
  pinned?: boolean
}

export interface ChatResponse {
  message?: string
  response?: string
  error?: string
  agent?: string
  reason?: string
  image_summary?: string
}

export interface ImageChatPayload {
  image: string
  mimeType: string
  text?: string
}
