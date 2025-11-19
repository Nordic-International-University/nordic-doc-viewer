import Cookie from "js-cookie";
export const API_BASE_URL = "https://present-api.nordicuniversity.org/";

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
}

export interface FileData {
  id: string;
  filename: string;
  originalName?: string;
  size?: number;
  mimeType?: string;
  userId?: string;
  createdAt: string;
  updatedAt?: string;
  downloadUrl?: string;
  fileUrl: string;
  fileType: string;
  uploadedBy: string;
  deletedAt?: string | null;
}

export interface PaginationData {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface FilesResponse {
  files: FileData[];
  pagination: PaginationData;
}

export interface UserProfile {
  id: string;
  fullname: string;
  username: string;
  isActive: boolean;
  isAdmin: boolean;
  telegramId: string;
  avatarUrl: string | null;
}

export interface UsersResponse {
  count: number;
  pageNumber: number;
  pageSize: number;
  pageCount: number;
  data: UserProfile[];
}

export interface WOPIEditorResponse {
  wopiSrc: string;
  accessToken: string;
  fileId: string;
  actionType?: string;
}

class ApiClient {
  private getAuthHeaders(): HeadersInit {
    const token = Cookie.get("auth_token");
    return {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` }),
    };
  }

  async authenticateWithTelegram(code: string): Promise<ApiResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/telegram`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: code.trim() }),
      });

      if (response.ok) {
        const data = await response.json();
        return { success: true, data };
      } else {
        return { success: false, error: "Noto'g'ri kod" };
      }
    } catch (error) {
      return { success: false, error: "Tarmoq xatosi" };
    }
  }

  async getFiles(params?: {
    page?: number;
    limit?: number;
    search?: string;
    sortBy?: "createdAt" | "updatedAt" | "filename" | "size";
    sortOrder?: "asc" | "desc";
  }): Promise<ApiResponse<FilesResponse>> {
    try {
      const queryParams = new URLSearchParams();
      if (params?.page) queryParams.append("page", params.page.toString());
      if (params?.limit) queryParams.append("limit", params.limit.toString());
      if (params?.search) queryParams.append("search", params.search);
      if (params?.sortBy) queryParams.append("sortBy", params.sortBy);
      if (params?.sortOrder) queryParams.append("sortOrder", params.sortOrder);

      const url = `${API_BASE_URL}api/files${queryParams.toString() ? `?${queryParams.toString()}` : ""}`;

      const response = await fetch(url, {
        headers: this.getAuthHeaders(),
      });

      if (response.ok) {
        const rawData = await response.json();

        // Проверяем, какая структура пришла
        let data: FilesResponse;

        if (Array.isArray(rawData)) {
          // Если пришел массив напрямую
          data = {
            files: rawData,
            pagination: {
              currentPage: params?.page || 1,
              totalPages: 1,
              totalItems: rawData.length,
              hasNext: false,
              hasPrev: false,
            },
          };
        } else if (rawData.files && Array.isArray(rawData.files)) {
          // Если структура правильная
          data = rawData;
        } else {
          // Неизвестная структура
          return { success: false, error: "Noto'g'ri ma'lumot formati" };
        }

        return { success: true, data };
      } else {
        return { success: false, error: "Fayllarni yuklashda xatolik" };
      }
    } catch (error) {
      return { success: false, error: "Tarmoq xatosi" };
    }
  }

  async getFile(id: string): Promise<ApiResponse<FileData>> {
    try {
      const response = await fetch(`${API_BASE_URL}/files/${id}`, {
        headers: this.getAuthHeaders(),
      });

      if (response.ok) {
        const data = await response.json();
        return { success: true, data };
      } else {
        return { success: false, error: "Fayl topilmadi" };
      }
    } catch (error) {
      return { success: false, error: "Tarmoq xatosi" };
    }
  }

  async uploadFile(file: File): Promise<ApiResponse> {
    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch(`${API_BASE_URL}api/files/upload`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${Cookie.get("auth_token")}`,
        },
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        return { success: true, data };
      } else {
        return { success: false, error: "Fayl yuklashda xatolik" };
      }
    } catch (error) {
      return { success: false, error: "Tarmoq xatosi" };
    }
  }

  async getUserProfile(): Promise<ApiResponse<UserProfile>> {
    try {
      const response = await fetch(`${API_BASE_URL}api/auth/profile`, {
        headers: this.getAuthHeaders(),
      });

      if (response.ok) {
        const data = await response.json();
        return { success: true, data };
      } else {
        return {
          success: false,
          error: "Profil ma'lumotlarini yuklashda xatolik",
        };
      }
    } catch (error) {
      return { success: false, error: "Tarmoq xatosi" };
    }
  }

  async getAllUsers(params?: {
    pageNumber?: number;
    pageSize?: number;
    search?: string;
  }): Promise<ApiResponse<UsersResponse>> {
    try {
      const queryParams = new URLSearchParams();
      if (params?.pageNumber)
        queryParams.append("pageNumber", params.pageNumber.toString());
      if (params?.pageSize)
        queryParams.append("pageSize", params.pageSize.toString());
      if (params?.search) queryParams.append("search", params.search);

      const url = `${API_BASE_URL}api/user/all${queryParams.toString() ? `?${queryParams.toString()}` : ""}`;
      const response = await fetch(url, {
        headers: this.getAuthHeaders(),
      });

      if (response.ok) {
        const data = await response.json();
        return { success: true, data };
      } else {
        return {
          success: false,
          error: "Foydalanuvchilarni yuklashda xatolik",
        };
      }
    } catch (error) {
      return { success: false, error: "Tarmoq xatosi" };
    }
  }

  async updateUser(
    id: string,
    userData: {
      fullname?: string;
      username?: string;
      isActive?: boolean;
      isAdmin?: boolean;
      avatarUrl?: string | null;
    },
  ): Promise<ApiResponse<UserProfile>> {
    try {
      const response = await fetch(`${API_BASE_URL}api/user/${id}`, {
        method: "PATCH",
        headers: this.getAuthHeaders(),
        body: JSON.stringify(userData),
      });

      if (response.ok) {
        const data = await response.json();
        return { success: true, data };
      } else {
        return { success: false, error: "Foydalanuvchini yangilashda xatolik" };
      }
    } catch (error) {
      return { success: false, error: "Tarmoq xatosi" };
    }
  }

  async getWOPIEditorUrl(
    fileId: string,
  ): Promise<ApiResponse<WOPIEditorResponse>> {
    try {
      const url = `${API_BASE_URL}api/wopi/editor/${fileId}`;

      const response = await fetch(url, {
        headers: this.getAuthHeaders(),
      });

      if (response.ok) {
        const data = await response.json();
        return { success: true, data };
      } else {
        return {
          success: false,
          error: `Muharrir URL ni olishda xatolik (Status: ${response.status})`,
        };
      }
    } catch (error) {
      return { success: false, error: "Tarmoq xatosi" };
    }
  }
}

export const apiClient = new ApiClient();
