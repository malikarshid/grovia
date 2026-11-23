'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Mail, ArrowLeft, Check, AlertCircle } from 'lucide-react';
import { BrandLogo } from '@/components/common/BrandLogo';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim() }),
      });
      const data = await res.json();
      setMessage(data.message || 'Password reset link sent to your registered email.');
    } catch {
      setMessage('Request failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-center items-center px-4 py-12 bg-[#FAFAFA] dark:bg-slate-950 eye-protection:bg-[#FBF7EE]">
      <div className="w-full max-w-md bg-white dark:bg-slate-900 eye-protection:bg-[#FFFDF9] rounded-3xl p-6 sm:p-8 border border-gray-200/80 dark:border-slate-800 eye-protection:border-[#E6DCBE] shadow-xl">
        <div className="text-center mb-6">
          <div className="flex justify-center mb-3">
            <BrandLogo size="lg" showTagline={false} />
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-gray-900 dark:text-white eye-protection:text-[#3E3B32]">
            Reset Password
          </h1>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Enter your email to receive password recovery instructions
          </p>
        </div>

        {message ? (
          <div className="p-4 bg-green-50 dark:bg-slate-800 rounded-2xl border border-green-200 dark:border-slate-700 text-center space-y-3">
            <Check className="w-8 h-8 text-[#2E7D32] mx-auto" />
            <p className="text-xs font-semibold text-green-800 dark:text-green-300">{message}</p>
            <Link
              href="/auth/login"
              className="inline-block px-4 py-2 bg-[#2E7D32] text-white text-xs font-bold rounded-xl"
            >
              Back to Login
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                Registered Email Address
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

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-[#2E7D32] hover:bg-[#1B5E20] text-white text-xs font-bold rounded-xl shadow-lg transition flex items-center justify-center gap-2 disabled:opacity-40"
            >
              <span>{loading ? 'Sending...' : 'Send Reset Link'}</span>
            </button>
          </form>
        )}

        <div className="text-center mt-6 pt-4 border-t border-gray-100 dark:border-slate-800">
          <Link
            href="/auth/login"
            className="text-xs font-bold text-gray-500 hover:text-[#2E7D32] inline-flex items-center gap-1"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Return to Login</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
