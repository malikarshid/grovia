'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  Bike,
  ShieldCheck,
  ShieldAlert,
  Phone,
  Mail,
  Wallet,
  Calendar,
  CheckCircle2,
  Clock,
  RefreshCw,
} from 'lucide-react';

export default function AdminRiderDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const [rider, setRider] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [suspending, setSuspending] = useState(false);

  const fetchRider = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/admin/riders/${params.id}`);
      const data = await res.json();
      if (res.ok) setRider(data.rider);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRider();
  }, [params.id]);

  const handleToggleSuspend = async () => {
    if (!rider) return;
    try {
      setSuspending(true);
      const currentSuspended = rider.user?.isSuspended;
      const res = await fetch(`/api/admin/riders/${rider.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isSuspended: !currentSuspended }),
      });

      if (res.ok) {
        setRider((prev: any) => ({
          ...prev,
          user: { ...prev.user, isSuspended: !currentSuspended },
        }));
      }
    } catch (e) {
      console.error(e);
    } finally {
      setSuspending(false);
    }
  };

  if (loading) {
    return (
      <div className="py-24 text-center text-gray-400 space-y-2">
        <RefreshCw className="w-8 h-8 animate-spin mx-auto text-[#2E7D32]" />
        <p className="text-xs">Loading rider profile...</p>
      </div>
    );
  }

  if (!rider) {
    return (
      <div className="p-8 text-center space-y-3">
        <p className="font-bold text-gray-900 dark:text-white">Rider not found</p>
        <Link href="/admin/riders" className="text-xs text-[#2E7D32] underline">
          Back to rider directory
        </Link>
      </div>
    );
  }

  const isSuspended = rider.user?.isSuspended;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Link
          href="/admin/riders"
          className="p-2 rounded-xl bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-gray-300 hover:text-black dark:hover:text-white transition"
        >
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div className="text-center">
          <h1 className="text-lg font-black text-gray-900 dark:text-white">
            {rider.user?.name}
          </h1>
          <span className="text-xs text-gray-400">Rider Partner Operations Dossier</span>
        </div>
        <button
          onClick={handleToggleSuspend}
          disabled={suspending}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
            isSuspended
              ? 'bg-emerald-600 text-white hover:bg-emerald-700'
              : 'bg-red-600 text-white hover:bg-red-700'
          }`}
        >
          {isSuspended ? 'Reactivate Account' : 'Suspend Account'}
        </button>
      </div>

      {/* Main Dossier Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left Column: Personal & Credentials */}
        <div className="bg-white dark:bg-slate-900 eye-protection:bg-[#FFFDF9] border border-gray-200 dark:border-slate-800 rounded-2xl p-5 space-y-4 shadow-sm">
          <div className="text-center space-y-2">
            <div className="w-16 h-16 rounded-2xl bg-green-100 dark:bg-green-950/60 text-[#2E7D32] flex items-center justify-center font-black text-2xl mx-auto">
              {rider.user?.name?.charAt(0) || 'R'}
            </div>
            <h2 className="font-bold text-base text-gray-900 dark:text-white">
              {rider.user?.name}
            </h2>
            <p className="text-xs text-gray-400 font-mono">ID: {rider.user?.username || 'rider_me'}</p>
          </div>

          <div className="space-y-2 pt-2 border-t border-gray-100 dark:border-slate-800 text-xs">
            <div className="flex justify-between">
              <span className="text-gray-400">Phone:</span>
              <span className="font-semibold text-gray-900 dark:text-white">{rider.user?.phone}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Email:</span>
              <span className="font-semibold text-gray-900 dark:text-white">{rider.user?.email}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Vehicle Type:</span>
              <span className="font-semibold text-gray-900 dark:text-white">{rider.vehicleType}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Registration:</span>
              <span className="font-mono font-bold text-gray-900 dark:text-white">{rider.vehicleNumber}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">License:</span>
              <span className="font-mono font-bold text-gray-900 dark:text-white">{rider.licenseNumber}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Assigned Hub:</span>
              <span className="font-semibold text-gray-900 dark:text-white">{rider.hub?.name || 'Connaught Place'}</span>
            </div>
          </div>
        </div>

        {/* Middle Column: Operational Scores */}
        <div className="bg-white dark:bg-slate-900 eye-protection:bg-[#FFFDF9] border border-gray-200 dark:border-slate-800 rounded-2xl p-5 space-y-4 shadow-sm">
          <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">
            Operational KPIs & Wallet
          </h3>

          <div className="grid grid-cols-2 gap-3 text-center">
            <div className="p-3 rounded-xl bg-gray-50 dark:bg-slate-800/60">
              <span className="text-[10px] text-gray-400 block">Total Trips</span>
              <span className="text-lg font-black text-gray-900 dark:text-white">{rider.totalTrips || 0}</span>
            </div>
            <div className="p-3 rounded-xl bg-gray-50 dark:bg-slate-800/60">
              <span className="text-[10px] text-gray-400 block">Rating</span>
              <span className="text-lg font-black text-amber-500">{rider.rating} ★</span>
            </div>
            <div className="p-3 rounded-xl bg-gray-50 dark:bg-slate-800/60">
              <span className="text-[10px] text-gray-400 block">Acceptance</span>
              <span className="text-lg font-black text-emerald-500">{rider.acceptanceRate}%</span>
            </div>
            <div className="p-3 rounded-xl bg-gray-50 dark:bg-slate-800/60">
              <span className="text-[10px] text-gray-400 block">On-Time Rate</span>
              <span className="text-lg font-black text-emerald-500">{rider.onTimeRate}%</span>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-gradient-to-br from-[#1B5E20] to-[#2E7D32] text-white space-y-1">
            <span className="text-[10px] uppercase font-bold text-emerald-100 block">Wallet Payable</span>
            <span className="text-2xl font-black">₹{(rider.walletBalance || 0).toFixed(2)}</span>
            <p className="text-[10px] text-emerald-100">Ready for automated weekly bank settlement</p>
          </div>
        </div>

        {/* Right Column: Historical Settlements */}
        <div className="bg-white dark:bg-slate-900 eye-protection:bg-[#FFFDF9] border border-gray-200 dark:border-slate-800 rounded-2xl p-5 space-y-3 shadow-sm">
          <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">
            Settlement Audit Trail
          </h3>

          {rider.settlements?.length === 0 ? (
            <p className="text-xs text-gray-400 py-6 text-center">No settlements processed yet.</p>
          ) : (
            <div className="space-y-2">
              {rider.settlements?.map((s: any) => (
                <div key={s.id} className="p-2.5 rounded-xl bg-gray-50 dark:bg-slate-800/60 flex items-center justify-between text-xs">
                  <div>
                    <span className="font-mono font-bold text-gray-800 dark:text-gray-200">{s.payoutRef}</span>
                    <span className="text-[10px] text-gray-400 block">Status: {s.status}</span>
                  </div>
                  <span className="font-black text-[#2E7D32]">₹{s.amount.toFixed(2)}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Recent Trips Table */}
      <div className="bg-white dark:bg-slate-900 eye-protection:bg-[#FFFDF9] border border-gray-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm space-y-4">
        <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">
          Trip History Log
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-gray-100 dark:border-slate-800 text-gray-400">
                <th className="pb-2">Order #</th>
                <th className="pb-2">Status</th>
                <th className="pb-2">Total Amount</th>
                <th className="pb-2">Customer</th>
                <th className="pb-2 text-right">Time</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-slate-800">
              {rider.assignments?.map((a: any) => (
                <tr key={a.id} className="hover:bg-gray-50 dark:hover:bg-slate-800/50">
                  <td className="py-2.5 font-bold text-gray-900 dark:text-white">
                    {a.order?.orderNumber}
                  </td>
                  <td className="py-2.5">
                    <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-600 text-[10px] font-bold">
                      {a.status}
                    </span>
                  </td>
                  <td className="py-2.5 font-semibold text-gray-800 dark:text-gray-200">
                    ₹{a.order?.totalAmount}
                  </td>
                  <td className="py-2.5 text-gray-500">
                    {a.order?.customerName}
                  </td>
                  <td className="py-2.5 text-right text-gray-400">
                    {new Date(a.assignedAt).toLocaleDateString()}
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
