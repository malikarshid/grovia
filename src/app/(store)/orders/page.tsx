'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import {
  Package,
  Clock,
  CheckCircle2,
  Truck,
  RotateCcw,
  ShoppingBag,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  AlertCircle,
  Phone,
} from 'lucide-react';
import { OrderDto } from '@/types';
import { formatCurrency, formatDate } from '@/lib/utils';
import { useCartStore } from '@/store/cartStore';
import { LiveTrackingModal } from '@/components/orders/LiveTrackingModal';

function OrdersPageContent() {
  const searchParams = useSearchParams();
  const newOrderNumber = searchParams.get('newOrder');

  const [orders, setOrders] = useState<OrderDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);
  const [trackingModalOrder, setTrackingModalOrder] = useState<{ id: string; number: string } | null>(null);
  const { addItem } = useCartStore();
  const [reorderToast, setReorderToast] = useState('');

  useEffect(() => {
    async function loadOrders() {
      try {
        const res = await fetch('/api/orders');
        const data = await res.json();
        setOrders(data.orders || []);
      } catch (err) {
        console.error('Failed to load orders:', err);
      } finally {
        setLoading(false);
      }
    }
    loadOrders();
  }, []);

  const handleReorder = (order: OrderDto) => {
    let count = 0;
    for (const item of order.items) {
      addItem(
        {
          id: item.productId,
          name: item.productName,
          slug: item.productId,
          price: item.price,
          unit: item.unit,
          image: '',
          stock: 999,
          description: '',
          categoryId: '',
          sku: '',
          originalPrice: null,
          weight: 1,
          minStock: 5,
          isFeatured: false,
          isBestSeller: false,
          isActive: true,
          rating: 5,
          reviewCount: 0,
          createdAt: '',
          updatedAt: '',
        },
        item.quantity
      );
      count++;
    }
    setReorderToast(`Added ${count} items from Order #${order.orderNumber} to your cart!`);
    setTimeout(() => setReorderToast(''), 3000);
  };

  const statusProgress: Record<string, number> = {
    PENDING: 1,
    CONFIRMED: 2,
    PROCESSING: 3,
    PACKED: 4,
    OUT_FOR_DELIVERY: 5,
    DELIVERED: 6,
    CANCELLED: 0,
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'DELIVERED':
        return <span className="bg-green-100 text-[#2E7D32] px-2.5 py-0.5 rounded-full text-xs font-bold">Delivered</span>;
      case 'OUT_FOR_DELIVERY':
        return <span className="bg-orange-100 text-[#FF6F00] px-2.5 py-0.5 rounded-full text-xs font-bold animate-pulse">Out for Delivery 🛵</span>;
      case 'CONFIRMED':
      case 'PROCESSING':
      case 'PACKED':
        return <span className="bg-blue-100 text-blue-700 px-2.5 py-0.5 rounded-full text-xs font-bold">In Progress</span>;
      case 'CANCELLED':
        return <span className="bg-red-100 text-red-700 px-2.5 py-0.5 rounded-full text-xs font-bold">Cancelled</span>;
      default:
        return <span className="bg-gray-100 text-gray-700 px-2.5 py-0.5 rounded-full text-xs font-bold">{status}</span>;
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
      {/* Toast */}
      {reorderToast && (
        <div className="fixed bottom-20 right-4 z-50 bg-[#2E7D32] text-white text-xs font-bold px-4 py-3 rounded-2xl shadow-xl flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4" />
          <span>{reorderToast}</span>
          <Link href="/cart" className="underline ml-2">View Cart →</Link>
        </div>
      )}

      {/* New Order Celebration Banner */}
      {newOrderNumber && (
        <div className="mb-8 p-6 bg-gradient-to-r from-green-600 to-emerald-700 text-white rounded-3xl shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="p-1 bg-white/20 rounded-lg">
                <CheckCircle2 className="w-5 h-5 text-white" />
              </span>
              <h2 className="text-xl font-black">Order Placed Successfully!</h2>
            </div>
            <p className="text-xs text-green-100">
              Your grocery order <span className="font-mono font-bold text-yellow-300">#{newOrderNumber}</span> is now confirmed and allocated for fast dispatch.
            </p>
          </div>
          <Link
            href="/products"
            className="px-5 py-2.5 bg-white text-[#2E7D32] text-xs font-black rounded-xl hover:bg-green-50 shadow-md transition w-fit"
          >
            Continue Shopping
          </Link>
        </div>
      )}

      {/* Title */}
      <div className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-black text-gray-900 dark:text-white eye-protection:text-[#3E3B32]">
          My Grocery Orders
        </h1>
        <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
          Track real-time status, view invoices, and repeat orders
        </p>
      </div>

      {loading ? (
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-44 rounded-3xl bg-gray-100 dark:bg-slate-800 animate-pulse" />
          ))}
        </div>
      ) : orders.length === 0 ? (
        <div className="text-center py-16 bg-white dark:bg-slate-900 eye-protection:bg-[#FFFDF9] rounded-3xl border border-gray-200 dark:border-slate-800 p-8 max-w-md mx-auto">
          <Package className="w-16 h-16 text-gray-300 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">No orders yet</h3>
          <p className="text-xs text-gray-500 mb-6">You haven&apos;t placed any orders with GROVIA yet.</p>
          <Link
            href="/products"
            className="px-5 py-2.5 bg-[#2E7D32] text-white text-xs font-bold rounded-xl shadow-md hover:bg-[#1B5E20]"
          >
            Shop Now
          </Link>
        </div>
      ) : (
        <div className="space-y-5">
          {orders.map((order) => {
            const isExpanded = expandedOrderId === order.id;
            const progressLevel = statusProgress[order.orderStatus] || 1;

            return (
              <div
                key={order.id}
                className="bg-white dark:bg-slate-900 eye-protection:bg-[#FFFDF9] rounded-3xl border border-gray-200/80 dark:border-slate-800 eye-protection:border-[#E6DCBE] p-5 sm:p-6 shadow-sm overflow-hidden"
              >
                {/* Header row */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gray-100 dark:border-slate-800 pb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-green-50 dark:bg-slate-800 flex items-center justify-center text-[#2E7D32]">
                      <Package className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-extrabold text-sm sm:text-base text-gray-900 dark:text-white">
                          #{order.orderNumber}
                        </span>
                        {getStatusBadge(order.orderStatus)}
                      </div>
                      <p className="text-[11px] text-gray-400 mt-0.5">
                        Placed on {formatDate(order.createdAt)} • Via {order.paymentMethod}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="text-right sm:text-right">
                      <span className="text-base sm:text-lg font-black text-[#2E7D32] dark:text-[#4CAF50]">
                        {formatCurrency(order.total)}
                      </span>
                      <p className="text-[10px] text-gray-400">{order.items.length} items</p>
                    </div>

                    <Link
                      href={`/order-tracking/${order.id}`}
                      className="px-3 py-1.5 bg-[#2E7D32] hover:bg-[#1B5E20] text-white rounded-xl text-xs font-bold transition flex items-center gap-1 shadow-sm"
                    >
                      <Truck className="w-3.5 h-3.5" />
                      <span>Live Track</span>
                    </Link>

                    <button
                      onClick={() => handleReorder(order)}
                      className="px-3 py-1.5 bg-green-50 dark:bg-slate-800 text-[#2E7D32] dark:text-green-400 hover:bg-[#2E7D32] hover:text-white rounded-xl text-xs font-bold transition flex items-center gap-1 border border-green-200 dark:border-slate-700"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>Reorder</span>
                    </button>
                  </div>
                </div>

                {/* Progress Bar (Visual Order Timeline) */}
                {order.orderStatus !== 'CANCELLED' && (
                  <div className="py-4 border-b border-gray-100 dark:border-slate-800">
                    <div className="flex items-center justify-between text-[11px] font-bold text-gray-500 mb-2">
                      <span className={progressLevel >= 2 ? 'text-[#2E7D32]' : ''}>Confirmed</span>
                      <span className={progressLevel >= 3 ? 'text-[#2E7D32]' : ''}>Processing</span>
                      <span className={progressLevel >= 4 ? 'text-[#2E7D32]' : ''}>Packed</span>
                      <span className={progressLevel >= 5 ? 'text-[#FF6F00]' : ''}>Out for Delivery</span>
                      <span className={progressLevel >= 6 ? 'text-[#2E7D32]' : ''}>Delivered</span>
                    </div>

                    <div className="w-full bg-gray-100 dark:bg-slate-800 rounded-full h-2 overflow-hidden">
                      <div
                        className="bg-gradient-to-r from-[#2E7D32] to-[#FF6F00] h-full rounded-full transition-all duration-700"
                        style={{ width: `${Math.min(100, (progressLevel / 6) * 100)}%` }}
                      />
                    </div>
                  </div>
                )}

                {/* Live Tracking Information */}
                {order.delivery && (
                  <div className="py-3 px-4 my-3 bg-gray-50 dark:bg-slate-800/60 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                    <div className="flex items-center gap-2">
                      <Truck className="w-4 h-4 text-[#2E7D32]" />
                      <span className="font-semibold text-gray-700 dark:text-gray-300">
                        Tracking: <span className="font-mono font-bold">{order.delivery.trackingNumber}</span>
                      </span>
                      {order.delivery.deliveryPersonName && (
                        <span className="text-gray-500">
                          • Assigned to {order.delivery.deliveryPersonName}
                        </span>
                      )}
                    </div>

                    {order.delivery.deliveryPersonPhone && (
                      <a
                        href={`tel:${order.delivery.deliveryPersonPhone}`}
                        className="text-xs font-bold text-[#2E7D32] hover:underline flex items-center gap-1"
                      >
                        <Phone className="w-3.5 h-3.5" />
                        <span>Call Partner</span>
                      </a>
                    )}
                  </div>
                )}

                {/* Collapsible Items Details */}
                <button
                  onClick={() => setExpandedOrderId(isExpanded ? null : order.id)}
                  className="w-full flex items-center justify-between text-xs font-bold text-gray-500 hover:text-gray-800 dark:hover:text-white pt-2"
                >
                  <span>{isExpanded ? 'Hide Items' : 'View Itemised Breakdown & Delivery Address'}</span>
                  {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </button>

                {isExpanded && (
                  <div className="mt-3 pt-3 border-t border-gray-100 dark:border-slate-800 space-y-3">
                    <div className="divide-y divide-gray-100 dark:divide-slate-800">
                      {order.items.map((item) => (
                        <div key={item.id} className="py-2 flex justify-between items-center text-xs">
                          <div>
                            <span className="font-bold text-gray-800 dark:text-gray-200">
                              {item.productName}
                            </span>
                            <p className="text-[11px] text-gray-400">
                              {item.unit} × {item.quantity}
                            </p>
                          </div>
                          <span className="font-extrabold text-gray-900 dark:text-white">
                            {formatCurrency(item.total)}
                          </span>
                        </div>
                      ))}
                    </div>

                    {order.address && (
                      <div className="p-3 bg-gray-50 dark:bg-slate-800 rounded-xl text-xs">
                        <span className="font-bold text-gray-400 uppercase text-[10px]">Delivered to</span>
                        <p className="font-bold text-gray-800 dark:text-gray-200 mt-0.5">
                          {order.address.fullName} ({order.address.phone})
                        </p>
                        <p className="text-gray-500">
                          {order.address.houseNumber}, {order.address.street}, {order.address.area}, {order.address.city} - {order.address.pincode}
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Live GPS / Courier Tracking Modal */}
      {trackingModalOrder && (
        <LiveTrackingModal
          isOpen={true}
          orderId={trackingModalOrder.id}
          orderNumber={trackingModalOrder.number}
          onClose={() => setTrackingModalOrder(null)}
        />
      )}
    </div>
  );
}

export default function OrdersPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-sm font-semibold text-gray-400">Loading orders...</div>}>
      <OrdersPageContent />
    </Suspense>
  );
}
