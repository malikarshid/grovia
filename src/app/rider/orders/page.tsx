'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Package, Clock, MapPin, CheckCircle2, ChevronRight, RefreshCw } from 'lucide-react';

export default function RiderOrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [filter, setFilter] = useState<'all' | 'active' | 'delivered'>('all');
  const [loading, setLoading] = useState(true);

  const fetchOrders = async (currentFilter: string) => {
    try {
      setLoading(true);
      const res = await fetch(`/api/rider/orders?filter=${currentFilter}`);
      const data = await res.json();
      if (res.ok) {
        setOrders(data.orders || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders(filter);
  }, [filter]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-black text-white">Trip & Order Queue</h1>
        <button
          onClick={() => fetchOrders(filter)}
          className="p-1.5 rounded-lg bg-slate-800 text-slate-300 hover:text-white"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Tabs */}
      <div className="flex bg-slate-950 border border-slate-800 rounded-xl p-1 gap-1">
        {(['all', 'active', 'delivered'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setFilter(tab)}
            className={`flex-1 py-1.5 text-xs font-bold rounded-lg capitalize transition ${
              filter === tab
                ? 'bg-[#2E7D32] text-white shadow'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Order List */}
      {loading ? (
        <div className="py-12 text-center text-slate-400 space-y-2">
          <RefreshCw className="w-6 h-6 animate-spin mx-auto text-emerald-400" />
          <p className="text-xs">Loading trips...</p>
        </div>
      ) : orders.length === 0 ? (
        <div className="bg-slate-950 border border-slate-800 rounded-2xl p-8 text-center space-y-2">
          <Package className="w-10 h-10 text-slate-600 mx-auto" />
          <p className="text-sm font-bold text-white">No orders found</p>
          <p className="text-xs text-slate-400">There are no orders matching this filter.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {orders.map((order) => {
            const isCompleted = order.assignmentStatus === 'DELIVERED';
            return (
              <Link
                key={order.assignmentId}
                href={`/rider/orders/${order.orderId}`}
                className="block bg-slate-950 border border-slate-800 hover:border-slate-700 rounded-2xl p-4 transition shadow-md"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-black text-sm text-white">{order.orderNumber}</span>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      isCompleted
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                        : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                    }`}
                  >
                    {order.assignmentStatus.replace(/_/g, ' ')}
                  </span>
                </div>

                <div className="space-y-1.5 text-xs text-slate-300">
                  <div className="flex items-center gap-2">
                    <span className="text-slate-400">Customer:</span>
                    <span className="font-semibold text-white">{order.customerName}</span>
                  </div>
                  <div className="flex items-start gap-1.5 text-slate-400">
                    <MapPin className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                    <span className="line-clamp-1">{order.shippingAddress}</span>
                  </div>
                </div>

                <div className="mt-3 pt-2 border-t border-slate-900 flex items-center justify-between text-xs">
                  <span className="text-slate-400">
                    {order.itemCount} items • <strong className="text-white">₹{order.totalAmount}</strong>
                  </span>
                  <div className="flex items-center gap-1 text-[#4CAF50] font-bold text-[11px]">
                    <span>View Task</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
