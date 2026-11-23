export type ThemeMode = 'light' | 'dark' | 'eye-protection';

export interface UserSession {
  id: string;
  userId?: string;
  name: string;
  email: string;
  role: 'CUSTOMER' | 'ADMIN' | 'SUPER_ADMIN' | 'INVENTORY_MGR' | 'ORDER_MGR' | 'DELIVERY_MGR' | 'RIDER';
  avatar?: string | null;
  phone?: string | null;
}

export interface StoreSettingsDto {
  storeName: string;
  storeEmail: string;
  storePhone: string;
  storeAddress: string;
  currency: string;
  timezone: string;
  businessHours: string;
  deliveryFee: number;
  freeDeliveryThreshold: number;
  isDemoPayment: boolean;
  taxRate: number;
}

export interface CategoryDto {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  image: string;
  displayOrder: number;
  isActive: boolean;
  _count?: {
    products: number;
  };
}

export interface ProductDto {
  id: string;
  name: string;
  slug: string;
  description: string;
  categoryId: string;
  category?: CategoryDto;
  sku: string;
  price: number;
  originalPrice: number | null;
  unit: string;
  weight: number;
  stock: number;
  minStock: number;
  isFeatured: boolean;
  isBestSeller: boolean;
  isActive: boolean;
  rating: number;
  reviewCount: number;
  image: string;
  createdAt: string;
  updatedAt: string;
}

export interface CartItemDto {
  id: string;
  productId: string;
  product: ProductDto;
  quantity: number;
}

export interface CartDto {
  items: CartItemDto[];
  subtotal: number;
  discount: number;
  deliveryFee: number;
  tax: number;
  total: number;
  freeDeliveryRemaining: number;
}

export interface AddressDto {
  id: string;
  userId?: string;
  fullName: string;
  phone: string;
  houseNumber: string;
  street: string;
  area: string;
  city: string;
  state: string;
  pincode: string;
  instructions?: string | null;
  isDefault?: boolean;
}

export interface DeliverySlotDto {
  id: string;
  date: string;
  startTime: string;
  endTime: string;
  capacity: number;
  bookedCount: number;
  isActive: boolean;
}

export interface OrderItemDto {
  id: string;
  productId: string;
  productName: string;
  unit: string;
  price: number;
  quantity: number;
  total: number;
}

export interface OrderDto {
  id: string;
  orderNumber: string;
  userId: string;
  user?: {
    name: string;
    email: string;
    phone: string | null;
  };
  address: AddressDto;
  deliverySlot?: DeliverySlotDto | null;
  subtotal: number;
  discount: number;
  deliveryFee: number;
  tax: number;
  total: number;
  paymentMethod: string;
  paymentStatus: string;
  orderStatus: string;
  channel: string;
  notes?: string | null;
  createdAt: string;
  updatedAt: string;
  items: OrderItemDto[];
  delivery?: {
    trackingNumber: string;
    status: string;
    deliveryPersonName?: string | null;
    deliveryPersonPhone?: string | null;
    departureTime?: string | null;
    estimatedDeliveryTime?: string | null;
    deliveredTime?: string | null;
    notes?: string | null;
  } | null;
}

export interface InventoryItemDto {
  id: string;
  productId: string;
  product: ProductDto;
  currentStock: number;
  minThreshold: number;
  reorderQuantity: number;
  status: 'IN_STOCK' | 'LOW_STOCK' | 'OUT_OF_STOCK' | 'NEEDS_REORDER';
  supplierId: string | null;
  supplier?: {
    id: string;
    name: string;
    company: string;
    leadTimeDays: number;
  } | null;
  leadTimeDays: number;
  updatedAt: string;
}

export interface StockMovementDto {
  id: string;
  productId: string;
  productName?: string;
  type: string;
  quantity: number;
  previousStock: number;
  newStock: number;
  reason: string;
  createdBy: string;
  createdAt: string;
}

export interface SupplierDto {
  id: string;
  name: string;
  company: string;
  email: string;
  phone: string;
  address: string;
  leadTimeDays: number;
  status: string;
  _count?: {
    products: number;
    inventories: number;
  };
}

export interface CouponDto {
  id: string;
  code: string;
  description: string;
  discountType: 'PERCENTAGE' | 'FIXED';
  discountValue: number;
  minOrderAmount: number;
  maxDiscount: number | null;
  usageLimit: number;
  usedCount: number;
  startDate: string;
  endDate: string;
  isActive: boolean;
}

export interface NotificationDto {
  id: string;
  userId?: string | null;
  title: string;
  message: string;
  type: 'INFO' | 'ORDER' | 'PROMO' | 'STOCK' | 'ALERT';
  isRead: boolean;
  link?: string | null;
  createdAt: string;
}
