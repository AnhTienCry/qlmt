export interface User {
  UserId: number
  Username: string
  PasswordHash: string
  Role: 'admin' | 'user'
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
    role: 'admin' | 'user'
  }
  token: string
}
