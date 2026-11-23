'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { ShoppingBag } from 'lucide-react';

interface ImageWithFallbackProps {
  src: string;
  alt: string;
  className?: string;
  width?: number;
  height?: number;
  priority?: boolean;
}

export const ImageWithFallback: React.FC<ImageWithFallbackProps> = ({
  src,
  alt,
  className = '',
  width = 400,
  height = 400,
  priority = false,
}) => {
  const [error, setError] = useState(false);

  if (error || !src) {
    return (
      <div
        className={`flex flex-col items-center justify-center bg-green-50 dark:bg-slate-800 eye-protection:bg-[#F3ECD9] text-[#2E7D32] dark:text-[#4CAF50] p-4 rounded-xl border border-dashed border-green-200 dark:border-slate-700 ${className}`}
      >
        <ShoppingBag className="w-10 h-10 stroke-1 opacity-70 mb-1" />
        <span className="text-xs font-semibold text-center line-clamp-1">{alt}</span>
      </div>
    );
  }

  return (
    <Image
      src={src}
      alt={alt}
      width={width}
      height={height}
      priority={priority}
      onError={() => setError(true)}
      className={`object-cover transition-opacity duration-300 ${className}`}
    />
  );
};
