import React, { useState } from 'react';
import type { KeyboardEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/authContext';

interface LoginFormState {
  email: string;
  password: string;
  showPassword: boolean;
  error: string;
  loading: boolean;
}

const Login: React.FC = () => {
  const [formState, setFormState] = useState<LoginFormState>({
    email: '',
    password: '',
    showPassword: false,
    error: '',
    loading: false,
  });

  const { login } = useAuth();
  const navigate = useNavigate();

  const updateFormState = (updates: Partial<LoginFormState>): void => {
    setFormState(prev => ({ ...prev, ...updates }));
  };

  const handleSubmit = async (): Promise<void> => {
    if (!formState.email || !formState.password) {
      updateFormState({ error: 'Please fill in all fields' });
      return;
    }

    updateFormState({ error: '', loading: true });

    try {
      await login(formState.email, formState.password);
      // Navigate after successful login
      navigate('/dashboard');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Login failed';
      updateFormState({ error: errorMessage });
    } finally {
      updateFormState({ loading: false });
    }
  };

  const handleKeyPress = (e: KeyboardEvent<HTMLInputElement>): void => {
    if (e.key === 'Enter') {
      handleSubmit();
    }
  };

  const togglePasswordVisibility = (): void => {
    updateFormState({ showPassword: !formState.showPassword });
  };

  return (
    <div className="min-h-screen bg-white relative overflow-hidden">
      {/* Diagonal Gradient Background - Lower Part */}
      <div className="absolute inset-0">
        <div 
          className="absolute inset-0 bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600"
          style={{
            clipPath: 'polygon(65% 47%, 79% 48%, 91% 55%, 100% 63%, 100% 100%, 0 100%, 0 84%, 11% 68%, 24% 55%, 41% 50%)'
          }}
        >
          {/* Background Decorations */}
          <div className="absolute top-1/2 left-0 w-72 h-72 bg-white bg-opacity-10 rounded-full -translate-x-32"></div>
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-white bg-opacity-10 rounded-full translate-x-48 translate-y-32"></div>
          <div className="absolute bottom-1/3 left-1/4 w-48 h-48 bg-white bg-opacity-5 rounded-full"></div>
          <div className="absolute bottom-1/4 right-1/3 w-32 h-32 bg-white bg-opacity-5 rounded-full"></div>
        </div>

        {/* Mobile diagonal */}
        <div 
          className="md:hidden absolute inset-0 bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600"
          style={{
            clipPath: 'polygon(65% 47%, 79% 48%, 91% 55%, 100% 63%, 100% 100%, 0 100%, 0 84%, 11% 68%, 24% 55%, 41% 50%)'
          }}
        >
          <div className="absolute bottom-0 left-0 w-72 h-72 bg-white bg-opacity-10 rounded-full -translate-x-32 translate-y-32"></div>
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-white bg-opacity-10 rounded-full translate-x-32 translate-y-32"></div>
        </div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 min-h-screen flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-2xl shadow-2xl p-8 border border-gray-100">
            
            {/* Header */}
            <div className="text-center mb-8">
              <h1 className="text-4xl font-bold text-gray-800 mb-2">Welcome back!</h1>
            </div>

            {/* Error Message */}
            {formState.error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
                {formState.error}
              </div>
            )}

            {/* Form */}
            <div className="space-y-4">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
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
                    disabled={formState.loading}
                  />
                </div>
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    id="password"
                    type={formState.showPassword ? 'text' : 'password'}
                    value={formState.password}
                    onChange={(e) => updateFormState({ password: e.target.value })}
                    onKeyPress={handleKeyPress}
                    className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all duration-200"
                    placeholder="Enter password"
                    disabled={formState.loading}
                  />
                  <button
                    type="button"
                    onClick={togglePasswordVisibility}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                    disabled={formState.loading}
                  >
                    {formState.showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                <div className="text-right mt-2">
                  <button 
                    type="button"
                    className="text-sm text-blue-600 hover:text-blue-800 transition-colors"
                  >
                    Forgot Password?
                  </button>
                </div>
              </div>

              <button
                type="button"
                onClick={handleSubmit}
                disabled={formState.loading}
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 px-4 rounded-lg hover:from-blue-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center space-x-2 group"
              >
                {formState.loading ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <>
                    <span>Log In</span>
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </button>
            </div>

            {/* Sign Up Link */}
            <div className="mt-8 text-center">
              <p className="text-gray-600">
                Don't have an account?{' '}
                <Link
                  to="/register"
                  className="text-purple-600 hover:text-purple-800 font-medium transition-colors"
                >
                  Sign up
                </Link>
              </p>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
