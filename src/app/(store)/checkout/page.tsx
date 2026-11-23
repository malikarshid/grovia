'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  MapPin,
  Clock,
  CreditCard,
  CheckCircle2,
  ChevronRight,
  ShieldCheck,
  Plus,
  AlertCircle,
  Truck,
} from 'lucide-react';
import { useCartStore } from '@/store/cartStore';
import { useAuthStore } from '@/store/authStore';
import { formatCurrency } from '@/lib/utils';
import { DeliverySlotDto, AddressDto } from '@/types';

export default function CheckoutPage() {
  const router = useRouter();
  const { items, getSubtotal, couponCode, couponDiscount, clearCart, deliveryFee, freeDeliveryThreshold } = useCartStore();
  const { user, isAuthenticated } = useAuthStore();

  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [addresses, setAddresses] = useState<AddressDto[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string>('');
  const [showNewAddressForm, setShowNewAddressForm] = useState(false);

  // New Address form fields
  const [newAddress, setNewAddress] = useState({
    fullName: user?.name || '',
    phone: user?.phone || '',
    houseNumber: '',
    street: '',
    area: '',
    city: 'Bengaluru',
    state: 'Karnataka',
    pincode: '560038',
    instructions: '',
  });

  // Delivery Slots
  const [slots, setSlots] = useState<DeliverySlotDto[]>([]);
  const [selectedSlotId, setSelectedSlotId] = useState<string>('');

  // Payment
  const [paymentMethod, setPaymentMethod] = useState<'COD' | 'UPI' | 'CARD' | 'DEMO'>('DEMO');

  // Submitting
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);
  const [orderError, setOrderError] = useState('');

  const subtotal = getSubtotal();
  const isFreeDelivery = subtotal >= freeDeliveryThreshold;
  const applicableDeliveryFee = isFreeDelivery || subtotal === 0 ? 0 : deliveryFee;
  const taxable = Math.max(0, subtotal - couponDiscount);
  const tax = Number((taxable * 0.05).toFixed(2));
  const grandTotal = Number((taxable + applicableDeliveryFee + tax).toFixed(2));

  useEffect(() => {
    if (items.length === 0) {
      router.push('/cart');
      return;
    }

    async function loadCheckoutData() {
      try {
        const [addrRes, slotRes] = await Promise.all([
          fetch('/api/addresses'),
          fetch('/api/delivery-slots'),
        ]);

        const addrData = await addrRes.json();
        const slotData = await slotRes.json();

        const addrs: AddressDto[] = addrData.addresses || [];
        setAddresses(addrs);
        if (addrs.length > 0) {
          setSelectedAddressId(addrs[0].id);
        } else {
          setShowNewAddressForm(true);
        }

        const sls: DeliverySlotDto[] = slotData.slots || [];
        setSlots(sls);
        if (sls.length > 0) {
          setSelectedSlotId(sls[0].id);
        }
      } catch (err) {
        console.error('Failed to load checkout dependencies:', err);
      }
    }

    loadCheckoutData();
  }, [items, router]);

  const handleCreateAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAddress.fullName || !newAddress.phone || !newAddress.houseNumber || !newAddress.pincode) {
      alert('Please fill all mandatory address fields.');
      return;
    }

    try {
      const res = await fetch('/api/addresses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...newAddress, isDefault: true }),
      });
      const data = await res.json();
      if (res.ok && data.address) {
        setAddresses([data.address, ...addresses]);
        setSelectedAddressId(data.address.id);
        setShowNewAddressForm(false);
      }
    } catch {
      // If guest, keep in local state
      setShowNewAddressForm(false);
    }
  };

  const handlePlaceOrder = async () => {
    setIsPlacingOrder(true);
    setOrderError('');

    try {
      const payload: any = {
        items: items.map((i) => ({ productId: i.productId, quantity: i.quantity })),
        deliverySlotId: selectedSlotId || null,
        paymentMethod,
        couponCode: couponCode || null,
      };

      if (selectedAddressId) {
        payload.addressId = selectedAddressId;
      } else {
        payload.addressData = newAddress;
      }

      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        setOrderError(data.error || 'Failed to complete order. Please check item availability.');
        setIsPlacingOrder(false);
        return;
      }

      // Clear cart
      clearCart();

      // Redirect to orders page with order highlight
      router.push(`/orders?newOrder=${data.orderNumber}`);
    } catch (err: any) {
      setOrderError('A network error occurred. Please try again.');
      setIsPlacingOrder(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
      {/* Checkout Progress Stepper */}
      <div className="flex items-center justify-center mb-8 max-w-2xl mx-auto">
        {[
          { num: 1, label: 'Address' },
          { num: 2, label: 'Delivery Slot' },
          { num: 3, label: 'Payment' },
          { num: 4, label: 'Order Summary' },
        ].map((s, idx) => (
          <React.Fragment key={s.num}>
            <div className="flex flex-col items-center">
              <div
                className={`w-9 h-9 rounded-full flex items-center justify-center font-black text-xs transition ${
                  step === s.num
                    ? 'bg-[#2E7D32] text-white ring-4 ring-green-100 dark:ring-slate-800'
                    : step > s.num
                    ? 'bg-[#2E7D32] text-white'
                    : 'bg-gray-200 dark:bg-slate-800 text-gray-500'
                }`}
              >
                {step > s.num ? <CheckCircle2 className="w-5 h-5" /> : s.num}
              </div>
              <span className="text-[11px] font-bold mt-1 text-gray-600 dark:text-gray-300">
                {s.label}
              </span>
            </div>
            {idx < 3 && (
              <div
                className={`flex-1 h-1 mx-2 sm:mx-4 rounded-full transition ${
                  step > s.num ? 'bg-[#2E7D32]' : 'bg-gray-200 dark:bg-slate-800'
                }`}
              />
            )}
          </React.Fragment>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Main Step Area */}
        <div className="lg:col-span-8">
          {/* STEP 1: Delivery Address */}
          {step === 1 && (
            <div className="bg-white dark:bg-slate-900 eye-protection:bg-[#FFFDF9] p-6 rounded-3xl border border-gray-200 dark:border-slate-800 eye-protection:border-[#E6DCBE] shadow-sm space-y-6">
              <div className="flex items-center justify-between border-b border-gray-100 dark:border-slate-800 pb-4">
                <div className="flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-[#2E7D32]" />
                  <h2 className="text-lg font-black text-gray-900 dark:text-white">
                    Step 1: Select Delivery Address
                  </h2>
                </div>
                {!showNewAddressForm && (
                  <button
                    onClick={() => setShowNewAddressForm(true)}
                    className="text-xs font-bold text-[#2E7D32] hover:underline flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add New Address</span>
                  </button>
                )}
              </div>

              {!showNewAddressForm && addresses.length > 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {addresses.map((addr) => (
                    <label
                      key={addr.id}
                      className={`relative flex flex-col justify-between p-4 rounded-2xl border cursor-pointer transition ${
                        selectedAddressId === addr.id
                          ? 'border-[#2E7D32] bg-green-50/50 dark:bg-slate-800 ring-2 ring-[#2E7D32]'
                          : 'border-gray-200 dark:border-slate-700 hover:border-gray-300'
                      }`}
                    >
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-bold text-sm text-gray-900 dark:text-white">
                            {addr.fullName}
                          </span>
                          <input
                            type="radio"
                            name="addressSelection"
                            checked={selectedAddressId === addr.id}
                            onChange={() => setSelectedAddressId(addr.id)}
                            className="text-[#2E7D32] focus:ring-[#2E7D32]"
                          />
                        </div>
                        <p className="text-xs text-gray-600 dark:text-gray-300 leading-relaxed">
                          {addr.houseNumber}, {addr.street}, {addr.area}
                        </p>
                        <p className="text-xs text-gray-600 dark:text-gray-300">
                          {addr.city}, {addr.state} - {addr.pincode}
                        </p>
                        <p className="text-xs text-gray-500 mt-2 font-medium">Phone: {addr.phone}</p>
                      </div>
                    </label>
                  ))}
                </div>
              )}

              {/* Add New Address Form */}
              {showNewAddressForm && (
                <form onSubmit={handleCreateAddress} className="space-y-4 pt-2">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                        Full Name *
                      </label>
                      <input
                        type="text"
                        required
                        value={newAddress.fullName}
                        onChange={(e) => setNewAddress({ ...newAddress, fullName: e.target.value })}
                        placeholder="e.g. Rahul Sharma"
                        className="w-full px-3 py-2 text-xs rounded-xl bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                        10-Digit Mobile Phone *
                      </label>
                      <input
                        type="tel"
                        required
                        value={newAddress.phone}
                        onChange={(e) => setNewAddress({ ...newAddress, phone: e.target.value })}
                        placeholder="+91 98200 12345"
                        className="w-full px-3 py-2 text-xs rounded-xl bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 outline-none"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                        Flat / House / Building *
                      </label>
                      <input
                        type="text"
                        required
                        value={newAddress.houseNumber}
                        onChange={(e) => setNewAddress({ ...newAddress, houseNumber: e.target.value })}
                        placeholder="Flat 402, Green Meadows"
                        className="w-full px-3 py-2 text-xs rounded-xl bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                        Street / Road
                      </label>
                      <input
                        type="text"
                        value={newAddress.street}
                        onChange={(e) => setNewAddress({ ...newAddress, street: e.target.value })}
                        placeholder="14th Main Road"
                        className="w-full px-3 py-2 text-xs rounded-xl bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                        Area / Locality
                      </label>
                      <input
                        type="text"
                        value={newAddress.area}
                        onChange={(e) => setNewAddress({ ...newAddress, area: e.target.value })}
                        placeholder="Indiranagar"
                        className="w-full px-3 py-2 text-xs rounded-xl bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 outline-none"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">City</label>
                      <input
                        type="text"
                        value={newAddress.city}
                        onChange={(e) => setNewAddress({ ...newAddress, city: e.target.value })}
                        className="w-full px-3 py-2 text-xs rounded-xl bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">State</label>
                      <input
                        type="text"
                        value={newAddress.state}
                        onChange={(e) => setNewAddress({ ...newAddress, state: e.target.value })}
                        className="w-full px-3 py-2 text-xs rounded-xl bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">PIN Code *</label>
                      <input
                        type="text"
                        required
                        value={newAddress.pincode}
                        onChange={(e) => setNewAddress({ ...newAddress, pincode: e.target.value })}
                        placeholder="560038"
                        className="w-full px-3 py-2 text-xs rounded-xl bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 outline-none"
                      />
                    </div>
                  </div>

                  <div className="flex gap-3 pt-2">
                    <button
                      type="submit"
                      className="px-5 py-2.5 bg-[#2E7D32] text-white text-xs font-bold rounded-xl shadow-md hover:bg-[#1B5E20]"
                    >
                      Save & Use Address
                    </button>
                    {addresses.length > 0 && (
                      <button
                        type="button"
                        onClick={() => setShowNewAddressForm(false)}
                        className="px-4 py-2.5 bg-gray-100 dark:bg-slate-800 text-xs font-bold rounded-xl text-gray-700 dark:text-gray-300"
                      >
                        Cancel
                      </button>
                    )}
                  </div>
                </form>
              )}

              <div className="flex justify-end pt-4 border-t border-gray-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => {
                    if (!selectedAddressId && !newAddress.houseNumber) {
                      alert('Please select or fill a delivery address.');
                      return;
                    }
                    setStep(2);
                  }}
                  className="px-6 py-3 bg-[#2E7D32] text-white text-xs font-bold rounded-xl shadow-md hover:bg-[#1B5E20] flex items-center gap-1.5"
                >
                  <span>Continue to Delivery Slot</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 2: Delivery Slot */}
          {step === 2 && (
            <div className="bg-white dark:bg-slate-900 eye-protection:bg-[#FFFDF9] p-6 rounded-3xl border border-gray-200 dark:border-slate-800 eye-protection:border-[#E6DCBE] shadow-sm space-y-6">
              <div className="flex items-center justify-between border-b border-gray-100 dark:border-slate-800 pb-4">
                <div className="flex items-center gap-2">
                  <Clock className="w-5 h-5 text-[#2E7D32]" />
                  <h2 className="text-lg font-black text-gray-900 dark:text-white">
                    Step 2: Choose Delivery Time Slot
                  </h2>
                </div>
                <span className="text-xs font-bold text-[#FF6F00] bg-orange-50 dark:bg-slate-800 px-2.5 py-1 rounded-lg">
                  Guaranteed Dispatch
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {slots.map((slot) => (
                  <label
                    key={slot.id}
                    className={`flex items-center justify-between p-4 rounded-2xl border cursor-pointer transition ${
                      selectedSlotId === slot.id
                        ? 'border-[#2E7D32] bg-green-50/50 dark:bg-slate-800 ring-2 ring-[#2E7D32]'
                        : 'border-gray-200 dark:border-slate-700 hover:border-gray-300'
                    }`}
                  >
                    <div>
                      <span className="text-xs font-bold uppercase tracking-wider text-[#2E7D32] dark:text-[#4CAF50]">
                        {slot.date}
                      </span>
                      <p className="font-black text-sm text-gray-900 dark:text-white mt-1">
                        {slot.startTime} - {slot.endTime}
                      </p>
                      <p className="text-[11px] text-gray-400 mt-0.5">
                        Capacity: {slot.bookedCount}/{slot.capacity} slots filled
                      </p>
                    </div>
                    <input
                      type="radio"
                      name="slotSelection"
                      checked={selectedSlotId === slot.id}
                      onChange={() => setSelectedSlotId(slot.id)}
                      className="text-[#2E7D32] focus:ring-[#2E7D32]"
                    />
                  </label>
                ))}
              </div>

              <div className="flex justify-between pt-4 border-t border-gray-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="px-4 py-2.5 bg-gray-100 dark:bg-slate-800 text-xs font-bold rounded-xl text-gray-700 dark:text-gray-300"
                >
                  ← Back to Address
                </button>
                <button
                  type="button"
                  onClick={() => setStep(3)}
                  className="px-6 py-3 bg-[#2E7D32] text-white text-xs font-bold rounded-xl shadow-md hover:bg-[#1B5E20] flex items-center gap-1.5"
                >
                  <span>Continue to Payment</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: Payment Method */}
          {step === 3 && (
            <div className="bg-white dark:bg-slate-900 eye-protection:bg-[#FFFDF9] p-6 rounded-3xl border border-gray-200 dark:border-slate-800 eye-protection:border-[#E6DCBE] shadow-sm space-y-6">
              <div className="flex items-center justify-between border-b border-gray-100 dark:border-slate-800 pb-4">
                <div className="flex items-center gap-2">
                  <CreditCard className="w-5 h-5 text-[#2E7D32]" />
                  <h2 className="text-lg font-black text-gray-900 dark:text-white">
                    Step 3: Select Payment Method
                  </h2>
                </div>
              </div>

              <div className="space-y-3">
                {[
                  {
                    id: 'DEMO',
                    label: 'GROVIA Instant Verified Demo Mode (Fastest for testing)',
                    desc: 'Instantly simulates payment verification with zero test credentials required.',
                    badge: 'RECOMMENDED FOR REVIEW',
                  },
                  {
                    id: 'UPI',
                    label: 'UPI (Google Pay, PhonePe, Paytm, BHIM)',
                    desc: 'Pay using any UPI ID or scan QR at delivery.',
                  },
                  {
                    id: 'CARD',
                    label: 'Credit / Debit Card (Visa, RuPay, Mastercard)',
                    desc: 'Secure encrypted card processing.',
                  },
                  {
                    id: 'COD',
                    label: 'Cash on Delivery (Doorstep Payment)',
                    desc: 'Pay via cash or UPI to the delivery executive at your doorstep.',
                  },
                ].map((pm) => (
                  <label
                    key={pm.id}
                    className={`flex items-start justify-between p-4 rounded-2xl border cursor-pointer transition ${
                      paymentMethod === pm.id
                        ? 'border-[#2E7D32] bg-green-50/50 dark:bg-slate-800 ring-2 ring-[#2E7D32]'
                        : 'border-gray-200 dark:border-slate-700 hover:border-gray-300'
                    }`}
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-gray-900 dark:text-white">
                          {pm.label}
                        </span>
                        {pm.badge && (
                          <span className="bg-[#FF6F00] text-white text-[9px] font-bold px-2 py-0.5 rounded-full uppercase">
                            {pm.badge}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-gray-500 dark:text-gray-400">{pm.desc}</p>
                    </div>
                    <input
                      type="radio"
                      name="paymentOption"
                      checked={paymentMethod === pm.id}
                      onChange={() => setPaymentMethod(pm.id as any)}
                      className="text-[#2E7D32] focus:ring-[#2E7D32] mt-1"
                    />
                  </label>
                ))}
              </div>

              <div className="flex justify-between pt-4 border-t border-gray-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="px-4 py-2.5 bg-gray-100 dark:bg-slate-800 text-xs font-bold rounded-xl text-gray-700 dark:text-gray-300"
                >
                  ← Back to Slot
                </button>
                <button
                  type="button"
                  onClick={() => setStep(4)}
                  className="px-6 py-3 bg-[#2E7D32] text-white text-xs font-bold rounded-xl shadow-md hover:bg-[#1B5E20] flex items-center gap-1.5"
                >
                  <span>Review Order Summary</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 4: Review and Place Order */}
          {step === 4 && (
            <div className="bg-white dark:bg-slate-900 eye-protection:bg-[#FFFDF9] p-6 rounded-3xl border border-gray-200 dark:border-slate-800 eye-protection:border-[#E6DCBE] shadow-sm space-y-6">
              <div className="border-b border-gray-100 dark:border-slate-800 pb-4">
                <h2 className="text-lg font-black text-gray-900 dark:text-white">
                  Step 4: Confirm & Place Order
                </h2>
                <p className="text-xs text-gray-500">Please review your delivery details and order items.</p>
              </div>

              {/* Items summary */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400">Items Ordered</h4>
                <div className="divide-y divide-gray-100 dark:divide-slate-800 max-h-60 overflow-y-auto">
                  {items.map((i) => (
                    <div key={i.productId} className="py-2.5 flex justify-between items-center text-xs">
                      <div>
                        <span className="font-bold text-gray-900 dark:text-white">{i.product.name}</span>
                        <p className="text-[11px] text-gray-400">{i.product.unit} × {i.quantity}</p>
                      </div>
                      <span className="font-black text-gray-900 dark:text-white">
                        {formatCurrency(i.product.price * i.quantity)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Delivery & Payment details summary */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-gray-50 dark:bg-slate-800 p-4 rounded-2xl text-xs">
                <div>
                  <span className="font-bold text-gray-400 uppercase text-[10px]">Delivery Target</span>
                  <p className="font-bold text-gray-800 dark:text-gray-200 mt-1">
                    {addresses.find((a) => a.id === selectedAddressId)?.fullName || newAddress.fullName}
                  </p>
                  <p className="text-gray-500">
                    {addresses.find((a) => a.id === selectedAddressId)?.houseNumber || newAddress.houseNumber},{' '}
                    {addresses.find((a) => a.id === selectedAddressId)?.area || newAddress.area}
                  </p>
                </div>

                <div>
                  <span className="font-bold text-gray-400 uppercase text-[10px]">Payment & Slot</span>
                  <p className="font-bold text-gray-800 dark:text-gray-200 mt-1">Method: {paymentMethod}</p>
                  <p className="text-gray-500">
                    Slot: {slots.find((s) => s.id === selectedSlotId)?.startTime || 'Standard 2-Hour Delivery'}
                  </p>
                </div>
              </div>

              {orderError && (
                <div className="p-3 bg-red-50 text-red-700 text-xs font-bold rounded-xl flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>{orderError}</span>
                </div>
              )}

              <div className="flex justify-between pt-4 border-t border-gray-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setStep(3)}
                  className="px-4 py-2.5 bg-gray-100 dark:bg-slate-800 text-xs font-bold rounded-xl text-gray-700 dark:text-gray-300"
                >
                  ← Back to Payment
                </button>
                <button
                  type="button"
                  onClick={handlePlaceOrder}
                  disabled={isPlacingOrder}
                  className="px-8 py-3.5 bg-gradient-to-r from-[#2E7D32] to-[#1B5E20] text-white text-sm font-black rounded-xl shadow-lg hover:opacity-95 flex items-center gap-2 disabled:opacity-40"
                >
                  {isPlacingOrder ? 'Processing Order...' : `Place Order • ${formatCurrency(grandTotal)}`}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Order Bill Breakdown */}
        <div className="lg:col-span-4">
          <div className="bg-white dark:bg-slate-900 eye-protection:bg-[#FFFDF9] p-6 rounded-3xl border border-gray-200 dark:border-slate-800 eye-protection:border-[#E6DCBE] shadow-sm space-y-3.5 sticky top-24">
            <h3 className="text-sm font-black text-gray-900 dark:text-white border-b border-gray-100 dark:border-slate-800 pb-3">
              Payment Summary
            </h3>

            <div className="flex justify-between text-xs text-gray-600 dark:text-gray-300">
              <span>Items Total</span>
              <span className="font-bold text-gray-900 dark:text-white">{formatCurrency(subtotal)}</span>
            </div>

            {couponDiscount > 0 && (
              <div className="flex justify-between text-xs text-green-600 font-medium">
                <span>Coupon ({couponCode})</span>
                <span className="font-bold">- {formatCurrency(couponDiscount)}</span>
              </div>
            )}

            <div className="flex justify-between text-xs text-gray-600 dark:text-gray-300">
              <span>Delivery Fee</span>
              <span className="font-bold text-gray-900 dark:text-white">
                {applicableDeliveryFee === 0 ? 'FREE' : formatCurrency(applicableDeliveryFee)}
              </span>
            </div>

            <div className="flex justify-between text-xs text-gray-600 dark:text-gray-300">
              <span>GST (5%)</span>
              <span className="font-bold text-gray-900 dark:text-white">{formatCurrency(tax)}</span>
            </div>

            <div className="border-t border-gray-100 dark:border-slate-800 pt-3 flex justify-between items-baseline">
              <span className="text-sm font-black text-gray-900 dark:text-white">Total Payable</span>
              <span className="text-xl font-black text-[#2E7D32] dark:text-[#4CAF50]">
                {formatCurrency(grandTotal)}
              </span>
            </div>

            <div className="bg-green-50 dark:bg-slate-800/60 p-3 rounded-xl border border-green-200 dark:border-slate-700 text-xs text-[#2E7D32] dark:text-green-400 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 flex-shrink-0" />
              <span>Doorstep quality check guaranteed on every delivery</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
