'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Bike,
  ShieldCheck,
  ShieldAlert,
  Search,
  Filter,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  RefreshCw,
  Phone,
  IndianRupee,
  MapPin,
} from 'lucide-react';

export default function AdminRidersPage() {
  const [riders, setRiders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const fetchRiders = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/admin/riders');
      const data = await res.json();
      if (res.ok) setRiders(data.riders || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRiders();
  }, []);

  const handleToggleSuspend = async (riderId: string, currentSuspended: boolean) => {
    try {
      setActionLoading(riderId);
      const res = await fetch(`/api/admin/riders/${riderId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isSuspended: !currentSuspended }),
      });

      if (res.ok) {
        setRiders((prev) =>
          prev.map((r) =>
            r.id === riderId || r.userId === riderId
              ? { ...r, user: { ...r.user, isSuspended: !currentSuspended } }
              : r
          )
        );
      }
    } catch (err) {
      console.error(err);
    } finally {
      setActionLoading(null);
    }
  };

  const filtered = riders.filter((r) => {
    const q = search.toLowerCase();
    return (
      r.user?.name?.toLowerCase().includes(q) ||
      r.user?.phone?.includes(q) ||
      r.vehicleNumber?.toLowerCase().includes(q) ||
      r.user?.username?.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-gray-900 dark:text-white eye-protection:text-[#3E3B32] flex items-center gap-2">
            <Bike className="w-7 h-7 text-[#2E7D32]" />
            <span>Delivery Fleet & Rider Partners</span>
          </h1>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Manage delivery personnel, credentials, live duty status, and fleet suspensions.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/admin/rider-assignments"
            className="px-4 py-2 bg-[#2E7D32] hover:bg-[#1B5E20] text-white text-xs font-bold rounded-xl shadow transition flex items-center gap-1.5"
          >
            <span>Dispatch Console</span>
          </Link>
          <button
            onClick={fetchRiders}
            className="p-2 bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-gray-300 rounded-xl hover:bg-gray-200 transition"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white dark:bg-slate-900 eye-protection:bg-[#FFFDF9] border border-gray-200 dark:border-slate-800 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-sm">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, phone, vehicle..."
            className="w-full bg-gray-50 dark:bg-slate-950 border border-gray-200 dark:border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:border-[#2E7D32]"
          />
        </div>

        <div className="flex items-center gap-3 text-xs text-gray-500">
          <span>Total Fleet: <strong className="text-gray-900 dark:text-white">{riders.length}</strong></span>
          <span>•</span>
          <span>Online: <strong className="text-emerald-500">{riders.filter(r => r.currentStatus !== 'OFFLINE').length}</strong></span>
        </div>
      </div>

      {/* Fleet Table */}
      <div className="bg-white dark:bg-slate-900 eye-protection:bg-[#FFFDF9] border border-gray-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-gray-50 dark:bg-slate-800/60 text-gray-500 dark:text-gray-400 font-semibold border-b border-gray-100 dark:border-slate-800">
                <th className="p-3.5">Rider Partner</th>
                <th className="p-3.5">Vehicle & Hub</th>
                <th className="p-3.5">Status</th>
                <th className="p-3.5">Completed Trips</th>
                <th className="p-3.5">Rating</th>
                <th className="p-3.5">Wallet Balance</th>
                <th className="p-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-slate-800">
              {loading ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-gray-400">
                    <RefreshCw className="w-6 h-6 animate-spin mx-auto text-[#2E7D32] mb-2" />
                    <span>Loading rider directory...</span>
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-gray-400">
                    No delivery riders found matching search.
                  </td>
                </tr>
              ) : (
                filtered.map((rider) => {
                  const isSuspended = rider.user?.isSuspended;
                  return (
                    <tr
                      key={rider.id}
                      className="hover:bg-gray-50/50 dark:hover:bg-slate-800/40 transition"
                    >
                      <td className="p-3.5">
                        <div className="flex items-center gap-2.5">
                          <div className="w-9 h-9 rounded-xl bg-green-100 dark:bg-green-950/60 text-[#2E7D32] font-black flex items-center justify-center shrink-0">
                            {rider.user?.name?.charAt(0) || 'R'}
                          </div>
                          <div>
                            <p className="font-bold text-gray-900 dark:text-white">
                              {rider.user?.name}
                            </p>
                            <p className="text-[11px] text-gray-400 font-mono">
                              ID: {rider.user?.username || 'rider'} • {rider.user?.phone}
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="p-3.5">
                        <p className="font-semibold text-gray-800 dark:text-gray-200">
                          {rider.vehicleType}
                        </p>
                        <p className="text-[10px] text-gray-400 font-mono">
                          {rider.vehicleNumber} • {rider.hub?.name || 'Central Hub'}
                        </p>
                      </td>

                      <td className="p-3.5">
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                            isSuspended
                              ? 'bg-red-100 dark:bg-red-950/50 text-red-600'
                              : rider.currentStatus === 'OFFLINE'
                              ? 'bg-gray-100 dark:bg-slate-800 text-gray-500'
                              : 'bg-emerald-100 dark:bg-emerald-950/50 text-emerald-600'
                          }`}
                        >
                          {isSuspended ? 'SUSPENDED' : rider.currentStatus}
                        </span>
                      </td>

                      <td className="p-3.5 font-bold text-gray-900 dark:text-white">
                        {rider.totalTrips || rider._count?.assignments || 0}
                      </td>

                      <td className="p-3.5">
                        <span className="font-bold text-amber-500">{rider.rating} ★</span>
                      </td>

                      <td className="p-3.5 font-black text-[#2E7D32]">
                        ₹{(rider.walletBalance || 0).toFixed(2)}
                      </td>

                      <td className="p-3.5 text-right space-x-2">
                        <Link
                          href={`/admin/riders/${rider.id}`}
                          className="px-2.5 py-1 bg-gray-100 dark:bg-slate-800 hover:bg-gray-200 text-gray-700 dark:text-gray-300 rounded-lg text-xs font-semibold"
                        >
                          Details
                        </Link>

                        <button
                          onClick={() => handleToggleSuspend(rider.id, isSuspended)}
                          disabled={actionLoading === rider.id}
                          className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition ${
                            isSuspended
                              ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200'
                              : 'bg-red-100 text-red-700 hover:bg-red-200'
                          }`}
                        >
                          {isSuspended ? 'Reactivate' : 'Suspend'}
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
