import api from '@/libs/axios'
import { LoginRequest, RegisterRequest, LoginResponse, ChangePasswordRequest, CreateUserRequest, UpdateUserRequest, AdminUser } from '@/types/auth.types'
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

  changePassword: async (data: ChangePasswordRequest) => {
    const response = await api.post<ApiResponse<void>>('/auth/change-password', data)
    return response.data
  },

  // Admin: User management
  getAllUsers: async () => {
    const response = await api.get<ApiResponse<AdminUser[]>>('/auth/users')
    return response.data.data!
  },

  getUserById: async (id: number) => {
    const response = await api.get<ApiResponse<AdminUser>>(`/auth/users/${id}`)
    return response.data.data!
  },

  createUser: async (data: CreateUserRequest) => {
    const response = await api.post<ApiResponse<AdminUser>>('/auth/users', data)
    return response.data.data!
  },

  updateUser: async (id: number, data: UpdateUserRequest) => {
    const response = await api.put<ApiResponse<AdminUser>>(`/auth/users/${id}`, data)
    return response.data.data!
  },

  resetPassword: async (id: number, newPassword: string) => {
    const response = await api.post<ApiResponse<void>>(`/auth/users/${id}/reset-password`, { newPassword })
    return response.data
  },

  deleteUser: async (id: number) => {
    const response = await api.delete<ApiResponse<void>>(`/auth/users/${id}`)
    return response.data
  },
}
