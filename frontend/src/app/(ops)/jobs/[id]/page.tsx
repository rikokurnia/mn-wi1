'use client';

import React from 'react';
import { useRouter, useParams } from 'next/navigation';
import dynamic from 'next/dynamic';
import { 
  ArrowLeft, 
  Users, 
  Target, 
  Zap, 
  MapPin, 
  Clock, 
  ShieldCheck,
  TrendingUp,
  MoreVertical
} from 'lucide-react';

// Reusing the map picker in a read-only mode or just a display map
const JobMapPicker = dynamic(() => import('@/components/ops/JobMapPicker'), { 
  ssr: false,
  loading: () => <div className="h-[300px] w-full bg-[#F5F2ED] animate-pulse rounded-[32px]" />
});

export default function JobDetailPage() {
  const router = useRouter();
  const params = useParams();

  return (
    <div className="p-8 space-y-8 pb-20">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-6">
          <button onClick={() => router.back()} className="h-12 w-12 bg-white border-2 border-[#D4D0CA] rounded-2xl flex items-center justify-center hover:border-[#FF4D00] transition-colors">
            <ArrowLeft className="h-6 w-6 text-[#0A0A0A]" />
          </button>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[10px] font-black text-[#FF4D00] uppercase tracking-[0.3em]">ACTIVE TASK</span>
              <div className="h-1.5 w-1.5 bg-green-500 rounded-full animate-pulse" />
            </div>
            <h1 className="text-4xl font-black text-[#0A0A0A] tracking-tighter uppercase leading-none">
              AC Maintenance - Kuningan
            </h1>
          </div>
        </div>
        <button className="h-12 w-12 bg-white border-2 border-[#D4D0CA] rounded-2xl flex items-center justify-center hover:bg-[#0A0A0A] hover:text-white transition-all">
          <MoreVertical className="h-6 w-6" />
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Stats & Map */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Main Map Visualization */}
          <div className="relative group">
            <div className="absolute top-6 left-6 z-20 space-y-2">
              <div className="bg-[#0A0A0A] text-white px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-2 shadow-xl">
                <MapPin className="h-3 w-3 text-[#FF4D00]" />
                Geofence: 50m Radius
              </div>
            </div>
            <JobMapPicker 
              center={[-6.2297, 106.8166]} 
              radius={50} 
              onLocationChange={() => {}} 
            />
          </div>

          {/* Detailed Stats Grid */}
          <div className="grid grid-cols-3 gap-6">
            <div className="bg-white border-2 border-[#D4D0CA] p-8 rounded-[40px] space-y-2 hover:border-[#FF4D00] transition-colors cursor-default">
              <p className="text-[10px] font-black text-[#6B6B6B] uppercase tracking-widest">WORKERS ACTIVE</p>
              <div className="flex items-baseline gap-2">
                <p className="text-3xl font-black text-[#0A0A0A]">12</p>
                <Users className="h-5 w-5 text-[#FF4D00]" />
              </div>
            </div>
            <div className="bg-white border-2 border-[#D4D0CA] p-8 rounded-[40px] space-y-2 hover:border-[#FF4D00] transition-colors cursor-default">
              <p className="text-[10px] font-black text-[#6B6B6B] uppercase tracking-widest">SUCCESS RATE</p>
              <div className="flex items-baseline gap-2">
                <p className="text-3xl font-black text-[#0A0A0A]">94%</p>
                <TrendingUp className="h-5 w-5 text-green-500" />
              </div>
            </div>
            <div className="bg-white border-2 border-[#D4D0CA] p-8 rounded-[40px] space-y-2 hover:border-[#FF4D00] transition-colors cursor-default">
              <p className="text-[10px] font-black text-[#6B6B6B] uppercase tracking-widest">BUDGET USED</p>
              <div className="flex items-baseline gap-2">
                <p className="text-3xl font-black text-[#0A0A0A]">68%</p>
                <Zap className="h-5 w-5 text-amber-500" />
              </div>
            </div>
          </div>

          {/* Activity Logs */}
          <div className="bg-[#0A0A0A] p-10 rounded-[48px] text-white">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-sm font-black uppercase tracking-[0.2em]">Live Activity Feed</h3>
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse" />
                <span className="text-[9px] font-black uppercase tracking-widest text-[#6B6B6B]">Syncing with Solana</span>
              </div>
            </div>
            <div className="space-y-6">
              {[
                { type: 'Verification', user: 'Riko K.', status: 'Accepted', time: '10m ago', reward: '150k' },
                { type: 'Attempt', user: 'Alex S.', status: 'Out of Bounds', time: '14m ago', reward: '0' },
                { type: 'Verification', user: 'Maya T.', status: 'Accepted', time: '1h ago', reward: '150k' },
              ].map((log, i) => (
                <div key={i} className="flex items-center justify-between border-b border-white/10 pb-6 last:border-0 last:pb-0">
                  <div className="flex items-center gap-4">
                    <div className="h-10 w-10 bg-white/5 rounded-xl flex items-center justify-center text-[#FF4D00]">
                      <Zap className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-xs font-black uppercase tracking-tight">{log.user} — {log.type}</p>
                      <p className="text-[10px] font-bold text-[#6B6B6B] mt-1">{log.time}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`text-xs font-black uppercase tracking-widest ${log.status === 'Accepted' ? 'text-[#FF4D00]' : 'text-red-500'}`}>
                      {log.status}
                    </p>
                    <p className="text-[10px] font-bold text-[#6B6B6B] mt-1">Rp {log.reward}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Settings & Actions */}
        <div className="space-y-8">
          <div className="bg-white border-2 border-[#D4D0CA] p-8 rounded-[40px] space-y-8">
            <div className="space-y-4">
              <p className="text-[10px] font-black text-[#6B6B6B] uppercase tracking-widest">JOB CONFIGURATION</p>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[#6B6B6B]">Base Reward</span>
                  <span className="text-sm font-black text-[#0A0A0A]">Rp 150.000</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[#6B6B6B]">Verification Radius</span>
                  <span className="text-sm font-black text-[#0A0A0A]">50 Meters</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[#6B6B6B]">Proof Required</span>
                  <span className="text-sm font-black text-[#0A0A0A]">GPS + Photo</span>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t-2 border-[#F5F2ED] space-y-4">
              <button className="w-full py-5 bg-[#FF4D00] text-white rounded-full font-black text-sm uppercase tracking-[0.2em] shadow-xl shadow-orange-200 hover:-translate-y-1 transition-all">
                Edit Parameters
              </button>
              <button className="w-full py-5 border-2 border-[#D4D0CA] text-red-500 rounded-full font-black text-sm uppercase tracking-[0.2em] hover:bg-red-50 hover:border-red-200 transition-all">
                Terminate Job
              </button>
            </div>
          </div>

          <div className="bg-[#FF4D00] p-8 rounded-[40px] text-white space-y-4">
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-5 w-5" />
              <p className="text-[10px] font-black uppercase tracking-widest">Escrow Protection</p>
            </div>
            <p className="text-xs font-bold leading-relaxed opacity-90">
              This job is currently funded with 1.5M IDRX. Payouts are automatically managed by the Mandora Trust Protocol.
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}
