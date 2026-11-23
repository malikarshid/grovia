'use client';

import React, { useState, useEffect } from 'react';
import {
  IndianRupee,
  Wallet,
  CheckCircle2,
  AlertCircle,
  Clock,
  ArrowUpRight,
  RefreshCw,
  Building2,
} from 'lucide-react';

export default function AdminRiderEarningsPage() {
  const [riders, setRiders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [settling, setSettling] = useState<string | null>(null);
  const [msg, setMsg] = useState<string | null>(null);

  const fetchRiders = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/admin/riders');
      const data = await res.json();
      if (res.ok) setRiders(data.riders || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRiders();
  }, []);

  const handleSettle = async (riderId: string) => {
    try {
      setSettling(riderId);
      setMsg(null);
      const res = await fetch('/api/admin/riders/settle', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ riderId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to settle rider balance');

      setMsg(data.message);
      await fetchRiders();
    } catch (e: any) {
      alert(e.message);
    } finally {
      setSettling(null);
    }
  };

  const totalPayable = riders.reduce((acc, r) => acc + (r.walletBalance || 0), 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-gray-900 dark:text-white flex items-center gap-2">
            <IndianRupee className="w-7 h-7 text-[#2E7D32]" />
            <span>Rider Settlements & Payouts Console</span>
          </h1>
          <p className="text-xs text-gray-500 mt-1">
            Automate weekly bank disbursements, view unsettled balances, and process rider payouts.
          </p>
        </div>
        <button
          onClick={fetchRiders}
          className="p-2 bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-gray-300 rounded-xl hover:bg-gray-200"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {msg && (
        <div className="p-3 bg-emerald-50 text-[#2E7D32] border border-emerald-200 rounded-xl text-xs font-semibold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4" />
          <span>{msg}</span>
        </div>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 bg-gradient-to-br from-[#1B5E20] to-[#2E7D32] text-white rounded-2xl shadow-lg space-y-1">
          <span className="text-xs text-emerald-100 font-medium">Total Pending Fleet Payables</span>
          <p className="text-3xl font-black">₹{totalPayable.toFixed(2)}</p>
          <span className="text-[10px] text-emerald-100 block">Across {riders.length} active delivery partners</span>
        </div>

        <div className="p-5 bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-2xl shadow-sm space-y-1">
          <span className="text-xs text-gray-400 font-medium">Standard Settlement Cycle</span>
          <p className="text-xl font-bold text-gray-900 dark:text-white">Every Wednesday (T+3)</p>
          <span className="text-[10px] text-gray-400 block">Direct NEFT / IMPS transfer</span>
        </div>

        <div className="p-5 bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-2xl shadow-sm space-y-1">
          <span className="text-xs text-gray-400 font-medium">Platform Fee & TDS</span>
          <p className="text-xl font-bold text-gray-900 dark:text-white">0% Platform Cut</p>
          <span className="text-[10px] text-emerald-600 font-bold">100% Delivery fee & tips to rider</span>
        </div>
      </div>

      {/* Riders Settlement Table */}
      <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm space-y-4">
        <h2 className="font-bold text-sm text-gray-900 dark:text-white">
          Rider Balance Audit & Settlement Action
        </h2>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-gray-100 dark:border-slate-800 text-gray-400">
                <th className="pb-3">Rider Partner</th>
                <th className="pb-3">Bank Phone / Account</th>
                <th className="pb-3">Trips Logged</th>
                <th className="pb-3">Wallet Balance</th>
                <th className="pb-3 text-right">Settlement Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-slate-800">
              {riders.map((r) => {
                const balance = r.walletBalance || 0;
                return (
                  <tr key={r.id} className="hover:bg-gray-50/50 dark:hover:bg-slate-800/40">
                    <td className="py-3">
                      <p className="font-bold text-gray-900 dark:text-white">{r.user?.name}</p>
                      <p className="text-[10px] text-gray-400 font-mono">ID: {r.user?.username || 'rider_me'}</p>
                    </td>
                    <td className="py-3 text-gray-500 font-mono">{r.user?.phone}</td>
                    <td className="py-3 font-semibold text-gray-800 dark:text-gray-200">{r.totalTrips || 0}</td>
                    <td className="py-3 font-black text-[#2E7D32] text-sm">
                      ₹{balance.toFixed(2)}
                    </td>
                    <td className="py-3 text-right">
                      <button
                        onClick={() => handleSettle(r.id)}
                        disabled={settling === r.id || balance <= 0}
                        className="px-3 py-1.5 rounded-xl bg-[#2E7D32] hover:bg-[#1B5E20] disabled:bg-gray-200 disabled:text-gray-400 text-white font-bold text-xs transition shadow"
                      >
                        {settling === r.id ? 'Processing...' : 'Approve & Settle'}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
