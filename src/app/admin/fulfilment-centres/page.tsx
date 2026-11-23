'use client';

import React, { useState, useEffect } from 'react';
import {
  Store,
  Plus,
  Search,
  MapPin,
  Clock,
  Building2,
  CheckCircle2,
  Boxes,
  Zap,
  Truck,
  X,
} from 'lucide-react';

export default function AdminFulfilmentCentresPage() {
  const [centres, setCentres] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    type: 'DARK_STORE',
    address: '',
    city: 'Bengaluru',
    state: 'Karnataka',
    pincode: '',
    latitude: '12.9716',
    longitude: '77.5946',
    deliveryRadiusKm: '10.0',
    capacityOrdersPerHour: '150',
  });

  const loadCentres = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/fulfilment-centres');
      const data = await res.json();
      setCentres(data.centres || []);
    } catch (e) {
      console.error('Failed to load centres:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCentres();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/fulfilment-centres', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      if (res.ok) {
        setShowAddModal(false);
        loadCentres();
      }
    } catch (err) {
      console.error('Failed to create centre:', err);
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-green-100 dark:bg-green-950/40 text-[#2E7D32]">
              <Store className="w-5 h-5" />
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-gray-900 dark:text-white">
              Fulfilment Centres & Dark Stores
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1">
            Manage 10-30 minute hyper-local dark stores and nationwide regional distribution warehouses.
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="inline-flex items-center gap-2 px-4 py-2 bg-[#2E7D32] hover:bg-[#1B5E20] text-white text-xs font-bold rounded-xl transition shadow"
        >
          <Plus className="w-4 h-4" />
          <span>Add Fulfilment Hub</span>
        </button>
      </div>

      {/* Grid of Fulfilment Centres */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {loading ? (
          [...Array(6)].map((_, i) => (
            <div key={i} className="h-56 rounded-2xl bg-gray-100 dark:bg-slate-800 animate-pulse" />
          ))
        ) : centres.length === 0 ? (
          <div className="col-span-full py-16 text-center text-gray-400">
            No fulfilment centres registered yet.
          </div>
        ) : (
          centres.map((c) => (
            <div
              key={c.id}
              className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-200 dark:border-slate-800 p-5 shadow-sm hover:shadow-md transition flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span
                    className={`text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full flex items-center gap-1 ${
                      c.type === 'DARK_STORE'
                        ? 'bg-green-100 text-[#2E7D32] dark:bg-green-950 dark:text-green-300'
                        : 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300'
                    }`}
                  >
                    {c.type === 'DARK_STORE' ? (
                      <>
                        <Zap className="w-3 h-3 fill-current" />
                        <span>QUICK DARK STORE</span>
                      </>
                    ) : (
                      <>
                        <Truck className="w-3 h-3" />
                        <span>NATIONAL WAREHOUSE</span>
                      </>
                    )}
                  </span>

                  <span className="font-mono text-xs font-bold text-gray-400">{c.code}</span>
                </div>

                <h3 className="font-bold text-base text-gray-900 dark:text-white mb-1">
                  {c.name}
                </h3>

                <p className="text-xs text-gray-500 dark:text-gray-400 mb-3 flex items-start gap-1">
                  <MapPin className="w-3.5 h-3.5 flex-shrink-0 mt-0.5 text-[#2E7D32]" />
                  <span>{c.address}, {c.city}, {c.state} - {c.pincode}</span>
                </p>

                <div className="grid grid-cols-2 gap-2 text-xs py-3 border-y border-gray-100 dark:border-slate-800 my-3">
                  <div>
                    <span className="text-gray-400 text-[10px] uppercase font-bold">Delivery Radius</span>
                    <p className="font-black text-gray-800 dark:text-gray-200">{c.deliveryRadiusKm} km</p>
                  </div>
                  <div>
                    <span className="text-gray-400 text-[10px] uppercase font-bold">Hourly Capacity</span>
                    <p className="font-black text-gray-800 dark:text-gray-200">{c.capacityOrdersPerHour} orders/hr</p>
                  </div>
                  <div>
                    <span className="text-gray-400 text-[10px] uppercase font-bold">Active Fleet</span>
                    <p className="font-black text-[#2E7D32]">{c._count?.drivers || 0} Partners</p>
                  </div>
                  <div>
                    <span className="text-gray-400 text-[10px] uppercase font-bold">Serving PINs</span>
                    <p className="font-black text-blue-600">{c._count?.serviceablePinCodes || 0} Areas</p>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between text-xs text-gray-400 pt-1">
                <span className="flex items-center gap-1 text-green-600 font-semibold text-[11px]">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Operational ({c.operationalHours})</span>
                </span>
                <span className="font-mono text-[10px]">
                  {c.latitude.toFixed(4)}, {c.longitude.toFixed(4)}
                </span>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Add Fulfilment Hub Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-gray-100 dark:border-slate-800 relative">
            <button
              onClick={() => setShowAddModal(false)}
              className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 rounded-full"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 rounded-2xl bg-green-100 text-[#2E7D32] flex items-center justify-center">
                <Building2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                  Add New Fulfilment Centre
                </h3>
                <p className="text-xs text-gray-500">Configure dark store or regional dispatch hub</p>
              </div>
            </div>

            <form onSubmit={handleCreate} className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-gray-700 dark:text-gray-300 block mb-1">
                  Centre Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Pune Central Dark Store"
                  className="w-full px-3 py-2 rounded-xl border border-gray-300 dark:border-slate-700 bg-gray-50 dark:bg-slate-800 outline-none focus:border-[#2E7D32]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-gray-700 dark:text-gray-300 block mb-1">
                    Hub Code *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                    placeholder="PUN-CEN-01"
                    className="w-full px-3 py-2 rounded-xl border border-gray-300 dark:border-slate-700 bg-gray-50 dark:bg-slate-800 outline-none font-mono focus:border-[#2E7D32]"
                  />
                </div>

                <div>
                  <label className="font-bold text-gray-700 dark:text-gray-300 block mb-1">
                    Facility Type
                  </label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-gray-300 dark:border-slate-700 bg-gray-50 dark:bg-slate-800 outline-none focus:border-[#2E7D32]"
                  >
                    <option value="DARK_STORE">Dark Store (10-30 min Quick Delivery)</option>
                    <option value="WAREHOUSE">Warehouse (Nationwide Courier Shipping)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="font-bold text-gray-700 dark:text-gray-300 block mb-1">
                  Address
                </label>
                <input
                  type="text"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  placeholder="Street / Industrial Zone"
                  className="w-full px-3 py-2 rounded-xl border border-gray-300 dark:border-slate-700 bg-gray-50 dark:bg-slate-800 outline-none focus:border-[#2E7D32]"
                />
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="font-bold text-gray-700 dark:text-gray-300 block mb-1">City *</label>
                  <input
                    type="text"
                    required
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-gray-300 dark:border-slate-700 bg-gray-50 dark:bg-slate-800 outline-none"
                  />
                </div>
                <div>
                  <label className="font-bold text-gray-700 dark:text-gray-300 block mb-1">State *</label>
                  <input
                    type="text"
                    required
                    value={formData.state}
                    onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-gray-300 dark:border-slate-700 bg-gray-50 dark:bg-slate-800 outline-none"
                  />
                </div>
                <div>
                  <label className="font-bold text-gray-700 dark:text-gray-300 block mb-1">PIN Code *</label>
                  <input
                    type="text"
                    required
                    value={formData.pincode}
                    onChange={(e) => setFormData({ ...formData, pincode: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-gray-300 dark:border-slate-700 bg-gray-50 dark:bg-slate-800 outline-none font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2">
                <div>
                  <label className="font-bold text-gray-700 dark:text-gray-300 block mb-1">
                    Delivery Radius (km)
                  </label>
                  <input
                    type="number"
                    value={formData.deliveryRadiusKm}
                    onChange={(e) => setFormData({ ...formData, deliveryRadiusKm: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-gray-300 dark:border-slate-700 bg-gray-50 dark:bg-slate-800 outline-none"
                  />
                </div>
                <div>
                  <label className="font-bold text-gray-700 dark:text-gray-300 block mb-1">
                    Capacity (Orders/Hour)
                  </label>
                  <input
                    type="number"
                    value={formData.capacityOrdersPerHour}
                    onChange={(e) => setFormData({ ...formData, capacityOrdersPerHour: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-gray-300 dark:border-slate-700 bg-gray-50 dark:bg-slate-800 outline-none"
                  />
                </div>
              </div>

              <div className="pt-4 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 border border-gray-200 text-gray-600 rounded-xl font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#2E7D32] hover:bg-[#1B5E20] text-white rounded-xl font-bold shadow"
                >
                  Save Hub
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
