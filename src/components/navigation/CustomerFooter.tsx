import React from 'react';
import Link from 'next/link';
import { BrandLogo } from '@/components/common/BrandLogo';
import { ShieldCheck, Truck, RotateCcw, Clock, Phone, Mail, MapPin } from 'lucide-react';

export const CustomerFooter: React.FC = () => {
  return (
    <footer className="bg-white dark:bg-slate-950 eye-protection:bg-[#F3ECD9] border-t border-gray-200 dark:border-slate-800 eye-protection:border-[#E2D7BE] text-gray-600 dark:text-gray-300 eye-protection:text-[#3E3B32] transition-colors pb-16 md:pb-0">
      {/* Trust Badges */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 border-b border-gray-200 dark:border-slate-800 eye-protection:border-[#E2D7BE]">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-green-50 dark:bg-slate-800 rounded-xl text-[#2E7D32]">
              <Truck className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-bold text-sm text-gray-900 dark:text-white eye-protection:text-[#3E3B32]">
                Instant 2-Hr Delivery
              </h4>
              <p className="text-xs text-gray-500 dark:text-gray-400">Guaranteed delivery slots</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="p-3 bg-green-50 dark:bg-slate-800 rounded-xl text-[#2E7D32]">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-bold text-sm text-gray-900 dark:text-white eye-protection:text-[#3E3B32]">
                100% Quality Checked
              </h4>
              <p className="text-xs text-gray-500 dark:text-gray-400">Hand-picked farm harvest</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="p-3 bg-green-50 dark:bg-slate-800 rounded-xl text-[#2E7D32]">
              <RotateCcw className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-bold text-sm text-gray-900 dark:text-white eye-protection:text-[#3E3B32]">
                Doorstep Return Policy
              </h4>
              <p className="text-xs text-gray-500 dark:text-gray-400">No questions asked refunds</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="p-3 bg-green-50 dark:bg-slate-800 rounded-xl text-[#2E7D32]">
              <Clock className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-bold text-sm text-gray-900 dark:text-white eye-protection:text-[#3E3B32]">
                6 AM - 11 PM Support
              </h4>
              <p className="text-xs text-gray-500 dark:text-gray-400">Dedicated helpline in India</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Links */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-8">
          <div className="md:col-span-2 space-y-4">
            <BrandLogo size="lg" showTagline={true} />
            <p className="text-sm text-gray-500 dark:text-gray-400 max-w-sm leading-relaxed">
              GROVIA is India&apos;s smarter grocery shopping platform. Connecting local farmers, fresh produce, and quality brands directly to your kitchen.
            </p>
            <div className="text-xs space-y-1.5 pt-2">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-[#2E7D32]" />
                <span>100 Feet Road, Indiranagar, Bengaluru 560038</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-[#2E7D32]" />
                <span>+91 80 4965 2000 (Mon - Sun, 6 AM to 11 PM)</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-[#2E7D32]" />
                <span>support@grovia.in</span>
              </div>
            </div>
          </div>

          <div>
            <h5 className="font-bold text-sm text-gray-900 dark:text-white eye-protection:text-[#3E3B32] mb-3">
              Top Categories
            </h5>
            <ul className="space-y-2 text-xs">
              <li><Link href="/products?category=fresh-fruits" className="hover:text-[#2E7D32]">Fresh Fruits</Link></li>
              <li><Link href="/products?category=fresh-vegetables" className="hover:text-[#2E7D32]">Organic Vegetables</Link></li>
              <li><Link href="/products?category=dairy-eggs" className="hover:text-[#2E7D32]">Dairy & Farm Eggs</Link></li>
              <li><Link href="/products?category=bakery-breads" className="hover:text-[#2E7D32]">Bakery & Sourdough</Link></li>
              <li><Link href="/products?category=rice-grains-pulses" className="hover:text-[#2E7D32]">Rice, Atta & Pulses</Link></li>
            </ul>
          </div>

          <div>
            <h5 className="font-bold text-sm text-gray-900 dark:text-white eye-protection:text-[#3E3B32] mb-3">
              Customer Care
            </h5>
            <ul className="space-y-2 text-xs">
              <li><Link href="/orders" className="hover:text-[#2E7D32]">Track Your Order</Link></li>
              <li><Link href="/profile" className="hover:text-[#2E7D32]">Manage Addresses</Link></li>
              <li><Link href="/cart" className="hover:text-[#2E7D32]">Shopping Cart</Link></li>
              <li><Link href="/favorites" className="hover:text-[#2E7D32]">Saved Favourites</Link></li>
              <li><Link href="/terms" className="hover:text-[#2E7D32]">Terms & Conditions</Link></li>
            </ul>
          </div>

          <div>
            <h5 className="font-bold text-sm text-gray-900 dark:text-white eye-protection:text-[#3E3B32] mb-3">
              Safe Payments
            </h5>
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-3 leading-relaxed">
              We support UPI (GPay, PhonePe, Paytm), All Major Debit/Credit Cards, NetBanking, and Cash on Delivery.
            </p>
            <div className="flex flex-wrap gap-2 text-[10px] font-bold text-gray-700 dark:text-gray-300">
              <span className="px-2 py-1 bg-gray-100 dark:bg-slate-800 rounded">UPI</span>
              <span className="px-2 py-1 bg-gray-100 dark:bg-slate-800 rounded">RuPay</span>
              <span className="px-2 py-1 bg-gray-100 dark:bg-slate-800 rounded">Visa</span>
              <span className="px-2 py-1 bg-gray-100 dark:bg-slate-800 rounded">Mastercard</span>
              <span className="px-2 py-1 bg-gray-100 dark:bg-slate-800 rounded">COD</span>
            </div>
          </div>
        </div>
      </div>

      <div className="border-t border-gray-100 dark:border-slate-800 eye-protection:border-[#E2D7BE] py-4 text-center text-xs text-gray-400">
        <p>© 2026 GROVIA Technologies Pvt Ltd. All rights reserved. Fresh Living. Smarter Shopping.</p>
      </div>
    </footer>
  );
};
