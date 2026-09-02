export interface AuthUser {
  id: string
  email: string
  name: string
  avatar_url?: string
}

export interface AuthResponse {
  token?: string
  user?: AuthUser
  error?: string
}
