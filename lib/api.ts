export const API_BASE_URL = "https://present-api.nordicuniversity.org/"

export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  error?: string
}

export interface FileData {
  id: string
  name: string
  type: string
  size: number
  created_at: string
  url: string
}

class ApiClient {
  private getAuthHeaders(): HeadersInit {
    const token = localStorage.getItem("auth_token")
    return {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` }),
    }
  }

  async authenticateWithTelegram(code: string): Promise<ApiResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/telegram`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: code.trim() }),
      })

      if (response.ok) {
        const data = await response.json()
        return { success: true, data }
      } else {
        return { success: false, error: "Noto'g'ri kod" }
      }
    } catch (error) {
      return { success: false, error: "Tarmoq xatosi" }
    }
  }

  async getFiles(): Promise<ApiResponse<FileData[]>> {
    try {
      const response = await fetch(`${API_BASE_URL}/files`, {
        headers: this.getAuthHeaders(),
      })

      if (response.ok) {
        const data = await response.json()
        return { success: true, data: data.files || [] }
      } else {
        return { success: false, error: "Fayllarni yuklashda xatolik" }
      }
    } catch (error) {
      return { success: false, error: "Tarmoq xatosi" }
    }
  }

  async getFile(id: string): Promise<ApiResponse<FileData>> {
    try {
      const response = await fetch(`${API_BASE_URL}/files/${id}`, {
        headers: this.getAuthHeaders(),
      })

      if (response.ok) {
        const data = await response.json()
        return { success: true, data }
      } else {
        return { success: false, error: "Fayl topilmadi" }
      }
    } catch (error) {
      return { success: false, error: "Tarmoq xatosi" }
    }
  }

  async uploadFile(file: File): Promise<ApiResponse> {
    try {
      const formData = new FormData()
      formData.append("file", file)

      const response = await fetch(`${API_BASE_URL}/files/upload`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("auth_token")}`,
        },
        body: formData,
      })

      if (response.ok) {
        const data = await response.json()
        return { success: true, data }
      } else {
        return { success: false, error: "Fayl yuklashda xatolik" }
      }
    } catch (error) {
      return { success: false, error: "Tarmoq xatosi" }
    }
  }
}

export const apiClient = new ApiClient()
