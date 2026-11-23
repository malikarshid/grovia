'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Package,
  Navigation,
  IndianRupee,
  User,
  ShieldAlert,
  Wifi,
} from 'lucide-react';

export default function RiderLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  // If on login page, render clean full-screen layout
  if (pathname === '/rider/login') {
    return <>{children}</>;
  }

  const navItems = [
    { label: 'Dashboard', href: '/rider/dashboard', icon: LayoutDashboard },
    { label: 'Orders', href: '/rider/orders', icon: Package },
    { label: 'Nav', href: '/rider/navigation', icon: Navigation },
    { label: 'Earnings', href: '/rider/earnings', icon: IndianRupee },
    { label: 'Profile', href: '/rider/profile', icon: User },
  ];

  return (
    <div className="min-h-screen bg-slate-900 text-white flex flex-col max-w-md mx-auto relative shadow-2xl pb-20 selection:bg-[#2E7D32]">
      {/* Top Rider Operational Header */}
      <header className="sticky top-0 z-40 bg-slate-950/95 backdrop-blur-md border-b border-slate-800 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-[#2E7D32] flex items-center justify-center font-black text-white text-base shadow">
            G
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-sm tracking-wide text-white">GROVIA RIDER</span>
              <span className="text-[10px] font-semibold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-1.5 py-0.2 rounded">
                FIELD OPS
              </span>
            </div>
            <p className="text-[10px] text-slate-400">Hub: Connaught Place QuickHub</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/rider/support"
            className="p-1.5 rounded-lg bg-red-950/40 border border-red-800/50 text-red-400 hover:bg-red-900/50 transition flex items-center gap-1 text-[11px] font-bold"
            title="Emergency Support / SOS"
          >
            <ShieldAlert className="w-4 h-4 text-red-400 animate-pulse" />
            <span>SOS</span>
          </Link>
          <div className="flex items-center gap-1 bg-slate-800/80 px-2 py-1 rounded-md text-[11px] text-emerald-400 border border-slate-700">
            <Wifi className="w-3 h-3 text-emerald-400" />
            <span>GPS Active</span>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 p-4 overflow-y-auto">
        {children}
      </main>

      {/* Bottom Rider Navigation Bar */}
      <nav
        aria-label="Rider Navigation"
        className="fixed bottom-0 left-0 right-0 max-w-md mx-auto z-50 bg-slate-950/95 backdrop-blur-md border-t border-slate-800 px-3 py-2 flex items-center justify-around shadow-2xl"
      >
        {navItems.map((item) => {
          const isActive = pathname === item.href || (item.href !== '/rider/dashboard' && pathname.startsWith(item.href));
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition ${
                isActive
                  ? 'text-[#4CAF50] font-bold bg-slate-900/80'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Icon className={`w-5 h-5 ${isActive ? 'stroke-[2.5]' : 'stroke-2'}`} />
              <span className="text-[10px] mt-0.5 tracking-tight">{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
