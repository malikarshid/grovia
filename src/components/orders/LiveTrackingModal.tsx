'use client';

import React, { useState, useEffect } from 'react';
import {
  X,
  MapPin,
  Truck,
  Zap,
  Phone,
  ShieldCheck,
  CheckCircle2,
  Clock,
  Building2,
  Navigation,
} from 'lucide-react';

interface LiveTrackingModalProps {
  orderId: string;
  orderNumber: string;
  isOpen: boolean;
  onClose: () => void;
}

export const LiveTrackingModal: React.FC<LiveTrackingModalProps> = ({
  orderId,
  orderNumber,
  isOpen,
  onClose,
}) => {
  const [trackingData, setTrackingData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [driverProgress, setDriverProgress] = useState(0.45); // simulated progress 0 to 1

  useEffect(() => {
    if (!isOpen || !orderId) return;

    setLoading(true);
    fetch(`/api/driver/tracking/${orderId}`)
      .then((res) => res.json())
      .then((data) => {
        setTrackingData(data);
      })
      .catch((err) => {
        console.error('Failed to load tracking data:', err);
      })
      .finally(() => {
        setLoading(false);
      });

    // Animate driver progress slightly to simulate live movement
    const interval = setInterval(() => {
      setDriverProgress((prev) => {
        if (prev >= 0.85) return 0.85;
        return prev + 0.02;
      });
    }, 3000);

    return () => clearInterval(interval);
  }, [isOpen, orderId]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
      <div className="bg-white dark:bg-slate-900 eye-protection:bg-[#FFFDF9] rounded-3xl max-w-xl w-full p-6 shadow-2xl border border-gray-100 dark:border-slate-800 eye-protection:border-[#E8DFCA] relative max-h-[90vh] overflow-y-auto">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 rounded-full hover:bg-gray-100 dark:hover:bg-slate-800 transition"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-2xl bg-green-100 dark:bg-green-950/50 flex items-center justify-center text-[#2E7D32]">
            <Navigation className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-black text-gray-900 dark:text-gray-100">
                Live Order Tracking
              </h3>
              <span className="text-xs font-mono font-bold text-gray-500">#{orderNumber}</span>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {trackingData?.type === 'QUICK_LOCAL'
                ? '⚡ 15-Minute Local Dark Store Delivery'
                : '📦 Nationwide Surface Courier Delivery'}
            </p>
          </div>
        </div>

        {loading ? (
          <div className="py-16 text-center">
            <div className="w-8 h-8 rounded-full border-2 border-[#2E7D32] border-t-transparent animate-spin mx-auto mb-2" />
            <p className="text-xs text-gray-400 font-semibold">Connecting to GPS telemetry...</p>
          </div>
        ) : trackingData?.type === 'QUICK_LOCAL' ? (
          <div>
            {/* Live GPS Map Simulation Canvas */}
            <div className="relative h-52 rounded-2xl bg-slate-900 overflow-hidden border border-slate-800 p-4 mb-4 shadow-inner">
              {/* Street Grid Graphic */}
              <svg className="absolute inset-0 w-full h-full opacity-20" xmlns="http://www.w3.org/2000/svg">
                <defs>
                  <pattern id="grid" width="30" height="30" patternUnits="userSpaceOnUse">
                    <path d="M 30 0 L 0 0 0 30" fill="none" stroke="#22c55e" strokeWidth="0.5" />
                  </pattern>
                </defs>
                <rect width="100%" height="100%" fill="url(#grid)" />
              </svg>

              {/* Delivery Route Path */}
              <svg className="absolute inset-0 w-full h-full" xmlns="http://www.w3.org/2000/svg">
                <path
                  d="M 50 160 Q 150 140, 240 90 T 420 50"
                  fill="none"
                  stroke="#2E7D32"
                  strokeWidth="3"
                  strokeDasharray="6 4"
                />
              </svg>

              {/* Dark Store Point */}
              <div className="absolute left-8 bottom-6 flex flex-col items-center">
                <div className="w-7 h-7 rounded-full bg-slate-800 border-2 border-green-500 flex items-center justify-center text-green-400 shadow-lg">
                  <Building2 className="w-3.5 h-3.5" />
                </div>
                <span className="text-[9px] font-bold text-green-400 mt-1 bg-slate-900/80 px-1.5 rounded">
                  Dark Store
                </span>
              </div>

              {/* Destination Point */}
              <div className="absolute right-8 top-6 flex flex-col items-center">
                <div className="w-7 h-7 rounded-full bg-red-600 border-2 border-white flex items-center justify-center text-white shadow-lg animate-bounce">
                  <MapPin className="w-3.5 h-3.5" />
                </div>
                <span className="text-[9px] font-bold text-red-400 mt-1 bg-slate-900/80 px-1.5 rounded">
                  Your Doorstep
                </span>
              </div>

              {/* Moving Driver Marker */}
              <div
                className="absolute transition-all duration-1000 flex flex-col items-center"
                style={{
                  left: `${30 + driverProgress * 55}%`,
                  top: `${65 - driverProgress * 40}%`,
                }}
              >
                <div className="relative">
                  <span className="absolute -inset-1 rounded-full bg-green-400/40 animate-ping" />
                  <div className="w-8 h-8 rounded-full bg-[#2E7D32] border-2 border-white flex items-center justify-center text-white shadow-xl relative z-10">
                    <Zap className="w-4 h-4 fill-current" />
                  </div>
                </div>
                <span className="text-[9px] font-extrabold text-white mt-1 bg-[#2E7D32] px-1.5 py-0.2 rounded-full shadow">
                  {trackingData.driver?.name?.split(' ')[0] || 'Driver'}
                </span>
              </div>

              {/* Live Overlay Banner */}
              <div className="absolute bottom-2 right-2 bg-slate-950/80 backdrop-blur-md px-2.5 py-1 rounded-lg border border-slate-700 text-[10px] text-green-300 font-mono font-bold flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                <span>SPEED: 26 KM/H • GPS ACTIVE</span>
              </div>
            </div>

            {/* ETA Banner */}
            <div className="flex items-center justify-between p-3.5 rounded-2xl bg-green-50 dark:bg-green-950/30 eye-protection:bg-[#F3ECD9] border border-green-200 dark:border-green-900/40 mb-4">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-[#2E7D32] text-white rounded-xl shadow-sm">
                  <Clock className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-extrabold text-gray-900 dark:text-white">
                    {trackingData.liveEtaText || 'Arriving in ~14 mins'}
                  </h4>
                  <p className="text-[11px] text-gray-600 dark:text-gray-400">
                    Delivery partner is on the way with your sealed groceries
                  </p>
                </div>
              </div>
            </div>

            {/* Delivery Partner Info */}
            <div className="p-3.5 rounded-2xl border border-gray-200 dark:border-slate-800 flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gray-100 dark:bg-slate-800 flex items-center justify-center font-bold text-sm text-[#2E7D32]">
                  {trackingData.driver?.name?.charAt(0) || 'D'}
                </div>
                <div>
                  <h5 className="font-bold text-xs text-gray-900 dark:text-white">
                    {trackingData.driver?.name}
                  </h5>
                  <p className="text-[11px] text-gray-500 dark:text-gray-400">
                    {trackingData.driver?.vehicleType} ({trackingData.driver?.vehicleRegistration}) • ⭐ {trackingData.driver?.rating}
                  </p>
                </div>
              </div>

              <a
                href={`tel:${trackingData.driver?.phone}`}
                className="px-3 py-1.5 bg-[#2E7D32] hover:bg-[#1B5E20] text-white text-xs font-bold rounded-xl flex items-center gap-1 transition shadow-sm"
              >
                <Phone className="w-3.5 h-3.5" />
                <span>Call</span>
              </a>
            </div>

            {/* Timeline Checkpoints */}
            <div className="space-y-2 border-t border-gray-100 dark:border-slate-800 pt-3">
              <h5 className="text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-2">
                Order Progress Checkpoints
              </h5>
              {trackingData.progressSteps?.map((step: any, i: number) => (
                <div key={i} className="flex items-center gap-2.5 text-xs">
                  <CheckCircle2
                    className={`w-4 h-4 ${
                      step.completed
                        ? 'text-[#2E7D32] fill-green-100 dark:fill-green-950'
                        : 'text-gray-300 dark:text-gray-600'
                    }`}
                  />
                  <span
                    className={
                      step.completed
                        ? 'font-bold text-gray-800 dark:text-gray-200'
                        : 'text-gray-400'
                    }
                  >
                    {step.label}
                  </span>
                </div>
              ))}
            </div>
          </div>
        ) : (
          /* Nationwide Courier Tracking */
          <div>
            <div className="p-4 rounded-2xl bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900/40 mb-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-blue-900 dark:text-blue-200 flex items-center gap-1.5">
                  <Truck className="w-4 h-4 text-blue-600" />
                  <span>{trackingData.courierName}</span>
                </span>
                <span className="font-mono text-xs font-bold bg-white dark:bg-slate-800 px-2 py-0.5 rounded border border-blue-200 text-blue-800 dark:text-blue-300">
                  AWB: {trackingData.awbCode}
                </span>
              </div>
              <p className="text-xs text-blue-700 dark:text-blue-300">
                Route: PIN {trackingData.originPin} → Destination PIN {trackingData.destinationPin}
              </p>
            </div>

            <div className="space-y-3">
              {trackingData.checkpoints?.map((cp: any, idx: number) => (
                <div key={idx} className="flex items-start gap-3 text-xs">
                  <div className="w-5 h-5 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center flex-shrink-0 mt-0.5 font-bold text-[10px]">
                    {idx + 1}
                  </div>
                  <div>
                    <h5 className="font-bold text-gray-800 dark:text-gray-200">{cp.title}</h5>
                    <p className="text-[11px] text-gray-500">{cp.location}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
