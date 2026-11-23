'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Search,
  ShoppingCart,
  User as UserIcon,
  MapPin,
  Bell,
  Heart,
  Menu,
  X,
  ChevronDown,
  LogOut,
  ShieldCheck,
} from 'lucide-react';
import { BrandLogo } from '@/components/common/BrandLogo';
import { ThemeSelector } from '@/components/common/ThemeSelector';
import { LocationModal } from '@/components/common/LocationModal';
import { useCartStore } from '@/store/cartStore';
import { useAuthStore } from '@/store/authStore';

export const CustomerHeader: React.FC = () => {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [cartCount, setCartCount] = useState(0);

  // Dynamic Location State
  const [locationModalOpen, setLocationModalOpen] = useState(false);
  const [activeLocation, setActiveLocation] = useState({
    pincode: '560038',
    city: 'Indiranagar',
    deliveryMode: 'QUICK_LOCAL',
    timeText: '15 MINS',
  });

  const { items, getItemCount } = useCartStore();
  const { user, isAuthenticated, logout } = useAuthStore();

  useEffect(() => {
    setCartCount(getItemCount());
  }, [items, getItemCount]);

  useEffect(() => {
    // Fetch initial preference from API / cookie
    fetch('/api/location/preference')
      .then((res) => res.json())
      .then((data) => {
        if (data.preference) {
          setActiveLocation((prev) => ({
            ...prev,
            pincode: data.preference.pincode || '560038',
            city: data.preference.city || 'Indiranagar',
          }));
        }
      })
      .catch(() => {});
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      router.push(`/products?search=${encodeURIComponent(searchTerm.trim())}`);
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 dark:bg-slate-900/95 eye-protection:bg-[#FFFDF9]/95 backdrop-blur-md border-b border-gray-200 dark:border-slate-800 eye-protection:border-[#E6DCBE] transition-colors">
      {/* Top Banner Bar */}
      <div className="bg-[#2E7D32] text-white text-xs py-1.5 px-4 text-center font-medium flex items-center justify-between">
        <div className="hidden sm:flex items-center gap-2 text-green-100">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>100% Quality Guaranteed • Farm Fresh at Your Doorstep in 2 Hours</span>
        </div>
        <div className="flex items-center justify-between sm:justify-end w-full sm:w-auto gap-4">
          <span className="text-yellow-300 font-bold tracking-wide">
            Use code <span className="underline decoration-yellow-400">GROVIA100</span> for ₹100 OFF
          </span>
        </div>
      </div>

      {/* Main Header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
        <div className="flex items-center justify-between gap-4">
          {/* Logo */}
          <Link href="/" className="flex-shrink-0">
            <BrandLogo size="md" showTagline={true} />
          </Link>

          {/* Delivery Location Selector Pill (Clickable Modal Trigger) */}
          <button
            type="button"
            onClick={() => setLocationModalOpen(true)}
            aria-label="Select delivery location"
            className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-gray-50 dark:bg-slate-800 eye-protection:bg-[#F3ECD9] border border-gray-200 dark:border-slate-700 eye-protection:border-[#E2D7BE] hover:border-[#2E7D32] dark:hover:border-[#4CAF50] transition text-xs group"
          >
            <MapPin className="w-3.5 h-3.5 text-[#2E7D32] dark:text-[#4CAF50] flex-shrink-0 group-hover:scale-110 transition-transform" />
            <div className="flex flex-col text-left">
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] text-gray-400 font-semibold uppercase">Deliver to</span>
                <span className={`text-[9px] font-bold px-1.5 py-0.2 rounded-full ${
                  activeLocation.deliveryMode === 'QUICK_LOCAL'
                    ? 'bg-green-100 text-[#2E7D32] dark:bg-green-950 dark:text-green-300'
                    : 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300'
                }`}>
                  {activeLocation.timeText}
                </span>
              </div>
              <span className="font-bold text-gray-800 dark:text-gray-200 eye-protection:text-[#3E3B32] truncate max-w-[130px]">
                {activeLocation.city}, {activeLocation.pincode}
              </span>
            </div>
            <ChevronDown className="w-3 h-3 text-gray-400 group-hover:text-gray-600 transition" />
          </button>

          {/* Search Form */}
          <form
            onSubmit={handleSearch}
            className="flex-1 max-w-xl relative hidden md:block"
            role="search"
          >
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search farm fresh vegetables, dairy, fruits, staples..."
              className="w-full pl-10 pr-24 py-2 text-sm rounded-full bg-gray-100 dark:bg-slate-800 eye-protection:bg-[#F3ECD9] border border-transparent focus:border-[#2E7D32] dark:focus:border-[#4CAF50] focus:bg-white dark:focus:bg-slate-900 outline-none transition"
            />
            <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-2.5" />
            <button
              type="submit"
              className="absolute right-1 top-1 bottom-1 px-3 bg-[#2E7D32] hover:bg-[#1B5E20] text-white text-xs font-semibold rounded-full transition"
            >
              Search
            </button>
          </form>

          {/* Right Action Controls */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Theme Selector */}
            <div className="hidden sm:block">
              <ThemeSelector compact />
            </div>

            {/* Favourites */}
            <Link
              href="/favorites"
              aria-label="Wishlist and Favourites"
              className="p-2 text-gray-600 dark:text-gray-300 eye-protection:text-[#3E3B32] hover:text-[#2E7D32] dark:hover:text-[#4CAF50] rounded-full hover:bg-gray-100 dark:hover:bg-slate-800 transition relative"
            >
              <Heart className="w-5 h-5" />
            </Link>

            {/* Notifications */}
            <Link
              href="/orders"
              aria-label="Notifications"
              className="p-2 text-gray-600 dark:text-gray-300 eye-protection:text-[#3E3B32] hover:text-[#2E7D32] rounded-full hover:bg-gray-100 dark:hover:bg-slate-800 transition relative"
            >
              <Bell className="w-5 h-5" />
              <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-[#FF6F00]"></span>
            </Link>

            {/* Shopping Cart Button */}
            <Link
              href="/cart"
              aria-label="Shopping Cart"
              className="flex items-center gap-2 bg-[#2E7D32] hover:bg-[#1B5E20] text-white px-3 sm:px-4 py-2 rounded-full font-semibold text-xs sm:text-sm shadow-sm transition relative"
            >
              <ShoppingCart className="w-4 h-4" />
              <span className="hidden sm:inline">Cart</span>
              {cartCount > 0 && (
                <span className="bg-[#FF6F00] text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </Link>

            {/* User Profile / Auth */}
            {isAuthenticated && user ? (
              <div className="relative">
                <button
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="flex items-center gap-1.5 p-1 rounded-full border border-gray-200 dark:border-slate-700 hover:border-[#2E7D32]"
                >
                  <div className="w-8 h-8 rounded-full bg-green-100 dark:bg-slate-800 text-[#2E7D32] flex items-center justify-center font-bold text-xs uppercase">
                    {user.name.charAt(0)}
                  </div>
                  <ChevronDown className="w-3.5 h-3.5 text-gray-500 mr-1" />
                </button>

                {userDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-52 bg-white dark:bg-slate-800 eye-protection:bg-[#FFFDF9] rounded-xl shadow-xl border border-gray-200 dark:border-slate-700 py-2 z-50">
                    <div className="px-4 py-2 border-b border-gray-100 dark:border-slate-700">
                      <p className="text-sm font-bold text-gray-900 dark:text-white truncate">{user.name}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{user.email}</p>
                    </div>
                    <Link
                      href="/profile"
                      onClick={() => setUserDropdownOpen(false)}
                      className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-slate-700"
                    >
                      My Profile & Addresses
                    </Link>
                    <Link
                      href="/orders"
                      onClick={() => setUserDropdownOpen(false)}
                      className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-slate-700"
                    >
                      Order History & Tracking
                    </Link>
                    <button
                      onClick={() => {
                        setUserDropdownOpen(false);
                        logout();
                      }}
                      className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-slate-700 flex items-center gap-2 border-t border-gray-100 dark:border-slate-700 mt-1"
                    >
                      <LogOut className="w-4 h-4" />
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link
                href="/auth/login"
                className="flex items-center gap-1.5 text-xs font-bold text-[#2E7D32] dark:text-[#4CAF50] border border-[#2E7D32] dark:border-[#4CAF50] hover:bg-[#2E7D32] hover:text-white px-3 py-1.5 rounded-full transition"
              >
                <UserIcon className="w-3.5 h-3.5" />
                <span>Login</span>
              </Link>
            )}

            {/* Mobile menu toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-gray-600 dark:text-gray-300"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Search Input */}
        <form onSubmit={handleSearch} className="mt-3 md:hidden relative">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search groceries..."
            className="w-full pl-9 pr-20 py-2 text-xs rounded-full bg-gray-100 dark:bg-slate-800 eye-protection:bg-[#F3ECD9] border border-transparent focus:border-[#2E7D32] outline-none"
          />
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
          <button
            type="submit"
            className="absolute right-1 top-1 bottom-1 px-3 bg-[#2E7D32] text-white text-xs font-semibold rounded-full"
          >
            Search
          </button>
        </form>

        {/* Mobile Expandable Drawer Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-gray-200 dark:border-slate-800 mt-3 pt-3 space-y-2">
            <div className="flex items-center justify-between pb-2 border-b border-gray-100 dark:border-slate-800">
              <span className="text-xs font-semibold text-gray-500">Theme Preference:</span>
              <ThemeSelector compact />
            </div>
            <Link
              href="/categories"
              onClick={() => setMobileMenuOpen(false)}
              className="block py-2 text-sm font-semibold text-gray-700 dark:text-gray-200"
            >
              Browse All Categories
            </Link>
            <Link
              href="/products"
              onClick={() => setMobileMenuOpen(false)}
              className="block py-2 text-sm font-semibold text-gray-700 dark:text-gray-200"
            >
              Popular Products & Offers
            </Link>
            <Link
              href="/orders"
              onClick={() => setMobileMenuOpen(false)}
              className="block py-2 text-sm font-semibold text-gray-700 dark:text-gray-200"
            >
              My Orders & Live Tracking
            </Link>
          </div>
        )}
      </div>

      {/* Interactive Location Selector Modal */}
      <LocationModal
        isOpen={locationModalOpen}
        onClose={() => setLocationModalOpen(false)}
        currentPincode={activeLocation.pincode}
        currentCity={activeLocation.city}
        deliveryMode={activeLocation.deliveryMode}
        onLocationSelected={(loc) => {
          setActiveLocation(loc);
          // Optional window dispatch to let homepage re-render serviceability banner
          if (typeof window !== 'undefined') {
            window.dispatchEvent(new CustomEvent('grovia-location-changed', { detail: loc }));
          }
        }}
      />
    </header>
  );
};
