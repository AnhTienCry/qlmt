import api from '@/libs/axios'
import { LoginRequest, RegisterRequest, LoginResponse } from '@/types/auth.types'
import { ApiResponse } from '@/types/api.types'

export const authApi = {
  register: async (data: RegisterRequest) => {
    const response = await api.post<ApiResponse<LoginResponse>>('/auth/register', data)
    return response.data.data!
  },

  login: async (data: LoginRequest) => {
    const response = await api.post<ApiResponse<LoginResponse>>('/auth/login', data)
    return response.data.data!
  },

  logout: async () => {
    await api.post('/auth/logout')
  },

  getMe: async () => {
    const response = await api.get<ApiResponse<{ userId: number; role: string }>>('/auth/me')
    return response.data.data!
  },
}
