import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Format numeric value to Indian Rupee representation (₹)
 */
export function formatCurrency(amount: number | string | null | undefined): string {
  if (amount === null || amount === undefined || isNaN(Number(amount))) {
    return "₹0.00";
  }
  const numericAmount = Number(amount);
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
    minimumFractionDigits: numericAmount % 1 === 0 ? 0 : 2,
  }).format(numericAmount);
}

/**
 * Format date string or object to standard Indian localized presentation
 */
export function formatDate(date: string | Date | null | undefined): string {
  if (!date) return "N/A";
  const d = new Date(date);
  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  }).format(d);
}

export function formatShortDate(date: string | Date | null | undefined): string {
  if (!date) return "N/A";
  const d = new Date(date);
  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(d);
}

/**
 * Calculate discount percentage
 */
export function calculateDiscount(price: number, originalPrice?: number | null): number {
  if (!originalPrice || originalPrice <= price) return 0;
  return Math.round(((originalPrice - price) / originalPrice) * 100);
}

/**
 * Order financial calculation
 */
export function calculateTotals({
  items,
  couponDiscount = 0,
  deliveryFee = 30,
  freeDeliveryThreshold = 499,
  taxRate = 5.0,
}: {
  items: Array<{ price: number; quantity: number }>;
  couponDiscount?: number;
  deliveryFee?: number;
  freeDeliveryThreshold?: number;
  taxRate?: number;
}) {
  const subtotal = items.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const discount = Math.min(couponDiscount, subtotal);
  const taxableAmount = Math.max(0, subtotal - discount);
  const applicableDeliveryFee = taxableAmount >= freeDeliveryThreshold || taxableAmount === 0 ? 0 : deliveryFee;
  const tax = Number(((taxableAmount * taxRate) / 100).toFixed(2));
  const total = Number((taxableAmount + applicableDeliveryFee + tax).toFixed(2));
  const freeDeliveryRemaining = Math.max(0, freeDeliveryThreshold - taxableAmount);

  return {
    subtotal: Number(subtotal.toFixed(2)),
    discount: Number(discount.toFixed(2)),
    deliveryFee: applicableDeliveryFee,
    tax,
    total,
    freeDeliveryRemaining,
  };
}
