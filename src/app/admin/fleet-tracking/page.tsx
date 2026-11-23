'use client';

import React, { useState, useEffect } from 'react';
import {
  Navigation,
  Search,
  Zap,
  Phone,
  CheckCircle2,
  Clock,
  Radio,
  Star,
  MapPin,
  RefreshCw,
} from 'lucide-react';

export default function AdminFleetTrackingPage() {
  const [drivers, setDrivers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [pinging, setPinging] = useState(false);
  const [selectedDriver, setSelectedDriver] = useState<any>(null);

  const loadDrivers = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/driver/location');
      const data = await res.json();
      setDrivers(data.drivers || []);
      if (data.drivers?.length > 0 && !selectedDriver) {
        setSelectedDriver(data.drivers[0]);
      }
    } catch (e) {
      console.error('Failed to load fleet:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDrivers();
  }, []);

  const simulateDriverPing = async (driverId: string) => {
    setPinging(true);
    try {
      // Simulate small GPS jitter (driver on move)
      const baseLat = selectedDriver?.currentLatitude || 12.9789;
      const baseLng = selectedDriver?.currentLongitude || 77.6415;
      const newLat = baseLat + (Math.random() - 0.5) * 0.002;
      const newLng = baseLng + (Math.random() - 0.5) * 0.002;

      await fetch('/api/driver/location', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          driverId,
          latitude: newLat,
          longitude: newLng,
          speed: 28.5,
          status: 'ON_THE_WAY',
        }),
      });
      loadDrivers();
    } catch (err) {
      console.error('Ping error:', err);
    } finally {
      setPinging(false);
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-green-100 dark:bg-green-950/40 text-[#2E7D32]">
              <Navigation className="w-5 h-5" />
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-gray-900 dark:text-white">
              Live Delivery Fleet Tracking
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1">
            Real-time GPS telemetry, dark store fleet dispatch, and on-duty delivery partner management.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1.5 text-xs font-bold text-green-600 bg-green-50 dark:bg-green-950/40 px-3 py-1.5 rounded-xl border border-green-200">
            <Radio className="w-3.5 h-3.5 animate-pulse" />
            <span>GPS Radar Live</span>
          </span>
          <button
            onClick={() => loadDrivers()}
            className="p-2 rounded-xl border border-gray-200 dark:border-slate-800 text-gray-500 hover:text-gray-700"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Driver Fleet List */}
        <div className="space-y-3">
          <h2 className="text-xs font-black uppercase tracking-wider text-gray-400">
            Active Delivery Partners ({drivers.length})
          </h2>

          {loading ? (
            [...Array(4)].map((_, i) => (
              <div key={i} className="h-24 rounded-2xl bg-gray-100 dark:bg-slate-800 animate-pulse" />
            ))
          ) : (
            drivers.map((d) => (
              <div
                key={d.id}
                onClick={() => setSelectedDriver(d)}
                className={`p-4 rounded-2xl border transition cursor-pointer flex flex-col justify-between ${
                  selectedDriver?.id === d.id
                    ? 'border-[#2E7D32] bg-green-50/40 dark:bg-green-950/20 shadow-sm'
                    : 'border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-gray-900 dark:text-white">
                      {d.name}
                    </span>
                    <span className="text-[10px] bg-green-100 text-[#2E7D32] font-black px-1.5 py-0.2 rounded">
                      {d.vehicleType}
                    </span>
                  </div>
                  <span className="text-xs font-mono font-bold text-gray-400">
                    {d.vehicleRegistration}
                  </span>
                </div>

                <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                  <span className="truncate max-w-[170px]">
                    {d.fulfilmentCentre?.name || 'Local Dark Store'}
                  </span>
                  <div className="flex items-center gap-1 font-bold text-amber-500 text-[11px]">
                    <Star className="w-3 h-3 fill-current" />
                    <span>{d.rating}</span>
                    <span className="text-gray-400">({d.totalDeliveries})</span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Right: Simulated GPS Radar & Driver Details */}
        <div className="lg:col-span-2 space-y-4">
          <div className="h-96 rounded-3xl bg-slate-950 border border-slate-800 relative overflow-hidden p-6 flex flex-col justify-between shadow-2xl">
            {/* Grid Pattern */}
            <svg className="absolute inset-0 w-full h-full opacity-20" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <pattern id="radarGrid" width="40" height="40" patternUnits="userSpaceOnUse">
                  <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#22c55e" strokeWidth="0.5" />
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#radarGrid)" />
            </svg>

            {/* Radar Sweep Effect */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="w-80 h-80 rounded-full border border-green-500/30 animate-ping opacity-25" />
              <div className="w-64 h-64 rounded-full border border-green-500/40" />
              <div className="w-36 h-36 rounded-full border border-green-500/50" />
            </div>

            {/* Top Info Overlay */}
            <div className="relative z-10 flex items-center justify-between">
              <div className="bg-slate-900/90 backdrop-blur-md px-3 py-1.5 rounded-xl border border-slate-700 text-xs text-white">
                <span className="text-gray-400 text-[10px] uppercase font-bold block">Tracking Target</span>
                <span className="font-extrabold text-[#2E7D32] dark:text-green-400">
                  {selectedDriver?.name || 'Karthik Varma'}
                </span>
              </div>

              <div className="bg-slate-900/90 backdrop-blur-md px-3 py-1.5 rounded-xl border border-slate-700 text-xs text-right text-white">
                <span className="text-gray-400 text-[10px] uppercase font-bold block">Status</span>
                <span className="font-mono text-green-400 text-xs font-bold">● ON RADAR (28 KM/H)</span>
              </div>
            </div>

            {/* Driver Marker */}
            <div className="relative z-10 flex flex-col items-center mx-auto my-auto">
              <div className="relative">
                <span className="absolute -inset-2 rounded-full bg-green-500/40 animate-ping" />
                <div className="w-12 h-12 rounded-full bg-[#2E7D32] border-2 border-white flex items-center justify-center text-white shadow-2xl relative z-10">
                  <Zap className="w-6 h-6 fill-current text-yellow-300" />
                </div>
              </div>
              <div className="mt-2 text-center bg-slate-900/90 px-3 py-1 rounded-xl border border-slate-700 shadow">
                <span className="text-xs font-black text-white block">
                  {selectedDriver?.name} ({selectedDriver?.vehicleType})
                </span>
                <span className="font-mono text-[10px] text-green-400">
                  {selectedDriver?.currentLatitude?.toFixed(4)}, {selectedDriver?.currentLongitude?.toFixed(4)}
                </span>
              </div>
            </div>

            {/* Bottom Controls */}
            <div className="relative z-10 flex items-center justify-between">
              <div className="text-[10px] text-slate-400 font-mono">
                TELEMETRY FREQUENCY: 3000ms • LATENCY: 22ms
              </div>

              {selectedDriver && (
                <button
                  type="button"
                  onClick={() => simulateDriverPing(selectedDriver.id)}
                  disabled={pinging}
                  className="px-4 py-2 bg-green-600 hover:bg-green-500 text-white text-xs font-black rounded-xl transition shadow flex items-center gap-1.5 disabled:opacity-50"
                >
                  <Radio className="w-3.5 h-3.5" />
                  <span>{pinging ? 'Pinging GPS...' : 'Simulate Live GPS Movement'}</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
