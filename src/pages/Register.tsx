import React, { useState, useEffect } from 'react'
import type { KeyboardEvent } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { Mail, Lock, User, Eye, EyeOff, ArrowRight, Users } from 'lucide-react'
import { useAuth } from '../context/authContext'

interface RegisterFormState {
  name: string
  email: string
  password: string
  showPassword: boolean
  error: string
  loading: boolean
}

const Register: React.FC = () => {
  const [formState, setFormState] = useState<RegisterFormState>({
    name: '',
    email: '',
    password: '',
    showPassword: false,
    error: '',
    loading: false,
  })

  const { register, user, token } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const invitationId = location.state?.invitationId
  const returnTo = location.state?.returnTo
  const prefilledEmail = location.state?.email

  const updateFormState = (updates: Partial<RegisterFormState>): void => {
    setFormState((prev) => ({ ...prev, ...updates }))
  }

  useEffect(() => {
    if (prefilledEmail) {
      updateFormState({ email: prefilledEmail })
    }
  }, [prefilledEmail])

  useEffect(() => {
    if (user && token && invitationId) {
      navigate(`/invitation/${invitationId}`)
    } else if (user && token) {
      navigate(returnTo || '/')
    }
  }, [user, token, invitationId, returnTo, navigate])

  const handleSubmit = async (): Promise<void> => {
    if (!formState.name || !formState.email || !formState.password) {
      updateFormState({ error: 'Please fill in all fields' })
      return
    }

    if (formState.password.length < 8) {
      updateFormState({ error: 'Password must be at least 8 characters long' })
      return
    }

    updateFormState({ error: '', loading: true })

    try {
      const result = await register(
        formState.name,
        formState.email,
        formState.password,
        invitationId
      )

      if (
        result.success &&
        result.invitationAccepted &&
        result.workspaceNumber
      ) {
        navigate(`/${result.workspaceNumber}`)
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Registration failed'

      if (
        errorMessage.includes('User with this email already exists') ||
        errorMessage.includes('already exists')
      ) {
        navigate('/login', {
          state: {
            returnTo: invitationId ? `/invitation/${invitationId}` : returnTo,
            invitationId,
            email: formState.email,
            message:
              'Account already exists. Please sign in to accept the invitation.',
          },
        })
        return
      }

      updateFormState({ error: errorMessage })
    } finally {
      updateFormState({ loading: false })
    }
  }

  const handleKeyPress = (e: KeyboardEvent<HTMLInputElement>): void => {
    if (e.key === 'Enter') {
      handleSubmit()
    }
  }

  const togglePasswordVisibility = (): void => {
    updateFormState({ showPassword: !formState.showPassword })
  }

  return (
    <div className="min-h-screen bg-white relative overflow-hidden">
      <div className="absolute inset-0">
        <div
          className="absolute inset-0 bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600"
          style={{ clipPath: 'polygon(0 80%, 100% 50%, 100% 100%, 0% 100%)' }}
        >
          <div className="absolute top-1/2 left-0 w-72 h-72 bg-white bg-opacity-10 rounded-full -translate-x-32"></div>
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-white bg-opacity-10 rounded-full translate-x-48 translate-y-32"></div>
        </div>
      </div>

      <div className="relative z-10 min-h-screen flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-2xl shadow-2xl p-8 border border-gray-100">
            <div className="text-center mb-8">
              <h1 className="text-4xl font-bold text-gray-800 mb-2">
                {invitationId ? 'Join Workspace' : 'Create Account'}
              </h1>
              {invitationId && (
                <p className="text-gray-600 text-sm">
                  Create your account to join the workspace
                </p>
              )}
            </div>

            {formState.error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
                {formState.error}
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label
                  htmlFor="name"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Name
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    id="name"
                    type="text"
                    value={formState.name}
                    onChange={(e) => updateFormState({ name: e.target.value })}
                    onKeyPress={handleKeyPress}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all duration-200"
                    placeholder="Enter your name"
                    disabled={formState.loading}
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Email
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    id="email"
                    type="email"
                    value={formState.email}
                    onChange={(e) => updateFormState({ email: e.target.value })}
                    onKeyPress={handleKeyPress}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all duration-200"
                    placeholder="Enter your email"
                    disabled={formState.loading || !!prefilledEmail}
                  />
                </div>
                {prefilledEmail && (
                  <p className="text-xs text-gray-500 mt-1">
                    Email pre-filled from invitation
                  </p>
                )}
              </div>

              <div>
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    id="password"
                    type={formState.showPassword ? 'text' : 'password'}
                    value={formState.password}
                    onChange={(e) =>
                      updateFormState({ password: e.target.value })
                    }
                    onKeyPress={handleKeyPress}
                    className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all duration-200"
                    placeholder="Create a password"
                    disabled={formState.loading}
                  />
                  <button
                    type="button"
                    onClick={togglePasswordVisibility}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                    disabled={formState.loading}
                  >
                    {formState.showPassword ? (
                      <EyeOff className="w-5 h-5" />
                    ) : (
                      <Eye className="w-5 h-5" />
                    )}
                  </button>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Must be at least 8 characters long
                </p>
              </div>

              <button
                type="button"
                onClick={handleSubmit}
                disabled={formState.loading}
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 px-4 rounded-lg hover:from-blue-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center space-x-2 group"
              >
                {formState.loading ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <>
                    {invitationId ? (
                      <>
                        <Users className="w-5 h-5" />
                        <span>Create Account & Join Workspace</span>
                      </>
                    ) : (
                      <>
                        <span>Create Account</span>
                        <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                      </>
                    )}
                  </>
                )}
              </button>
            </div>

            <div className="mt-8 text-center">
              <p className="text-gray-600">
                Already have an account?{' '}
                <button
                  type="button"
                  onClick={() => {
                    navigate('/login', {
                      state: { returnTo, invitationId, email: prefilledEmail },
                    })
                  }}
                  className="text-purple-600 hover:text-purple-800 font-medium transition-colors cursor-pointer"
                >
                  Sign in
                </button>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Register
