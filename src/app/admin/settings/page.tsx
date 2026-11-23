'use client';

import React, { useState, useEffect } from 'react';
import { Settings, Save, Check, ShieldCheck } from 'lucide-react';
import { StoreSettingsDto } from '@/types';

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<StoreSettingsDto>({
    storeName: 'GROVIA',
    storeEmail: 'support@grovia.in',
    storePhone: '+91 80 4965 2000',
    storeAddress: 'Grovia HQ, 100 Feet Road, Indiranagar, Bengaluru, Karnataka 560038',
    currency: 'INR',
    timezone: 'Asia/Kolkata',
    businessHours: '06:00 AM - 11:00 PM',
    deliveryFee: 30.0,
    freeDeliveryThreshold: 499.0,
    isDemoPayment: true,
    taxRate: 5.0,
  });

  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    async function loadSettings() {
      try {
        const res = await fetch('/api/settings');
        const data = await res.json();
        if (data.settings) setSettings(data.settings);
      } catch (err) {
        console.error(err);
      }
    }
    loadSettings();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSavedSuccess(false);

    try {
      await fetch('/api/settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      });
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-xl sm:text-2xl font-black text-gray-900 dark:text-white">
          Store & Business Configuration
        </h1>
        <p className="text-xs text-gray-500">
          Configure delivery fees, free shipping threshold, tax policies, and payments
        </p>
      </div>

      <form onSubmit={handleSubmit} className="bg-white dark:bg-slate-900 eye-protection:bg-[#FFFDF9] rounded-3xl p-6 sm:p-8 border border-gray-200/80 dark:border-slate-800 eye-protection:border-[#E6DCBE] shadow-sm space-y-6">
        {savedSuccess && (
          <div className="p-3 bg-green-50 text-[#2E7D32] text-xs font-bold rounded-xl flex items-center gap-2">
            <Check className="w-4 h-4" />
            <span>Settings saved successfully!</span>
          </div>
        )}

        {/* Store Info */}
        <div className="space-y-4">
          <h3 className="font-bold text-sm text-gray-900 dark:text-white border-b border-gray-100 dark:border-slate-800 pb-2">
            Store Profile & Contact
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">Store Name</label>
              <input
                type="text"
                value={settings.storeName}
                onChange={(e) => setSettings({ ...settings, storeName: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded-xl bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">Support Email</label>
              <input
                type="email"
                value={settings.storeEmail}
                onChange={(e) => setSettings({ ...settings, storeEmail: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded-xl bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 outline-none"
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">Hub Address (Bengaluru)</label>
            <input
              type="text"
              value={settings.storeAddress}
              onChange={(e) => setSettings({ ...settings, storeAddress: e.target.value })}
              className="w-full px-3 py-2 text-xs rounded-xl bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 outline-none"
            />
          </div>
        </div>

        {/* Delivery Charges & Free Delivery Threshold */}
        <div className="space-y-4 pt-2">
          <h3 className="font-bold text-sm text-gray-900 dark:text-white border-b border-gray-100 dark:border-slate-800 pb-2">
            Delivery & Tax Economics
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                Standard Delivery Fee (₹)
              </label>
              <input
                type="number"
                value={settings.deliveryFee}
                onChange={(e) => setSettings({ ...settings, deliveryFee: Number(e.target.value) })}
                className="w-full px-3 py-2 text-xs rounded-xl bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                Free Delivery Threshold (₹)
              </label>
              <input
                type="number"
                value={settings.freeDeliveryThreshold}
                onChange={(e) => setSettings({ ...settings, freeDeliveryThreshold: Number(e.target.value) })}
                className="w-full px-3 py-2 text-xs rounded-xl bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                GST Rate (%)
              </label>
              <input
                type="number"
                step="0.5"
                value={settings.taxRate}
                onChange={(e) => setSettings({ ...settings, taxRate: Number(e.target.value) })}
                className="w-full px-3 py-2 text-xs rounded-xl bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 outline-none"
              />
            </div>
          </div>
        </div>

        {/* Payment mode */}
        <div className="space-y-4 pt-2">
          <h3 className="font-bold text-sm text-gray-900 dark:text-white border-b border-gray-100 dark:border-slate-800 pb-2">
            Payment Processing Mode
          </h3>
          <label className="flex items-center gap-3 p-4 bg-gray-50 dark:bg-slate-800 rounded-2xl cursor-pointer">
            <input
              type="checkbox"
              checked={settings.isDemoPayment}
              onChange={(e) => setSettings({ ...settings, isDemoPayment: e.target.checked })}
              className="rounded text-[#2E7D32]"
            />
            <div>
              <span className="font-bold text-xs text-gray-900 dark:text-white block">
                Enable Instant Verified Demo Gateway (Recommended)
              </span>
              <span className="text-[11px] text-gray-400">
                Allows testing payments immediately with automated simulated transaction receipts.
              </span>
            </div>
          </label>
        </div>

        <button
          type="submit"
          disabled={saving}
          className="px-6 py-3 bg-[#2E7D32] hover:bg-[#1B5E20] text-white text-xs font-bold rounded-xl shadow-md transition flex items-center gap-2 disabled:opacity-40"
        >
          <Save className="w-4 h-4" />
          <span>{saving ? 'Saving...' : 'Save Settings'}</span>
        </button>
      </form>
    </div>
  );
}
