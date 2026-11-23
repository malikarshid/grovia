'use client';

import React, { useState, useEffect } from 'react';
import { BrandLogo } from '@/components/common/BrandLogo';

export const SplashScreen: React.FC<{ onFinish: () => void }> = ({ onFinish }) => {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    // 2.2-second automatic transition as required by prompt section 8
    const timer = setTimeout(() => {
      setVisible(false);
      onFinish();
    }, 2200);

    return () => clearTimeout(timer);
  }, [onFinish]);

  if (!visible) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Welcome to GROVIA"
      className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#FAFAFA] dark:bg-slate-950 eye-protection:bg-[#FBF7EE] transition-opacity duration-500"
    >
      <div className="flex flex-col items-center animate-pulse-subtle">
        <BrandLogo size="xl" showTagline={false} />
        <p className="mt-4 text-base sm:text-lg font-bold text-gray-700 dark:text-gray-200 eye-protection:text-[#3E3B32] tracking-wide">
          Fresh Living. Smarter Shopping.
        </p>

        {/* Loading Spinner */}
        <div className="mt-8 flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-[#2E7D32] animate-bounce [animation-delay:-0.3s]"></div>
          <div className="w-2.5 h-2.5 rounded-full bg-[#FF6F00] animate-bounce [animation-delay:-0.15s]"></div>
          <div className="w-2.5 h-2.5 rounded-full bg-[#2E7D32] animate-bounce"></div>
        </div>
      </div>

      <button
        onClick={() => {
          setVisible(false);
          onFinish();
        }}
        className="absolute bottom-8 text-xs font-semibold text-gray-400 hover:text-[#2E7D32] transition"
      >
        Skip Loading →
      </button>
    </div>
  );
};
