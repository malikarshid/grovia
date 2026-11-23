'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function RiderRootPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/rider/dashboard');
  }, [router]);

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-slate-400 space-y-3">
      <div className="w-8 h-8 border-2 border-[#4CAF50] border-t-transparent rounded-full animate-spin" />
      <p className="text-xs">Directing to GROVIA Rider Portal...</p>
    </div>
  );
}
