import { useState, useEffect } from 'react'
import { AUTH_TOKEN_KEY, AUTH_USER_KEY } from '@/constants'
import { User } from '@/types/auth.types'
import { authApi } from '@/libs/auth'

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem(AUTH_TOKEN_KEY)
    const savedUser = localStorage.getItem(AUTH_USER_KEY)

    if (token && savedUser) {
      setUser(JSON.parse(savedUser))
    }
    setLoading(false)
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

  return {
    user,
    loading,
    isAuthenticated: !!user,
    login,
    logout,
  }
}
