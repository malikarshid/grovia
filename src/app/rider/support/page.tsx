'use client';

import React from 'react';
import Link from 'next/link';
import {
  ShieldAlert,
  PhoneCall,
  MessageSquare,
  HelpCircle,
  AlertTriangle,
  Building,
  CheckCircle2,
} from 'lucide-react';

export default function RiderSupportPage() {
  const handleTriggerSos = () => {
    alert('EMERGENCY SOS SIGNAL BROADCASTED: Fleet operations team and emergency services alerted with current GPS telemetry.');
  };

  return (
    <div className="space-y-4">
      <h1 className="text-lg font-black text-white">Rider Field Support</h1>

      {/* Emergency SOS Button */}
      <div className="bg-red-950/60 border-2 border-red-700 rounded-2xl p-5 text-center space-y-3 shadow-2xl">
        <div className="w-16 h-16 rounded-full bg-red-600 flex items-center justify-center text-white mx-auto shadow-lg shadow-red-950 animate-pulse">
          <ShieldAlert className="w-9 h-9" />
        </div>
        <div>
          <h2 className="text-base font-black text-red-200">EMERGENCY RIDER SOS</h2>
          <p className="text-xs text-red-300/80 max-w-xs mx-auto mt-1">
            Press immediately in case of accidents, threats, medical emergencies, or safety incidents.
          </p>
        </div>
        <button
          onClick={handleTriggerSos}
          className="w-full py-3 px-4 rounded-xl bg-red-600 hover:bg-red-700 text-white font-black text-sm uppercase tracking-wider shadow-lg transition"
        >
          BROADCAST EMERGENCY SOS
        </button>
      </div>

      {/* Quick Contacts */}
      <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 space-y-3">
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
          Direct Helplines
        </h3>

        <div className="space-y-2">
          <a
            href="tel:18002089682"
            className="flex items-center justify-between p-3 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-400">
                <PhoneCall className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-bold text-white">Fleet Operations Hotline</p>
                <p className="text-[10px] text-slate-400">Toll-free 24x7: 1800-208-9682</p>
              </div>
            </div>
            <span className="text-xs font-bold text-[#4CAF50]">Call Now</span>
          </a>

          <a
            href="tel:+911123456789"
            className="flex items-center justify-between p-3 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-400">
                <Building className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-bold text-white">Connaught Place Hub Manager</p>
                <p className="text-[10px] text-slate-400">+91 11 2345 6789</p>
              </div>
            </div>
            <span className="text-xs font-bold text-blue-400">Call Hub</span>
          </a>
        </div>
      </div>

      {/* Common Issue Reporting */}
      <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 space-y-3">
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
          Report Field Issue
        </h3>

        <div className="grid grid-cols-2 gap-2 text-xs">
          {[
            'Customer Unreachable',
            'Incorrect Address',
            'Damaged Package',
            'Flat Tyre / Breakdown',
            'Cash Collection Issue',
            'Heavy Rain / Weather',
          ].map((issue, idx) => (
            <button
              key={idx}
              onClick={() => alert(`Issue reported: "${issue}". Fleet dispatcher notified.`)}
              className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 text-left text-slate-300 font-semibold transition"
            >
              {issue}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
