export interface User {
  userId: number
  username: string
  role: 'admin' | 'user'
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
