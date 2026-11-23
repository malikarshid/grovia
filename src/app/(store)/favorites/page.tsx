'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Heart, ShoppingBag, ArrowRight } from 'lucide-react';
import { ProductDto } from '@/types';
import { ProductCard } from '@/components/products/ProductCard';

export default function FavoritesPage() {
  const [favorites, setFavorites] = useState<ProductDto[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadFavorites() {
      try {
        const res = await fetch('/api/favorites');
        const data = await res.json();
        setFavorites(data.favorites || []);
      } catch (err) {
        console.error('Failed to load favorites:', err);
      } finally {
        setLoading(false);
      }
    }
    loadFavorites();
  }, []);

  const handleFavoriteToggle = (productId: string, isFav: boolean) => {
    if (!isFav) {
      setFavorites((prev) => prev.filter((p) => p.id !== productId));
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
      <div className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-black text-gray-900 dark:text-white eye-protection:text-[#3E3B32]">
          My Saved Favourites
        </h1>
        <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
          Quickly reorder your everyday grocery favorites
        </p>
      </div>

      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-64 rounded-2xl bg-gray-100 dark:bg-slate-800 animate-pulse" />
          ))}
        </div>
      ) : favorites.length === 0 ? (
        <div className="text-center py-16 bg-white dark:bg-slate-900 eye-protection:bg-[#FFFDF9] rounded-3xl border border-gray-200 dark:border-slate-800 p-8 max-w-md mx-auto">
          <Heart className="w-16 h-16 text-gray-300 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">
            No saved favorites yet
          </h3>
          <p className="text-xs text-gray-500 mb-6">
            Tap the heart icon on any product to save it here for fast reordering.
          </p>
          <Link
            href="/products"
            className="px-5 py-2.5 bg-[#2E7D32] text-white text-xs font-bold rounded-xl shadow-md hover:bg-[#1B5E20]"
          >
            Explore Groceries
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {favorites.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              isFavoriteInitial={true}
              onFavoriteToggle={handleFavoriteToggle}
            />
          ))}
        </div>
      )}
    </div>
  );
}
