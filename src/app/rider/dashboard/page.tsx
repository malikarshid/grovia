'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Power,
  Package,
  MapPin,
  Clock,
  ArrowRight,
  TrendingUp,
  Award,
  Navigation,
  PhoneCall,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Bell,
  X,
} from 'lucide-react';

export default function RiderDashboardPage() {
  const router = useRouter();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [toggling, setToggling] = useState(false);
  const [actingOnOrderId, setActingOnOrderId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const fetchDashboard = useCallback(async (isSilent = false) => {
    try {
      if (!isSilent) setLoading(true);
      const res = await fetch('/api/rider/dashboard');
      if (res.status === 401) {
        router.push('/rider/login');
        return;
      }
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Failed to load dashboard');
      setData(json);
    } catch (err: any) {
      if (!isSilent) setError(err.message);
    } finally {
      if (!isSilent) setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    fetchDashboard();
  }, [fetchDashboard]);

  // Polling for live assignments when rider is online
  useEffect(() => {
    if (!data?.profile?.isOnline) return;

    const interval = setInterval(() => {
      fetchDashboard(true);
    }, 10000);

    return () => clearInterval(interval);
  }, [data?.profile?.isOnline, fetchDashboard]);

  const handleToggleOnline = async () => {
    if (!data || toggling) return;
    setError(null);
    setSuccessMsg(null);

    const currentOnline = !!data.profile?.isOnline;
    const newStatus = !currentOnline;

    try {
      setToggling(true);
      const res = await fetch('/api/rider/availability', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isOnline: newStatus }),
      });

      const resJson = await res.json();

      if (!res.ok) {
        throw new Error(resJson.error || 'Failed to update duty availability');
      }

      setSuccessMsg(resJson.message || `You are now ${newStatus ? 'ONLINE' : 'OFFLINE'}`);
      setData((prev: any) => ({
        ...prev,
        profile: {
          ...prev.profile,
          isOnline: newStatus,
          currentStatus: resJson.status,
        },
      }));

      // Refresh full dashboard state from server
      await fetchDashboard(true);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setToggling(false);
    }
  };

  const handleAcceptAssignment = async (orderId: string) => {
    try {
      setActingOnOrderId(orderId);
      setError(null);
      const res = await fetch(`/api/rider/orders/${orderId}/accept`, {
        method: 'POST',
      });
      const resJson = await res.json();
      if (!res.ok) throw new Error(resJson.error || 'Failed to accept order');

      setSuccessMsg('Delivery assignment accepted! Proceed to store hub for pickup.');
      await fetchDashboard(true);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setActingOnOrderId(null);
    }
  };

  const handleRejectAssignment = async (orderId: string) => {
    const confirmDecline = window.confirm('Are you sure you want to decline this delivery task? It will be re-assigned.');
    if (!confirmDecline) return;

    try {
      setActingOnOrderId(orderId);
      setError(null);
      const res = await fetch(`/api/rider/orders/${orderId}/reject`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason: 'Rider declined from dashboard' }),
      });
      const resJson = await res.json();
      if (!res.ok) throw new Error(resJson.error || 'Failed to decline order');

      setSuccessMsg('Order assignment declined.');
      await fetchDashboard(true);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setActingOnOrderId(null);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-slate-400 space-y-3">
        <RefreshCw className="w-8 h-8 animate-spin text-[#4CAF50]" />
        <p className="text-xs font-semibold">Loading Rider Fleet Telemetry...</p>
      </div>
    );
  }

  const isOnline = !!data?.profile?.isOnline;
  const activeOrder = data?.activeOrder;
  const pendingAssignments = data?.pendingAssignments || [];
  const stats = data?.stats;

  return (
    <div className="space-y-4">
      {/* Notifications / Alerts */}
      {error && (
        <div className="bg-red-950/80 border border-red-800 rounded-xl p-3 flex items-start gap-2.5 text-xs text-red-200">
          <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="font-bold">Duty Status Alert</p>
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
            <p className="font-bold">Success</p>
            <p>{successMsg}</p>
          </div>
          <button onClick={() => setSuccessMsg(null)} className="text-emerald-400 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Rider Status Card with Online/Offline Toggle */}
      <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 flex items-center justify-between shadow-lg">
        <div>
          <h2 className="text-base font-bold text-white flex items-center gap-1.5">
            {data?.profile?.name || 'Rider'}
            <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              {data?.profile?.vehicleNumber || 'DL 04 AB 9682'}
            </span>
          </h2>
          <div className="flex items-center gap-2 mt-1">
            <span
              className={`w-2.5 h-2.5 rounded-full ${
                isOnline ? 'bg-emerald-500 animate-pulse' : 'bg-red-500'
              }`}
            />
            <span className="text-xs font-semibold text-slate-300">
              {isOnline ? 'ONLINE & RECEIVING ORDERS' : 'OFFLINE (ON BREAK)'}
            </span>
          </div>
        </div>

        <button
          onClick={handleToggleOnline}
          disabled={toggling}
          className={`px-4 py-2 rounded-xl font-bold text-xs flex items-center gap-2 transition shadow-md ${
            toggling ? 'opacity-70 cursor-not-allowed' : ''
          } ${
            isOnline
              ? 'bg-red-950/60 text-red-300 border border-red-800 hover:bg-red-900/60'
              : 'bg-[#2E7D32] text-white hover:bg-[#1B5E20]'
          }`}
        >
          <Power className={`w-4 h-4 ${toggling ? 'animate-spin' : ''}`} />
          <span>{toggling ? 'Updating...' : isOnline ? 'Go Offline' : 'Go Online'}</span>
        </button>
      </div>

      {/* Pending Assignment Alert Banner */}
      {pendingAssignments.length > 0 && (
        <div className="space-y-3">
          {pendingAssignments.map((task: any) => (
            <div
              key={task.assignmentId}
              className="bg-amber-950/40 border-2 border-amber-500/80 rounded-2xl p-4 space-y-3 animate-pulse shadow-xl"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Bell className="w-4 h-4 text-amber-400 animate-bounce" />
                  <span>NEW DELIVERY TASK ASSIGNED</span>
                </span>
                <span className="text-xs font-bold bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded-full border border-amber-500/30">
                  Awaiting Acceptance
                </span>
              </div>

              <div className="bg-slate-900/90 rounded-xl p-3 border border-slate-800 space-y-1.5 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-white text-sm">#{task.orderNumber}</span>
                  <span className="font-black text-emerald-400 text-sm">₹{task.totalAmount}</span>
                </div>
                <p className="text-slate-300">Customer: <strong className="text-white">{task.customerName}</strong></p>
                <p className="text-slate-400 line-clamp-1">Destination: {task.shippingAddress}</p>
                <p className="text-[11px] text-slate-500">Items: {task.itemsCount} products</p>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-1">
                <button
                  onClick={() => handleRejectAssignment(task.orderId)}
                  disabled={actingOnOrderId === task.orderId}
                  className="py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs transition border border-slate-700"
                >
                  Decline
                </button>
                <button
                  onClick={() => handleAcceptAssignment(task.orderId)}
                  disabled={actingOnOrderId === task.orderId}
                  className="py-2.5 px-3 rounded-xl bg-[#2E7D32] hover:bg-[#1B5E20] text-white font-bold text-xs transition shadow-lg shadow-emerald-950 flex items-center justify-center gap-1"
                >
                  {actingOnOrderId === task.orderId ? 'Accepting...' : 'Accept Delivery'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Active Delivery Order Banner */}
      {activeOrder ? (
        <div className="bg-slate-950 border-2 border-emerald-500/60 rounded-2xl p-4 shadow-xl space-y-3 relative overflow-hidden">
          <div className="absolute top-0 right-0 bg-[#FF6F00] text-white text-[10px] font-black uppercase px-2.5 py-0.5 rounded-bl-lg tracking-wider">
            {activeOrder.deliveryType === 'QUICK' ? '10-MIN INSTANT' : 'SCHEDULED'}
          </div>

          <div className="flex items-center justify-between pr-24">
            <div>
              <span className="text-[11px] font-semibold text-slate-400">ACTIVE TASK:</span>
              <p className="text-base font-black text-white">{activeOrder.orderNumber}</p>
              <span className="text-[10px] font-bold text-emerald-400 bg-emerald-950/40 px-2 py-0.5 rounded border border-emerald-800/30 uppercase mt-0.5 inline-block">
                {activeOrder.assignmentStatus.replace(/_/g, ' ')}
              </span>
            </div>
            <div className="text-right">
              <span className="text-[11px] font-semibold text-slate-400">PAYOUT:</span>
              <p className="text-base font-black text-[#4CAF50]">₹80.00</p>
            </div>
          </div>

          {/* Customer & Address Preview */}
          <div className="bg-slate-900/80 rounded-xl p-3 border border-slate-800 space-y-2">
            <div className="flex items-start gap-2">
              <MapPin className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <div className="text-xs">
                <p className="font-bold text-white">{activeOrder.customerName}</p>
                <p className="text-slate-400 line-clamp-1">{activeOrder.shippingAddress}</p>
              </div>
            </div>

            <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-800/80">
              <span className="text-slate-400">
                Items: <strong className="text-white">{activeOrder.itemsCount} products</strong>
              </span>
              <span className="text-amber-400 font-semibold">
                {activeOrder.paymentMethod === 'COD' ? `COLLECT COD: ₹${activeOrder.totalAmount}` : 'PAID ONLINE'}
              </span>
            </div>
          </div>

          {/* Action Row */}
          <div className="grid grid-cols-2 gap-2 pt-1">
            <Link
              href={`/rider/navigation?orderId=${activeOrder.orderId}`}
              className="py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition border border-slate-700"
            >
              <Navigation className="w-4 h-4 text-emerald-400" />
              <span>Map Route</span>
            </Link>

            <Link
              href={`/rider/orders/${activeOrder.orderId}`}
              className="py-2.5 px-3 rounded-xl bg-[#2E7D32] hover:bg-[#1B5E20] text-white font-bold text-xs flex items-center justify-center gap-1.5 transition shadow-lg shadow-emerald-950"
            >
              <span>Manage Order</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      ) : (
        <div className="bg-slate-950 border border-slate-800 rounded-2xl p-6 text-center space-y-2">
          <div className="w-12 h-12 rounded-full bg-slate-900 flex items-center justify-center mx-auto text-emerald-400">
            <Package className="w-6 h-6" />
          </div>
          <h3 className="font-bold text-sm text-white">
            {isOnline ? 'Searching for Orders...' : 'You are currently offline'}
          </h3>
          <p className="text-xs text-slate-400 max-w-xs mx-auto">
            {isOnline
              ? 'Stay near the Connaught Place dark store cluster for instant order assignments.'
              : 'Tap "Go Online" above whenever you are ready to begin receiving delivery tasks.'}
          </p>
        </div>
      )}

      {/* Metrics & Performance Grid */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-slate-950 border border-slate-800 rounded-2xl p-3.5 space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-medium">Today's Earnings</span>
            <TrendingUp className="w-4 h-4 text-[#4CAF50]" />
          </div>
          <p className="text-xl font-black text-white">₹{stats?.todayEarnings || 0}</p>
          <p className="text-[10px] text-slate-400">{stats?.todayTrips || 0} trips completed</p>
        </div>

        <div className="bg-slate-950 border border-slate-800 rounded-2xl p-3.5 space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-medium">Rating & Health</span>
            <Award className="w-4 h-4 text-amber-400" />
          </div>
          <p className="text-xl font-black text-white">{stats?.rating || 4.9} ★</p>
          <p className="text-[10px] text-slate-400">Total: {stats?.totalCompletedDeliveries || 0} orders delivered</p>
        </div>
      </div>

      {/* Quick Navigation Cards */}
      <div className="space-y-2">
        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider px-1">
          Quick Access
        </h4>
        <div className="grid grid-cols-2 gap-2">
          <Link
            href="/rider/orders"
            className="p-3 bg-slate-950 border border-slate-800 rounded-xl hover:border-slate-700 transition flex items-center gap-3"
          >
            <div className="w-9 h-9 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-400">
              <Package className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-bold text-white">Trip History</p>
              <p className="text-[10px] text-slate-400">All deliveries</p>
            </div>
          </Link>

          <Link
            href="/rider/earnings"
            className="p-3 bg-slate-950 border border-slate-800 rounded-xl hover:border-slate-700 transition flex items-center gap-3"
          >
            <div className="w-9 h-9 rounded-lg bg-amber-500/10 flex items-center justify-center text-amber-400">
              <TrendingUp className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-bold text-white">Payouts</p>
              <p className="text-[10px] text-slate-400">Bank deposits</p>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}
