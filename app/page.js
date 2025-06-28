'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Brain, User, Lock, ArrowRight } from 'lucide-react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const handleLogin = async e => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    // Simple validation
    if (!email || !password) {
      setError('Please enter both email and password');
      setIsLoading(false);
      return;
    }

    try {
      // Simulate login process (replace with your actual auth logic)
      await new Promise(resolve => setTimeout(resolve, 1000));

      // For demo purposes, accept any email/password
      // In production, you'd validate against your auth system
      console.log('Login attempt:', { email, password });

      // Redirect to curate page on successful login
      router.push('/curate');
    } catch (error) {
      setError('Login failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDemoLogin = () => {
    setEmail('demo@growthos.com');
    setPassword('demo123');
    // Auto-submit after a brief delay
    setTimeout(() => {
      const form = document.getElementById('login-form');
      if (form) {
        form.requestSubmit();
      }
    }, 500);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-lime-50 to-green-100 flex items-center justify-center p-4">
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-10 pointer-events-none">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%239C92AC' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='1'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}
        ></div>
      </div>

      {/* Login Card */}
      <div className="w-full max-w-md relative">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="flex gap-1">
              <div className="w-3 h-3 bg-red-500 rounded-full"></div>
              <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
              <div className="w-3 h-3 bg-lime-500 rounded-full"></div>
            </div>
            <Brain size={32} className="text-lime-500" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">GrowthOS</h1>
          <p className="text-gray-600">Your Second Brain for Knowledge Management</p>
        </div>

        {/* Login Form */}
        <div className="bg-white rounded-lg shadow-2xl p-8 border border-lime-100">
          <form id="login-form" onSubmit={handleLogin} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">Email Address</label>
              <div className="relative">
                <User
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-lime-400"
                  size={20}
                />
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-white border border-lime-200 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-lime-400 focus:border-transparent transition-all"
                  placeholder="Enter your email"
                  disabled={isLoading}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">Password</label>
              <div className="relative">
                <Lock
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-lime-400"
                  size={20}
                />
                <input
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-white border border-lime-200 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-lime-400 focus:border-transparent transition-all"
                  placeholder="Enter your password"
                  disabled={isLoading}
                />
              </div>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                <p className="text-red-600 text-sm">❌ {error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-lime-600 hover:bg-lime-700 disabled:bg-lime-800 disabled:cursor-not-allowed text-white font-medium py-3 px-4 rounded-lg transition-all duration-200 flex items-center justify-center gap-2 group shadow"
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                  Signing In...
                </>
              ) : (
                <>
                  Sign In
                  <ArrowRight
                    size={20}
                    className="group-hover:translate-x-1 transition-transform"
                  />
                </>
              )}
            </button>
          </form>

          {/* Demo Login */}
          <div className="mt-6 pt-6 border-t border-lime-100">
            <button
              onClick={handleDemoLogin}
              disabled={isLoading}
              className="w-full bg-lime-100 hover:bg-lime-200 disabled:bg-lime-200 disabled:cursor-not-allowed text-lime-700 font-medium py-3 px-4 rounded-lg transition-all duration-200 flex items-center justify-center gap-2"
            >
              <Brain size={20} className="text-lime-500" />
              Try Demo Account
            </button>
            <p className="text-xs text-gray-500 text-center mt-2">
              Quick access to explore GrowthOS features
            </p>
          </div>

          {/* Additional Options */}
          <div className="mt-6 text-center">
            <p className="text-gray-600 text-sm">
              "Don&apos;t have an account?"{' '}
              <button className="text-lime-600 hover:text-lime-700 transition-colors">
                Sign up
              </button>
            </p>
          </div>
        </div>

        {/* Features Preview */}
        <div className="mt-8 text-center">
          <p className="text-gray-600 text-sm mb-4">"What you&apos;ll get access to:"</p>
          <div className="flex justify-center gap-6 text-xs text-gray-700">
            <div className="flex items-center gap-1">
              <span>🔧</span>
              <span>Curate Knowledge</span>
            </div>
            <div className="flex items-center gap-1">
              <span>🧪</span>
              <span>Self Testing</span>
            </div>
            <div className="flex items-center gap-1">
              <span>🤖</span>
              <span>AI Agents</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}