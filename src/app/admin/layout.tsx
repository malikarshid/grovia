'use client';

import React, { useState, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { AdminSidebar } from '@/components/admin/AdminSidebar';
import { AdminHeader } from '@/components/admin/AdminHeader';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [dateFilter, setDateFilter] = useState('week');
  const [authChecking, setAuthChecking] = useState(true);

  useEffect(() => {
    if (pathname === '/admin/login') {
      setAuthChecking(false);
      return;
    }

    // Verify session client-side to prevent unauthenticated dashboard calls
    fetch('/api/auth/me')
      .then((res) => res.json())
      .then((data) => {
        const ADMIN_ROLES = ['ADMIN', 'SUPER_ADMIN', 'INVENTORY_MGR', 'ORDER_MGR', 'DELIVERY_MGR'];
        if (!data.user || !ADMIN_ROLES.includes(data.user.role)) {
          router.push('/admin/login');
        } else {
          setAuthChecking(false);
        }
      })
      .catch(() => {
        router.push('/admin/login');
      });
  }, [pathname, router]);

  if (pathname === '/admin/login') {
    return <>{children}</>;
  }

  if (authChecking) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-slate-400 space-y-3">
        <div className="w-8 h-8 border-2 border-[#2E7D32] border-t-transparent rounded-full animate-spin" />
        <p className="text-xs">Authenticating Enterprise Admin Session...</p>
      </div>
    );
  }

  const handleExport = () => {
    // Generate and download sample CSV of business orders
    const csvContent =
      'data:text/csv;charset=utf-8,' +
      'Order ID,Customer,Total,Status,Channel,Date\n' +
      'GRO-2026-8812,Rahul Sharma,691.95,DELIVERED,MOBILE,2026-11-20\n' +
      'GRO-2026-9045,Rahul Sharma,576.45,OUT_FOR_DELIVERY,WEB,2026-11-22\n' +
      'GRO-2026-9110,Priya Patel,838.95,CONFIRMED,WEB,2026-11-22\n';

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `grovia_business_report_${dateFilter}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="flex min-h-screen bg-[#FAFAFA] dark:bg-slate-950 eye-protection:bg-[#FBF7EE] text-gray-900 dark:text-gray-100 transition-colors">
      <AdminSidebar
        collapsed={collapsed}
        onToggleCollapse={() => setCollapsed(!collapsed)}
        mobileOpen={mobileOpen}
        onCloseMobile={() => setMobileOpen(false)}
      />

      <div className="flex-1 flex flex-col min-w-0">
        <AdminHeader
          onOpenMobileSidebar={() => setMobileOpen(true)}
          dateFilter={dateFilter}
          setDateFilter={setDateFilter}
          onExport={handleExport}
        />
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto space-y-6">
          {children}
        </main>
      </div>
    </div>
  );
}
