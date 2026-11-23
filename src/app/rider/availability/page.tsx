'use client';

import React, { useState, useEffect } from 'react';
import { Calendar, Clock, Power, ShieldCheck, CheckCircle2, AlertCircle, RefreshCw, X } from 'lucide-react';

export default function RiderAvailabilityPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [toggling, setToggling] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const fetchAvailability = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch('/api/rider/availability');
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Failed to fetch availability status');
      setData(json);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAvailability();
  }, []);

  const handleToggle = async () => {
    if (!data || toggling) return;
    setError(null);
    setSuccessMsg(null);

    const targetOnline = !data.isOnline;

    try {
      setToggling(true);
      const res = await fetch('/api/rider/availability', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isOnline: targetOnline }),
      });

      const resJson = await res.json();
      if (!res.ok) throw new Error(resJson.error || 'Failed to update availability');

      setSuccessMsg(resJson.message);
      setData((prev: any) => ({
        ...prev,
        isOnline: targetOnline,
        currentStatus: resJson.status,
      }));

      // Refresh history
      await fetchAvailability();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setToggling(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-slate-400 space-y-3">
        <RefreshCw className="w-8 h-8 animate-spin text-[#4CAF50]" />
        <p className="text-xs">Loading shift records...</p>
      </div>
    );
  }

  const isOnline = !!data?.isOnline;
  const history = data?.history || [];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-black text-white">Shift & Availability</h1>
        <button
          onClick={fetchAvailability}
          className="p-1.5 rounded-lg bg-slate-800 text-slate-300 hover:text-white"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {error && (
        <div className="bg-red-950/80 border border-red-800 rounded-xl p-3 flex items-start gap-2.5 text-xs text-red-200">
          <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="font-bold">Notice</p>
            <p>{error}</p>
          </div>
          <button onClick={() => setError(null)} className="text-red-400 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {successMsg && (
        <div className="bg-emerald-950/80 border border-emerald-800 rounded-xl p-3 flex items-start gap-2.5 text-xs text-emerald-200">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="font-bold">Status Updated</p>
            <p>{successMsg}</p>
          </div>
          <button onClick={() => setSuccessMsg(null)} className="text-emerald-400 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Duty Status Card */}
      <div className="bg-slate-950 border border-slate-800 rounded-2xl p-5 space-y-4 shadow-xl">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-400">Current Rider State</span>
            <p className="text-base font-bold text-white flex items-center gap-2 mt-0.5">
              <span
                className={`w-3 h-3 rounded-full ${
                  isOnline ? 'bg-emerald-500 animate-pulse' : 'bg-red-500'
                }`}
              />
              <span>{isOnline ? 'ONLINE & ACTIVE ON FLEET' : 'OFFLINE (OFF DUTY)'}</span>
            </p>
          </div>

          <button
            onClick={handleToggle}
            disabled={toggling}
            className={`px-4 py-2 rounded-xl font-bold text-xs flex items-center gap-2 transition shadow-md ${
              toggling ? 'opacity-70 cursor-not-allowed' : ''
            } ${
              isOnline
                ? 'bg-red-950/60 text-red-300 border border-red-800 hover:bg-red-900/60'
                : 'bg-[#2E7D32] text-white hover:bg-[#1B5E20]'
            }`}
          >
            <Power className="w-4 h-4" />
            <span>{toggling ? 'Updating...' : isOnline ? 'Go Offline' : 'Go Online'}</span>
          </button>
        </div>

        <div className="p-3 bg-slate-900/80 rounded-xl border border-slate-800 text-xs text-slate-300 space-y-1">
          <p className="font-semibold text-white">Duty Policy Notice:</p>
          <p className="text-slate-400">
            When online, orders will be dispatched based on your live GPS proximity to dark store hubs.
            To go offline, you must complete or hand off all active deliveries first.
          </p>
        </div>
      </div>

      {/* Real Shift Logs from Database */}
      <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 space-y-3">
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
          Recent Shift Sessions
        </h3>

        {history.length === 0 ? (
          <div className="py-6 text-center text-slate-500 text-xs">
            No shift logs recorded yet. Toggle Online above to begin your first shift.
          </div>
        ) : (
          <div className="space-y-2 text-xs">
            {history.map((shift: any) => {
              const start = new Date(shift.sessionStart).toLocaleString();
              const end = shift.sessionEnd ? new Date(shift.sessionEnd).toLocaleString() : 'In Progress (Active)';
              return (
                <div
                  key={shift.id}
                  className="flex items-center justify-between p-3 rounded-xl bg-slate-900 border border-slate-800/80"
                >
                  <div>
                    <p className="font-bold text-white flex items-center gap-2">
                      <Clock className="w-3.5 h-3.5 text-emerald-400" />
                      <span>{start}</span>
                    </p>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      Ended: <strong className="text-slate-300">{end}</strong>
                    </p>
                    {shift.notes && (
                      <p className="text-[10px] text-slate-500 italic mt-0.5">{shift.notes}</p>
                    )}
                  </div>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                      !shift.sessionEnd
                        ? 'text-emerald-400 bg-emerald-950/40 border-emerald-800/30'
                        : 'text-slate-400 bg-slate-800 border-slate-700'
                    }`}
                  >
                    {!shift.sessionEnd ? 'ACTIVE' : 'COMPLETED'}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
