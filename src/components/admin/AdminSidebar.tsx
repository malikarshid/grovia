'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  ShoppingBag,
  Boxes,
  Package,
  Layers,
  Truck,
  Users,
  Building2,
  BarChart3,
  TicketPercent,
  UserCheck,
  Bell,
  Settings,
  UserCircle,
  HelpCircle,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Globe,
  Store,
  MapPin,
  Coins,
  Navigation,
  UploadCloud,
  Bike,
  ShieldAlert,
} from 'lucide-react';
import { BrandLogo } from '@/components/common/BrandLogo';
import { useAuthStore } from '@/store/authStore';

interface AdminSidebarProps {
  collapsed: boolean;
  onToggleCollapse: () => void;
  mobileOpen: boolean;
  onCloseMobile: () => void;
}

export const AdminSidebar: React.FC<AdminSidebarProps> = ({
  collapsed,
  onToggleCollapse,
  mobileOpen,
  onCloseMobile,
}) => {
  const pathname = usePathname();
  const { user, logout } = useAuthStore();

  const menuSections = [
    {
      title: 'Operations',
      items: [
        { label: 'Dashboard', href: '/admin', icon: LayoutDashboard },
        { label: 'Orders', href: '/admin/orders', icon: ShoppingBag },
        { label: 'Inventory', href: '/admin/inventory', icon: Boxes },
        { label: 'Products', href: '/admin/products', icon: Package },
        { label: 'Categories', href: '/admin/categories', icon: Layers },
        { label: 'Deliveries', href: '/admin/deliveries', icon: Truck },
      ],
    },
    {
      title: 'Marketplace & Logistics',
      items: [
        { label: 'Marketplace SKUs', href: '/admin/marketplace', icon: Globe },
        { label: 'Fulfilment Centres', href: '/admin/fulfilment-centres', icon: Store },
        { label: 'PIN Serviceability', href: '/admin/serviceability', icon: MapPin },
        { label: 'Delivery Pricing', href: '/admin/pricing-rules', icon: Coins },
        { label: 'Fleet Tracking', href: '/admin/fleet-tracking', icon: Navigation },
        { label: 'Riders Fleet', href: '/admin/riders', icon: Bike },
        { label: 'Dispatch Console', href: '/admin/rider-assignments', icon: Navigation },
        { label: 'Rider Performance', href: '/admin/rider-performance', icon: BarChart3 },
        { label: 'Rider Settlements', href: '/admin/rider-earnings', icon: Coins },
        { label: 'Supplier Imports', href: '/admin/supplier-imports', icon: UploadCloud },
      ],
    },
    {
      title: 'Business & Relations',
      items: [
        { label: 'Customers', href: '/admin/customers', icon: Users },
        { label: 'Suppliers', href: '/admin/suppliers', icon: Building2 },
        { label: 'Reports & Analytics', href: '/admin/reports', icon: BarChart3 },
        { label: 'Promotions', href: '/admin/promotions', icon: TicketPercent },
      ],
    },
    {
      title: 'Administration',
      items: [
        { label: 'Staff Management', href: '/admin/staff', icon: UserCheck },
        { label: 'Audit Logs', href: '/admin/audit-logs', icon: ShieldAlert },
        { label: 'Notifications', href: '/admin/notifications', icon: Bell },
        { label: 'Settings', href: '/admin/settings', icon: Settings },
        { label: 'My Account', href: '/admin/account', icon: UserCircle },
        { label: 'Help & Support', href: '/admin/help', icon: HelpCircle },
      ],
    },
  ];

  const sidebarContent = (
    <aside
      className={`h-full flex flex-col justify-between bg-white dark:bg-slate-900 eye-protection:bg-[#FFFDF9] border-r border-gray-200 dark:border-slate-800 eye-protection:border-[#E6DCBE] transition-all duration-300 ${
        collapsed ? 'w-20' : 'w-64'
      }`}
    >
      {/* Top Header */}
      <div>
        <div className="h-16 px-4 flex items-center justify-between border-b border-gray-100 dark:border-slate-800">
          {!collapsed ? (
            <Link href="/admin">
              <BrandLogo size="sm" showTagline={false} isAdmin={true} />
            </Link>
          ) : (
            <div className="w-9 h-9 rounded-xl bg-[#2E7D32] flex items-center justify-center text-white font-black text-sm mx-auto">
              G
            </div>
          )}

          <button
            onClick={onToggleCollapse}
            className="hidden lg:flex p-1.5 rounded-lg text-gray-400 hover:text-gray-700 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-slate-800 transition"
            title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>

        {/* Navigation items */}
        <nav className="p-3 space-y-5 overflow-y-auto max-h-[calc(100vh-140px)] scrollbar-none">
          {menuSections.map((section, idx) => (
            <div key={idx} className="space-y-1">
              {!collapsed && (
                <span className="px-3 text-[10px] font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500">
                  {section.title}
                </span>
              )}
              {section.items.map((item) => {
                const isActive = pathname === item.href;
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={onCloseMobile}
                    title={collapsed ? item.label : undefined}
                    className={`flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold transition ${
                      isActive
                        ? 'bg-[#2E7D32] text-white shadow-sm'
                        : 'text-gray-600 dark:text-gray-300 eye-protection:text-[#3E3B32] hover:bg-gray-100 dark:hover:bg-slate-800 eye-protection:hover:bg-[#F3ECD9]'
                    } ${collapsed ? 'justify-center px-2' : ''}`}
                  >
                    <Icon className={`w-4 h-4 flex-shrink-0 ${isActive ? 'stroke-[2.5]' : 'stroke-2'}`} />
                    {!collapsed && <span className="truncate">{item.label}</span>}
                  </Link>
                );
              })}
            </div>
          ))}
        </nav>
      </div>

      {/* Bottom Profile & Sign out */}
      <div className="p-3 border-t border-gray-100 dark:border-slate-800">
        {!collapsed ? (
          <div className="flex items-center justify-between p-2 rounded-xl bg-gray-50 dark:bg-slate-800 eye-protection:bg-[#F3ECD9]">
            <div className="flex items-center gap-2 min-w-0">
              <div className="w-8 h-8 rounded-lg bg-green-100 dark:bg-slate-700 text-[#2E7D32] dark:text-[#4CAF50] font-black flex items-center justify-center text-xs uppercase flex-shrink-0">
                {user?.name ? user.name.charAt(0) : 'A'}
              </div>
              <div className="truncate">
                <p className="text-xs font-bold text-gray-900 dark:text-white truncate">
                  {user?.name || 'Admin'}
                </p>
                <p className="text-[10px] text-gray-400 truncate">{user?.role || 'SUPER_ADMIN'}</p>
              </div>
            </div>
            <button
              onClick={logout}
              title="Sign Out"
              className="text-gray-400 hover:text-red-500 p-1"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <button
            onClick={logout}
            title="Sign Out"
            className="w-full py-2 flex items-center justify-center text-gray-400 hover:text-red-500"
          >
            <LogOut className="w-4 h-4" />
          </button>
        )}
      </div>
    </aside>
  );

  return (
    <>
      {/* Desktop fixed sidebar */}
      <div className="hidden lg:block h-screen sticky top-0 z-30 flex-shrink-0">
        {sidebarContent}
      </div>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={onCloseMobile} />
          <div className="relative z-10 w-64 h-full animate-in slide-in-from-left duration-200">
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
};
