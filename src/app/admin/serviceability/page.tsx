'use client';

import React, { useState, useEffect } from 'react';
import {
  MapPin,
  Plus,
  Search,
  Filter,
  Zap,
  Truck,
  CheckCircle2,
  Building2,
  X,
} from 'lucide-react';

export default function AdminServiceabilityPage() {
  const [pinCodes, setPinCodes] = useState<any[]>([]);
  const [centres, setCentres] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [modeFilter, setModeFilter] = useState('ALL');
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    pincode: '',
    city: 'Bengaluru',
    state: 'Karnataka',
    district: '',
    deliveryMode: 'QUICK_LOCAL',
    estimatedDeliveryMinutes: '20',
    estimatedDeliveryDays: '0',
    fulfilmentCentreId: '',
  });

  const loadData = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.set('search', search);
      if (modeFilter !== 'ALL') params.set('mode', modeFilter);

      const [pinRes, centreRes] = await Promise.all([
        fetch(`/api/serviceable-pincodes?${params.toString()}`),
        fetch('/api/fulfilment-centres'),
      ]);

      const pinData = await pinRes.json();
      const centreData = await centreRes.json();

      setPinCodes(pinData.pinCodes || []);
      setCentres(centreData.centres || []);
      if (centreData.centres?.length > 0 && !formData.fulfilmentCentreId) {
        setFormData((prev) => ({ ...prev, fulfilmentCentreId: centreData.centres[0].id }));
      }
    } catch (e) {
      console.error('Failed to load serviceability data:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [modeFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loadData();
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/serviceable-pincodes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      if (res.ok) {
        setShowModal(false);
        setFormData({
          pincode: '',
          city: 'Bengaluru',
          state: 'Karnataka',
          district: '',
          deliveryMode: 'QUICK_LOCAL',
          estimatedDeliveryMinutes: '20',
          estimatedDeliveryDays: '0',
          fulfilmentCentreId: centres[0]?.id || '',
        });
        loadData();
      }
    } catch (err) {
      console.error('Failed to save pincode:', err);
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-green-100 dark:bg-green-950/40 text-[#2E7D32]">
              <MapPin className="w-5 h-5" />
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-gray-900 dark:text-white">
              PIN Code Serviceability & Routing
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1">
            Configure delivery speeds (15-25 min Dark Store vs Nationwide Courier) for postal PIN codes across India.
          </p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="inline-flex items-center gap-2 px-4 py-2 bg-[#2E7D32] hover:bg-[#1B5E20] text-white text-xs font-bold rounded-xl transition shadow"
        >
          <Plus className="w-4 h-4" />
          <span>Add Serviceable PIN</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-gray-200 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row gap-3 items-center justify-between">
        <form onSubmit={handleSearchSubmit} className="relative flex-1 w-full">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by PIN code, City, State..."
            className="w-full pl-9 pr-20 py-2 text-xs rounded-xl border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800 outline-none focus:border-[#2E7D32]"
          />
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
          <button
            type="submit"
            className="absolute right-1 top-1 bottom-1 px-3 bg-[#2E7D32] text-white text-xs font-semibold rounded-lg"
          >
            Search
          </button>
        </form>

        <div className="flex items-center gap-1.5 self-end sm:self-center w-full sm:w-auto overflow-x-auto">
          {['ALL', 'QUICK_LOCAL', 'NATIONWIDE'].map((mode) => (
            <button
              key={mode}
              onClick={() => setModeFilter(mode)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap ${
                modeFilter === mode
                  ? 'bg-[#2E7D32] text-white shadow-sm'
                  : 'bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200'
              }`}
            >
              {mode === 'ALL' ? 'All PINs' : mode === 'QUICK_LOCAL' ? '⚡ Quick Local' : '📦 Nationwide'}
            </button>
          ))}
        </div>
      </div>

      {/* PIN Codes Table */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-gray-50 dark:bg-slate-800/60 text-gray-400 uppercase text-[10px] tracking-wider border-b border-gray-200 dark:border-slate-800">
              <tr>
                <th className="py-3 px-4">PIN Code</th>
                <th className="py-3 px-4">City / State</th>
                <th className="py-3 px-4">Delivery Mode</th>
                <th className="py-3 px-4">Promised Speed</th>
                <th className="py-3 px-4">Fulfilment Dark Store / Hub</th>
                <th className="py-3 px-4 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-slate-800">
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-gray-400">
                    Loading serviceable PIN codes...
                  </td>
                </tr>
              ) : pinCodes.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-gray-400">
                    No serviceable PIN codes match your search criteria.
                  </td>
                </tr>
              ) : (
                pinCodes.map((p) => (
                  <tr key={p.id} className="hover:bg-gray-50/50 dark:hover:bg-slate-800/40 transition">
                    <td className="py-3 px-4">
                      <span className="font-mono font-black text-sm text-gray-900 dark:text-white">
                        {p.pincode}
                      </span>
                    </td>

                    <td className="py-3 px-4">
                      <span className="font-bold text-gray-800 dark:text-gray-200">
                        {p.city}
                      </span>
                      <p className="text-[10px] text-gray-400">{p.district || p.state}</p>
                    </td>

                    <td className="py-3 px-4">
                      <span
                        className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full inline-flex items-center gap-1 ${
                          p.deliveryMode === 'QUICK_LOCAL'
                            ? 'bg-green-100 text-[#2E7D32] dark:bg-green-950 dark:text-green-300'
                            : 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300'
                        }`}
                      >
                        {p.deliveryMode === 'QUICK_LOCAL' ? (
                          <>
                            <Zap className="w-3 h-3 fill-current" />
                            <span>15-25M QUICK</span>
                          </>
                        ) : (
                          <>
                            <Truck className="w-3 h-3" />
                            <span>COURIER</span>
                          </>
                        )}
                      </span>
                    </td>

                    <td className="py-3 px-4">
                      <span className="font-extrabold text-[#2E7D32] dark:text-green-400">
                        {p.deliveryMode === 'QUICK_LOCAL'
                          ? `~${p.estimatedDeliveryMinutes} mins`
                          : `${p.estimatedDeliveryDays} days`}
                      </span>
                    </td>

                    <td className="py-3 px-4">
                      {p.fulfilmentCentre ? (
                        <div>
                          <span className="font-bold text-gray-800 dark:text-gray-200">
                            {p.fulfilmentCentre.name}
                          </span>
                          <span className="font-mono text-[10px] text-gray-400 block">
                            {p.fulfilmentCentre.code}
                          </span>
                        </div>
                      ) : (
                        <span className="text-gray-400 italic">Central Network</span>
                      )}
                    </td>

                    <td className="py-3 px-4 text-center">
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-green-600">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Active</span>
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-md w-full p-6 shadow-2xl border border-gray-100 dark:border-slate-800 relative">
            <button
              onClick={() => setShowModal(false)}
              className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 rounded-full"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 rounded-2xl bg-green-100 text-[#2E7D32] flex items-center justify-center">
                <MapPin className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                  Add Serviceable Postal PIN
                </h3>
                <p className="text-xs text-gray-500">Route orders and set speed promise</p>
              </div>
            </div>

            <form onSubmit={handleSave} className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-gray-700 dark:text-gray-300 block mb-1">
                  6-Digit Indian PIN Code *
                </label>
                <input
                  type="text"
                  required
                  maxLength={6}
                  value={formData.pincode}
                  onChange={(e) => setFormData({ ...formData, pincode: e.target.value.replace(/\D/g, '') })}
                  placeholder="e.g. 560038"
                  className="w-full px-3 py-2 rounded-xl border border-gray-300 dark:border-slate-700 bg-gray-50 dark:bg-slate-800 outline-none font-mono text-sm focus:border-[#2E7D32]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
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
              </div>

              <div>
                <label className="font-bold text-gray-700 dark:text-gray-300 block mb-1">
                  Delivery Mode *
                </label>
                <select
                  value={formData.deliveryMode}
                  onChange={(e) => setFormData({ ...formData, deliveryMode: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-gray-300 dark:border-slate-700 bg-gray-50 dark:bg-slate-800 outline-none focus:border-[#2E7D32]"
                >
                  <option value="QUICK_LOCAL">⚡ Quick Local Delivery (10-30 Mins Dark Store)</option>
                  <option value="NATIONWIDE">📦 Nationwide Courier Shipping (2-4 Days)</option>
                </select>
              </div>

              <div>
                <label className="font-bold text-gray-700 dark:text-gray-300 block mb-1">
                  Assigned Fulfilment Centre
                </label>
                <select
                  value={formData.fulfilmentCentreId}
                  onChange={(e) => setFormData({ ...formData, fulfilmentCentreId: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-gray-300 dark:border-slate-700 bg-gray-50 dark:bg-slate-800 outline-none focus:border-[#2E7D32]"
                >
                  <option value="">None / Regional Warehouse</option>
                  {centres.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({c.code}) - {c.city}
                    </option>
                  ))}
                </select>
              </div>

              <div className="pt-4 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 border border-gray-200 text-gray-600 rounded-xl font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#2E7D32] hover:bg-[#1B5E20] text-white rounded-xl font-bold shadow"
                >
                  Save PIN Code
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
