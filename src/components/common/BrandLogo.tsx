import React from 'react';
import Link from 'next/link';
import { ShoppingBag, Sparkles } from 'lucide-react';

interface BrandLogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showTagline?: boolean;
  isAdmin?: boolean;
  className?: string;
}

export const BrandLogo: React.FC<BrandLogoProps> = ({
  size = 'md',
  showTagline = true,
  isAdmin = false,
  className = '',
}) => {
  const iconSizes = {
    sm: 'w-6 h-6',
    md: 'w-8 h-8',
    lg: 'w-10 h-10',
    xl: 'w-14 h-14',
  };

  const textSizes = {
    sm: 'text-lg',
    md: 'text-2xl',
    lg: 'text-3xl',
    xl: 'text-4xl',
  };

  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      <div className={`relative flex items-center justify-center rounded-xl bg-gradient-to-br from-[#2E7D32] to-[#1B5E20] text-white shadow-md shadow-green-900/10 ${iconSizes[size]}`}>
        <ShoppingBag className="w-1/2 h-1/2 stroke-[2.2]" />
        <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#FF6F00] opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#FF6F00]"></span>
        </span>
      </div>

      <div className="flex flex-col">
        <div className="flex items-center gap-1.5 leading-none">
          <span className={`font-black tracking-tight text-[#2E7D32] dark:text-[#4CAF50] ${textSizes[size]}`}>
            GROVIA
          </span>
          {isAdmin && (
            <span className="bg-[#FF6F00] text-white text-[10px] font-bold px-1.5 py-0.5 rounded tracking-wide uppercase">
              ADMIN
            </span>
          )}
        </div>
        {showTagline && size !== 'sm' && (
          <span className="text-[10px] font-semibold text-gray-500 dark:text-gray-400 eye-protection:text-[#787262] tracking-wider mt-0.5">
            Fresh Living. Smarter Shopping.
          </span>
        )}
      </div>
    </div>
  );
};
