'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import {
  Star,
  Heart,
  Plus,
  Minus,
  ShoppingCart,
  Truck,
  ShieldCheck,
  RotateCcw,
  Clock,
  ArrowLeft,
  Check,
  Zap,
  MapPin,
  Building2,
  CheckCircle2,
  Layers,
} from 'lucide-react';
import { ImageWithFallback } from '@/components/common/ImageWithFallback';
import { formatCurrency, calculateDiscount } from '@/lib/utils';
import { useCartStore } from '@/store/cartStore';
import { ProductCard } from '@/components/products/ProductCard';

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params?.slug as string;

  const [product, setProduct] = useState<any>(null);
  const [relatedProducts, setRelatedProducts] = useState<any[]>([]);
  const [isFavorite, setIsFavorite] = useState(false);
  const [selectedQty, setSelectedQty] = useState(1);
  const [selectedVariantId, setSelectedVariantId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [addedToast, setAddedToast] = useState(false);

  // Pin Code Delivery Checker State
  const [checkPin, setCheckPin] = useState('560038');
  const [pinResult, setPinResult] = useState<any>(null);
  const [checkingPin, setCheckingPin] = useState(false);

  const { items, addItem, updateQuantity } = useCartStore();

  useEffect(() => {
    async function loadProduct() {
      setLoading(true);
      try {
        const res = await fetch(`/api/products/${slug}`);
        if (!res.ok) {
          router.push('/products');
          return;
        }
        const data = await res.json();
        setProduct(data.product);
        setRelatedProducts(data.related || []);

        if (data.product?.variants && data.product.variants.length > 0) {
          const def = data.product.variants.find((v: any) => v.isDefault) || data.product.variants[0];
          setSelectedVariantId(def.id);
        }

        // Auto check default pincode
        checkPinCode('560038');
      } catch (err) {
        console.error('Failed to load product details:', err);
      } finally {
        setLoading(false);
      }
    }

    if (slug) loadProduct();
  }, [slug, router]);

  const checkPinCode = async (pin: string) => {
    if (!pin || pin.length !== 6) return;
    setCheckingPin(true);
    try {
      const res = await fetch(`/api/location/serviceability?pincode=${pin}`);
      const data = await res.json();
      if (res.ok) {
        setPinResult(data);
      }
    } catch (e) {
      // ignore
    } finally {
      setCheckingPin(false);
    }
  };

  if (loading || !product) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12 flex justify-center items-center min-h-[60vh]">
        <div className="w-8 h-8 rounded-full border-2 border-[#2E7D32] border-t-transparent animate-spin" />
      </div>
    );
  }

  // Active Variant or Base Product
  const activeVariant = product.variants?.find((v: any) => v.id === selectedVariantId);
  const activePrice = activeVariant ? activeVariant.price : product.price;
  const activeMrp = activeVariant ? activeVariant.mrp : (product.originalPrice || product.price);
  const activeUnit = activeVariant ? activeVariant.title : product.unit;
  const activeStock = activeVariant ? activeVariant.stock : product.stock;

  const discountPercent = calculateDiscount(activePrice, activeMrp);
  const cartItem = items.find((i) => i.productId === product.id);
  const currentInCart = cartItem?.quantity || 0;

  const handleAddToCart = () => {
    if (activeStock <= 0) return;
    addItem(
      {
        ...product,
        price: activePrice,
        originalPrice: activeMrp,
        unit: activeUnit,
      },
      selectedQty
    );
    setAddedToast(true);
    setTimeout(() => setAddedToast(false), 2500);
  };

  const handleToggleFavorite = async () => {
    const next = !isFavorite;
    setIsFavorite(next);
    try {
      await fetch('/api/favorites', {
        method: next ? 'POST' : 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId: product.id }),
      });
    } catch {
      setIsFavorite(!next);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
      {/* Back button */}
      <div className="mb-4">
        <Link
          href="/products"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-gray-500 hover:text-[#2E7D32] transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to All Products</span>
        </Link>
      </div>

      {/* Main Product Container */}
      <div className="bg-white dark:bg-slate-900 eye-protection:bg-[#FFFDF9] rounded-3xl border border-gray-200/80 dark:border-slate-800 eye-protection:border-[#E6DCBE] p-4 sm:p-8 shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
          {/* Image Column */}
          <div className="relative">
            <div className="relative pt-[90%] w-full rounded-2xl overflow-hidden bg-gray-50 dark:bg-slate-800 border border-gray-100 dark:border-slate-700">
              <ImageWithFallback
                src={product.image}
                alt={product.name}
                priority={true}
                className="absolute inset-0 w-full h-full object-cover"
              />
              <div className="absolute top-4 left-4 flex flex-col gap-1.5">
                {discountPercent > 0 && (
                  <span className="bg-[#FF6F00] text-white text-xs font-extrabold px-2.5 py-1 rounded-full shadow-md">
                    {discountPercent}% OFF
                  </span>
                )}
                {product.supplierOffers && product.supplierOffers.length > 0 && (
                  <span className="bg-[#2E7D32] text-white text-[10px] font-black px-2 py-0.5 rounded-full shadow-md flex items-center gap-1">
                    <Zap className="w-3 h-3 fill-current" />
                    <span>SMART PRICE VERIFIED</span>
                  </span>
                )}
              </div>
            </div>

            {/* Favorite button */}
            <button
              onClick={handleToggleFavorite}
              aria-label={isFavorite ? 'Remove from wishlist' : 'Save to wishlist'}
              className="absolute top-4 right-4 p-2.5 rounded-full bg-white/90 dark:bg-slate-900/90 shadow-md text-gray-400 hover:text-red-500 transition"
            >
              <Heart className={`w-5 h-5 ${isFavorite ? 'fill-red-500 text-red-500' : ''}`} />
            </button>
          </div>

          {/* Details Column */}
          <div className="flex flex-col justify-between">
            <div>
              {/* Category, Brand & Rating */}
              <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-[#2E7D32] dark:text-[#4CAF50] bg-green-50 dark:bg-slate-800 px-2.5 py-1 rounded-lg">
                    {product.brand?.name || product.category?.name || 'Fresh Grocery'}
                  </span>
                  {product.department && (
                    <span className="text-[10px] font-bold text-gray-500 bg-gray-100 dark:bg-slate-800 px-2 py-1 rounded-lg">
                      {product.department.name}
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-1.5 text-xs font-bold text-amber-500 bg-amber-50 dark:bg-slate-800 px-2.5 py-1 rounded-lg">
                  <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                  <span>{product.rating.toFixed(1)}</span>
                  <span className="text-gray-400 font-normal">({product.reviewCount || 34} reviews)</span>
                </div>
              </div>

              {/* Title & SKU */}
              <h1 className="text-2xl sm:text-3xl font-black text-gray-900 dark:text-white eye-protection:text-[#3E3B32] leading-tight">
                {product.name}
              </h1>
              <p className="text-xs text-gray-400 mt-1 font-mono">
                SKU: {activeVariant ? activeVariant.sku : product.sku}
              </p>

              {/* Price Row */}
              <div className="flex items-baseline gap-3 my-4">
                <span className="text-3xl sm:text-4xl font-black text-[#2E7D32] dark:text-[#4CAF50]">
                  {formatCurrency(activePrice)}
                </span>
                {activeMrp && activeMrp > activePrice && (
                  <span className="text-lg text-gray-400 line-through">
                    {formatCurrency(activeMrp)}
                  </span>
                )}
                <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">
                  (Inclusive of 5% GST)
                </span>
              </div>

              {/* Pack Sizes / Variants Selector */}
              {product.variants && product.variants.length > 0 && (
                <div className="mb-5">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-gray-700 dark:text-gray-300 mb-2">
                    <Layers className="w-4 h-4 text-[#2E7D32]" />
                    <span>Select Pack Size / Quantity:</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {product.variants.map((v: any) => (
                      <button
                        key={v.id}
                        type="button"
                        onClick={() => setSelectedVariantId(v.id)}
                        className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold border transition ${
                          selectedVariantId === v.id
                            ? 'border-[#2E7D32] bg-green-50 dark:bg-green-950/40 text-[#2E7D32] dark:text-green-300 shadow-sm ring-1 ring-[#2E7D32]'
                            : 'border-gray-200 dark:border-slate-700 text-gray-700 dark:text-gray-300 hover:border-gray-300'
                        }`}
                      >
                        <span>{v.title}</span>
                        <span className="font-extrabold text-[#2E7D32] dark:text-green-400">
                          {formatCurrency(v.price)}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Stock Status */}
              <div className="mb-4">
                {activeStock <= 0 ? (
                  <span className="inline-flex items-center gap-1 text-xs font-bold text-red-600 bg-red-50 dark:bg-slate-800 px-3 py-1 rounded-full">
                    Currently Out of Stock
                  </span>
                ) : activeStock <= (product.minStock || 5) ? (
                  <span className="inline-flex items-center gap-1 text-xs font-bold text-amber-600 bg-amber-50 dark:bg-slate-800 px-3 py-1 rounded-full">
                    Only {activeStock} units remaining - Order soon!
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-xs font-bold text-green-700 dark:text-green-400 bg-green-50 dark:bg-slate-800 px-3 py-1 rounded-full">
                    <Check className="w-3.5 h-3.5" /> In Stock & Ready for Rapid Dispatch
                  </span>
                )}
              </div>

              {/* Location & PIN Code Checker Widget */}
              <div className="p-3.5 rounded-2xl bg-gray-50 dark:bg-slate-800/60 eye-protection:bg-[#F3ECD9] border border-gray-200 dark:border-slate-700 mb-5">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-gray-700 dark:text-gray-300 flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-[#2E7D32]" />
                    <span>Check Delivery Speed in Your PIN</span>
                  </span>
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    maxLength={6}
                    value={checkPin}
                    onChange={(e) => setCheckPin(e.target.value.replace(/\D/g, ''))}
                    placeholder="Enter 6-digit PIN"
                    className="w-36 px-3 py-1.5 text-xs rounded-lg border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-900 outline-none focus:border-[#2E7D32]"
                  />
                  <button
                    type="button"
                    onClick={() => checkPinCode(checkPin)}
                    disabled={checkingPin || checkPin.length !== 6}
                    className="px-3 py-1.5 bg-[#2E7D32] hover:bg-[#1B5E20] text-white text-xs font-bold rounded-lg transition disabled:opacity-50"
                  >
                    {checkingPin ? '...' : 'Check'}
                  </button>
                </div>
                {pinResult && (
                  <div className="mt-2.5 flex items-center gap-2 text-xs font-semibold">
                    {pinResult.deliveryMode === 'QUICK_LOCAL' ? (
                      <span className="text-green-700 dark:text-green-400 flex items-center gap-1">
                        <Zap className="w-3.5 h-3.5 fill-current" />
                        <span>⚡ <strong>15-25 Mins Express Delivery</strong> to {pinResult.city} ({pinResult.pincode})</span>
                      </span>
                    ) : (
                      <span className="text-blue-700 dark:text-blue-400 flex items-center gap-1">
                        <Truck className="w-3.5 h-3.5" />
                        <span>📦 <strong>2-3 Days Nationwide Courier</strong> to {pinResult.city} ({pinResult.pincode})</span>
                      </span>
                    )}
                  </div>
                )}
              </div>

              {/* Multi-Supplier Price Comparison Table */}
              {product.supplierOffers && product.supplierOffers.length > 0 && (
                <div className="border border-green-200 dark:border-green-900/60 rounded-2xl p-4 bg-green-50/40 dark:bg-green-950/20 mb-5">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-extrabold text-[#2E7D32] dark:text-green-300 uppercase tracking-wider flex items-center gap-1.5">
                      <Zap className="w-3.5 h-3.5 fill-current" />
                      <span>Smart Price Comparison Across Verified Suppliers</span>
                    </span>
                    <span className="text-[10px] bg-white dark:bg-slate-800 text-gray-600 dark:text-gray-300 px-2 py-0.5 rounded border font-semibold">
                      {product.supplierOffers.length} Verified B2B Offers
                    </span>
                  </div>

                  <div className="divide-y divide-green-100 dark:divide-slate-800 text-xs">
                    {product.supplierOffers.map((offer: any, idx: number) => (
                      <div key={offer.id || idx} className="py-2 flex items-center justify-between">
                        <div>
                          <p className="font-bold text-gray-800 dark:text-gray-200">
                            {offer.supplier?.name || offer.supplier?.company || 'Verified Supplier'}
                          </p>
                          <span className="text-[10px] text-gray-500">
                            Lead time: {offer.leadTimeHours || 24}h • Stock: {offer.stockAvailable} units
                          </span>
                        </div>
                        <div className="text-right">
                          <span className="font-extrabold text-[#2E7D32] dark:text-green-400 text-sm">
                            {formatCurrency(offer.sellingPrice)}
                          </span>
                          {offer.isCheapest && (
                            <span className="block text-[9px] font-black text-amber-600 uppercase">
                              ★ Lowest Price Offer
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Description */}
              <div className="border-t border-gray-100 dark:border-slate-800 py-3">
                <h2 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-1">
                  Product Overview
                </h2>
                <p className="text-sm text-gray-600 dark:text-gray-300 eye-protection:text-[#787262] leading-relaxed">
                  {product.description}
                </p>
              </div>
            </div>

            {/* Actions: Stepper and Add to Cart */}
            <div className="border-t border-gray-100 dark:border-slate-800 pt-5 mt-3">
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
                {/* Quantity Stepper */}
                <div className="flex items-center justify-between sm:justify-start bg-gray-100 dark:bg-slate-800 eye-protection:bg-[#F3ECD9] rounded-2xl p-1.5 border border-gray-200 dark:border-slate-700">
                  <button
                    type="button"
                    onClick={() => setSelectedQty(Math.max(1, selectedQty - 1))}
                    disabled={selectedQty <= 1}
                    className="p-2 hover:bg-white dark:hover:bg-slate-700 rounded-xl transition disabled:opacity-30"
                  >
                    <Minus className="w-4 h-4 text-gray-700 dark:text-gray-200" />
                  </button>
                  <span className="px-5 font-bold text-sm text-gray-900 dark:text-white">
                    {selectedQty}
                  </span>
                  <button
                    type="button"
                    onClick={() => setSelectedQty(Math.min(activeStock, selectedQty + 1))}
                    disabled={selectedQty >= activeStock}
                    className="p-2 hover:bg-white dark:hover:bg-slate-700 rounded-xl transition disabled:opacity-30"
                  >
                    <Plus className="w-4 h-4 text-gray-700 dark:text-gray-200" />
                  </button>
                </div>

                {/* Add To Cart Button */}
                <button
                  type="button"
                  onClick={handleAddToCart}
                  disabled={activeStock <= 0}
                  className="flex-1 py-3.5 px-6 bg-[#2E7D32] hover:bg-[#1B5E20] text-white font-bold rounded-2xl shadow-lg shadow-green-900/15 flex items-center justify-center gap-2 text-sm transition disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <ShoppingCart className="w-4 h-4" />
                  <span>
                    {activeStock <= 0
                      ? 'Out of Stock'
                      : currentInCart > 0
                      ? `Add ${selectedQty} More (${currentInCart} in Cart)`
                      : `Add ${selectedQty} to Cart`}
                  </span>
                </button>
              </div>

              {/* Added Toast Alert */}
              {addedToast && (
                <div className="mt-3 bg-green-100 border border-green-300 text-green-800 text-xs font-bold px-4 py-2 rounded-xl flex items-center justify-between animate-in fade-in">
                  <span>Added {selectedQty} {activeUnit} to your grocery basket!</span>
                  <Link href="/cart" className="underline text-[#2E7D32]">View Cart →</Link>
                </div>
              )}

              {/* Trust Badges */}
              <div className="grid grid-cols-3 gap-2 mt-5 pt-5 border-t border-gray-100 dark:border-slate-800 text-center">
                <div className="flex flex-col items-center p-2 rounded-xl bg-gray-50 dark:bg-slate-800/50">
                  <Zap className="w-4 h-4 text-[#2E7D32] mb-1 fill-current" />
                  <span className="text-[10px] font-bold text-gray-700 dark:text-gray-300">15-Min Delivery</span>
                </div>
                <div className="flex flex-col items-center p-2 rounded-xl bg-gray-50 dark:bg-slate-800/50">
                  <ShieldCheck className="w-4 h-4 text-[#2E7D32] mb-1" />
                  <span className="text-[10px] font-bold text-gray-700 dark:text-gray-300">100% Authentic</span>
                </div>
                <div className="flex flex-col items-center p-2 rounded-xl bg-gray-50 dark:bg-slate-800/50">
                  <RotateCcw className="w-4 h-4 text-[#2E7D32] mb-1" />
                  <span className="text-[10px] font-bold text-gray-700 dark:text-gray-300">Doorstep Return</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <div className="mt-12">
          <h2 className="text-xl font-black text-gray-900 dark:text-white eye-protection:text-[#3E3B32] mb-4">
            You Might Also Like
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
            {relatedProducts.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
