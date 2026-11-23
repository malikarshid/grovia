'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  User,
  Phone,
  Mail,
  Bike,
  Shield,
  KeyRound,
  LogOut,
  Award,
  AlertCircle,
  CheckCircle2,
  Lock,
} from 'lucide-react';

export default function RiderProfilePage() {
  const router = useRouter();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Password Change Modal
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [passwordMsg, setPasswordMsg] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [changing, setChanging] = useState(false);

  useEffect(() => {
    async function loadProfile() {
      try {
        const res = await fetch('/api/rider/profile');
        const data = await res.json();
        if (res.ok) {
          setProfile(data.profile);
        } else {
          const fallbackRes = await fetch('/api/rider/dashboard');
          const fallbackData = await fallbackRes.json();
          if (fallbackRes.ok) setProfile(fallbackData.profile);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    loadProfile();
  }, []);

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError(null);
    setPasswordMsg(null);
    setChanging(true);

    try {
      const res = await fetch('/api/auth/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to change password');

      setPasswordMsg('Password updated successfully!');
      setCurrentPassword('');
      setNewPassword('');
      setTimeout(() => setShowPasswordModal(false), 2000);
    } catch (err: any) {
      setPasswordError(err.message);
    } finally {
      setChanging(false);
    }
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      router.push('/rider/login');
      router.refresh();
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="space-y-4">
      <h1 className="text-lg font-black text-white">Rider Account</h1>

      {/* Main Identity Card */}
      <div className="bg-slate-950 border border-slate-800 rounded-2xl p-5 shadow-xl text-center space-y-3 relative overflow-hidden">
        <div className="w-20 h-20 rounded-full bg-[#2E7D32] flex items-center justify-center text-white text-3xl font-black mx-auto shadow-lg shadow-emerald-950">
          R
        </div>

        <div>
          <h2 className="text-base font-bold text-white">{profile?.name || 'Ramesh Kumar'}</h2>
          <span className="text-xs text-[#4CAF50] font-mono">ID: {profile?.userId ? 'rider_me' : 'rider_me'}</span>
        </div>

        <div className="flex items-center justify-center gap-2 pt-1">
          <span className="px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-xs font-bold">
            Verified Partner
          </span>
          <span className="px-3 py-1 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/30 text-xs font-bold">
            4.9 ★ Rating
          </span>
        </div>
      </div>

      {/* Vehicle & Compliance Credentials */}
      <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 space-y-3">
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
          <Bike className="w-4 h-4 text-emerald-400" />
          <span>Vehicle & License</span>
        </h3>

        <div className="space-y-2 text-xs">
          <div className="flex justify-between p-2 rounded-xl bg-slate-900">
            <span className="text-slate-400">Vehicle Type</span>
            <span className="font-bold text-white">Electric Two-Wheeler (EV)</span>
          </div>
          <div className="flex justify-between p-2 rounded-xl bg-slate-900">
            <span className="text-slate-400">Registration Number</span>
            <span className="font-bold text-white font-mono">DL 04 AB 9682</span>
          </div>
          <div className="flex justify-between p-2 rounded-xl bg-slate-900">
            <span className="text-slate-400">Commercial License</span>
            <span className="font-bold text-white font-mono">DL-042024009682</span>
          </div>
          <div className="flex justify-between p-2 rounded-xl bg-slate-900">
            <span className="text-slate-400">Assigned Hub</span>
            <span className="font-bold text-white">Connaught Place QuickHub</span>
          </div>
        </div>
      </div>

      {/* Contact Details */}
      <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 space-y-2.5">
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
          Contact Information
        </h3>
        <div className="space-y-2 text-xs">
          <div className="flex items-center gap-2.5 text-slate-300">
            <Phone className="w-4 h-4 text-slate-500" />
            <span>+91 98765 43210</span>
          </div>
          <div className="flex items-center gap-2.5 text-slate-300">
            <Mail className="w-4 h-4 text-slate-500" />
            <span>rider@grovia.in</span>
          </div>
        </div>
      </div>

      {/* Security Actions */}
      <div className="space-y-2">
        <button
          onClick={() => setShowPasswordModal(true)}
          className="w-full py-3 px-4 rounded-xl bg-slate-950 border border-slate-800 hover:border-slate-700 text-white font-bold text-xs flex items-center justify-between transition shadow"
        >
          <div className="flex items-center gap-2">
            <KeyRound className="w-4 h-4 text-[#4CAF50]" />
            <span>Change Security Password</span>
          </div>
          <span className="text-[10px] text-slate-400">Update PIN</span>
        </button>

        <button
          onClick={handleLogout}
          className="w-full py-3 px-4 rounded-xl bg-red-950/40 border border-red-800/60 hover:bg-red-900/50 text-red-300 font-bold text-xs flex items-center justify-center gap-2 transition shadow"
        >
          <LogOut className="w-4 h-4" />
          <span>Sign Out of Rider Account</span>
        </button>
      </div>

      {/* Change Password Modal */}
      {showPasswordModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-sm bg-slate-950 border border-slate-800 rounded-2xl p-6 shadow-2xl space-y-4">
            <div className="text-center space-y-1">
              <Lock className="w-8 h-8 text-[#4CAF50] mx-auto" />
              <h3 className="text-base font-bold text-white">Update Rider Password</h3>
              <p className="text-xs text-slate-400">
                Replace your default initial password with a personal secure PIN.
              </p>
            </div>

            {passwordError && (
              <div className="p-2.5 bg-red-950/80 border border-red-800 rounded-xl text-red-300 text-xs">
                {passwordError}
              </div>
            )}

            {passwordMsg && (
              <div className="p-2.5 bg-emerald-950/80 border border-emerald-800 rounded-xl text-emerald-300 text-xs">
                {passwordMsg}
              </div>
            )}

            <form onSubmit={handleChangePassword} className="space-y-3">
              <div>
                <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                  Current Password
                </label>
                <input
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="Enter current password"
                  required
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#4CAF50]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                  New Password (min 8 chars)
                </label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Enter new strong password"
                  required
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#4CAF50]"
                />
              </div>

              <div className="grid grid-cols-2 gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowPasswordModal(false)}
                  className="py-2.5 px-3 rounded-xl bg-slate-800 text-slate-300 font-bold text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={changing}
                  className="py-2.5 px-3 rounded-xl bg-[#2E7D32] hover:bg-[#1B5E20] text-white font-bold text-xs transition disabled:opacity-50"
                >
                  {changing ? 'Saving...' : 'Save Password'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
