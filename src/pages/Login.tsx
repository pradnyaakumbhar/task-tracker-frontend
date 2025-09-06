// import React, { useState } from 'react';
// import type { KeyboardEvent } from 'react';
// import { Link, useNavigate } from 'react-router-dom';
// import { Mail, Lock, Eye, EyeOff, ArrowRight } from 'lucide-react';
// import { useAuth } from '../context/authContext';

// interface LoginFormState {
//   email: string;
//   password: string;
//   showPassword: boolean;
//   error: string;
//   loading: boolean;
// }

// const Login: React.FC = () => {
//   const [formState, setFormState] = useState<LoginFormState>({
//     email: '',
//     password: '',
//     showPassword: false,
//     error: '',
//     loading: false,
//   });

//   const { login } = useAuth();
//   const navigate = useNavigate();

//   const updateFormState = (updates: Partial<LoginFormState>): void => {
//     setFormState(prev => ({ ...prev, ...updates }));
//   };

//   const handleSubmit = async (): Promise<void> => {
//     if (!formState.email || !formState.password) {
//       updateFormState({ error: 'Please fill in all fields' });
//       return;
//     }

//     updateFormState({ error: '', loading: true });

//     try {
//       await login(formState.email, formState.password);
//       // Navigate after successful login
//       navigate('/');
//     } catch (err) {
//       const errorMessage = err instanceof Error ? err.message : 'Login failed';
//       updateFormState({ error: errorMessage });
//     } finally {
//       updateFormState({ loading: false });
//     }
//   };

//   const handleKeyPress = (e: KeyboardEvent<HTMLInputElement>): void => {
//     if (e.key === 'Enter') {
//       handleSubmit();
//     }
//   };

//   const togglePasswordVisibility = (): void => {
//     updateFormState({ showPassword: !formState.showPassword });
//   };

//   return (
//     <div className="min-h-screen bg-white relative overflow-hidden">
//       {/* Diagonal Gradient Background - Lower Part */}
//       <div className="absolute inset-0">
//         <div
//           className="absolute inset-0 bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600"
//           style={{
//             clipPath: 'polygon(0 80%, 100% 50%, 100% 100%, 0% 100%)'
//           }}
//         >
//           {/* Background Decorations */}
//           <div className="absolute top-1/2 left-0 w-72 h-72 bg-white bg-opacity-10 rounded-full -translate-x-32"></div>
//           <div className="absolute bottom-0 right-0 w-96 h-96 bg-white bg-opacity-10 rounded-full translate-x-48 translate-y-32"></div>
//           <div className="absolute bottom-1/3 left-1/4 w-48 h-48 bg-white bg-opacity-5 rounded-full"></div>
//           <div className="absolute bottom-1/4 right-1/3 w-32 h-32 bg-white bg-opacity-5 rounded-full"></div>
//         </div>

//         {/* Mobile diagonal */}
//         <div
//           className="md:hidden absolute inset-0 bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600"
//           style={{
//             clipPath: 'polygon(65% 47%, 79% 48%, 91% 55%, 100% 63%, 100% 100%, 0 100%, 0 84%, 11% 68%, 24% 55%, 41% 50%)'
//           }}
//         >
//           <div className="absolute bottom-0 left-0 w-72 h-72 bg-white bg-opacity-10 rounded-full -translate-x-32 translate-y-32"></div>
//           <div className="absolute bottom-0 right-0 w-96 h-96 bg-white bg-opacity-10 rounded-full translate-x-32 translate-y-32"></div>
//         </div>
//       </div>

//       {/* Main Content */}
//       <div className="relative z-10 min-h-screen flex items-center justify-center px-4 py-8">
//         <div className="w-full max-w-md">
//           <div className="bg-white rounded-2xl shadow-2xl p-8 border border-gray-100">

//             {/* Header */}
//             <div className="text-center mb-8">
//               <h1 className="text-4xl font-bold text-gray-800 mb-2">Welcome back!</h1>
//             </div>

//             {/* Error Message */}
//             {formState.error && (
//               <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
//                 {formState.error}
//               </div>
//             )}

//             {/* Form */}
//             <div className="space-y-4">
//               <div>
//                 <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
//                   Email
//                 </label>
//                 <div className="relative">
//                   <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
//                   <input
//                     id="email"
//                     type="email"
//                     value={formState.email}
//                     onChange={(e) => updateFormState({ email: e.target.value })}
//                     onKeyPress={handleKeyPress}
//                     className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all duration-200"
//                     placeholder="Enter your email"
//                     disabled={formState.loading}
//                   />
//                 </div>
//               </div>

//               <div>
//                 <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
//                   Password
//                 </label>
//                 <div className="relative">
//                   <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
//                   <input
//                     id="password"
//                     type={formState.showPassword ? 'text' : 'password'}
//                     value={formState.password}
//                     onChange={(e) => updateFormState({ password: e.target.value })}
//                     onKeyPress={handleKeyPress}
//                     className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all duration-200"
//                     placeholder="Enter password"
//                     disabled={formState.loading}
//                   />
//                   <button
//                     type="button"
//                     onClick={togglePasswordVisibility}
//                     className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
//                     disabled={formState.loading}
//                   >
//                     {formState.showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
//                   </button>
//                 </div>
//                 <div className="text-right mt-2">
//                   <button
//                     type="button"
//                     className="text-sm text-blue-600 hover:text-blue-800 transition-colors"
//                   >
//                     Forgot Password?
//                   </button>
//                 </div>
//               </div>

//               <button
//                 type="button"
//                 onClick={handleSubmit}
//                 disabled={formState.loading}
//                 className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 px-4 rounded-lg hover:from-blue-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center space-x-2 group"
//               >
//                 {formState.loading ? (
//                   <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
//                 ) : (
//                   <>
//                     <span>Log In</span>
//                     <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
//                   </>
//                 )}
//               </button>
//             </div>

//             {/* Sign Up Link */}
//             <div className="mt-8 text-center">
//               <p className="text-gray-600">
//                 Don't have an account?{' '}
//                 <Link
//                   to="/register"
//                   className="text-purple-600 hover:text-purple-800 font-medium transition-colors"
//                 >
//                   Sign up
//                 </Link>
//               </p>
//             </div>

//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default Login;

import React, { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '@/context/authContext'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { AlertCircle, Mail, Lock, Loader2 } from 'lucide-react'

const Login: React.FC = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const { login, user, token } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  // Get invitation state from navigation
  const invitationId = location.state?.invitationId
  const returnTo = location.state?.returnTo
  const prefilledEmail = location.state?.email

  useEffect(() => {
    // Prefill email if provided from invitation
    if (prefilledEmail) {
      setEmail(prefilledEmail)
    }
  }, [prefilledEmail])

  useEffect(() => {
    // If user is already authenticated and there's an invitation, redirect to process it
    if (user && token && invitationId) {
      navigate(`/invitation/${invitationId}`)
    } else if (user && token) {
      // Normal redirect after login
      navigate(returnTo || '/')
    }
  }, [user, token, invitationId, returnTo, navigate])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!email || !password) {
      setError('Please fill in all fields')
      return
    }

    setIsLoading(true)
    setError('')

    try {
      await login(email, password)
      // Navigation will be handled by useEffect above
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Login failed'
      setError(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">Sign In</CardTitle>
          {invitationId && (
            <p className="text-sm text-muted-foreground mt-2">
              Sign in to accept your workspace invitation
            </p>
          )}
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10"
                  disabled={isLoading}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10"
                  disabled={isLoading}
                  required
                />
              </div>
            </div>

            {error && (
              <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 dark:bg-red-900/20 p-3 rounded-lg">
                <AlertCircle className="h-4 w-4" />
                <span>{error}</span>
              </div>
            )}

            <Button
              type="submit"
              className="w-full"
              disabled={isLoading}
              size="lg"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Signing in...
                </>
              ) : (
                'Sign In'
              )}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-muted-foreground">
              Don't have an account?{' '}
              <Button
                variant="link"
                className="p-0 h-auto"
                onClick={() => {
                  navigate('/register', {
                    state: {
                      returnTo,
                      invitationId,
                      email: prefilledEmail,
                    },
                  })
                }}
              >
                Create account
              </Button>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default Login
