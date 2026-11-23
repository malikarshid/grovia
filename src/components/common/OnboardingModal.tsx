'use client';

import React, { useState } from 'react';
import { Apple, ShoppingCart, Truck, ChevronRight, Check } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';

export const OnboardingModal: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const [step, setStep] = useState(0);
  const { setOnboardingCompleted } = useAuthStore();

  const slides = [
    {
      title: 'Farm Fresh Groceries',
      description:
        'Sourced directly from local verified farmers in India. Crisp vegetables, juicy fruits, and pure dairy delivered at peak freshness.',
      icon: Apple,
      color: 'bg-green-100 text-[#2E7D32]',
    },
    {
      title: 'Smart & Easy Shopping',
      description:
        'Instant search, smart categories, customizable delivery slots, and curated recipe ingredients right at your fingertips.',
      icon: ShoppingCart,
      color: 'bg-orange-100 text-[#FF6F00]',
    },
    {
      title: 'Lightning 2-Hour Delivery',
      description:
        'Select your preferred morning or evening delivery slot with real-time status tracking and doorstep temperature control.',
      icon: Truck,
      color: 'bg-emerald-100 text-[#2E7D32]',
    },
  ];

  const handleFinish = () => {
    setOnboardingCompleted(true);
    onClose();
  };

  const currentSlide = slides[step];
  const IconComponent = currentSlide.icon;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Welcome Onboarding Tour"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
    >
      <div className="w-full max-w-md bg-white dark:bg-slate-900 eye-protection:bg-[#FFFDF9] rounded-3xl p-6 sm:p-8 shadow-2xl border border-gray-100 dark:border-slate-800 eye-protection:border-[#E6DCBE] text-center relative animate-in fade-in zoom-in-95 duration-200">
        {/* Skip button */}
        <button
          onClick={handleFinish}
          className="absolute top-4 right-4 text-xs font-bold text-gray-400 hover:text-gray-700 dark:hover:text-white"
        >
          Skip
        </button>

        {/* Icon Illustration */}
        <div className={`mx-auto w-24 h-24 rounded-3xl flex items-center justify-center mb-6 shadow-inner ${currentSlide.color}`}>
          <IconComponent className="w-12 h-12 stroke-[2.2]" />
        </div>

        {/* Content */}
        <h2 className="text-xl font-black text-gray-900 dark:text-white eye-protection:text-[#3E3B32] mb-3">
          {currentSlide.title}
        </h2>
        <p className="text-sm text-gray-600 dark:text-gray-300 eye-protection:text-[#787262] leading-relaxed mb-8">
          {currentSlide.description}
        </p>

        {/* Indicator dots */}
        <div className="flex items-center justify-center gap-2 mb-8">
          {slides.map((_, idx) => (
            <span
              key={idx}
              className={`h-2 rounded-full transition-all duration-300 ${
                idx === step ? 'w-8 bg-[#2E7D32]' : 'w-2 bg-gray-200 dark:bg-slate-700'
              }`}
            />
          ))}
        </div>

        {/* Controls */}
        {step < slides.length - 1 ? (
          <button
            onClick={() => setStep(step + 1)}
            className="w-full py-3.5 bg-[#2E7D32] hover:bg-[#1B5E20] text-white font-bold rounded-2xl shadow-md transition flex items-center justify-center gap-2 text-sm"
          >
            <span>Next</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        ) : (
          <button
            onClick={handleFinish}
            className="w-full py-3.5 bg-gradient-to-r from-[#2E7D32] to-[#1B5E20] hover:opacity-95 text-white font-bold rounded-2xl shadow-lg shadow-green-900/20 transition flex items-center justify-center gap-2 text-sm"
          >
            <Check className="w-4 h-4" />
            <span>Get Started with GROVIA</span>
          </button>
        )}
      </div>
    </div>
  );
};
