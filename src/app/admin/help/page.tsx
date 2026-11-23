'use client';

import React from 'react';
import { HelpCircle, Phone, Mail, FileText, CheckCircle2 } from 'lucide-react';

export default function AdminHelpPage() {
  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-xl sm:text-2xl font-black text-gray-900 dark:text-white">
          Admin Help & Operations Manual
        </h1>
        <p className="text-xs text-gray-500">
          Guide to managing GROVIA grocery store, orders, deliveries, and procurement
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-white dark:bg-slate-900 eye-protection:bg-[#FFFDF9] rounded-3xl p-6 border border-gray-200 dark:border-slate-800 shadow-sm space-y-2">
          <h3 className="font-bold text-sm text-[#2E7D32]">Order Fulfillment Flow</h3>
          <p className="text-xs text-gray-600 dark:text-gray-300 leading-relaxed">
            When customer orders arrive with status <span className="font-bold text-blue-600">CONFIRMED</span>, warehouse staff packages items and marks the order as <span className="font-bold text-blue-600">PACKED</span>. Delivery partners update the order to <span className="font-bold text-[#FF6F00]">OUT FOR DELIVERY</span> and complete doorstep handover as <span className="font-bold text-[#2E7D32]">DELIVERED</span>.
          </p>
        </div>

        <div className="bg-white dark:bg-slate-900 eye-protection:bg-[#FFFDF9] rounded-3xl p-6 border border-gray-200 dark:border-slate-800 shadow-sm space-y-2">
          <h3 className="font-bold text-sm text-[#2E7D32]">Inventory Reorder Levels</h3>
          <p className="text-xs text-gray-600 dark:text-gray-300 leading-relaxed">
            Products falling at or below their <span className="font-bold">minStock</span> threshold trigger a <span className="font-bold text-amber-600">LOW STOCK</span> badge. The system alerts staff to issue purchase orders to assigned farm suppliers with lead time tracking.
          </p>
        </div>
      </div>
    </div>
  );
}
