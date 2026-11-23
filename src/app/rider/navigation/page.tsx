'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  Navigation,
  Compass,
  MapPin,
  ExternalLink,
  ShieldCheck,
  AlertCircle,
  LocateFixed,
  CornerUpRight,
  ArrowUp,
} from 'lucide-react';

function RiderNavigationContent() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get('orderId');

  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [currentCoords, setCurrentCoords] = useState<{ lat: number; lng: number }>({
    lat: 28.6328,
    lng: 77.2197,
  });
  const [gpsActive, setGpsActive] = useState(false);
  const [simulatedProgress, setSimulatedProgress] = useState(35); // percentage along route

  // Fetch target order for delivery address
  useEffect(() => {
    async function loadOrder() {
      try {
        setLoading(true);
        const endpoint = orderId ? `/api/rider/orders/${orderId}` : '/api/rider/dashboard';
        const res = await fetch(endpoint);
        const data = await res.json();
        if (res.ok) {
          if (orderId) {
            setOrder(data.order);
          } else if (data.activeOrder) {
            setOrder(data.activeOrder);
          }
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    loadOrder();
  }, [orderId]);

  // Real Geolocation Hook & Telemetry Stream
  useEffect(() => {
    let watchId: number | null = null;
    if (typeof window !== 'undefined' && 'geolocation' in navigator) {
      watchId = navigator.geolocation.watchPosition(
        (position) => {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;
          setCurrentCoords({ lat, lng });
          setGpsActive(true);

          // Post telemetry to backend
          fetch('/api/rider/location', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              latitude: lat,
              longitude: lng,
              speed: position.coords.speed || 0,
            }),
          }).catch(() => {});
        },
        (err) => {
          console.warn('Geolocation fallback:', err.message);
          setGpsActive(false);
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 5000 }
      );
    }

    return () => {
      if (watchId !== null) navigator.geolocation.clearWatch(watchId);
    };
  }, []);

  const destinationAddress = order?.shippingAddress || 'A-12, Sector 62, Noida, Uttar Pradesh 201309';
  const destinationCoords = { lat: 28.6289, lng: 77.2065 };

  const googleMapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(
    destinationAddress
  )}`;

  return (
    <div className="space-y-4">
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <Link
          href={orderId ? `/rider/orders/${orderId}` : '/rider/dashboard'}
          className="p-2 rounded-xl bg-slate-800 text-slate-300 hover:text-white transition"
        >
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div className="text-center">
          <h1 className="text-sm font-black text-white">Turn-by-Turn GPS</h1>
          <span className="text-[10px] text-slate-400">Live Telemetry Route</span>
        </div>
        <a
          href={googleMapsUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="p-2 rounded-xl bg-slate-800 text-blue-400 hover:text-blue-300 transition"
          title="Open in Google Maps App"
        >
          <ExternalLink className="w-4 h-4" />
        </a>
      </div>

      {/* GPS Status Pill */}
      <div className="flex items-center justify-between bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs">
        <div className="flex items-center gap-2">
          <LocateFixed className={`w-4 h-4 ${gpsActive ? 'text-emerald-400 animate-pulse' : 'text-slate-400'}`} />
          <span className="text-slate-300 font-mono text-[11px]">
            {currentCoords.lat.toFixed(4)}, {currentCoords.lng.toFixed(4)}
          </span>
        </div>
        <span
          className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
            gpsActive
              ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
              : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
          }`}
        >
          {gpsActive ? 'GPS LOCKED' : 'SIMULATED GPS'}
        </span>
      </div>

      {/* Turn Directions Card */}
      <div className="bg-slate-950 border-2 border-emerald-500/50 rounded-2xl p-4 shadow-xl space-y-3">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-[#2E7D32] flex items-center justify-center text-white shadow-lg shrink-0">
            <CornerUpRight className="w-7 h-7 stroke-[2.5]" />
          </div>
          <div>
            <span className="text-emerald-400 text-xs font-bold uppercase tracking-wider">
              In 250 metres
            </span>
            <p className="text-sm font-black text-white leading-tight">
              Turn Right onto Kasturba Gandhi Marg
            </p>
            <p className="text-[11px] text-slate-400 mt-0.5">Then continue straight for 1.2 km</p>
          </div>
        </div>

        {/* ETA & Distance Metric Bar */}
        <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-900 text-center">
          <div className="bg-slate-900/80 rounded-xl p-2">
            <span className="text-[10px] text-slate-400 block">ETA</span>
            <span className="text-sm font-black text-emerald-400">7 mins</span>
          </div>
          <div className="bg-slate-900/80 rounded-xl p-2">
            <span className="text-[10px] text-slate-400 block">Remaining</span>
            <span className="text-sm font-black text-white">1.8 km</span>
          </div>
          <div className="bg-slate-900/80 rounded-xl p-2">
            <span className="text-[10px] text-slate-400 block">Speed</span>
            <span className="text-sm font-black text-amber-400">28 km/h</span>
          </div>
        </div>
      </div>

      {/* Interactive Map Visualizer */}
      <div className="relative bg-slate-950 border border-slate-800 rounded-2xl h-64 overflow-hidden shadow-inner flex items-center justify-center">
        {/* Dynamic Route SVG Map */}
        <svg className="w-full h-full" viewBox="0 0 400 240" fill="none">
          {/* Street grid background */}
          <path d="M 0,60 L 400,60" stroke="#1e293b" strokeWidth="1" strokeDasharray="4 4" />
          <path d="M 0,120 L 400,120" stroke="#1e293b" strokeWidth="1" strokeDasharray="4 4" />
          <path d="M 0,180 L 400,180" stroke="#1e293b" strokeWidth="1" strokeDasharray="4 4" />
          <path d="M 80,0 L 80,240" stroke="#1e293b" strokeWidth="1" strokeDasharray="4 4" />
          <path d="M 180,0 L 180,240" stroke="#1e293b" strokeWidth="1" strokeDasharray="4 4" />
          <path d="M 300,0 L 300,240" stroke="#1e293b" strokeWidth="1" strokeDasharray="4 4" />

          {/* Route path */}
          <path
            d="M 50,190 Q 120,150 180,130 T 320,60"
            stroke="#2E7D32"
            strokeWidth="5"
            strokeLinecap="round"
            strokeDasharray="6 2"
          />

          {/* Start Hub Pin */}
          <circle cx="50" cy="190" r="10" fill="#0284c7" />
          <circle cx="50" cy="190" r="4" fill="#ffffff" />
          <text x="30" y="215" fill="#94a3b8" fontSize="10" fontWeight="bold">Store Hub</text>

          {/* Destination Pin */}
          <circle cx="320" cy="60" r="12" fill="#ef4444" />
          <circle cx="320" cy="60" r="5" fill="#ffffff" />
          <text x="290" y="40" fill="#f87171" fontSize="10" fontWeight="bold">Customer</text>

          {/* Current Rider Moving Position Marker */}
          <g transform={`translate(${50 + (320 - 50) * (simulatedProgress / 100)}, ${190 - (190 - 60) * (simulatedProgress / 100)})`}>
            <circle cx="0" cy="0" r="14" fill="#4ade80" fillOpacity="0.3" className="animate-ping" />
            <circle cx="0" cy="0" r="9" fill="#22c55e" stroke="#ffffff" strokeWidth="2" />
          </g>
        </svg>

        {/* Floating Controls */}
        <div className="absolute bottom-3 right-3 flex flex-col gap-1.5">
          <button
            onClick={() => setSimulatedProgress((p) => Math.min(95, p + 15))}
            className="p-2 rounded-xl bg-slate-900/90 text-white border border-slate-700 shadow text-xs font-bold hover:bg-slate-800"
            title="Advance simulated navigation"
          >
            + Progress
          </button>
        </div>
      </div>

      {/* Target Address Card */}
      <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 space-y-2">
        <div className="flex items-center justify-between text-xs text-slate-400">
          <span className="font-semibold">DESTINATION:</span>
          <span className="text-[#4CAF50] font-bold">10-Min Fast Track</span>
        </div>
        <p className="text-sm font-bold text-white">{order?.customerName || 'Customer Delivery'}</p>
        <p className="text-xs text-slate-300 leading-relaxed">{destinationAddress}</p>

        <a
          href={googleMapsUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="w-full mt-2 py-3 px-4 rounded-xl bg-[#0284c7] hover:bg-[#0369a1] text-white font-bold text-xs flex items-center justify-center gap-2 transition shadow-lg"
        >
          <Navigation className="w-4 h-4" />
          <span>Launch Google Maps Live Directions</span>
        </a>
      </div>
    </div>
  );
}

export default function RiderNavigationPage() {
  return (
    <Suspense
      fallback={
        <div className="py-24 text-center text-xs text-slate-400">
          Loading GPS telemetry...
        </div>
      }
    >
      <RiderNavigationContent />
    </Suspense>
  );
}
