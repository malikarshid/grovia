'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Grid, Heart, ShoppingBag, User } from 'lucide-react';
import { useCartStore } from '@/store/cartStore';

export const CustomerBottomNav: React.FC = () => {
  const pathname = usePathname();
  const { getItemCount } = useCartStore();
  const cartCount = getItemCount();

  // Don't render on admin or rider routes
  if (pathname.startsWith('/admin') || pathname.startsWith('/rider')) {
    return null;
  }

  const navItems = [
    { label: 'Home', href: '/', icon: Home },
    { label: 'Categories', href: '/categories', icon: Grid },
    { label: 'Wishlist', href: '/favorites', icon: Heart },
    { label: 'Cart', href: '/cart', icon: ShoppingBag, badge: cartCount },
    { label: 'Profile', href: '/profile', icon: User },
  ];

  return (
    <nav
      aria-label="Mobile Bottom Navigation"
      className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-slate-900/95 eye-protection:bg-[#FFFDF9]/95 backdrop-blur-md border-t border-gray-200 dark:border-slate-800 eye-protection:border-[#E6DCBE] px-2 py-1.5 shadow-lg"
    >
      <div className="flex items-center justify-around">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center justify-center py-1 px-3 rounded-lg relative transition ${
                isActive
                  ? 'text-[#2E7D32] dark:text-[#4CAF50] font-bold'
                  : 'text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-white eye-protection:text-[#787262]'
              }`}
            >
              <div className="relative">
                <Icon className={`w-5 h-5 ${isActive ? 'stroke-[2.5]' : 'stroke-2'}`} />
                {item.badge !== undefined && item.badge > 0 && (
                  <span className="absolute -top-1.5 -right-2.5 bg-[#FF6F00] text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                    {item.badge}
                  </span>
                )}
              </div>
              <span className="text-[10px] mt-0.5">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
};
