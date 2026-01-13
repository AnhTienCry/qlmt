import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { AUTH_TOKEN_KEY, AUTH_USER_KEY } from '@/constants'
import { User } from '@/types/auth.types'
import { authApi } from '@/libs/auth'

interface AuthContextType {
  user: User | null
  loading: boolean
  isAuthenticated: boolean
  login: (user: User, token: string) => void
  logout: () => Promise<void>
  refreshUser: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | null>(null)

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  const refreshUser = async () => {
    const token = localStorage.getItem(AUTH_TOKEN_KEY)
    if (!token) {
      setUser(null)
      return
    }

    try {
      const freshUser = await authApi.getMe()
      localStorage.setItem(AUTH_USER_KEY, JSON.stringify(freshUser))
      setUser(freshUser)
    } catch (error) {
      console.error('Auth refresh error:', error)
      localStorage.removeItem(AUTH_TOKEN_KEY)
      localStorage.removeItem(AUTH_USER_KEY)
      setUser(null)
    }
  }

  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem(AUTH_TOKEN_KEY)

      if (token) {
        // LUÔN fetch user mới từ server để đảm bảo role đúng
        try {
          const freshUser = await authApi.getMe()
          localStorage.setItem(AUTH_USER_KEY, JSON.stringify(freshUser))
          setUser(freshUser)
        } catch (error) {
          console.error('Auth verify error:', error)
          localStorage.removeItem(AUTH_TOKEN_KEY)
          localStorage.removeItem(AUTH_USER_KEY)
          setUser(null)
        }
      }
      setLoading(false)
    }

    initAuth()
  }, [])

  const login = (user: User, token: string) => {
    localStorage.setItem(AUTH_TOKEN_KEY, token)
    localStorage.setItem(AUTH_USER_KEY, JSON.stringify(user))
    setUser(user)
  }

  const logout = async () => {
    try {
      await authApi.logout()
    } catch (error) {
      console.error('Logout error:', error)
    } finally {
      localStorage.removeItem(AUTH_TOKEN_KEY)
      localStorage.removeItem(AUTH_USER_KEY)
      setUser(null)
    }
  }

  return (
    <AuthContext.Provider value={{
      user,
      loading,
      isAuthenticated: !!user,
      login,
      logout,
      refreshUser
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}
