'use client';

import React, { useState, useEffect } from 'react';
import {
  ShoppingBag,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  Truck,
  RotateCcw,
  AlertCircle,
  Eye,
  X,
} from 'lucide-react';
import { OrderDto } from '@/types';
import { formatCurrency, formatDate } from '@/lib/utils';

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<OrderDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [selectedOrder, setSelectedOrder] = useState<OrderDto | null>(null);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (statusFilter !== 'ALL') params.set('status', statusFilter);
      if (search) params.set('search', search);

      const res = await fetch(`/api/orders?${params.toString()}`);
      const data = await res.json();
      setOrders(data.orders || []);
    } catch (err) {
      console.error('Failed to load orders:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [statusFilter, search]);

  const handleUpdateStatus = async (orderId: string, orderStatus: string) => {
    try {
      await fetch(`/api/orders/${orderId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderStatus }),
      });
      fetchOrders();
      if (selectedOrder && selectedOrder.id === orderId) {
        setSelectedOrder({ ...selectedOrder, orderStatus });
      }
    } catch (err) {
      console.error('Failed to update status:', err);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-gray-900 dark:text-white">
            Order Management
          </h1>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Monitor, fulfill, and update customer grocery orders
          </p>
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-72">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search order # or customer..."
            className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 outline-none focus:border-[#2E7D32]"
          />
          <Search className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-3" />
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-2 scrollbar-none">
        {['ALL', 'CONFIRMED', 'PROCESSING', 'PACKED', 'OUT_FOR_DELIVERY', 'DELIVERED', 'CANCELLED'].map(
          (st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition ${
                statusFilter === st
                  ? 'bg-[#2E7D32] text-white shadow-sm'
                  : 'bg-white dark:bg-slate-900 text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-slate-800 hover:bg-gray-50'
              }`}
            >
              {st.replace(/_/g, ' ')}
            </button>
          )
        )}
      </div>

      {/* Orders Table */}
      <div className="bg-white dark:bg-slate-900 eye-protection:bg-[#FFFDF9] rounded-3xl border border-gray-200/80 dark:border-slate-800 eye-protection:border-[#E6DCBE] shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-gray-100 dark:border-slate-800 text-gray-400 uppercase text-[10px] tracking-wider bg-gray-50/50 dark:bg-slate-800/40">
                <th className="py-3 px-4 font-bold">Order ID</th>
                <th className="py-3 px-4 font-bold">Customer</th>
                <th className="py-3 px-4 font-bold">Date & Time</th>
                <th className="py-3 px-4 font-bold">Items</th>
                <th className="py-3 px-4 font-bold">Total</th>
                <th className="py-3 px-4 font-bold">Payment</th>
                <th className="py-3 px-4 font-bold">Order Status</th>
                <th className="py-3 px-4 font-bold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-slate-800">
              {loading ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-gray-400">
                    Loading orders...
                  </td>
                </tr>
              ) : orders.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-gray-400">
                    No orders match your filter criteria.
                  </td>
                </tr>
              ) : (
                orders.map((order) => (
                  <tr key={order.id} className="hover:bg-gray-50/60 dark:hover:bg-slate-800/40 transition">
                    <td className="py-3 px-4 font-mono font-bold text-[#2E7D32]">
                      #{order.orderNumber}
                    </td>
                    <td className="py-3 px-4">
                      <span className="font-bold text-gray-900 dark:text-white block">
                        {order.user?.name || order.address?.fullName}
                      </span>
                      <span className="text-[11px] text-gray-400">
                        {order.user?.email || order.address?.phone}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-gray-500 whitespace-nowrap">
                      {formatDate(order.createdAt)}
                    </td>
                    <td className="py-3 px-4 font-semibold text-gray-800 dark:text-gray-200">
                      {order.items.length} items
                    </td>
                    <td className="py-3 px-4 font-black text-gray-900 dark:text-white">
                      {formatCurrency(order.total)}
                    </td>
                    <td className="py-3 px-4">
                      <span className="font-mono font-bold text-[11px] block">{order.paymentMethod}</span>
                      <span
                        className={`text-[10px] font-bold uppercase ${
                          order.paymentStatus === 'PAID' ? 'text-green-600' : 'text-amber-600'
                        }`}
                      >
                        {order.paymentStatus}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <select
                        value={order.orderStatus}
                        onChange={(e) => handleUpdateStatus(order.id, e.target.value)}
                        className="bg-gray-100 dark:bg-slate-800 border-none rounded-lg px-2.5 py-1 text-xs font-bold text-gray-700 dark:text-gray-200 outline-none cursor-pointer"
                      >
                        <option value="CONFIRMED">CONFIRMED</option>
                        <option value="PROCESSING">PROCESSING</option>
                        <option value="PACKED">PACKED</option>
                        <option value="OUT_FOR_DELIVERY">OUT FOR DELIVERY</option>
                        <option value="DELIVERED">DELIVERED</option>
                        <option value="CANCELLED">CANCELLED</option>
                      </select>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => setSelectedOrder(order)}
                        className="p-1.5 text-gray-500 hover:text-[#2E7D32] hover:bg-green-50 dark:hover:bg-slate-800 rounded-lg transition"
                        title="View Details"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Order Detail Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-slate-900 eye-protection:bg-[#FFFDF9] rounded-3xl p-6 max-w-lg w-full border border-gray-200 dark:border-slate-800 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-gray-100 dark:border-slate-800 pb-3">
              <div>
                <h3 className="font-black text-base text-gray-900 dark:text-white">
                  Order Details: #{selectedOrder.orderNumber}
                </h3>
                <p className="text-xs text-gray-500">{formatDate(selectedOrder.createdAt)}</p>
              </div>
              <button
                onClick={() => setSelectedOrder(null)}
                className="p-1 text-gray-400 hover:text-gray-700 dark:hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Customer & Address */}
            <div className="p-3 bg-gray-50 dark:bg-slate-800 rounded-2xl text-xs space-y-1">
              <span className="font-bold uppercase text-[10px] text-gray-400">Customer & Destination</span>
              <p className="font-bold text-gray-900 dark:text-white">
                {selectedOrder.user?.name} ({selectedOrder.user?.phone || 'No phone'})
              </p>
              <p className="text-gray-600 dark:text-gray-300">
                {selectedOrder.address.houseNumber}, {selectedOrder.address.street}, {selectedOrder.address.area}, {selectedOrder.address.city} - {selectedOrder.address.pincode}
              </p>
            </div>

            {/* Line items */}
            <div className="space-y-2">
              <span className="font-bold uppercase text-[10px] text-gray-400">Items Ordered</span>
              <div className="divide-y divide-gray-100 dark:divide-slate-800">
                {selectedOrder.items.map((item) => (
                  <div key={item.id} className="py-2 flex justify-between text-xs">
                    <div>
                      <span className="font-bold text-gray-800 dark:text-gray-200">{item.productName}</span>
                      <p className="text-[11px] text-gray-400">{item.unit} × {item.quantity}</p>
                    </div>
                    <span className="font-bold text-gray-900 dark:text-white">{formatCurrency(item.total)}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Financials */}
            <div className="border-t border-gray-100 dark:border-slate-800 pt-3 text-xs space-y-1.5">
              <div className="flex justify-between text-gray-500">
                <span>Subtotal:</span>
                <span>{formatCurrency(selectedOrder.subtotal)}</span>
              </div>
              {selectedOrder.discount > 0 && (
                <div className="flex justify-between text-green-600">
                  <span>Coupon Discount:</span>
                  <span>- {formatCurrency(selectedOrder.discount)}</span>
                </div>
              )}
              <div className="flex justify-between text-gray-500">
                <span>Delivery Charge:</span>
                <span>{selectedOrder.deliveryFee === 0 ? 'FREE' : formatCurrency(selectedOrder.deliveryFee)}</span>
              </div>
              <div className="flex justify-between text-gray-500">
                <span>GST (5%):</span>
                <span>{formatCurrency(selectedOrder.tax)}</span>
              </div>
              <div className="flex justify-between font-black text-sm text-gray-900 dark:text-white pt-2 border-t border-gray-100 dark:border-slate-800">
                <span>Grand Total:</span>
                <span className="text-[#2E7D32] dark:text-[#4CAF50]">{formatCurrency(selectedOrder.total)}</span>
              </div>
            </div>

            <button
              onClick={() => setSelectedOrder(null)}
              className="w-full py-2.5 bg-gray-100 dark:bg-slate-800 text-xs font-bold rounded-xl text-gray-700 dark:text-gray-300"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
