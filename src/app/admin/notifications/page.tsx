'use client';

import React, { useState, useEffect } from 'react';
import { Bell, Check, ShoppingBag, AlertTriangle, Info } from 'lucide-react';
import { formatDate } from '@/lib/utils';

export default function AdminNotificationsPage() {
  const [notifications, setNotifications] = useState([
    {
      id: '1',
      title: 'New Online Order #GRO-2026-9110',
      message: 'New order placed by Priya Patel for ₹838.95 via COD.',
      type: 'ORDER',
      time: new Date(),
      isRead: false,
    },
    {
      id: '2',
      title: 'Low Stock Alert: Organic Palak',
      message: 'Organic Palak (Spinach) has reached threshold (10 units remaining).',
      type: 'STOCK',
      time: new Date(Date.now() - 3600000),
      isRead: false,
    },
    {
      id: '3',
      title: 'Delivery Partner Dispatched',
      message: 'Partner Sunil Gowda dispatched for delivery of Order #GRO-2026-8812.',
      type: 'INFO',
      time: new Date(Date.now() - 7200000),
      isRead: true,
    },
  ]);

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-gray-900 dark:text-white">
            Operational Notifications
          </h1>
          <p className="text-xs text-gray-500">
            Real-time notifications for incoming orders, low inventory, and system events
          </p>
        </div>

        <button
          onClick={markAllAsRead}
          className="text-xs font-bold text-[#2E7D32] hover:underline flex items-center gap-1"
        >
          <Check className="w-3.5 h-3.5" />
          <span>Mark all as read</span>
        </button>
      </div>

      <div className="space-y-3">
        {notifications.map((n) => (
          <div
            key={n.id}
            className={`p-4 rounded-2xl border transition flex items-start gap-3.5 ${
              n.isRead
                ? 'bg-white dark:bg-slate-900 border-gray-100 dark:border-slate-800 opacity-75'
                : 'bg-green-50/50 dark:bg-slate-800 border-green-200 dark:border-slate-700 shadow-sm'
            }`}
          >
            <div
              className={`p-2 rounded-xl text-white flex-shrink-0 ${
                n.type === 'STOCK' ? 'bg-[#FF6F00]' : 'bg-[#2E7D32]'
              }`}
            >
              {n.type === 'STOCK' ? <AlertTriangle className="w-4 h-4" /> : <ShoppingBag className="w-4 h-4" />}
            </div>

            <div className="flex-1">
              <div className="flex items-center justify-between">
                <h4 className="font-bold text-sm text-gray-900 dark:text-white">{n.title}</h4>
                <span className="text-[10px] text-gray-400">{formatDate(n.time)}</span>
              </div>
              <p className="text-xs text-gray-600 dark:text-gray-300 mt-0.5">{n.message}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
