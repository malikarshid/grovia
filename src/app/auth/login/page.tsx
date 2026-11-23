'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff, Lock, Mail, ArrowRight, ShieldCheck, AlertCircle } from 'lucide-react';
import { BrandLogo } from '@/components/common/BrandLogo';
import { useAuthStore } from '@/store/authStore';

export default function LoginPage() {
  const router = useRouter();
  const { setUser } = useAuthStore();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), password }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Invalid credentials');
        setLoading(false);
        return;
      }

      setUser(data.user);
      if (data.user.role !== 'CUSTOMER') {
        router.push('/admin');
      } else {
        router.push('/');
      }
    } catch {
      setError('A network error occurred. Please try again.');
      setLoading(false);
    }
  };

  const handleDemoFill = (demoEmail: string, demoPass: string) => {
    setEmail(demoEmail);
    setPassword(demoPass);
    setError('');
  };

  return (
    <div className="min-h-screen flex flex-col justify-center items-center px-4 py-12 bg-[#FAFAFA] dark:bg-slate-950 eye-protection:bg-[#FBF7EE]">
      <div className="w-full max-w-md bg-white dark:bg-slate-900 eye-protection:bg-[#FFFDF9] rounded-3xl p-6 sm:p-8 border border-gray-200/80 dark:border-slate-800 eye-protection:border-[#E6DCBE] shadow-xl">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="flex justify-center mb-3">
            <BrandLogo size="lg" showTagline={false} />
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-gray-900 dark:text-white eye-protection:text-[#3E3B32]">
            Welcome Back
          </h1>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Sign in to access your saved groceries, orders, and addresses
          </p>
        </div>

        {/* Demo Credentials Quick-Fill Selector */}
        <div className="mb-6 p-3 bg-green-50 dark:bg-slate-800/80 rounded-2xl border border-green-200 dark:border-slate-700">
          <span className="text-[10px] font-bold uppercase tracking-wider text-[#2E7D32] dark:text-[#4CAF50] block mb-1.5">
            Quick Demo Autofill:
          </span>
          <div className="flex flex-wrap gap-1.5">
            <button
              type="button"
              onClick={() => handleDemoFill('admin@grovia.in', 'Grovia@Admin2026')}
              className="px-2.5 py-1 bg-white dark:bg-slate-900 rounded-lg text-[11px] font-bold text-gray-800 dark:text-gray-200 border border-gray-200 dark:border-slate-700 hover:border-[#2E7D32]"
            >
              Super Admin
            </button>
            <button
              type="button"
              onClick={() => handleDemoFill('inventory@grovia.in', 'Grovia@Staff2026')}
              className="px-2.5 py-1 bg-white dark:bg-slate-900 rounded-lg text-[11px] font-bold text-gray-800 dark:text-gray-200 border border-gray-200 dark:border-slate-700 hover:border-[#2E7D32]"
            >
              Inventory Mgr
            </button>
            <button
              type="button"
              onClick={() => handleDemoFill('rahul.sharma@example.com', 'Customer@123')}
              className="px-2.5 py-1 bg-white dark:bg-slate-900 rounded-lg text-[11px] font-bold text-gray-800 dark:text-gray-200 border border-gray-200 dark:border-slate-700 hover:border-[#2E7D32]"
            >
              Customer
            </button>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 text-red-700 text-xs font-bold rounded-xl flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
              Email Address
            </label>
            <div className="relative">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                className="w-full pl-9 pr-3 py-2.5 text-xs rounded-xl bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 outline-none focus:border-[#2E7D32]"
              />
              <Mail className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="block text-xs font-bold text-gray-700 dark:text-gray-300">
                Password
              </label>
              <Link
                href="/auth/forgot-password"
                className="text-[11px] font-bold text-[#2E7D32] hover:underline"
              >
                Forgot Password?
              </Link>
            </div>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-9 pr-10 py-2.5 text-xs rounded-xl bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 outline-none focus:border-[#2E7D32]"
              />
              <Lock className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div className="flex items-center">
            <label className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400 cursor-pointer">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="rounded text-[#2E7D32] focus:ring-[#2E7D32]"
              />
              <span>Remember session for 7 days</span>
            </label>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-[#2E7D32] hover:bg-[#1B5E20] text-white text-xs font-bold rounded-xl shadow-lg transition flex items-center justify-center gap-2 disabled:opacity-40"
          >
            <span>{loading ? 'Authenticating...' : 'Sign In'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* Google SSO Button */}
        <div className="mt-6 pt-6 border-t border-gray-100 dark:border-slate-800 text-center">
          <button
            type="button"
            onClick={() => {
              alert('Google Sign-In is structured and ready. To activate live Google OAuth, supply GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET in .env.');
            }}
            className="w-full py-2.5 px-4 bg-gray-50 dark:bg-slate-800 hover:bg-gray-100 border border-gray-200 dark:border-slate-700 rounded-xl text-xs font-bold text-gray-700 dark:text-gray-200 flex items-center justify-center gap-2 transition"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
            <span>Continue with Google</span>
          </button>

          <p className="text-xs text-gray-500 mt-4">
            Don&apos;t have an account yet?{' '}
            <Link href="/auth/register" className="font-bold text-[#2E7D32] hover:underline">
              Create an account
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
