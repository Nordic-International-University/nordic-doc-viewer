export interface User {
  id: string
  first_name: string
  last_name?: string
  username?: string
  photo_url?: string
  language_code?: string
}

export interface AuthResponse {
  token: string
  user: User
}

export const isAuthenticated = (): boolean => {
  if (typeof window === "undefined") return false
  return !!localStorage.getItem("auth_token")
}

export const getAuthToken = (): string | null => {
  if (typeof window === "undefined") return null
  return localStorage.getItem("auth_token")
}

export const getUserInfo = (): User | null => {
  if (typeof window === "undefined") return null
  const userInfo = localStorage.getItem("user_info")
  return userInfo ? JSON.parse(userInfo) : null
}

export const logout = (): void => {
  if (typeof window === "undefined") return
  localStorage.removeItem("auth_token")
  localStorage.removeItem("user_info")
}
