'use client';

import React, { useState, useEffect } from 'react';
import {
  MapPin,
  Crosshair,
  Search,
  CheckCircle2,
  AlertCircle,
  Truck,
  Zap,
  Clock,
  X,
  Building2,
} from 'lucide-react';

interface LocationModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentPincode: string;
  currentCity: string;
  deliveryMode: string;
  onLocationSelected: (location: { pincode: string; city: string; deliveryMode: string; timeText: string }) => void;
}

export const LocationModal: React.FC<LocationModalProps> = ({
  isOpen,
  onClose,
  currentPincode,
  currentCity,
  deliveryMode,
  onLocationSelected,
}) => {
  const [pincodeInput, setPincodeInput] = useState(currentPincode);
  const [detecting, setDetecting] = useState(false);
  const [checking, setChecking] = useState(false);
  const [serviceResult, setServiceResult] = useState<any>(null);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (isOpen) {
      setPincodeInput(currentPincode);
      setErrorMsg('');
    }
  }, [isOpen, currentPincode]);

  if (!isOpen) return null;

  const popularHubs = [
    { city: 'Bengaluru', area: 'Indiranagar', pincode: '560038', mode: 'QUICK_LOCAL', time: '15 MINS' },
    { city: 'Bengaluru', area: 'Koramangala', pincode: '560034', mode: 'QUICK_LOCAL', time: '15 MINS' },
    { city: 'Mumbai', area: 'Andheri West', pincode: '400053', mode: 'QUICK_LOCAL', time: '18 MINS' },
    { city: 'Gurugram', area: 'DLF Cyber City', pincode: '122002', mode: 'QUICK_LOCAL', time: '18 MINS' },
    { city: 'Hyderabad', area: 'HITEC City', pincode: '500081', mode: 'QUICK_LOCAL', time: '15 MINS' },
    { city: 'Pune', area: 'Shivaji Nagar', pincode: '411001', mode: 'NATIONWIDE', time: '2 DAYS' },
  ];

  const handleCheckPincode = async (codeToCheck?: string) => {
    const pin = (codeToCheck || pincodeInput).trim();
    if (!pin || pin.length !== 6 || !/^\d{6}$/.test(pin)) {
      setErrorMsg('Please enter a valid 6-digit Indian PIN code');
      return;
    }

    setChecking(true);
    setErrorMsg('');
    try {
      const res = await fetch(`/api/location/serviceability?pincode=${pin}`);
      const data = await res.json();

      if (!res.ok || !data.isServiceable) {
        setErrorMsg(data.error || 'PIN code is currently outside our delivery network.');
        setServiceResult(null);
      } else {
        setServiceResult(data);
        if (codeToCheck) {
          applyLocation(data);
        }
      }
    } catch (err) {
      setErrorMsg('Unable to verify PIN code serviceability. Please try again.');
    } finally {
      setChecking(false);
    }
  };

  const handleAutoDetect = () => {
    if (!navigator.geolocation) {
      setErrorMsg('Geolocation is not supported by your browser.');
      return;
    }

    setDetecting(true);
    setErrorMsg('');
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;
        try {
          const res = await fetch(`/api/location/serviceability?lat=${latitude}&lng=${longitude}`);
          const data = await res.json();
          if (data.isServiceable) {
            setServiceResult(data);
            setPincodeInput(data.pincode);
          } else {
            setErrorMsg('We are expanding to your exact GPS zone soon! You can still enter your 6-digit PIN code.');
          }
        } catch (e) {
          setErrorMsg('Failed to resolve GPS coordinates. Please enter PIN code manually.');
        } finally {
          setDetecting(false);
        }
      },
      (err) => {
        setDetecting(false);
        setErrorMsg('Location permission was denied. Please enter your 6-digit PIN code.');
      },
      { timeout: 10000 }
    );
  };

  const applyLocation = async (resultToApply = serviceResult) => {
    if (!resultToApply) return;

    try {
      await fetch('/api/location/preference', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pincode: resultToApply.pincode,
          city: resultToApply.city,
          state: resultToApply.state,
        }),
      });
    } catch (e) {
      // Ignore background save errors
    }

    onLocationSelected({
      pincode: resultToApply.pincode,
      city: resultToApply.city,
      deliveryMode: resultToApply.deliveryMode,
      timeText: resultToApply.deliveryTimeText || (resultToApply.deliveryMode === 'QUICK_LOCAL' ? '15 MINS' : '2-4 DAYS'),
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 eye-protection:bg-[#FFFDF9] rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-gray-100 dark:border-slate-800 eye-protection:border-[#E8DFCA] relative">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 rounded-full hover:bg-gray-100 dark:hover:bg-slate-800 transition"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 rounded-full bg-green-100 dark:bg-green-950/50 flex items-center justify-center text-[#2E7D32]">
            <MapPin className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">
              Select Delivery Location
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Check 15-min dark store & nationwide shipping availability
            </p>
          </div>
        </div>

        {/* Auto Detect Button */}
        <button
          type="button"
          onClick={handleAutoDetect}
          disabled={detecting}
          className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl border border-dashed border-[#2E7D32] dark:border-[#4CAF50] text-[#2E7D32] dark:text-[#4CAF50] hover:bg-green-50 dark:hover:bg-green-950/20 font-semibold text-sm transition disabled:opacity-50 mb-4"
        >
          <Crosshair className={`w-4 h-4 ${detecting ? 'animate-spin' : ''}`} />
          <span>{detecting ? 'Detecting your GPS location...' : 'Use My Current Location (GPS)'}</span>
        </button>

        {/* PIN Code Search Form */}
        <div className="flex gap-2 mb-3">
          <div className="relative flex-1">
            <input
              type="text"
              maxLength={6}
              value={pincodeInput}
              onChange={(e) => {
                setPincodeInput(e.target.value.replace(/\D/g, ''));
                setServiceResult(null);
                setErrorMsg('');
              }}
              placeholder="Enter 6-digit PIN code (e.g. 560038)"
              className="w-full pl-9 pr-3 py-2 text-sm rounded-xl border border-gray-300 dark:border-slate-700 bg-gray-50 dark:bg-slate-800 focus:bg-white dark:focus:bg-slate-900 focus:border-[#2E7D32] outline-none transition"
            />
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
          </div>
          <button
            type="button"
            onClick={() => handleCheckPincode()}
            disabled={checking || pincodeInput.length !== 6}
            className="px-4 py-2 bg-[#2E7D32] hover:bg-[#1B5E20] text-white text-sm font-semibold rounded-xl transition disabled:opacity-50"
          >
            {checking ? 'Checking...' : 'Check'}
          </button>
        </div>

        {/* Error Message */}
        {errorMsg && (
          <div className="flex items-center gap-2 text-xs text-red-600 bg-red-50 dark:bg-red-950/30 p-2.5 rounded-lg mb-3">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Serviceability Result Card */}
        {serviceResult && (
          <div className="p-4 rounded-xl bg-gray-50 dark:bg-slate-800/60 eye-protection:bg-[#F5EEDC] border border-gray-200 dark:border-slate-700 mb-4 animate-in fade-in">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                {serviceResult.city}, {serviceResult.state} ({serviceResult.pincode})
              </span>
              <span
                className={`text-xs font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1 ${
                  serviceResult.deliveryMode === 'QUICK_LOCAL'
                    ? 'bg-green-100 text-[#2E7D32] dark:bg-green-900/40 dark:text-green-300'
                    : 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300'
                }`}
              >
                {serviceResult.deliveryMode === 'QUICK_LOCAL' ? (
                  <>
                    <Zap className="w-3 h-3 fill-current" />
                    <span>{serviceResult.deliveryTimeText} EXPRESS</span>
                  </>
                ) : (
                  <>
                    <Truck className="w-3 h-3" />
                    <span>{serviceResult.deliveryTimeText} COURIER</span>
                  </>
                )}
              </span>
            </div>

            {serviceResult.fulfilmentCentre && (
              <p className="text-xs text-gray-600 dark:text-gray-300 mb-2 flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5 text-gray-400" />
                <span>Fulfilled by: <strong>{serviceResult.fulfilmentCentre.name}</strong></span>
              </p>
            )}

            <div className="flex flex-wrap gap-1.5 mb-3">
              {serviceResult.badges?.map((badge: string, i: number) => (
                <span
                  key={i}
                  className="text-[10px] bg-white dark:bg-slate-700 eye-protection:bg-white text-gray-700 dark:text-gray-300 px-2 py-0.5 rounded-md border border-gray-200 dark:border-slate-600 font-medium"
                >
                  {badge}
                </span>
              ))}
            </div>

            <button
              type="button"
              onClick={() => applyLocation()}
              className="w-full py-2 bg-[#2E7D32] hover:bg-[#1B5E20] text-white text-xs font-bold rounded-lg transition shadow flex items-center justify-center gap-1.5"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Deliver to This Location</span>
            </button>
          </div>
        )}

        {/* Popular Metro Hubs */}
        <div>
          <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-2">
            Popular Metro Delivery Locations:
          </p>
          <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto pr-1">
            {popularHubs.map((hub) => (
              <button
                key={hub.pincode}
                type="button"
                onClick={() => {
                  setPincodeInput(hub.pincode);
                  handleCheckPincode(hub.pincode);
                }}
                className={`text-left p-2 rounded-lg border text-xs transition flex flex-col justify-between ${
                  currentPincode === hub.pincode
                    ? 'border-[#2E7D32] bg-green-50/50 dark:bg-green-950/20'
                    : 'border-gray-200 dark:border-slate-800 hover:border-[#2E7D32]/50'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-gray-800 dark:text-gray-200 truncate">
                    {hub.area}
                  </span>
                  <span className="text-[10px] text-gray-400 font-mono">{hub.pincode}</span>
                </div>
                <div className="flex items-center gap-1 mt-1 text-[10px] text-[#2E7D32] dark:text-[#4CAF50] font-bold">
                  {hub.mode === 'QUICK_LOCAL' ? <Zap className="w-3 h-3 fill-current" /> : <Clock className="w-3 h-3" />}
                  <span>{hub.time}</span>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
