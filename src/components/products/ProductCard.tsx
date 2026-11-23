'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Heart, Plus, Minus, ShoppingCart, Star, Zap, ShieldCheck } from 'lucide-react';
import { ProductDto } from '@/types';
import { ImageWithFallback } from '@/components/common/ImageWithFallback';
import { formatCurrency, calculateDiscount } from '@/lib/utils';
import { useCartStore } from '@/store/cartStore';

interface ProductCardProps {
  product: ProductDto & {
    brand?: { name: string; slug: string };
    variants?: Array<{ id: string; title: string; price: number; mrp: number; stock: number; unit: string; isDefault?: boolean }>;
    supplierOffers?: Array<{ isCheapest: boolean; sellingPrice: number; mrp: number; supplier: { name: string } }>;
  };
  isFavoriteInitial?: boolean;
  onFavoriteToggle?: (productId: string, isFav: boolean) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  isFavoriteInitial = false,
  onFavoriteToggle,
}) => {
  const [isFavorite, setIsFavorite] = useState(isFavoriteInitial);
  const [isFavLoading, setIsFavLoading] = useState(false);
  const [selectedVariantIndex, setSelectedVariantIndex] = useState<number>(() => {
    if (product.variants && product.variants.length > 0) {
      const defIdx = product.variants.findIndex((v) => v.isDefault);
      return defIdx !== -1 ? defIdx : 0;
    }
    return -1;
  });

  const { items, addItem, updateQuantity, removeItem } = useCartStore();

  const activeVariant = selectedVariantIndex >= 0 && product.variants ? product.variants[selectedVariantIndex] : null;
  const currentPrice = activeVariant ? activeVariant.price : product.price;
  const currentMrp = activeVariant ? activeVariant.mrp : (product.originalPrice || product.price);
  const currentUnit = activeVariant ? activeVariant.title : product.unit;
  const currentStock = activeVariant ? activeVariant.stock : product.stock;

  const cartItem = items.find((i) => i.productId === product.id);
  const quantity = cartItem?.quantity || 0;
  const discountPercent = calculateDiscount(currentPrice, currentMrp);

  const handleFavoriteClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsFavLoading(true);
    const nextState = !isFavorite;
    setIsFavorite(nextState);

    try {
      await fetch('/api/favorites', {
        method: nextState ? 'POST' : 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId: product.id }),
      });
      if (onFavoriteToggle) {
        onFavoriteToggle(product.id, nextState);
      }
    } catch {
      setIsFavorite(!nextState); // rollback on error
    } finally {
      setIsFavLoading(false);
    }
  };

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (currentStock <= 0) return;
    addItem({
      ...product,
      price: currentPrice,
      originalPrice: currentMrp,
      unit: currentUnit,
    }, 1);
  };

  const handleIncrement = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (quantity < currentStock) {
      updateQuantity(product.id, quantity + 1);
    }
  };

  const handleDecrement = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (quantity === 1) {
      removeItem(product.id);
    } else {
      updateQuantity(product.id, quantity - 1);
    }
  };

  return (
    <div className="group relative flex flex-col justify-between bg-white dark:bg-slate-900 eye-protection:bg-[#FFFDF9] rounded-2xl border border-gray-200/80 dark:border-slate-800 eye-protection:border-[#E6DCBE] hover:shadow-grovia transition-all duration-200 overflow-hidden">
      {/* Top Badges */}
      <div className="absolute top-2.5 left-2.5 right-2.5 z-10 flex items-center justify-between pointer-events-none">
        <div className="flex flex-col gap-1">
          {discountPercent > 0 && (
            <span className="bg-[#FF6F00] text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm w-fit">
              {discountPercent}% OFF
            </span>
          )}
          {product.supplierOffers && product.supplierOffers.length > 0 && (
            <span className="bg-[#2E7D32] text-white text-[9px] font-extrabold px-1.5 py-0.2 rounded-full shadow-sm flex items-center gap-0.5 w-fit">
              <Zap className="w-2.5 h-2.5 fill-current" />
              <span>BEST PRICE</span>
            </span>
          )}
        </div>

        <button
          type="button"
          onClick={handleFavoriteClick}
          disabled={isFavLoading}
          aria-label={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
          className={`pointer-events-auto p-1.5 rounded-full transition shadow-sm ${
            isFavorite
              ? 'bg-red-50 text-red-500'
              : 'bg-white/90 dark:bg-slate-800/90 text-gray-400 hover:text-red-500 hover:scale-110'
          }`}
        >
          <Heart className={`w-4 h-4 ${isFavorite ? 'fill-red-500 text-red-500' : ''}`} />
        </button>
      </div>

      {/* Product Image Link */}
      <Link href={`/product/${product.slug}`} className="block relative pt-[90%] w-full overflow-hidden bg-gray-50 dark:bg-slate-800/50">
        <ImageWithFallback
          src={product.image}
          alt={product.name}
          className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
        {currentStock <= 0 && (
          <div className="absolute inset-0 bg-black/50 backdrop-blur-[2px] flex items-center justify-center">
            <span className="bg-red-600 text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
              Out of Stock
            </span>
          </div>
        )}
      </Link>

      {/* Content */}
      <div className="p-3.5 flex flex-col flex-1 justify-between">
        <div>
          {/* Brand & Rating */}
          <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 mb-1">
            <span className="font-semibold text-[11px] text-[#2E7D32] dark:text-green-400 uppercase tracking-wider truncate max-w-[130px]">
              {product.brand?.name || 'GROVIA'}
            </span>
            <div className="flex items-center gap-1 text-amber-500 font-semibold text-[11px]">
              <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
              <span>{product.rating.toFixed(1)}</span>
            </div>
          </div>

          {/* Product Title */}
          <Link href={`/product/${product.slug}`} className="block mb-2">
            <h3 className="font-bold text-xs sm:text-sm text-gray-900 dark:text-white eye-protection:text-[#3E3B32] line-clamp-2 hover:text-[#2E7D32] transition leading-snug">
              {product.name}
            </h3>
          </Link>

          {/* Variants Selector Pills */}
          {product.variants && product.variants.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-2">
              {product.variants.map((v, idx) => (
                <button
                  key={v.id || idx}
                  type="button"
                  onClick={() => setSelectedVariantIndex(idx)}
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-md border transition ${
                    selectedVariantIndex === idx
                      ? 'border-[#2E7D32] bg-green-50 dark:bg-green-950/40 text-[#2E7D32] dark:text-green-300'
                      : 'border-gray-200 dark:border-slate-700 text-gray-600 dark:text-gray-400 hover:border-gray-300'
                  }`}
                >
                  {v.title}
                </button>
              ))}
            </div>
          )}

          {(!product.variants || product.variants.length === 0) && (
            <div className="text-[11px] text-gray-500 dark:text-gray-400 font-medium mb-1">
              {product.unit}
            </div>
          )}
        </div>

        {/* Pricing & Add to Cart */}
        <div className="mt-2 pt-2.5 border-t border-gray-100 dark:border-slate-800 flex items-center justify-between gap-2">
          <div className="flex flex-col">
            <div className="flex items-baseline gap-1.5">
              <span className="text-sm sm:text-base font-extrabold text-[#2E7D32] dark:text-[#4CAF50]">
                {formatCurrency(currentPrice)}
              </span>
              {currentMrp && currentMrp > currentPrice && (
                <span className="text-[11px] text-gray-400 line-through">
                  {formatCurrency(currentMrp)}
                </span>
              )}
            </div>
          </div>

          {/* Cart Stepper or Add button */}
          {quantity > 0 ? (
            <div className="flex items-center bg-[#2E7D32] text-white rounded-lg p-0.5 shadow-sm">
              <button
                type="button"
                onClick={handleDecrement}
                aria-label="Decrease quantity"
                className="p-1 hover:bg-black/15 rounded transition"
              >
                <Minus className="w-3.5 h-3.5" />
              </button>
              <span className="px-2 text-xs font-bold">{quantity}</span>
              <button
                type="button"
                onClick={handleIncrement}
                disabled={quantity >= currentStock}
                aria-label="Increase quantity"
                className="p-1 hover:bg-black/15 rounded transition disabled:opacity-40"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={handleAddToCart}
              disabled={currentStock <= 0}
              aria-label={`Add ${product.name} to cart`}
              className="flex items-center gap-1 bg-green-50 hover:bg-[#2E7D32] text-[#2E7D32] hover:text-white dark:bg-slate-800 dark:hover:bg-[#2E7D32] dark:text-green-400 dark:hover:text-white text-xs font-bold px-3 py-1.5 rounded-lg border border-[#2E7D32]/20 hover:border-transparent transition shadow-sm disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <ShoppingCart className="w-3.5 h-3.5" />
              <span>ADD</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
