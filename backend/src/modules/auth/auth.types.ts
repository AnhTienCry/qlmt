// Role types
export type UserRole = 'admin' | 'it' | 'director' | 'user'

export interface User {
  UserId: number
  Username: string
  PasswordHash: string
  Role: UserRole
  MaNV: number | null
  IsActive: boolean
  LastLogin: string | null
  NgayTao: string
  NgayCapNhat: string
}

export interface LoginRequest {
  username: string
  password: string
}

export interface RegisterRequest {
  username: string
  password: string
  confirmPassword: string
  email?: string
  fullName?: string
}

export interface LoginResponse {
  user: {
    userId: number
    username: string
    role: UserRole
    maNV?: number | null
    tenNV?: string | null
    maPB?: number | null
    tenPB?: string | null
  }
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
