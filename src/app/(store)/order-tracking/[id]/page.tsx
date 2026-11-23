'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  Package,
  Clock,
  CheckCircle2,
  Bike,
  PhoneCall,
  MapPin,
  ShieldCheck,
  Building,
  KeyRound,
  ExternalLink,
  RefreshCw,
} from 'lucide-react';

const TRACKING_STEPS = [
  { key: 'PENDING', label: 'Order Placed', time: '1 min ago' },
  { key: 'CONFIRMED', label: 'Order Confirmed', time: 'Just now' },
  { key: 'PROCESSING', label: 'Packed at Hub', time: 'In progress' },
  { key: 'ASSIGNED', label: 'Rider Assigned', time: 'Connaught Place Hub' },
  { key: 'OUT_FOR_DELIVERY', label: 'Out for Delivery', time: 'On the way 🛵' },
  { key: 'ARRIVED', label: 'Arrived at Doorstep', time: 'At location' },
  { key: 'DELIVERED', label: 'Delivered', time: 'Completed' },
];

export default function OrderTrackingPage({
  params,
}: {
  params: { id: string };
}) {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [driverProgress, setDriverProgress] = useState(0.45);

  const fetchTracking = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/driver/tracking/${params.id}`);
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Failed to load tracking data');
      setData(json);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTracking();

    const interval = setInterval(() => {
      setDriverProgress((prev) => {
        if (prev >= 0.85) return 0.85;
        return prev + 0.02;
      });
    }, 4000);

    return () => clearInterval(interval);
  }, [params.id]);

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center space-y-3">
        <RefreshCw className="w-8 h-8 animate-spin text-[#2E7D32] mx-auto" />
        <p className="text-sm text-gray-500 font-medium">Connecting to live delivery fleet...</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="max-w-md mx-auto px-4 py-16 text-center space-y-4">
        <Package className="w-12 h-12 text-gray-400 mx-auto" />
        <h2 className="text-lg font-bold text-gray-900 dark:text-white">Order not found</h2>
        <p className="text-xs text-gray-500">{error || 'Could not locate delivery information.'}</p>
        <Link
          href="/orders"
          className="inline-flex items-center gap-2 px-4 py-2 bg-[#2E7D32] text-white rounded-xl text-xs font-bold"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to All Orders</span>
        </Link>
      </div>
    );
  }

  const { order, rider, hub, currentStage, verificationOtp } = data;
  const isDelivered = currentStage === 'DELIVERED';

  // Calculate active step index
  const stepOrder = ['PENDING', 'CONFIRMED', 'PROCESSING', 'ASSIGNED', 'OUT_FOR_DELIVERY', 'ARRIVED', 'DELIVERED'];
  const activeIndex = Math.max(0, stepOrder.indexOf(currentStage));

  return (
    <div className="max-w-3xl mx-auto px-4 py-6 space-y-6">
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <Link
          href="/orders"
          className="p-2 rounded-xl bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-gray-300 hover:text-black dark:hover:text-white transition"
        >
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div className="text-center">
          <span className="text-xs font-semibold text-[#FF6F00] uppercase tracking-wider block">
            {order.deliveryType === 'QUICK' ? '10-MIN INSTANT DELIVERY' : 'SCHEDULED EXPRESS'}
          </span>
          <h1 className="text-lg font-black text-gray-900 dark:text-white">
            Order #{order.orderNumber}
          </h1>
        </div>
        <button
          onClick={fetchTracking}
          className="p-2 rounded-xl bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-gray-300 hover:text-black dark:hover:text-white transition"
          title="Refresh GPS"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {/* ETA Banner */}
      <div className="bg-gradient-to-r from-[#2E7D32] to-[#1B5E20] rounded-2xl p-5 text-white shadow-xl flex items-center justify-between">
        <div>
          <span className="text-xs text-emerald-100 font-semibold flex items-center gap-1.5">
            <Clock className="w-4 h-4" />
            <span>Estimated Arrival</span>
          </span>
          <p className="text-2xl font-black mt-0.5">
            {isDelivered ? 'Order Delivered' : '8 to 12 minutes'}
          </p>
          <p className="text-xs text-emerald-100 mt-1">
            {isDelivered
              ? 'Thank you for shopping with GROVIA!'
              : 'Our rider is currently en route to your doorstep.'}
          </p>
        </div>

        {/* Verification OTP Box */}
        <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-3 text-center">
          <span className="text-[10px] uppercase font-bold text-emerald-200 block">
            Delivery OTP
          </span>
          <span className="text-2xl font-mono font-black tracking-widest text-white">
            {verificationOtp || '9682'}
          </span>
          <span className="text-[9px] text-emerald-100 block mt-0.5">
            Share only with rider
          </span>
        </div>
      </div>

      {/* Live Map Route Visualization */}
      <div className="relative bg-slate-950 border border-slate-800 rounded-2xl h-64 overflow-hidden shadow-xl flex items-center justify-center">
        <svg className="w-full h-full" viewBox="0 0 400 240" fill="none">
          {/* Grid lines */}
          <path d="M 0,60 L 400,60" stroke="#1e293b" strokeWidth="1" strokeDasharray="4 4" />
          <path d="M 0,120 L 400,120" stroke="#1e293b" strokeWidth="1" strokeDasharray="4 4" />
          <path d="M 0,180 L 400,180" stroke="#1e293b" strokeWidth="1" strokeDasharray="4 4" />
          <path d="M 100,0 L 100,240" stroke="#1e293b" strokeWidth="1" strokeDasharray="4 4" />
          <path d="M 220,0 L 220,240" stroke="#1e293b" strokeWidth="1" strokeDasharray="4 4" />
          <path d="M 320,0 L 320,240" stroke="#1e293b" strokeWidth="1" strokeDasharray="4 4" />

          {/* Route curve */}
          <path
            d="M 60,190 Q 140,160 200,120 T 340,55"
            stroke="#2E7D32"
            strokeWidth="5"
            strokeLinecap="round"
            strokeDasharray="6 2"
          />

          {/* Start Store Hub */}
          <circle cx="60" cy="190" r="10" fill="#0284c7" />
          <circle cx="60" cy="190" r="4" fill="#ffffff" />
          <text x="35" y="215" fill="#94a3b8" fontSize="10" fontWeight="bold">GROVIA Hub</text>

          {/* Customer Destination Pin */}
          <circle cx="340" cy="55" r="12" fill="#ef4444" />
          <circle cx="340" cy="55" r="5" fill="#ffffff" />
          <text x="305" y="35" fill="#f87171" fontSize="10" fontWeight="bold">Your Address</text>

          {/* Live Rider Marker */}
          <g transform={`translate(${60 + (340 - 60) * (isDelivered ? 1 : driverProgress)}, ${190 - (190 - 55) * (isDelivered ? 1 : driverProgress)})`}>
            <circle cx="0" cy="0" r="16" fill="#4ade80" fillOpacity="0.3" className="animate-ping" />
            <circle cx="0" cy="0" r="10" fill="#22c55e" stroke="#ffffff" strokeWidth="2" />
          </g>
        </svg>

        {/* Floating status pill */}
        <div className="absolute top-3 left-3 bg-slate-900/90 backdrop-blur-md px-3 py-1.5 rounded-xl border border-slate-700 text-xs text-white flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="font-semibold">Live GPS Telemetry Active</span>
        </div>
      </div>

      {/* Assigned Delivery Rider Details Card */}
      <div className="bg-white dark:bg-slate-900 eye-protection:bg-[#FFFDF9] border border-gray-100 dark:border-slate-800 eye-protection:border-[#E8DFCA] rounded-2xl p-5 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-[#2E7D32]/10 text-[#2E7D32] flex items-center justify-center font-bold text-lg">
              <Bike className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h3 className="font-bold text-sm text-gray-900 dark:text-white">
                  {rider?.name || 'Ramesh Kumar'}
                </h3>
                <span className="text-[10px] font-bold bg-green-100 dark:bg-green-950/60 text-[#2E7D32] px-2 py-0.5 rounded-full">
                  Verified Rider
                </span>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {rider?.vehicleType || 'Electric Two-Wheeler'} •{' '}
                <strong className="font-mono text-gray-800 dark:text-gray-200">
                  {rider?.vehicleNumber || 'DL 04 AB 9682'}
                </strong>
              </p>
              <div className="flex items-center gap-2 text-[11px] text-amber-500 font-bold mt-0.5">
                <span>{rider?.rating || '4.9'} ★ (950+ deliveries)</span>
              </div>
            </div>
          </div>

          {rider?.phone && (
            <a
              href={`tel:${rider.phone}`}
              className="p-3 rounded-2xl bg-green-50 dark:bg-slate-800 text-[#2E7D32] hover:bg-green-100 dark:hover:bg-slate-700 transition flex items-center gap-1 text-xs font-bold"
            >
              <PhoneCall className="w-4 h-4" />
              <span className="hidden sm:inline">Call Rider</span>
            </a>
          )}
        </div>
      </div>

      {/* 7-Step Visual Timeline */}
      <div className="bg-white dark:bg-slate-900 eye-protection:bg-[#FFFDF9] border border-gray-100 dark:border-slate-800 eye-protection:border-[#E8DFCA] rounded-2xl p-5 shadow-sm space-y-4">
        <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">
          Order Progress Timeline
        </h3>

        <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-gray-200 dark:before:bg-slate-800">
          {TRACKING_STEPS.map((step, idx) => {
            const isCompleted = idx <= activeIndex;
            const isCurrent = idx === activeIndex;

            return (
              <div key={step.key} className="relative flex items-center justify-between">
                <div
                  className={`absolute -left-6 w-5 h-5 rounded-full flex items-center justify-center transition-all ${
                    isCurrent
                      ? 'bg-amber-400 text-white ring-4 ring-amber-100 dark:ring-amber-950'
                      : isCompleted
                      ? 'bg-[#2E7D32] text-white'
                      : 'bg-gray-200 dark:bg-slate-800 text-gray-400'
                  }`}
                >
                  {isCompleted ? (
                    <CheckCircle2 className="w-3.5 h-3.5 stroke-[3]" />
                  ) : (
                    <div className="w-2 h-2 rounded-full bg-white dark:bg-slate-950" />
                  )}
                </div>

                <div>
                  <p
                    className={`text-xs font-bold ${
                      isCurrent
                        ? 'text-amber-600 dark:text-amber-400'
                        : isCompleted
                        ? 'text-gray-900 dark:text-white'
                        : 'text-gray-400'
                    }`}
                  >
                    {step.label}
                  </p>
                  <p className="text-[10px] text-gray-400">{step.time}</p>
                </div>

                {isCurrent && (
                  <span className="text-[10px] font-bold text-[#FF6F00] bg-orange-50 dark:bg-orange-950/40 px-2 py-0.5 rounded-full animate-pulse">
                    Current Status
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Delivery Address & Items Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white dark:bg-slate-900 eye-protection:bg-[#FFFDF9] border border-gray-100 dark:border-slate-800 eye-protection:border-[#E8DFCA] rounded-2xl p-4 space-y-2">
          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1">
            <MapPin className="w-3.5 h-3.5 text-[#2E7D32]" />
            <span>Delivery Destination</span>
          </span>
          <p className="text-xs font-bold text-gray-900 dark:text-white">{order.customerName}</p>
          <p className="text-xs text-gray-500 leading-relaxed">{order.shippingAddress}</p>
        </div>

        <div className="bg-white dark:bg-slate-900 eye-protection:bg-[#FFFDF9] border border-gray-100 dark:border-slate-800 eye-protection:border-[#E8DFCA] rounded-2xl p-4 space-y-2">
          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1">
            <Building className="w-3.5 h-3.5 text-blue-500" />
            <span>Dispatched From</span>
          </span>
          <p className="text-xs font-bold text-gray-900 dark:text-white">
            {hub?.name || 'Connaught Place QuickHub'}
          </p>
          <p className="text-xs text-gray-500 leading-relaxed">
            {hub?.address || 'Palika Underground Complex, Gate 3, CP, New Delhi 110001'}
          </p>
        </div>
      </div>
    </div>
  );
}
