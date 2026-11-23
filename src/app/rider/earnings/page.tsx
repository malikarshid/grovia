'use client';

import React, { useState, useEffect } from 'react';
import {
  IndianRupee,
  TrendingUp,
  Wallet,
  Calendar,
  CheckCircle2,
  Clock,
  ArrowUpRight,
  RefreshCw,
} from 'lucide-react';

export default function RiderEarningsPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchEarnings = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/rider/earnings');
      const json = await res.json();
      if (res.ok) setData(json);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEarnings();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-slate-400 space-y-3">
        <RefreshCw className="w-8 h-8 animate-spin text-[#4CAF50]" />
        <p className="text-xs">Loading payouts & earnings...</p>
      </div>
    );
  }

  const summary = data?.summary || {
    today: 0,
    thisWeek: 0,
    walletBalance: 0,
    totalEarned: 0,
    totalTips: 0,
    totalTrips: 0,
  };

  const earningsList = data?.earningsList || [];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-black text-white">Earnings & Payouts</h1>
        <button
          onClick={fetchEarnings}
          className="p-1.5 rounded-lg bg-slate-800 text-slate-300 hover:text-white"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {/* Main Wallet Balance Card */}
      <div className="bg-gradient-to-br from-[#1B5E20] to-[#2E7D32] rounded-2xl p-5 shadow-2xl text-white space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-emerald-100 flex items-center gap-1.5">
            <Wallet className="w-4 h-4" />
            <span>Ready for Settlement</span>
          </span>
          <span className="text-[10px] bg-white/20 px-2 py-0.5 rounded-full font-bold">
            Weekly Auto-Payout
          </span>
        </div>

        <div>
          <span className="text-3xl font-black tracking-tight">
            ₹{summary.walletBalance.toFixed(2)}
          </span>
          <p className="text-xs text-emerald-100 mt-0.5">
            Next settlement scheduled for Wednesday to registered bank account.
          </p>
        </div>
      </div>

      {/* Breakdown Grid */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-slate-950 border border-slate-800 rounded-2xl p-3.5 space-y-1">
          <span className="text-xs text-slate-400">Today's Total</span>
          <p className="text-xl font-black text-white">₹{summary.today.toFixed(2)}</p>
          <span className="text-[10px] text-emerald-400 font-semibold">Active shift</span>
        </div>

        <div className="bg-slate-950 border border-slate-800 rounded-2xl p-3.5 space-y-1">
          <span className="text-xs text-slate-400">This Week</span>
          <p className="text-xl font-black text-white">₹{summary.thisWeek.toFixed(2)}</p>
          <span className="text-[10px] text-slate-400 font-semibold">
            {summary.totalTrips} completed trips
          </span>
        </div>
      </div>

      {/* Earnings Breakdown Standards */}
      <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 space-y-2.5">
        <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
          Per-Trip Rate Card
        </h3>
        <div className="space-y-1.5 text-xs">
          <div className="flex justify-between text-slate-400">
            <span>Base Delivery Fee</span>
            <span className="text-white font-bold">₹40.00 / trip</span>
          </div>
          <div className="flex justify-between text-slate-400">
            <span>Distance Surcharge (&gt; 2 km)</span>
            <span className="text-white font-bold">₹10.00 / km</span>
          </div>
          <div className="flex justify-between text-slate-400">
            <span>Customer Tips</span>
            <span className="text-emerald-400 font-bold">100% Passed to Rider</span>
          </div>
          <div className="flex justify-between text-slate-400">
            <span>Peak Hour Bonus</span>
            <span className="text-amber-400 font-bold">Up to ₹30.00</span>
          </div>
        </div>
      </div>

      {/* Recent Trip Credits */}
      <div className="space-y-2">
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider px-1">
          Recent Trip Credits
        </h3>

        {earningsList.length === 0 ? (
          <div className="bg-slate-950 border border-slate-800 rounded-2xl p-6 text-center text-slate-400 text-xs">
            No delivery earnings logged yet. Complete trips to see items credited here!
          </div>
        ) : (
          <div className="space-y-2">
            {earningsList.map((earning: any) => (
              <div
                key={earning.id}
                className="bg-slate-950 border border-slate-800 rounded-xl p-3 flex items-center justify-between"
              >
                <div>
                  <p className="text-xs font-bold text-white">
                    {earning.orderNumber || 'Order Trip Payout'}
                  </p>
                  <p className="text-[10px] text-slate-400">
                    Base: ₹{earning.baseFee} • Dist: ₹{earning.distancePay}
                    {earning.tip > 0 && ` • Tip: ₹${earning.tip}`}
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-sm font-black text-[#4CAF50]">
                    +₹{earning.total.toFixed(2)}
                  </span>
                  <span className="text-[10px] block text-emerald-400">Credited</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
