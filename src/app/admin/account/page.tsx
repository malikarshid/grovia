'use client';

import React from 'react';
import { UserCircle, Shield, Key } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';

export default function AdminAccountPage() {
  const { user } = useAuthStore();

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-xl sm:text-2xl font-black text-gray-900 dark:text-white">
          Administrator Account Profile
        </h1>
        <p className="text-xs text-gray-500">Security credentials and administrative privileges</p>
      </div>

      <div className="bg-white dark:bg-slate-900 eye-protection:bg-[#FFFDF9] rounded-3xl p-6 border border-gray-200/80 dark:border-slate-800 eye-protection:border-[#E6DCBE] shadow-sm space-y-4">
        <div className="flex items-center gap-4 border-b border-gray-100 dark:border-slate-800 pb-4">
          <div className="w-14 h-14 rounded-2xl bg-[#2E7D32] text-white flex items-center justify-center font-black text-xl">
            {user?.name ? user.name.charAt(0) : 'A'}
          </div>
          <div>
            <h3 className="font-bold text-base text-gray-900 dark:text-white">{user?.name || 'Administrator'}</h3>
            <p className="text-xs text-gray-500">{user?.email || 'admin@grovia.in'}</p>
            <span className="bg-[#FF6F00] text-white text-[10px] font-bold px-2 py-0.5 rounded uppercase mt-1 inline-block">
              {user?.role || 'SUPER_ADMIN'}
            </span>
          </div>
        </div>

        <div className="space-y-3 text-xs">
          <div className="flex justify-between py-1">
            <span className="text-gray-500">Admin Role:</span>
            <span className="font-bold text-gray-900 dark:text-white">Full System Super Administrator</span>
          </div>
          <div className="flex justify-between py-1">
            <span className="text-gray-500">Security Clearance:</span>
            <span className="font-bold text-[#2E7D32]">Tier 1 Operations Access</span>
          </div>
          <div className="flex justify-between py-1">
            <span className="text-gray-500">Registered Office:</span>
            <span className="font-bold text-gray-900 dark:text-white">Indiranagar HQ, Bengaluru</span>
          </div>
        </div>
      </div>
    </div>
  );
}
