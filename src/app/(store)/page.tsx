'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Sparkles,
  ArrowRight,
  TrendingUp,
  Percent,
  Clock,
  ChevronRight,
  Award,
  Zap,
  ShieldCheck,
  Truck,
  MapPin,
  Tag,
  Flame,
  CheckCircle2,
} from 'lucide-react';
import { ProductDto, CategoryDto } from '@/types';
import { ProductCard } from '@/components/products/ProductCard';
import { SplashScreen } from '@/components/common/SplashScreen';
import { OnboardingModal } from '@/components/common/OnboardingModal';
import { useAuthStore } from '@/store/authStore';
import { ImageWithFallback } from '@/components/common/ImageWithFallback';

interface DepartmentDto {
  id: string;
  name: string;
  slug: string;
  icon?: string;
  image?: string;
  displayOrder: number;
}

export default function HomePage() {
  const [showSplash, setShowSplash] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [departments, setDepartments] = useState<DepartmentDto[]>([]);
  const [categories, setCategories] = useState<CategoryDto[]>([]);
  const [popularProducts, setPopularProducts] = useState<any[]>([]);
  const [bestSellers, setBestSellers] = useState<any[]>([]);
  const [freshArrivals, setFreshArrivals] = useState<any[]>([]);
  const [smartPriceDeals, setSmartPriceDeals] = useState<any[]>([]);
  const [regionalFoods, setRegionalFoods] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Active Location Info for Serviceability Promise
  const [locationInfo, setLocationInfo] = useState({
    city: 'Bengaluru',
    pincode: '560038',
    deliveryMode: 'QUICK_LOCAL',
    deliveryTimeText: '15 MINS',
    campaignText: 'Free Delivery on orders above ₹499 across all serviceable PIN codes!',
  });

  const { onboardingCompleted, user } = useAuthStore();

  useEffect(() => {
    const hasSeenSplash = sessionStorage.getItem('grovia_seen_splash');
    if (!hasSeenSplash) {
      setShowSplash(true);
      sessionStorage.setItem('grovia_seen_splash', 'true');
    }

    if (!onboardingCompleted) {
      setShowOnboarding(true);
    }

    // Fetch location serviceability
    fetch('/api/location/serviceability')
      .then((r) => r.json())
      .then((data) => {
        if (data.isServiceable) {
          setLocationInfo({
            city: data.city || 'Bengaluru',
            pincode: data.pincode || '560038',
            deliveryMode: data.deliveryMode || 'QUICK_LOCAL',
            deliveryTimeText: data.deliveryTimeText || '15 MINS',
            campaignText: data.pricing?.campaignText || 'Free Delivery on orders above ₹499!',
          });
        }
      })
      .catch(() => {});

    // Listen for custom location changed events
    const handleLocationUpdate = (e: any) => {
      if (e.detail) {
        setLocationInfo((prev) => ({
          ...prev,
          city: e.detail.city,
          pincode: e.detail.pincode,
          deliveryMode: e.detail.deliveryMode,
          deliveryTimeText: e.detail.timeText || '15 MINS',
        }));
      }
    };
    window.addEventListener('grovia-location-changed', handleLocationUpdate);

    // Fetch initial homepage data
    async function loadData() {
      try {
        const [deptRes, catRes, prodRes] = await Promise.all([
          fetch('/api/departments'),
          fetch('/api/categories'),
          fetch('/api/products?limit=50'),
        ]);

        const deptData = await deptRes.json();
        const catData = await catRes.json();
        const prodData = await prodRes.json();

        setDepartments(deptData.departments || []);
        setCategories(catData.categories || []);
        const allProds: any[] = prodData.products || [];

        setPopularProducts(allProds.filter((p) => p.isFeatured).slice(0, 8));
        setBestSellers(allProds.filter((p) => p.isBestSeller).slice(0, 8));
        setFreshArrivals(allProds.slice(0, 8));

        // Smart Price deals: Products with supplier offers or big discounts
        const deals = allProds.filter(
          (p) => (p.supplierOffers && p.supplierOffers.length > 0) || (p.originalPrice && p.originalPrice > p.price * 1.1)
        );
        setSmartPriceDeals(deals.length > 0 ? deals.slice(0, 8) : allProds.slice(0, 4));

        // Regional Indian foods
        const regional = allProds.filter(
          (p) =>
            p.slug.includes('mango') ||
            p.slug.includes('toor-dal') ||
            p.slug.includes('atta') ||
            p.slug.includes('bhujia')
        );
        setRegionalFoods(regional.length > 0 ? regional : allProds.slice(0, 4));
      } catch (err) {
        console.error('Failed to load homepage data:', err);
      } finally {
        setLoading(false);
      }
    }

    loadData();

    return () => {
      window.removeEventListener('grovia-location-changed', handleLocationUpdate);
    };
  }, [onboardingCompleted]);

  return (
    <div className="min-h-screen pb-12">
      {/* Splash Screen */}
      {showSplash && <SplashScreen onFinish={() => setShowSplash(false)} />}

      {/* Onboarding Modal */}
      {showOnboarding && !showSplash && (
        <OnboardingModal onClose={() => setShowOnboarding(false)} />
      )}

      {/* Main Content Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 space-y-8">
        {/* Dynamic Location Serviceability Promise Banner */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-emerald-800 via-[#2E7D32] to-teal-800 text-white p-5 sm:p-6 shadow-md">
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="bg-yellow-400 text-slate-900 text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full flex items-center gap-1">
                  {locationInfo.deliveryMode === 'QUICK_LOCAL' ? (
                    <>
                      <Zap className="w-3 h-3 fill-current" />
                      <span>{locationInfo.deliveryTimeText} DARK STORE DELIVERY</span>
                    </>
                  ) : (
                    <>
                      <Truck className="w-3 h-3" />
                      <span>{locationInfo.deliveryTimeText} NATIONWIDE EXPRESS</span>
                    </>
                  )}
                </span>
                <span className="text-emerald-100 text-xs font-semibold flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-yellow-300" />
                  <span>{locationInfo.city} ({locationInfo.pincode})</span>
                </span>
              </div>

              <h1 className="text-xl sm:text-3xl font-black tracking-tight leading-snug">
                {locationInfo.deliveryMode === 'QUICK_LOCAL' ? (
                  <>Fresh groceries delivered in <span className="text-yellow-300">{locationInfo.deliveryTimeText}</span></>
                ) : (
                  <>Fast nationwide courier to your doorstep in <span className="text-yellow-300">{locationInfo.deliveryTimeText}</span></>
                )}
              </h1>
              <p className="text-xs sm:text-sm text-emerald-100 mt-1 max-w-2xl">
                {locationInfo.campaignText}
              </p>

              <div className="flex flex-wrap items-center gap-4 mt-3 text-xs text-emerald-200">
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-yellow-300" />
                  <span>Direct Farm-to-Fork</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-yellow-300" />
                  <span>Cold-Chain Maintained</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-yellow-300" />
                  <span>Live GPS Partner Tracking</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 sm:self-start md:self-center flex-shrink-0">
              <Link
                href="/products"
                className="bg-white hover:bg-yellow-300 text-[#2E7D32] hover:text-slate-900 font-extrabold text-xs sm:text-sm px-5 py-3 rounded-xl transition shadow flex items-center gap-1.5"
              >
                <span>Start Shopping</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>

          <div className="absolute right-0 bottom-0 opacity-10 pointer-events-none transform translate-x-8 translate-y-8">
            <Zap className="w-72 h-72" />
          </div>
        </div>

        {/* 30 Marketplace Departments Section */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <div>
              <h2 className="text-lg sm:text-xl font-black text-gray-900 dark:text-white eye-protection:text-[#3E3B32]">
                Explore Marketplace Departments
              </h2>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Over 30 specialized departments for every grocery need
              </p>
            </div>
            <Link
              href="/categories"
              className="text-xs font-bold text-[#2E7D32] dark:text-[#4CAF50] hover:underline flex items-center gap-1"
            >
              <span>View All</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-gray-200 dark:scrollbar-thumb-slate-700">
            {departments.slice(0, 16).map((dept) => (
              <Link
                key={dept.id}
                href={`/products?department=${dept.slug}`}
                className="group flex-shrink-0 flex flex-col items-center w-24 sm:w-28 p-2.5 rounded-2xl bg-white dark:bg-slate-900 eye-protection:bg-[#FFFDF9] border border-gray-200/80 dark:border-slate-800 eye-protection:border-[#E6DCBE] hover:border-[#2E7D32] hover:shadow-md transition text-center"
              >
                <div className="w-14 h-14 rounded-xl overflow-hidden bg-gray-100 dark:bg-slate-800 mb-2 relative flex-shrink-0">
                  <ImageWithFallback
                    src={dept.image || 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=200&q=80'}
                    alt={dept.name}
                    width={100}
                    height={100}
                    className="w-full h-full object-cover group-hover:scale-110 transition duration-300"
                  />
                </div>
                <span className="text-[11px] font-bold text-gray-800 dark:text-gray-200 eye-protection:text-[#3E3B32] line-clamp-2 group-hover:text-[#2E7D32] transition leading-tight">
                  {dept.name}
                </span>
              </Link>
            ))}
          </div>
        </div>

        {/* Smart Price / Lowest Price Guarantee Section */}
        {smartPriceDeals.length > 0 && (
          <div className="p-4 sm:p-5 rounded-2xl bg-amber-50/60 dark:bg-slate-900 eye-protection:bg-[#F7EFE1] border border-amber-200/80 dark:border-slate-800">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-[#FF6F00] text-white rounded-lg shadow-sm">
                  <Flame className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-lg sm:text-xl font-black text-gray-900 dark:text-white eye-protection:text-[#3E3B32] flex items-center gap-2">
                    <span>Smart Price Guarantee</span>
                    <span className="text-[10px] bg-green-100 text-[#2E7D32] font-black px-2 py-0.5 rounded-full uppercase">
                      Cheapest in City
                    </span>
                  </h2>
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    Real-time multi-supplier price matching guaranteeing lowest rates
                  </p>
                </div>
              </div>
              <Link
                href="/products"
                className="text-xs font-bold text-[#FF6F00] hover:underline flex items-center gap-1"
              >
                <span>All Deals</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-4">
              {smartPriceDeals.slice(0, 4).map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </div>
        )}

        {/* Promotional Banner Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#2E7D32] to-[#1B5E20] text-white p-6 flex flex-col justify-between min-h-[170px] shadow-sm">
            <div className="relative z-10 max-w-[70%]">
              <span className="bg-[#FF6F00] text-white text-[10px] font-extrabold px-2 py-0.5 rounded-full uppercase tracking-wider">
                Festive Offer
              </span>
              <h2 className="text-xl font-black mt-2 leading-tight">
                Flat ₹100 OFF on Orders Above ₹500
              </h2>
              <p className="text-xs text-green-100 mt-1">Use coupon: <span className="font-mono font-bold text-yellow-300">GROVIA100</span></p>
            </div>
            <Link
              href="/products"
              className="relative z-10 inline-flex items-center gap-1 text-xs font-bold bg-white text-[#2E7D32] px-3 py-1.5 rounded-lg w-fit mt-3 hover:bg-green-50 transition"
            >
              <span>Claim Offer</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#FF6F00] to-[#E65100] text-white p-6 flex flex-col justify-between min-h-[170px] shadow-sm">
            <div className="relative z-10 max-w-[75%]">
              <span className="bg-white/20 text-white text-[10px] font-extrabold px-2 py-0.5 rounded-full uppercase tracking-wider">
                Seasonal Harvest
              </span>
              <h2 className="text-xl font-black mt-2 leading-tight">
                Authentic Ratnagiri Alphonso Mangoes
              </h2>
              <p className="text-xs text-orange-100 mt-1">Direct from partnered GI-tagged orchards</p>
            </div>
            <Link
              href="/products?category=fresh-fruits"
              className="relative z-10 inline-flex items-center gap-1 text-xs font-bold bg-white text-[#FF6F00] px-3 py-1.5 rounded-lg w-fit mt-3 hover:bg-orange-50 transition"
            >
              <span>Explore Fruits</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-800 to-slate-900 text-white p-6 flex flex-col justify-between min-h-[170px] shadow-sm">
            <div className="relative z-10 max-w-[70%]">
              <span className="bg-green-600 text-white text-[10px] font-extrabold px-2 py-0.5 rounded-full uppercase tracking-wider">
                Quick Local
              </span>
              <h2 className="text-xl font-black mt-2 leading-tight">
                Amul Fresh Milk & Dairy Staples
              </h2>
              <p className="text-xs text-slate-300 mt-1">15-minute doorstep drop via EV fleet</p>
            </div>
            <Link
              href="/products?category=dairy-eggs"
              className="relative z-10 inline-flex items-center gap-1 text-xs font-bold bg-white text-slate-900 px-3 py-1.5 rounded-lg w-fit mt-3 hover:bg-slate-100 transition"
            >
              <span>Order Dairy</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* Regional Indian Foods Showcase */}
        {regionalFoods.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-red-100 dark:bg-slate-800 rounded-lg text-red-600">
                  <Tag className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-lg sm:text-xl font-black text-gray-900 dark:text-white eye-protection:text-[#3E3B32]">
                    Regional Indian Foods & Authentic Flavours
                  </h2>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Geographically authentic staples sourced directly from native regions
                  </p>
                </div>
              </div>
              <Link
                href="/products?department=regional-indian-foods"
                className="text-xs font-bold text-[#2E7D32] dark:text-[#4CAF50] hover:underline flex items-center gap-1"
              >
                <span>Explore Regionals</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-4">
              {regionalFoods.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </div>
        )}

        {/* Popular Products */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-green-100 dark:bg-slate-800 rounded-lg text-[#2E7D32]">
                <TrendingUp className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-lg sm:text-xl font-black text-gray-900 dark:text-white eye-protection:text-[#3E3B32]">
                  Popular in {locationInfo.city}
                </h2>
                <p className="text-xs text-gray-500 dark:text-gray-400">Loved by thousands of Indian households</p>
              </div>
            </div>
            <Link
              href="/products?featured=true"
              className="text-xs font-bold text-[#2E7D32] dark:text-[#4CAF50] hover:underline flex items-center gap-1"
            >
              <span>See More</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {loading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-64 rounded-2xl bg-gray-100 dark:bg-slate-800 animate-pulse" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-4">
              {popularProducts.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          )}
        </div>

        {/* Best Sellers */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-orange-100 dark:bg-slate-800 rounded-lg text-[#FF6F00]">
                <Award className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-lg sm:text-xl font-black text-gray-900 dark:text-white eye-protection:text-[#3E3B32]">
                  Best Sellers
                </h2>
                <p className="text-xs text-gray-500 dark:text-gray-400">High-rotation everyday essentials</p>
              </div>
            </div>
            <Link
              href="/products?bestSeller=true"
              className="text-xs font-bold text-[#FF6F00] hover:underline flex items-center gap-1"
            >
              <span>See More</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-4">
            {bestSellers.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
