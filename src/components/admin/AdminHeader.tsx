'use client';

import React from 'react';
import Link from 'next/link';
import {
  Menu,
  Bell,
  Download,
  Calendar,
  ExternalLink,
  ChevronDown,
  Search,
} from 'lucide-react';
import { ThemeSelector } from '@/components/common/ThemeSelector';
import { useAuthStore } from '@/store/authStore';

interface AdminHeaderProps {
  onOpenMobileSidebar: () => void;
  dateFilter: string;
  setDateFilter: (filter: string) => void;
  onExport: () => void;
}

export const AdminHeader: React.FC<AdminHeaderProps> = ({
  onOpenMobileSidebar,
  dateFilter,
  setDateFilter,
  onExport,
}) => {
  const { user } = useAuthStore();

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <header className="sticky top-0 z-20 bg-white/95 dark:bg-slate-900/95 eye-protection:bg-[#FFFDF9]/95 backdrop-blur-md border-b border-gray-200 dark:border-slate-800 eye-protection:border-[#E6DCBE] px-4 sm:px-6 py-3 transition-colors">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        {/* Left: Mobile Toggle & Time Greeting */}
        <div className="flex items-center gap-3">
          <button
            onClick={onOpenMobileSidebar}
            className="lg:hidden p-2 rounded-xl text-gray-500 hover:bg-gray-100 dark:hover:bg-slate-800"
            aria-label="Open sidebar"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div>
            <h1 className="text-base sm:text-lg font-black text-gray-900 dark:text-white eye-protection:text-[#3E3B32]">
              {getGreeting()}, {user?.name ? user.name.split(' ')[0] : 'Administrator'} 👋
            </h1>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              GROVIA Store Operations • Bengaluru Hub
            </p>
          </div>
        </div>

        {/* Right Action Bar */}
        <div className="flex items-center gap-2 sm:gap-3 flex-wrap sm:flex-nowrap">
          {/* Date Filter selector */}
          <div className="flex items-center gap-1.5 bg-gray-100 dark:bg-slate-800 eye-protection:bg-[#F3ECD9] px-3 py-1.5 rounded-xl text-xs font-bold text-gray-700 dark:text-gray-300">
            <Calendar className="w-3.5 h-3.5 text-[#2E7D32]" />
            <select
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="bg-transparent border-none outline-none font-bold text-xs cursor-pointer"
            >
              <option value="today">Today</option>
              <option value="week">This Week</option>
              <option value="month">This Month</option>
              <option value="last-month">Last Month</option>
              <option value="all">All Time</option>
            </select>
          </div>

          {/* Export Action */}
          <button
            onClick={onExport}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-green-50 dark:bg-slate-800 hover:bg-[#2E7D32] text-[#2E7D32] hover:text-white dark:text-green-400 dark:hover:text-white rounded-xl text-xs font-bold transition border border-green-200 dark:border-slate-700 hover:border-transparent"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>

          {/* View Customer Storefront */}
          <Link
            href="/"
            target="_blank"
            className="hidden sm:flex items-center gap-1 text-xs font-bold text-gray-600 dark:text-gray-300 hover:text-[#2E7D32] px-2.5 py-1.5 rounded-xl hover:bg-gray-100 dark:hover:bg-slate-800 transition"
          >
            <span>Customer Store</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </Link>

          {/* Theme selector */}
          <div className="hidden md:block">
            <ThemeSelector compact />
          </div>

          {/* Notifications */}
          <Link
            href="/admin/notifications"
            className="p-2 text-gray-500 hover:text-[#2E7D32] rounded-xl hover:bg-gray-100 dark:hover:bg-slate-800 transition relative"
          >
            <Bell className="w-4 h-4" />
            <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-[#FF6F00]" />
          </Link>
        </div>
      </div>
    </header>
  );
};
