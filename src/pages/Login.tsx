import React, { useState, useEffect } from 'react'
import type { KeyboardEvent } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { Mail, Lock, Eye, EyeOff, ArrowRight } from 'lucide-react'
import { useAuth } from '../context/authContext'

interface LoginFormState {
  email: string
  password: string
  showPassword: boolean
  error: string
  loading: boolean
}

const Login: React.FC = () => {
  const [formState, setFormState] = useState<LoginFormState>({
    email: '',
    password: '',
    showPassword: false,
    error: '',
    loading: false,
  })

  const { login, user, token } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const invitationId = location.state?.invitationId
  const returnTo = location.state?.returnTo
  const prefilledEmail = location.state?.email
  const redirectMessage = location.state?.message

  const updateFormState = (updates: Partial<LoginFormState>): void => {
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
    if (!formState.email || !formState.password) {
      updateFormState({ error: 'Please fill in all fields' })
      return
    }

    updateFormState({ error: '', loading: true })

    try {
      const result = await login(
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
      const errorMessage = err instanceof Error ? err.message : 'Login failed'
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
          style={{
            clipPath: 'polygon(0 70%, 100% 40%, 100% 100%, 0% 100%)',
          }}
        >
          <div className="absolute top-1/2 left-0 w-48 h-48 sm:w-72 sm:h-72 bg-white bg-opacity-10 rounded-full -translate-x-24 sm:-translate-x-32"></div>
          <div className="absolute bottom-0 right-0 w-64 h-64 sm:w-96 sm:h-96 bg-white bg-opacity-10 rounded-full translate-x-32 translate-y-24 sm:translate-x-48 sm:translate-y-32"></div>
        </div>
      </div>

      <div className="relative z-10 min-h-screen flex items-center justify-center px-3 sm:px-4 py-6 sm:py-8">
        <div className="w-full max-w-sm sm:max-w-md">
          <div className="bg-white rounded-xl sm:rounded-2xl shadow-xl sm:shadow-2xl p-6 sm:p-8 border border-gray-100">
            <div className="text-center mb-6 sm:mb-8">
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-800 mb-2">
                Welcome back!
              </h1>
              {invitationId && (
                <p className="text-gray-600 text-sm sm:text-base mt-2">
                  Sign in to accept your workspace invitation
                </p>
              )}
              {redirectMessage && (
                <div className="mt-3 p-2 sm:p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-xs sm:text-sm text-blue-700">
                    {redirectMessage}
                  </p>
                </div>
              )}
            </div>

            {formState.error && (
              <div className="mb-4 p-2 sm:p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-xs sm:text-sm">
                {formState.error}
              </div>
            )}

            <div className="space-y-3 sm:space-y-4">
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Email
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 sm:w-5 sm:h-5" />
                  <input
                    id="email"
                    type="email"
                    value={formState.email}
                    onChange={(e) => updateFormState({ email: e.target.value })}
                    onKeyPress={handleKeyPress}
                    className="w-full pl-9 sm:pl-10 pr-4 py-2.5 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all duration-200 text-sm sm:text-base"
                    placeholder="Enter your email"
                    disabled={formState.loading}
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
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 sm:w-5 sm:h-5" />
                  <input
                    id="password"
                    type={formState.showPassword ? 'text' : 'password'}
                    value={formState.password}
                    onChange={(e) =>
                      updateFormState({ password: e.target.value })
                    }
                    onKeyPress={handleKeyPress}
                    className="w-full pl-9 sm:pl-10 pr-10 sm:pr-12 py-2.5 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all duration-200 text-sm sm:text-base"
                    placeholder="Enter password"
                    disabled={formState.loading}
                  />
                  <button
                    type="button"
                    onClick={togglePasswordVisibility}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                    disabled={formState.loading}
                  >
                    {formState.showPassword ? (
                      <EyeOff className="w-4 h-4 sm:w-5 sm:h-5" />
                    ) : (
                      <Eye className="w-4 h-4 sm:w-5 sm:h-5" />
                    )}
                  </button>
                </div>
                <div className="text-right mt-2">
                  <button
                    type="button"
                    className="text-xs sm:text-sm text-blue-600 hover:text-blue-800 transition-colors"
                  >
                    Forgot Password?
                  </button>
                </div>
              </div>

              <button
                type="button"
                onClick={handleSubmit}
                disabled={formState.loading}
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-2.5 sm:py-3 px-4 rounded-lg hover:from-blue-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center space-x-2 group text-sm sm:text-base"
              >
                {formState.loading ? (
                  <div className="w-4 h-4 sm:w-5 sm:h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <>
                    <span>
                      {invitationId ? (
                        <>
                          <span className="hidden sm:inline">
                            Sign In & Join Workspace
                          </span>
                          <span className="sm:hidden">Sign In & Join</span>
                        </>
                      ) : (
                        'Log In'
                      )}
                    </span>
                    <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </button>
            </div>

            <div className="mt-6 sm:mt-8 text-center">
              <p className="text-gray-600 text-sm sm:text-base">
                Don't have an account?{' '}
                <button
                  type="button"
                  onClick={() => {
                    navigate('/register', {
                      state: { returnTo, invitationId, email: prefilledEmail },
                    })
                  }}
                  className="text-purple-600 hover:text-purple-800 font-medium transition-colors cursor-pointer"
                >
                  Sign up
                </button>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Login
