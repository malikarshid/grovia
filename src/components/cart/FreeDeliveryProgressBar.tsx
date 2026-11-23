'use client';

import React from 'react';
import { Truck, CheckCircle2 } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import { useCartStore } from '@/store/cartStore';

export const FreeDeliveryProgressBar: React.FC = () => {
  const { getSubtotal, freeDeliveryThreshold, getDeliveryRemaining } = useCartStore();
  const subtotal = getSubtotal();
  const remaining = getDeliveryRemaining();
  const percentage = Math.min(100, Math.round((subtotal / freeDeliveryThreshold) * 100));

  return (
    <div className="bg-green-50/70 dark:bg-slate-800/60 eye-protection:bg-[#F3ECD9] p-3 rounded-xl border border-green-200 dark:border-slate-700 eye-protection:border-[#E2D7BE]">
      <div className="flex items-center gap-2 text-xs font-semibold text-gray-800 dark:text-gray-200 mb-2">
        {remaining === 0 ? (
          <>
            <CheckCircle2 className="w-4 h-4 text-[#2E7D32] dark:text-[#4CAF50] flex-shrink-0" />
            <span className="text-[#2E7D32] dark:text-[#4CAF50] font-bold">
              Congratulations! You unlocked FREE 2-Hour Delivery 🎉
            </span>
          </>
        ) : (
          <>
            <Truck className="w-4 h-4 text-[#FF6F00] flex-shrink-0" />
            <span>
              Add <span className="font-extrabold text-[#2E7D32] dark:text-[#4CAF50]">{formatCurrency(remaining)}</span> more to get <span className="font-bold underline text-[#FF6F00]">FREE Delivery</span>!
            </span>
          </>
        )}
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-gray-200 dark:bg-slate-700 rounded-full h-2 overflow-hidden">
        <div
          className="bg-gradient-to-r from-[#2E7D32] to-[#FF6F00] h-full rounded-full transition-all duration-500 ease-out"
          style={{ width: `${percentage}%` }}
        />
      </div>
      <div className="flex justify-between text-[10px] text-gray-400 mt-1 font-medium">
        <span>₹0</span>
        <span>Target: {formatCurrency(freeDeliveryThreshold)}</span>
      </div>
    </div>
  );
};
