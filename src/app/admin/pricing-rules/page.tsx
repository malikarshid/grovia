'use client';

import React, { useState, useEffect } from 'react';
import {
  Coins,
  CheckCircle2,
  AlertCircle,
  Zap,
  Truck,
  Sparkles,
  Save,
} from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

export default function AdminPricingRulesPage() {
  const [rules, setRules] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toastMsg, setToastMsg] = useState('');
  const [activeRule, setActiveRule] = useState({
    id: 'default-pricing-rule',
    name: 'GROVIA Standard National & Quick Rules',
    minOrderValue: 99,
    standardDeliveryFee: 99,
    freeDeliveryThreshold: 499,
    quickExpressFee: 25,
    smallOrderFee: 20,
    handlingFee: 5,
    isFreeDeliveryCampaign: true,
    campaignDescription: '🎉 Free Delivery on orders over ₹499 across all serviceable PIN codes!',
  });

  const loadRules = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/pricing-rules');
      const data = await res.json();
      if (data.rules && data.rules.length > 0) {
        setRules(data.rules);
        setActiveRule(data.rules[0]);
      }
    } catch (e) {
      console.error('Failed to load rules:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRules();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch('/api/pricing-rules', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(activeRule),
      });
      if (res.ok) {
        setToastMsg('Delivery pricing rules saved successfully!');
        setTimeout(() => setToastMsg(''), 3000);
      }
    } catch (err) {
      console.error('Failed to save rule:', err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-4xl">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="p-2.5 rounded-2xl bg-amber-100 dark:bg-amber-950/40 text-amber-700">
          <Coins className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-gray-900 dark:text-white">
            Delivery Pricing Rules & Logistics Economics
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
            Configure minimum basket sizes, standard courier fees, quick express surcharges, and free delivery campaigns.
          </p>
        </div>
      </div>

      {toastMsg && (
        <div className="p-3 bg-green-100 dark:bg-green-950/40 border border-green-300 text-green-800 dark:text-green-300 text-xs font-bold rounded-xl flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Main Settings Form */}
      <form onSubmit={handleSave} className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-200 dark:border-slate-800 p-6 shadow-sm space-y-6">
        <div>
          <h2 className="text-sm font-black text-gray-900 dark:text-white uppercase tracking-wider mb-1">
            Active Campaign Banner
          </h2>
          <p className="text-xs text-gray-400 mb-3">
            Displayed prominently across the customer app and checkout.
          </p>
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="campaignToggle"
                checked={activeRule.isFreeDeliveryCampaign}
                onChange={(e) => setActiveRule({ ...activeRule, isFreeDeliveryCampaign: e.target.checked })}
                className="w-4 h-4 text-[#2E7D32] rounded border-gray-300 focus:ring-[#2E7D32]"
              />
              <label htmlFor="campaignToggle" className="text-xs font-bold text-gray-800 dark:text-gray-200 cursor-pointer">
                Enable Free Delivery Promotion Across India
              </label>
            </div>

            <div>
              <input
                type="text"
                value={activeRule.campaignDescription}
                onChange={(e) => setActiveRule({ ...activeRule, campaignDescription: e.target.value })}
                placeholder="Campaign announcement text..."
                className="w-full px-3 py-2 text-xs rounded-xl border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800 outline-none focus:border-[#2E7D32]"
              />
            </div>
          </div>
        </div>

        <div className="border-t border-gray-100 dark:border-slate-800 pt-5">
          <h2 className="text-sm font-black text-gray-900 dark:text-white uppercase tracking-wider mb-3">
            Order Value Thresholds & Standard Fees
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="font-bold text-gray-700 dark:text-gray-300 block mb-1">
                Minimum Order Value (₹)
              </label>
              <input
                type="number"
                value={activeRule.minOrderValue}
                onChange={(e) => setActiveRule({ ...activeRule, minOrderValue: parseFloat(e.target.value) || 0 })}
                className="w-full px-3 py-2 rounded-xl border border-gray-300 dark:border-slate-700 bg-gray-50 dark:bg-slate-800 outline-none font-bold"
              />
              <span className="text-[10px] text-gray-400">Default minimum checkout basket size (₹99)</span>
            </div>

            <div>
              <label className="font-bold text-gray-700 dark:text-gray-300 block mb-1">
                Free Delivery Threshold (₹)
              </label>
              <input
                type="number"
                value={activeRule.freeDeliveryThreshold}
                onChange={(e) => setActiveRule({ ...activeRule, freeDeliveryThreshold: parseFloat(e.target.value) || 0 })}
                className="w-full px-3 py-2 rounded-xl border border-gray-300 dark:border-slate-700 bg-gray-50 dark:bg-slate-800 outline-none font-bold text-[#2E7D32]"
              />
              <span className="text-[10px] text-gray-400">Baskets above this amount unlock ₹0 shipping</span>
            </div>

            <div>
              <label className="font-bold text-gray-700 dark:text-gray-300 block mb-1">
                Standard Nationwide Courier Fee (₹)
              </label>
              <input
                type="number"
                value={activeRule.standardDeliveryFee}
                onChange={(e) => setActiveRule({ ...activeRule, standardDeliveryFee: parseFloat(e.target.value) || 0 })}
                className="w-full px-3 py-2 rounded-xl border border-gray-300 dark:border-slate-700 bg-gray-50 dark:bg-slate-800 outline-none font-bold"
              />
              <span className="text-[10px] text-gray-400">Surface courier fee for standard non-local PINs (₹99)</span>
            </div>

            <div>
              <label className="font-bold text-gray-700 dark:text-gray-300 block mb-1">
                Quick Dark Store Express Fee (₹)
              </label>
              <input
                type="number"
                value={activeRule.quickExpressFee}
                onChange={(e) => setActiveRule({ ...activeRule, quickExpressFee: parseFloat(e.target.value) || 0 })}
                className="w-full px-3 py-2 rounded-xl border border-gray-300 dark:border-slate-700 bg-gray-50 dark:bg-slate-800 outline-none font-bold"
              />
              <span className="text-[10px] text-gray-400">Base delivery fee for 15-25 min dark store orders (₹25)</span>
            </div>

            <div>
              <label className="font-bold text-gray-700 dark:text-gray-300 block mb-1">
                Small Order Surcharge (₹)
              </label>
              <input
                type="number"
                value={activeRule.smallOrderFee}
                onChange={(e) => setActiveRule({ ...activeRule, smallOrderFee: parseFloat(e.target.value) || 0 })}
                className="w-full px-3 py-2 rounded-xl border border-gray-300 dark:border-slate-700 bg-gray-50 dark:bg-slate-800 outline-none font-bold"
              />
              <span className="text-[10px] text-gray-400">Applied only if order value is below ₹99</span>
            </div>

            <div>
              <label className="font-bold text-gray-700 dark:text-gray-300 block mb-1">
                Order Handling & Packaging Fee (₹)
              </label>
              <input
                type="number"
                value={activeRule.handlingFee}
                onChange={(e) => setActiveRule({ ...activeRule, handlingFee: parseFloat(e.target.value) || 0 })}
                className="w-full px-3 py-2 rounded-xl border border-gray-300 dark:border-slate-700 bg-gray-50 dark:bg-slate-800 outline-none font-bold"
              />
              <span className="text-[10px] text-gray-400">Eco-packaging and thermal bag maintenance</span>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-100 dark:border-slate-800 pt-5 flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-2.5 bg-[#2E7D32] hover:bg-[#1B5E20] text-white text-xs font-bold rounded-xl transition shadow flex items-center gap-2 disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span>{saving ? 'Saving...' : 'Save Pricing Configuration'}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
