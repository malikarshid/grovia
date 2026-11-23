'use client';

import React from 'react';
import {
  TrendingUp,
  Award,
  Zap,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Bike,
  ShieldCheck,
} from 'lucide-react';

export default function AdminRiderPerformancePage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-gray-900 dark:text-white flex items-center gap-2">
          <Award className="w-7 h-7 text-[#FF6F00]" />
          <span>Fleet Performance & Delivery SLA Analytics</span>
        </h1>
        <p className="text-xs text-gray-500 mt-1">
          Measure 10-minute quick delivery fulfillment, average trip speeds, acceptance rates, and customer NPS scores.
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-2xl shadow-sm">
          <span className="text-xs font-semibold text-gray-400">On-Time Delivery SLA</span>
          <p className="text-2xl font-black text-[#2E7D32] mt-1">98.4%</p>
          <span className="text-[10px] text-emerald-600 font-bold">↑ 1.2% this week</span>
        </div>

        <div className="p-5 bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-2xl shadow-sm">
          <span className="text-xs font-semibold text-gray-400">Avg. 10-Min Trip Time</span>
          <p className="text-2xl font-black text-gray-900 dark:text-white mt-1">8m 42s</p>
          <span className="text-[10px] text-emerald-600 font-bold">Within 10m target</span>
        </div>

        <div className="p-5 bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-2xl shadow-sm">
          <span className="text-xs font-semibold text-gray-400">Order Acceptance Rate</span>
          <p className="text-2xl font-black text-blue-600 mt-1">99.1%</p>
          <span className="text-[10px] text-gray-400">Less than 1% declined</span>
        </div>

        <div className="p-5 bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-2xl shadow-sm">
          <span className="text-xs font-semibold text-gray-400">Customer CSAT</span>
          <p className="text-2xl font-black text-amber-500 mt-1">4.92 ★</p>
          <span className="text-[10px] text-gray-400">Based on 1,420 ratings</span>
        </div>
      </div>

      {/* Performance Standards Table */}
      <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-4">
        <h2 className="font-bold text-sm text-gray-900 dark:text-white">
          Active Rider Leaderboard (Delhi NCR Hub)
        </h2>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-gray-100 dark:border-slate-800 text-gray-400">
                <th className="pb-3">Rider Name</th>
                <th className="pb-3">Vehicle</th>
                <th className="pb-3">Completed Trips</th>
                <th className="pb-3">Avg Speed</th>
                <th className="pb-3">On-Time %</th>
                <th className="pb-3 text-right">Rating</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-slate-800">
              {[
                { name: 'Ramesh Kumar', vehicle: 'DL 04 AB 9682 (EV)', trips: 954, speed: '24 km/h', onTime: '99.2%', rating: '4.95 ★' },
                { name: 'Sunil Verma', vehicle: 'DL 07 CZ 4120 (EV)', trips: 842, speed: '26 km/h', onTime: '98.5%', rating: '4.91 ★' },
                { name: 'Amit Sharma', vehicle: 'DL 01 XY 8831', trips: 720, speed: '22 km/h', onTime: '97.8%', rating: '4.88 ★' },
                { name: 'Deepak Yadav', vehicle: 'UP 16 AT 5519', trips: 680, speed: '25 km/h', onTime: '98.0%', rating: '4.90 ★' },
              ].map((row, i) => (
                <tr key={i} className="hover:bg-gray-50/50 dark:hover:bg-slate-800/40">
                  <td className="py-3 font-bold text-gray-900 dark:text-white">{row.name}</td>
                  <td className="py-3 text-gray-500 font-mono">{row.vehicle}</td>
                  <td className="py-3 font-semibold text-gray-800 dark:text-gray-200">{row.trips}</td>
                  <td className="py-3 text-gray-500">{row.speed}</td>
                  <td className="py-3 font-bold text-emerald-600">{row.onTime}</td>
                  <td className="py-3 text-right font-black text-amber-500">{row.rating}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
