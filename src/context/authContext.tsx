import React, { createContext, useContext, useEffect, useState } from 'react'
import type { ReactNode } from 'react'
import axios from 'axios'

export interface User {
  id: string
  name: string
  email: string
  createdAt?: Date
  updatedAt?: Date
}

export interface AuthContextType {
  user: User | null
  token: string | null
  login: (
    email: string,
    password: string,
    invitationId?: string
  ) => Promise<LoginResult>
  register: (
    name: string,
    email: string,
    password: string,
    invitationId?: string
  ) => Promise<RegisterResult>
  logout: () => void
  loading: boolean
}

export interface LoginResult {
  success: boolean
  workspace?: any
  invitationAccepted?: boolean
  workspaceNumber?: string
}

export interface RegisterResult {
  success: boolean
  workspace?: any
  invitationAccepted?: boolean
  workspaceNumber?: string
}

interface AuthProviderProps {
  children: ReactNode
}

interface ApiResponse {
  success: boolean
  token: string
  user: User
  workspace?: any
  invitationAccepted?: boolean
  workspaceNumber?: string
  message?: string
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

// Custom hook to use auth context
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [loading, setLoading] = useState<boolean>(true)

  // Check for existing token on app load
  useEffect(() => {
    const storedToken = localStorage.getItem('auth_token')
    if (storedToken) {
      setToken(storedToken)
      fetchProfile(storedToken)
    } else {
      setLoading(false)
    }
  }, [])

  // Login function
  const login = async (
    email: string,
    password: string,
    invitationId?: string
  ): Promise<LoginResult> => {
    try {
      const payload: any = { email, password }
      if (invitationId) payload.invitationId = invitationId

      const response = await axios.post(
        `${import.meta.env.VITE_APP_BASE_URL}/api/auth/login`,
        payload,
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      )

      const data: ApiResponse = response.data

      if (data) {
        localStorage.setItem('auth_token', data.token)
        setToken(data.token)
        setUser(data.user)
        return {
          success: true,
          workspace: data.workspace,
          invitationAccepted: data.invitationAccepted,
          workspaceNumber: data.workspaceNumber || data.workspace?.number,
        }
      } else {
        throw new Error('Login failed')
      }
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const errorMessage = error.response?.data?.error || error.message
        throw new Error(errorMessage)
      }
      throw error
    }
  }

  // Register function
  const register = async (
    name: string,
    email: string,
    password: string,
    invitationId?: string
  ): Promise<RegisterResult> => {
    try {
      const payload: any = { name, email, password }
      if (invitationId) payload.invitationId = invitationId

      const response = await axios.post(
        `${import.meta.env.VITE_APP_BASE_URL}/api/auth/register`,
        payload,
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      )

      const data: ApiResponse = response.data

      if (data) {
        localStorage.setItem('auth_token', data.token)
        setToken(data.token)
        setUser(data.user)
        return {
          success: true,
          workspace: data.workspace,
          invitationAccepted: data.invitationAccepted,
          workspaceNumber: data.workspaceNumber || data.workspace?.number,
        }
      } else {
        throw new Error('Registration failed')
      }
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const errorMessage = error.response?.data?.error || error.message
        throw new Error(errorMessage)
      }
      throw error
    }
  }

  // Logout function
  const logout = (): void => {
    localStorage.removeItem('auth_token')
    setToken(null)
    setUser(null)
  }

  const fetchProfile = async (authToken: string): Promise<void> => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_APP_BASE_URL}/api/user/profile`,
        {
          headers: {
            Authorization: `Bearer ${authToken}`,
            'Content-Type': 'application/json',
          },
        }
      )

      if (response.data && response.data.user) {
        setUser(response.data.user)
      }
    } catch (error) {
      console.error('Profile fetch error:', error)
      localStorage.removeItem('auth_token')
      setToken(null)
      setUser(null)
    } finally {
      setLoading(false)
    }
  }

  // Context value
  const value: AuthContextType = {
    user,
    token,
    login,
    register,
    logout,
    loading,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
