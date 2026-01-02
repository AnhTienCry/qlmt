// Role types
export type UserRole = 'admin' | 'it' | 'director' | 'user'

// User type for authentication (returned from login/register)
export interface User {
  userId: number
  username: string
  role: UserRole
  maNV?: number | null
  tenNV?: string | null
  maPB?: number | null
  tenPB?: string | null
}

// Admin User type (returned from admin API - /auth/users)
export interface AdminUser {
  UserId: number
  Username: string
  Role: UserRole
  MaNV: number | null
  IsActive: boolean
  LastLogin: string | null
  NgayTao: string
  NgayCapNhat?: string
}

export interface AuthState {
  user: User | null
  token: string | null
  isAuthenticated: boolean
}

export interface LoginRequest {
  username: string
  password: string
}

export interface RegisterRequest {
  username: string
  password: string
  confirmPassword: string
}

export interface LoginResponse {
  user: User
  token: string
}

export interface ChangePasswordRequest {
  currentPassword: string
  newPassword: string
  confirmNewPassword: string
}

export interface CreateUserRequest {
  username: string
  password: string
  role: UserRole
  maNV?: number
}

export interface UpdateUserRequest {
  role?: UserRole
  maNV?: number
  isActive?: boolean
}
