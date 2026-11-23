'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  MapPin,
  PhoneCall,
  Navigation,
  CheckCircle2,
  AlertCircle,
  Package,
  Building,
  KeyRound,
  CheckSquare,
  Square,
  ShieldCheck,
  RefreshCw,
} from 'lucide-react';

const STEPS = [
  'ASSIGNED',
  'ACCEPTED',
  'ARRIVED_AT_STORE',
  'PICKED_UP',
  'OUT_FOR_DELIVERY',
  'ARRIVED_AT_CUSTOMER',
  'DELIVERED',
];

export default function RiderOrderDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const router = useRouter();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [advancing, setAdvancing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // OTP Modal State
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [enteredOtp, setEnteredOtp] = useState('');
  const [checkedItems, setCheckedItems] = useState<Record<string, boolean>>({});

  const fetchOrderDetail = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch(`/api/rider/orders/${params.id}`);
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Failed to fetch order details');
      setData(json);

      // Pre-populate items checklist if already picked up
      if (json.assignment.status !== 'ASSIGNED' && json.assignment.status !== 'ACCEPTED') {
        const checkedMap: Record<string, boolean> = {};
        json.order.items.forEach((item: any) => {
          checkedMap[item.id] = true;
        });
        setCheckedItems(checkedMap);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrderDetail();
  }, [params.id]);

  const handleNextStatus = async (targetStatus: string, otpValue?: string) => {
    try {
      setAdvancing(true);
      setError(null);
      setSuccessMsg(null);

      // Attempt getting current GPS
      let currentLat = null;
      let currentLng = null;
      if (typeof window !== 'undefined' && 'geolocation' in navigator) {
        try {
          const pos: any = await new Promise((resolve, reject) => {
            navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 3000 });
          });
          currentLat = pos.coords.latitude;
          currentLng = pos.coords.longitude;
        } catch {
          // Fallback gracefully
        }
      }

      const res = await fetch(`/api/rider/orders/${params.id}/status`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nextStatus: targetStatus,
          otp: otpValue,
          latitude: currentLat,
          longitude: currentLng,
        }),
      });

      const resJson = await res.json();
      if (!res.ok) {
        throw new Error(resJson.error || 'Failed to update delivery status');
      }

      setSuccessMsg(`Status updated to ${targetStatus.replace(/_/g, ' ')}`);
      setShowOtpModal(false);
      setEnteredOtp('');
      await fetchOrderDetail();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setAdvancing(false);
    }
  };

  const toggleItemCheck = (id: string) => {
    setCheckedItems((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-slate-400 space-y-3">
        <RefreshCw className="w-8 h-8 animate-spin text-[#4CAF50]" />
        <p className="text-xs">Loading order details...</p>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="p-4 bg-slate-950 border border-slate-800 rounded-2xl text-center space-y-3">
        <AlertCircle className="w-8 h-8 text-red-400 mx-auto" />
        <p className="text-sm font-bold text-white">Order not found</p>
        <Link href="/rider/orders" className="text-xs text-[#4CAF50] underline">
          Back to orders
        </Link>
      </div>
    );
  }

  const { assignment, order } = data;
  const currentStatus = assignment.status;
  const isDelivered = currentStatus === 'DELIVERED';
  const expectedOtp = order.delivery?.verificationOtp || '9682';

  // Get current step index
  const currentIndex = STEPS.indexOf(currentStatus);

  return (
    <div className="space-y-4">
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <Link
          href="/rider/orders"
          className="p-2 rounded-xl bg-slate-800 text-slate-300 hover:text-white transition"
        >
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div className="text-center">
          <h1 className="text-sm font-black text-white">{order.orderNumber}</h1>
          <span className="text-[10px] text-slate-400">Task Details & Proof</span>
        </div>
        <Link
          href={`/rider/navigation?orderId=${order.id}`}
          className="p-2 rounded-xl bg-slate-800 text-emerald-400 hover:bg-slate-700 transition"
          title="Open Map Navigation"
        >
          <Navigation className="w-4 h-4" />
        </Link>
      </div>

      {/* Alert Messages */}
      {error && (
        <div className="p-3 bg-red-950/80 border border-red-800 rounded-xl text-red-300 text-xs flex items-start gap-2">
          <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
          <p>{error}</p>
        </div>
      )}

      {successMsg && (
        <div className="p-3 bg-emerald-950/80 border border-emerald-800 rounded-xl text-emerald-300 text-xs flex items-start gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
          <p>{successMsg}</p>
        </div>
      )}

      {/* Lifecycle Progress Bar */}
      <div className="bg-slate-950 border border-slate-800 rounded-2xl p-3.5 space-y-2">
        <div className="flex items-center justify-between text-xs">
          <span className="text-slate-400 font-semibold">Delivery State:</span>
          <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[11px] font-black uppercase">
            {currentStatus.replace(/_/g, ' ')}
          </span>
        </div>

        {/* 7-step tracker */}
        <div className="grid grid-cols-7 gap-1 pt-1">
          {STEPS.map((step, idx) => {
            const isDone = idx <= currentIndex;
            const isCurrent = idx === currentIndex;
            return (
              <div
                key={step}
                className={`h-1.5 rounded-full transition-all ${
                  isCurrent
                    ? 'bg-amber-400 shadow-sm shadow-amber-400'
                    : isDone
                    ? 'bg-[#4CAF50]'
                    : 'bg-slate-800'
                }`}
                title={step}
              />
            );
          })}
        </div>
      </div>

      {/* Dark Store Pickup Section */}
      <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
            <Building className="w-3.5 h-3.5 text-blue-400" />
            <span>Store Hub Pickup</span>
          </span>
          {order.hub?.phone && (
            <a
              href={`tel:${order.hub.phone}`}
              className="text-xs text-blue-400 hover:underline flex items-center gap-1"
            >
              <PhoneCall className="w-3 h-3" />
              <span>Call Hub</span>
            </a>
          )}
        </div>
        <div>
          <p className="text-sm font-bold text-white">{order.hub?.name || 'Connaught Place QuickHub'}</p>
          <p className="text-xs text-slate-400">
            {order.hub?.address || 'Palika Underground Complex, Gate 3, CP, New Delhi 110001'}
          </p>
        </div>
      </div>

      {/* Customer Drop-off Section */}
      <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
            <MapPin className="w-3.5 h-3.5 text-emerald-400" />
            <span>Customer Drop-off</span>
          </span>
          {order.customerPhone && (
            <a
              href={`tel:${order.customerPhone}`}
              className="text-xs text-emerald-400 hover:underline flex items-center gap-1 font-bold bg-emerald-950/40 px-2 py-1 rounded-lg border border-emerald-800/40"
            >
              <PhoneCall className="w-3 h-3" />
              <span>Call Customer</span>
            </a>
          )}
        </div>

        <div>
          <p className="text-sm font-bold text-white">{order.customerName}</p>
          <p className="text-xs text-slate-300 mt-0.5 leading-relaxed">{order.shippingAddress}</p>
        </div>

        {/* Payment & Collection Details */}
        <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between text-xs">
          <div>
            <span className="text-[10px] text-slate-400 block">Payment Method</span>
            <span className="font-bold text-white">
              {order.paymentMethod === 'COD' ? 'Cash on Delivery (COD)' : 'Prepaid Online'}
            </span>
          </div>
          <div className="text-right">
            <span className="text-[10px] text-slate-400 block">Total Amount</span>
            <span
              className={`font-black text-sm ${
                order.paymentMethod === 'COD' ? 'text-amber-400' : 'text-[#4CAF50]'
              }`}
            >
              ₹{order.totalAmount}
            </span>
          </div>
        </div>
      </div>

      {/* Goods & Items Verification Checklist */}
      <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
            <Package className="w-3.5 h-3.5 text-[#FF6F00]" />
            <span>Order Checklist ({order.items.length} Items)</span>
          </span>
          <span className="text-[10px] text-slate-500">Verify before dispatch</span>
        </div>

        <div className="space-y-2">
          {order.items.map((item: any) => {
            const isChecked = !!checkedItems[item.id];
            return (
              <div
                key={item.id}
                onClick={() => toggleItemCheck(item.id)}
                className="flex items-center justify-between p-2 rounded-xl bg-slate-900/60 border border-slate-800/80 cursor-pointer hover:bg-slate-900 transition"
              >
                <div className="flex items-center gap-2.5">
                  {isChecked ? (
                    <CheckSquare className="w-4 h-4 text-[#4CAF50]" />
                  ) : (
                    <Square className="w-4 h-4 text-slate-500" />
                  )}
                  <span className={`text-xs ${isChecked ? 'text-slate-300 line-through' : 'text-white'}`}>
                    {item.productName || item.name}
                  </span>
                </div>
                <span className="text-xs font-bold text-slate-400">
                  x{item.quantity}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Rider Lifecycle Dynamic Action Buttons */}
      <div className="pt-2 sticky bottom-16 z-30 bg-slate-900/90 backdrop-blur-md pb-2">
        {currentStatus === 'ASSIGNED' && (
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => handleNextStatus('REJECTED')}
              disabled={advancing}
              className="py-3 px-4 rounded-xl bg-slate-800 text-slate-300 font-bold text-xs hover:bg-slate-700 transition"
            >
              Decline
            </button>
            <button
              onClick={() => handleNextStatus('ACCEPTED')}
              disabled={advancing}
              className="py-3 px-4 rounded-xl bg-[#2E7D32] hover:bg-[#1B5E20] text-white font-bold text-xs shadow-lg transition"
            >
              Accept Order
            </button>
          </div>
        )}

        {currentStatus === 'ACCEPTED' && (
          <button
            onClick={() => handleNextStatus('ARRIVED_AT_STORE')}
            disabled={advancing}
            className="w-full py-3.5 px-4 rounded-xl bg-[#2E7D32] hover:bg-[#1B5E20] text-white font-bold text-xs shadow-lg flex items-center justify-center gap-2 transition"
          >
            <Building className="w-4 h-4" />
            <span>I Have Arrived at Store Hub</span>
          </button>
        )}

        {currentStatus === 'ARRIVED_AT_STORE' && (
          <button
            onClick={() => handleNextStatus('PICKED_UP')}
            disabled={advancing}
            className="w-full py-3.5 px-4 rounded-xl bg-[#2E7D32] hover:bg-[#1B5E20] text-white font-bold text-xs shadow-lg flex items-center justify-center gap-2 transition"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>Items Verified & Picked Up</span>
          </button>
        )}

        {currentStatus === 'PICKED_UP' && (
          <button
            onClick={() => handleNextStatus('OUT_FOR_DELIVERY')}
            disabled={advancing}
            className="w-full py-3.5 px-4 rounded-xl bg-[#FF6F00] hover:bg-[#E65100] text-white font-bold text-xs shadow-lg flex items-center justify-center gap-2 transition"
          >
            <Navigation className="w-4 h-4" />
            <span>Start Out For Delivery</span>
          </button>
        )}

        {currentStatus === 'OUT_FOR_DELIVERY' && (
          <button
            onClick={() => handleNextStatus('ARRIVED_AT_CUSTOMER')}
            disabled={advancing}
            className="w-full py-3.5 px-4 rounded-xl bg-[#2E7D32] hover:bg-[#1B5E20] text-white font-bold text-xs shadow-lg flex items-center justify-center gap-2 transition"
          >
            <MapPin className="w-4 h-4" />
            <span>Arrived at Customer Doorstep</span>
          </button>
        )}

        {currentStatus === 'ARRIVED_AT_CUSTOMER' && (
          <button
            onClick={() => setShowOtpModal(true)}
            disabled={advancing}
            className="w-full py-3.5 px-4 rounded-xl bg-[#4CAF50] hover:bg-[#388E3C] text-white font-black text-sm shadow-xl flex items-center justify-center gap-2 transition"
          >
            <KeyRound className="w-5 h-5" />
            <span>Enter Delivery OTP to Complete</span>
          </button>
        )}

        {isDelivered && (
          <div className="p-3 bg-emerald-950/60 border border-emerald-800 rounded-xl text-center space-y-1">
            <CheckCircle2 className="w-6 h-6 text-emerald-400 mx-auto" />
            <p className="text-sm font-bold text-white">Order Delivered Successfully!</p>
            <p className="text-xs text-slate-400">Earnings credited to your wallet balance.</p>
          </div>
        )}
      </div>

      {/* Customer Verification OTP Dialog */}
      {showOtpModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-sm bg-slate-950 border border-slate-800 rounded-2xl p-6 shadow-2xl space-y-4">
            <div className="text-center space-y-1">
              <div className="w-12 h-12 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-400 mx-auto">
                <KeyRound className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-white">Customer Delivery OTP</h3>
              <p className="text-xs text-slate-400">
                Ask the customer for the 4-digit code shown on their GROVIA app.
              </p>
            </div>

            <div>
              <input
                type="text"
                maxLength={6}
                value={enteredOtp}
                onChange={(e) => setEnteredOtp(e.target.value)}
                placeholder="Enter 4-digit OTP"
                className="w-full text-center tracking-[0.5em] text-2xl font-black bg-slate-900 border border-slate-700 rounded-xl py-3 text-white focus:outline-none focus:border-[#4CAF50]"
                autoFocus
              />
              <p className="text-[10px] text-slate-500 text-center mt-2">
                Order Delivery OTP: <strong className="text-emerald-400 font-mono">{expectedOtp}</strong>
              </p>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowOtpModal(false)}
                className="py-2.5 px-3 rounded-xl bg-slate-800 text-slate-300 font-bold text-xs"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => handleNextStatus('DELIVERED', enteredOtp)}
                disabled={advancing || !enteredOtp.trim()}
                className="py-2.5 px-3 rounded-xl bg-[#2E7D32] hover:bg-[#1B5E20] text-white font-bold text-xs transition disabled:opacity-50"
              >
                Verify & Finish
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
