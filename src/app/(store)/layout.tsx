import React from 'react';
import { CustomerHeader } from '@/components/navigation/CustomerHeader';
import { CustomerBottomNav } from '@/components/navigation/CustomerBottomNav';
import { CustomerFooter } from '@/components/navigation/CustomerFooter';

export default function StoreLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col min-h-screen">
      <CustomerHeader />
      <main className="flex-1 pb-16 md:pb-0">{children}</main>
      <CustomerBottomNav />
      <CustomerFooter />
    </div>
  );
}
