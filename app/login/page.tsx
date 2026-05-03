'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Home, Mail, Lock, Eye, EyeOff } from 'lucide-react';

export default function LoginPage() {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        // Redirect based on user role
        if (data.user.role === 'admin') {
          router.push('/admin/dashboard');
        } else if (data.user.role === 'agent') {
          router.push('/agent/dashboard');
        } else {
          router.push('/tenant/dashboard');
        }
      } else {
        setError(data.error || 'Login failed');
      }
    } catch (error) {
      setError('An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-100 flex items-center justify-center py-8 sm:py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <div className="flex justify-center items-center mb-6">
            <div className="bg-blue-100 rounded-full p-3">
              <Home className="h-8 w-8 sm:h-10 sm:w-10 text-blue-600" />
            </div>
            <span className="ml-3 text-2xl sm:text-3xl font-bold text-gray-900">Makao</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">
            Welcome back
          </h2>
          <p className="mt-2 text-sm sm:text-base text-gray-600">
            Sign in to access your account
          </p>
          <p className="mt-2 text-sm text-gray-600">
            New here?{' '}
            <Link href="/register" className="font-medium text-blue-600 hover:text-blue-500 transition-colors ml-1">
              Create an account
            </Link>
          </p>
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-2xl shadow-xl p-6 sm:p-8">
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div className="space-y-5">
              {/* Email Field */}
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-4 w-4 text-gray-400" />
                  </div>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    value={formData.email}
                    onChange={handleChange}
                    className="pl-10 pr-3 block w-full h-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent sm:text-sm"
                    placeholder="Enter your email"
                  />
                </div>
              </div>

              {/* Password Field */}
              <div>
                <div className="flex justify-between items-center mb-1">
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                    Password
                  </label>
                  <Link href="/forgot-password" className="text-xs text-blue-600 hover:text-blue-500">
                    Forgot?
                  </Link>
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-4 w-4 text-gray-400" />
                  </div>
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="current-password"
                    required
                    value={formData.password}
                    onChange={handleChange}
                    className="pl-10 pr-10 block w-full h-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent sm:text-sm"
                    placeholder="Enter your password"
                    minLength={6}
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4 text-gray-400 hover:text-gray-600" />
                    ) : (
                      <Eye className="h-4 w-4 text-gray-400 hover:text-gray-600" />
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-5 h-5 rounded-full bg-red-100 flex items-center justify-center">
                    <span className="text-red-600 text-xs font-bold">!</span>
                  </div>
                </div>
                <div className="ml-3 text-sm">{error}</div>
              </div>
            )}

            {/* Submit Button */}
            <div>
              <button
                type="submit"
                disabled={isLoading}
                className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-semibold rounded-lg text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-[1.02]"
              >
                {isLoading ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Signing in...
                  </div>
                ) : (
                  'Sign in'
                )}
              </button>
            </div>

            {/* Demo Account Info */}
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-xs sm:text-sm text-gray-600 text-center">
                <span className="font-medium">Demo Account:</span>
                <br className="sm:hidden" />
                <span className="hidden sm:inline"> </span>
                <span className="font-mono bg-white px-2 py-1 rounded border border-gray-200">
                  admin@proprent.com / Admin123!
                </span>
              </p>
            </div>
          </form>
        </div>

        {/* Create Account Link */}
        <div className="text-center">
          <p className="text-sm text-gray-600">
            New to PropRent?{' '}
            <Link href="/register" className="font-medium text-blue-600 hover:text-blue-500 transition-colors ml-1">
              Create your free account
            </Link>
          </p>
        </div>

        {/* Footer Links */}
        <div className="text-center space-y-2">
          <p className="text-xs text-gray-500">
            By signing in, you agree to our{' '}
            <Link href="/terms" className="text-blue-600 hover:text-blue-500 transition-colors">
              Terms of Service
            </Link>{' '}
            and{' '}
            <Link href="/privacy" className="text-blue-600 hover:text-blue-500 transition-colors">
              Privacy Policy
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
