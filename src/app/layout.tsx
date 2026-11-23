import type { Metadata } from 'next';
import './globals.css';
import { ThemeInitializer } from '@/components/common/ThemeInitializer';
import { CustomerHeader } from '@/components/navigation/CustomerHeader';
import { CustomerBottomNav } from '@/components/navigation/CustomerBottomNav';
import { CustomerFooter } from '@/components/navigation/CustomerFooter';

export const metadata: Metadata = {
  title: 'GROVIA — Fresh Living. Smarter Shopping.',
  description:
    'Experience premier online grocery delivery in India. Farm fresh vegetables, fruits, dairy, and pantry essentials delivered to your doorstep in 2 hours.',
  keywords: 'grocery, fresh fruits, vegetables, dairy, online supermarket, Bangalore delivery, GROVIA',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="icon" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%232E7D32'><path d='M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z'/></svg>" />
      </head>
      <body className="antialiased min-h-screen flex flex-col">
        <ThemeInitializer />
        {children}
      </body>
    </html>
  );
}
