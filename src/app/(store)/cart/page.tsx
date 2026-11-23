'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Trash2,
  Plus,
  Minus,
  ShoppingBag,
  ArrowRight,
  Tag,
  Check,
  AlertCircle,
  ShieldCheck,
} from 'lucide-react';
import { useCartStore } from '@/store/cartStore';
import { ImageWithFallback } from '@/components/common/ImageWithFallback';
import { formatCurrency } from '@/lib/utils';
import { FreeDeliveryProgressBar } from '@/components/cart/FreeDeliveryProgressBar';

export default function CartPage() {
  const router = useRouter();
  const {
    items,
    updateQuantity,
    removeItem,
    clearCart,
    couponCode,
    couponDiscount,
    applyCoupon,
    removeCoupon,
    getSubtotal,
    getGrandTotal,
    deliveryFee,
    freeDeliveryThreshold,
  } = useCartStore();

  const [inputCoupon, setInputCoupon] = useState('');
  const [couponError, setCouponError] = useState('');
  const [couponSuccess, setCouponSuccess] = useState('');
  const [couponLoading, setCouponLoading] = useState(false);
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  const subtotal = getSubtotal();
  const isFreeDelivery = subtotal >= freeDeliveryThreshold;
  const currentDeliveryFee = isFreeDelivery || subtotal === 0 ? 0 : deliveryFee;
  const taxableAmount = Math.max(0, subtotal - couponDiscount);
  const tax = Number((taxableAmount * 0.05).toFixed(2));
  const grandTotal = Number((taxableAmount + currentDeliveryFee + tax).toFixed(2));

  const handleApplyCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    setCouponError('');
    setCouponSuccess('');
    if (!inputCoupon.trim()) return;

    setCouponLoading(true);
    try {
      const res = await fetch('/api/coupons/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: inputCoupon.trim(), subtotal }),
      });
      const data = await res.json();
      if (!res.ok || !data.valid) {
        setCouponError(data.message || 'Invalid coupon code');
      } else {
        applyCoupon(data.code, data.discount);
        setCouponSuccess(data.message);
        setInputCoupon('');
      }
    } catch {
      setCouponError('Failed to apply coupon. Please try again.');
    } finally {
      setCouponLoading(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
        <div className="max-w-md mx-auto bg-white dark:bg-slate-900 eye-protection:bg-[#FFFDF9] rounded-3xl p-8 border border-gray-200 dark:border-slate-800 eye-protection:border-[#E6DCBE] shadow-sm">
          <div className="w-20 h-20 bg-green-50 dark:bg-slate-800 text-[#2E7D32] rounded-3xl flex items-center justify-center mx-auto mb-4">
            <ShoppingBag className="w-10 h-10 stroke-[1.8]" />
          </div>
          <h1 className="text-xl font-black text-gray-900 dark:text-white eye-protection:text-[#3E3B32]">
            Your shopping cart is empty
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-2 mb-6 leading-relaxed">
            Explore our fresh organic harvest, pantry staples, and everyday essentials to start filling your basket.
          </p>
          <Link
            href="/products"
            className="inline-flex items-center gap-2 bg-[#2E7D32] hover:bg-[#1B5E20] text-white text-xs sm:text-sm font-bold px-6 py-3 rounded-xl shadow-md transition"
          >
            <span>Start Shopping</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
      {/* Title & Clear Cart */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-gray-900 dark:text-white eye-protection:text-[#3E3B32]">
            Shopping Cart ({items.reduce((acc, i) => acc + i.quantity, 0)} Items)
          </h1>
          <p className="text-xs text-gray-500 dark:text-gray-400">Review your products and proceed to checkout</p>
        </div>

        <button
          onClick={() => setShowClearConfirm(true)}
          className="text-xs font-bold text-red-600 hover:text-red-700 hover:underline flex items-center gap-1"
        >
          <Trash2 className="w-3.5 h-3.5" />
          <span>Clear Cart</span>
        </button>
      </div>

      {/* Clear Cart Confirmation Dialog */}
      {showClearConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white dark:bg-slate-900 eye-protection:bg-[#FFFDF9] rounded-2xl p-6 max-w-sm w-full border border-gray-200 dark:border-slate-800 shadow-xl text-center">
            <h3 className="text-base font-bold text-gray-900 dark:text-white mb-2">
              Clear your shopping cart?
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-6">
              Are you sure you want to remove all {items.length} items from your cart?
            </p>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowClearConfirm(false)}
                className="flex-1 py-2 rounded-xl text-xs font-bold bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-gray-300"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  clearCart();
                  setShowClearConfirm(false);
                }}
                className="flex-1 py-2 rounded-xl text-xs font-bold bg-red-600 text-white hover:bg-red-700"
              >
                Yes, Clear
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Cart Items & Free Delivery Progress */}
        <div className="lg:col-span-8 space-y-4">
          {/* Free Delivery Bar */}
          <FreeDeliveryProgressBar />

          {/* Items List */}
          <div className="bg-white dark:bg-slate-900 eye-protection:bg-[#FFFDF9] rounded-3xl border border-gray-200/80 dark:border-slate-800 eye-protection:border-[#E6DCBE] divide-y divide-gray-100 dark:divide-slate-800 shadow-sm overflow-hidden">
            {items.map((item) => (
              <div key={item.productId} className="p-4 sm:p-5 flex items-center gap-4">
                {/* Product Image */}
                <div className="w-18 h-18 sm:w-20 sm:h-20 rounded-xl overflow-hidden bg-gray-50 dark:bg-slate-800 flex-shrink-0 relative">
                  <ImageWithFallback
                    src={item.product.image}
                    alt={item.product.name}
                    width={100}
                    height={100}
                    className="w-full h-full object-cover"
                  />
                </div>

                {/* Details */}
                <div className="flex-1 min-w-0">
                  <Link
                    href={`/product/${item.product.slug}`}
                    className="font-bold text-sm text-gray-900 dark:text-white eye-protection:text-[#3E3B32] hover:text-[#2E7D32] line-clamp-1 transition"
                  >
                    {item.product.name}
                  </Link>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{item.product.unit}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <span className="font-extrabold text-sm text-[#2E7D32] dark:text-[#4CAF50]">
                      {formatCurrency(item.product.price)}
                    </span>
                    {item.product.originalPrice && item.product.originalPrice > item.product.price && (
                      <span className="text-[11px] text-gray-400 line-through">
                        {formatCurrency(item.product.originalPrice)}
                      </span>
                    )}
                  </div>
                </div>

                {/* Quantity Controls */}
                <div className="flex items-center bg-gray-100 dark:bg-slate-800 eye-protection:bg-[#F3ECD9] rounded-xl p-1 border border-gray-200 dark:border-slate-700">
                  <button
                    onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                    className="p-1 hover:bg-white dark:hover:bg-slate-700 rounded-lg text-gray-700 dark:text-gray-200 transition"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                  <span className="px-3 text-xs font-bold text-gray-900 dark:text-white">
                    {item.quantity}
                  </span>
                  <button
                    onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                    disabled={item.quantity >= item.product.stock}
                    className="p-1 hover:bg-white dark:hover:bg-slate-700 rounded-lg text-gray-700 dark:text-gray-200 transition disabled:opacity-30"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Total & Remove */}
                <div className="text-right flex flex-col items-end gap-1">
                  <span className="font-black text-sm text-gray-900 dark:text-white">
                    {formatCurrency(item.product.price * item.quantity)}
                  </span>
                  <button
                    onClick={() => removeItem(item.productId)}
                    className="text-gray-400 hover:text-red-500 p-1 transition"
                    title="Remove item"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="flex justify-between items-center pt-2">
            <Link
              href="/products"
              className="text-xs font-bold text-[#2E7D32] hover:underline flex items-center gap-1"
            >
              <span>← Continue Shopping</span>
            </Link>
          </div>
        </div>

        {/* Right Column: Order Summary & Coupon */}
        <div className="lg:col-span-4 space-y-4">
          {/* Coupon Code Box */}
          <div className="bg-white dark:bg-slate-900 eye-protection:bg-[#FFFDF9] p-5 rounded-3xl border border-gray-200/80 dark:border-slate-800 eye-protection:border-[#E6DCBE] shadow-sm">
            <div className="flex items-center gap-2 mb-3">
              <Tag className="w-4 h-4 text-[#FF6F00]" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-gray-900 dark:text-white">
                Apply Coupon Code
              </h3>
            </div>

            {couponCode ? (
              <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-slate-800 rounded-xl border border-green-200 dark:border-slate-700">
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-green-600" />
                  <div>
                    <span className="font-mono font-bold text-xs text-[#2E7D32] uppercase">
                      {couponCode}
                    </span>
                    <p className="text-[10px] text-green-700">Saving {formatCurrency(couponDiscount)}</p>
                  </div>
                </div>
                <button
                  onClick={removeCoupon}
                  className="text-xs font-bold text-red-600 hover:underline"
                >
                  Remove
                </button>
              </div>
            ) : (
              <form onSubmit={handleApplyCoupon} className="space-y-2">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={inputCoupon}
                    onChange={(e) => setInputCoupon(e.target.value)}
                    placeholder="Enter GROVIA100 or FRESH15"
                    className="flex-1 px-3 py-2 text-xs rounded-xl bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 outline-none uppercase font-mono"
                  />
                  <button
                    type="submit"
                    disabled={couponLoading || !inputCoupon.trim()}
                    className="px-4 py-2 bg-[#2E7D32] text-white text-xs font-bold rounded-xl hover:bg-[#1B5E20] transition disabled:opacity-40"
                  >
                    {couponLoading ? 'Checking...' : 'Apply'}
                  </button>
                </div>
                {couponError && (
                  <p className="text-[11px] text-red-500 font-medium flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5" />
                    {couponError}
                  </p>
                )}
                {couponSuccess && (
                  <p className="text-[11px] text-green-600 font-medium flex items-center gap-1">
                    <Check className="w-3.5 h-3.5" />
                    {couponSuccess}
                  </p>
                )}
              </form>
            )}
          </div>

          {/* Bill Details */}
          <div className="bg-white dark:bg-slate-900 eye-protection:bg-[#FFFDF9] p-6 rounded-3xl border border-gray-200/80 dark:border-slate-800 eye-protection:border-[#E6DCBE] shadow-sm space-y-3.5">
            <h3 className="text-sm font-black text-gray-900 dark:text-white eye-protection:text-[#3E3B32] border-b border-gray-100 dark:border-slate-800 pb-3">
              Bill Summary
            </h3>

            <div className="flex justify-between text-xs text-gray-600 dark:text-gray-300">
              <span>Item Total (Subtotal)</span>
              <span className="font-bold text-gray-900 dark:text-white">{formatCurrency(subtotal)}</span>
            </div>

            {couponDiscount > 0 && (
              <div className="flex justify-between text-xs text-green-600 font-medium">
                <span>Coupon Discount ({couponCode})</span>
                <span className="font-bold">- {formatCurrency(couponDiscount)}</span>
              </div>
            )}

            <div className="flex justify-between text-xs text-gray-600 dark:text-gray-300">
              <div className="flex items-center gap-1">
                <span>Delivery Charge</span>
                {isFreeDelivery && (
                  <span className="text-[10px] bg-green-100 text-[#2E7D32] font-bold px-1.5 py-0.2 rounded">
                    FREE
                  </span>
                )}
              </div>
              <span className="font-bold text-gray-900 dark:text-white">
                {currentDeliveryFee === 0 ? 'FREE' : formatCurrency(currentDeliveryFee)}
              </span>
            </div>

            <div className="flex justify-between text-xs text-gray-600 dark:text-gray-300">
              <span>Estimated Taxes (5% GST)</span>
              <span className="font-bold text-gray-900 dark:text-white">{formatCurrency(tax)}</span>
            </div>

            <div className="border-t border-gray-100 dark:border-slate-800 pt-3.5 flex justify-between items-baseline">
              <div>
                <span className="text-sm font-black text-gray-900 dark:text-white">Grand Total</span>
                <p className="text-[10px] text-gray-400">Includes all taxes and delivery</p>
              </div>
              <span className="text-xl font-black text-[#2E7D32] dark:text-[#4CAF50]">
                {formatCurrency(grandTotal)}
              </span>
            </div>

            <button
              onClick={() => router.push('/checkout')}
              className="w-full py-4 bg-[#2E7D32] hover:bg-[#1B5E20] text-white text-sm font-extrabold rounded-2xl shadow-lg shadow-green-900/15 flex items-center justify-center gap-2 transition mt-4"
            >
              <span>Proceed to Checkout</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <div className="flex items-center justify-center gap-1.5 text-[11px] text-gray-400 text-center pt-2">
              <ShieldCheck className="w-3.5 h-3.5 text-[#2E7D32]" />
              <span>Safe & Secure 256-bit Encrypted Checkout</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
