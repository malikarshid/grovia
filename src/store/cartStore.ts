import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { ProductDto } from '@/types';

export interface CartItemState {
  productId: string;
  product: ProductDto;
  quantity: number;
}

interface CartStore {
  items: CartItemState[];
  couponCode: string | null;
  couponDiscount: number;
  deliveryFee: number;
  freeDeliveryThreshold: number;
  addItem: (product: ProductDto, quantity?: number) => boolean;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  applyCoupon: (code: string, discount: number) => void;
  removeCoupon: () => void;
  getItemCount: () => number;
  getSubtotal: () => number;
  getGrandTotal: () => number;
  getDeliveryRemaining: () => number;
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      couponCode: null,
      couponDiscount: 0,
      deliveryFee: 30,
      freeDeliveryThreshold: 499,

      addItem: (product: ProductDto, quantity = 1) => {
        const { items } = get();
        const existing = items.find((i) => i.productId === product.id);

        if (existing) {
          const newQty = existing.quantity + quantity;
          if (newQty > product.stock) {
            return false; // Exceeds available stock
          }
          set({
            items: items.map((i) =>
              i.productId === product.id ? { ...i, quantity: newQty } : i
            ),
          });
        } else {
          if (quantity > product.stock) {
            return false;
          }
          set({
            items: [...items, { productId: product.id, product, quantity }],
          });
        }
        return true;
      },

      removeItem: (productId: string) => {
        set({
          items: get().items.filter((i) => i.productId !== productId),
        });
      },

      updateQuantity: (productId: string, quantity: number) => {
        if (quantity <= 0) {
          get().removeItem(productId);
          return;
        }
        const { items } = get();
        const item = items.find((i) => i.productId === productId);
        if (item && quantity > item.product.stock) {
          return; // Prevent exceeding stock
        }

        set({
          items: items.map((i) =>
            i.productId === productId ? { ...i, quantity } : i
          ),
        });
      },

      clearCart: () => {
        set({ items: [], couponCode: null, couponDiscount: 0 });
      },

      applyCoupon: (code: string, discount: number) => {
        set({ couponCode: code, couponDiscount: discount });
      },

      removeCoupon: () => {
        set({ couponCode: null, couponDiscount: 0 });
      },

      getItemCount: () => {
        return get().items.reduce((total, i) => total + i.quantity, 0);
      },

      getSubtotal: () => {
        return Number(
          get()
            .items.reduce((total, i) => total + i.product.price * i.quantity, 0)
            .toFixed(2)
        );
      },

      getDeliveryRemaining: () => {
        const subtotal = get().getSubtotal();
        const threshold = get().freeDeliveryThreshold;
        return Math.max(0, Number((threshold - subtotal).toFixed(2)));
      },

      getGrandTotal: () => {
        const subtotal = get().getSubtotal();
        const discount = get().couponDiscount;
        const taxable = Math.max(0, subtotal - discount);
        const delivery = taxable >= get().freeDeliveryThreshold || subtotal === 0 ? 0 : get().deliveryFee;
        const tax = (taxable * 0.05); // 5% GST
        return Number((taxable + delivery + tax).toFixed(2));
      },
    }),
    {
      name: 'grovia_cart_storage',
    }
  )
);
