'use client';

import React, { useState, useEffect } from 'react';
import {
  Truck,
  Search,
  Phone,
  Clock,
  MapPin,
  CheckCircle2,
  Calendar,
  User,
} from 'lucide-react';
import { formatDate } from '@/lib/utils';

export default function AdminDeliveriesPage() {
  const [deliveries, setDeliveries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('ALL');

  const loadDeliveries = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (statusFilter !== 'ALL') params.set('status', statusFilter);
      const res = await fetch(`/api/deliveries?${params.toString()}`);
      const data = await res.json();
      setDeliveries(data.deliveries || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDeliveries();
  }, [statusFilter]);

  const handleUpdate = async (id: string, status: string, driverName?: string) => {
    try {
      await fetch(`/api/deliveries/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status,
          deliveryPersonName: driverName,
        }),
      });
      loadDeliveries();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-gray-900 dark:text-white">
            Delivery Fleet & Dispatch
          </h1>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Assign delivery partners, monitor route departures, and track order fulfillment
          </p>
        </div>

        <div className="flex items-center gap-2">
          {['ALL', 'PENDING', 'OUT_FOR_DELIVERY', 'DELIVERED'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                statusFilter === st
                  ? 'bg-[#2E7D32] text-white shadow-sm'
                  : 'bg-white dark:bg-slate-900 text-gray-600 border border-gray-200 dark:border-slate-800'
              }`}
            >
              {st.replace(/_/g, ' ')}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 eye-protection:bg-[#FFFDF9] rounded-3xl border border-gray-200/80 dark:border-slate-800 eye-protection:border-[#E6DCBE] shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-gray-100 dark:border-slate-800 text-gray-400 uppercase text-[10px] tracking-wider bg-gray-50/50 dark:bg-slate-800/40">
                <th className="py-3 px-4 font-bold">Tracking #</th>
                <th className="py-3 px-4 font-bold">Order Details</th>
                <th className="py-3 px-4 font-bold">Destination</th>
                <th className="py-3 px-4 font-bold">Partner Assigned</th>
                <th className="py-3 px-4 font-bold">Status</th>
                <th className="py-3 px-4 font-bold text-right">Dispatch Control</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-slate-800">
              {deliveries.map((deliv) => (
                <tr key={deliv.id} className="hover:bg-gray-50/60 dark:hover:bg-slate-800/40 transition">
                  <td className="py-3 px-4 font-mono font-bold text-[#2E7D32]">
                    {deliv.trackingNumber}
                  </td>
                  <td className="py-3 px-4">
                    <span className="font-bold text-gray-900 dark:text-white block">
                      #{deliv.order?.orderNumber}
                    </span>
                    <span className="text-[10px] text-gray-400">
                      Slot: {deliv.order?.deliverySlot?.startTime || 'Morning'}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <span className="font-bold text-gray-900 dark:text-white block">
                      {deliv.order?.address?.fullName}
                    </span>
                    <span className="text-gray-500 text-[11px]">
                      {deliv.order?.address?.area}, {deliv.order?.address?.pincode}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <span className="font-bold text-gray-800 dark:text-gray-200 block">
                      {deliv.deliveryPersonName || 'Needs Assignment'}
                    </span>
                    {deliv.deliveryPersonPhone && (
                      <span className="text-[11px] text-gray-400 font-mono">
                        {deliv.deliveryPersonPhone}
                      </span>
                    )}
                  </td>
                  <td className="py-3 px-4">
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                        deliv.status === 'DELIVERED'
                          ? 'bg-green-100 text-[#2E7D32]'
                          : deliv.status === 'OUT_FOR_DELIVERY'
                          ? 'bg-orange-100 text-[#FF6F00]'
                          : 'bg-blue-100 text-blue-700'
                      }`}
                    >
                      {deliv.status.replace(/_/g, ' ')}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <select
                        value={deliv.status}
                        onChange={(e) => handleUpdate(deliv.id, e.target.value)}
                        className="bg-gray-100 dark:bg-slate-800 border-none rounded-lg px-2 py-1 text-xs font-bold text-gray-700 dark:text-gray-200 outline-none"
                      >
                        <option value="PENDING">PENDING</option>
                        <option value="OUT_FOR_DELIVERY">OUT FOR DELIVERY</option>
                        <option value="DELIVERED">DELIVERED</option>
                      </select>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
