'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  User,
  ShoppingBag,
  Heart,
  MapPin,
  ShieldCheck,
  LogOut,
  Bell,
  Sun,
  Eye,
  Award,
  ChevronRight,
  Plus,
} from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { ThemeSelector } from '@/components/common/ThemeSelector';
import { AddressDto } from '@/types';

export default function ProfilePage() {
  const router = useRouter();
  const { user, isAuthenticated, logout } = useAuthStore();
  const [addresses, setAddresses] = useState<AddressDto[]>([]);
  const [stats, setStats] = useState({ totalOrders: 0, completedOrders: 0, favoritesCount: 0 });
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  useEffect(() => {
    async function loadProfileData() {
      try {
        const [addrRes, orderRes, favRes] = await Promise.all([
          fetch('/api/addresses'),
          fetch('/api/orders'),
          fetch('/api/favorites'),
        ]);

        const addrData = await addrRes.json();
        const orderData = await orderRes.json();
        const favData = await favRes.json();

        setAddresses(addrData.addresses || []);

        const orders = orderData.orders || [];
        setStats({
          totalOrders: orders.length,
          completedOrders: orders.filter((o: any) => o.orderStatus === 'DELIVERED').length,
          favoritesCount: (favData.favorites || []).length,
        });
      } catch (err) {
        console.error('Failed to load profile data:', err);
      }
    }

    loadProfileData();
  }, []);

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6">
      {/* Title */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-black text-gray-900 dark:text-white eye-protection:text-[#3E3B32]">
          Customer Account
        </h1>
        <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
          Manage your personal profile, addresses, and shopping preferences
        </p>
      </div>

      {/* User Info Card */}
      <div className="bg-white dark:bg-slate-900 eye-protection:bg-[#FFFDF9] rounded-3xl p-6 border border-gray-200/80 dark:border-slate-800 eye-protection:border-[#E6DCBE] shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#2E7D32] to-[#1B5E20] text-white flex items-center justify-center font-black text-2xl uppercase shadow-md">
            {user?.name ? user.name.charAt(0) : 'G'}
          </div>
          <div>
            <h2 className="text-lg font-black text-gray-900 dark:text-white">
              {user?.name || 'Valued Shopper'}
            </h2>
            <p className="text-xs text-gray-500 dark:text-gray-400">{user?.email || 'shopper@grovia.in'}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">{user?.phone || '+91 98200 12345'}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {user?.role && user.role !== 'CUSTOMER' && (
            <Link
              href="/admin"
              className="px-4 py-2 bg-[#FF6F00] text-white text-xs font-bold rounded-xl shadow-md hover:bg-[#E65100] transition"
            >
              Open Admin Portal
            </Link>
          )}
          <button
            onClick={() => setShowLogoutConfirm(true)}
            className="px-4 py-2 bg-red-50 text-red-600 hover:bg-red-100 rounded-xl text-xs font-bold transition flex items-center gap-1.5"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        </div>
      </div>

      {/* Statistics Row as required by section 16 */}
      <div className="grid grid-cols-3 gap-3 sm:gap-4">
        <div className="bg-white dark:bg-slate-900 eye-protection:bg-[#FFFDF9] p-4 sm:p-5 rounded-2xl border border-gray-200 dark:border-slate-800 eye-protection:border-[#E6DCBE] shadow-sm text-center">
          <ShoppingBag className="w-5 h-5 text-[#2E7D32] mx-auto mb-1" />
          <span className="text-xl sm:text-2xl font-black text-gray-900 dark:text-white">
            {stats.totalOrders}
          </span>
          <p className="text-[11px] text-gray-500 font-medium">Total Orders</p>
        </div>

        <div className="bg-white dark:bg-slate-900 eye-protection:bg-[#FFFDF9] p-4 sm:p-5 rounded-2xl border border-gray-200 dark:border-slate-800 eye-protection:border-[#E6DCBE] shadow-sm text-center">
          <ShieldCheck className="w-5 h-5 text-[#2E7D32] mx-auto mb-1" />
          <span className="text-xl sm:text-2xl font-black text-gray-900 dark:text-white">
            {stats.completedOrders}
          </span>
          <p className="text-[11px] text-gray-500 font-medium">Completed</p>
        </div>

        <div className="bg-white dark:bg-slate-900 eye-protection:bg-[#FFFDF9] p-4 sm:p-5 rounded-2xl border border-gray-200 dark:border-slate-800 eye-protection:border-[#E6DCBE] shadow-sm text-center">
          <Heart className="w-5 h-5 text-red-500 mx-auto mb-1" />
          <span className="text-xl sm:text-2xl font-black text-gray-900 dark:text-white">
            {stats.favoritesCount}
          </span>
          <p className="text-[11px] text-gray-500 font-medium">Saved Favourites</p>
        </div>
      </div>

      {/* Theme Settings Box */}
      <div className="bg-white dark:bg-slate-900 eye-protection:bg-[#FFFDF9] p-6 rounded-3xl border border-gray-200 dark:border-slate-800 eye-protection:border-[#E6DCBE] shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="font-bold text-sm text-gray-900 dark:text-white">Display & Theme Preference</h3>
          <p className="text-xs text-gray-500 mt-0.5">
            Choose between standard Light, Dark, or eye-friendly warm sepia Eye Protection Mode
          </p>
        </div>
        <ThemeSelector />
      </div>

      {/* Saved Addresses Section */}
      <div className="bg-white dark:bg-slate-900 eye-protection:bg-[#FFFDF9] p-6 rounded-3xl border border-gray-200 dark:border-slate-800 eye-protection:border-[#E6DCBE] shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-[#2E7D32]" />
            <h3 className="font-bold text-sm text-gray-900 dark:text-white">
              Saved Delivery Addresses ({addresses.length})
            </h3>
          </div>
          <Link
            href="/checkout"
            className="text-xs font-bold text-[#2E7D32] hover:underline flex items-center gap-1"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add New</span>
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {addresses.map((addr) => (
            <div
              key={addr.id}
              className="p-4 rounded-2xl border border-gray-200 dark:border-slate-700 space-y-1 text-xs"
            >
              <div className="flex justify-between items-center mb-1">
                <span className="font-bold text-gray-900 dark:text-white">{addr.fullName}</span>
                {addr.isDefault && (
                  <span className="bg-green-100 text-[#2E7D32] text-[10px] font-bold px-2 py-0.5 rounded-full">
                    Default
                  </span>
                )}
              </div>
              <p className="text-gray-600 dark:text-gray-300">
                {addr.houseNumber}, {addr.street}, {addr.area}
              </p>
              <p className="text-gray-600 dark:text-gray-300">
                {addr.city}, {addr.state} - {addr.pincode}
              </p>
              <p className="text-gray-400 pt-1 font-medium">Contact: {addr.phone}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Logout Confirmation Dialog */}
      {showLogoutConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white dark:bg-slate-900 eye-protection:bg-[#FFFDF9] rounded-2xl p-6 max-w-sm w-full border border-gray-200 dark:border-slate-800 shadow-xl text-center">
            <h3 className="text-base font-bold text-gray-900 dark:text-white mb-2">
              Sign out from GROVIA?
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-6">
              You will need to sign in again to view your saved addresses and active order tracking.
            </p>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowLogoutConfirm(false)}
                className="flex-1 py-2 rounded-xl text-xs font-bold bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-gray-300"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  setShowLogoutConfirm(false);
                  logout();
                }}
                className="flex-1 py-2 rounded-xl text-xs font-bold bg-red-600 text-white hover:bg-red-700"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
