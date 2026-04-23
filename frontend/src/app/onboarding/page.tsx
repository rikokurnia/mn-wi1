'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useWallet } from '@solana/wallet-adapter-react';
import { 
  Briefcase, 
  User, 
  ArrowRight, 
  ShieldCheck,
  MapPin
} from 'lucide-react';

export default function RoleSelectionPage() {
  const { connected } = useWallet();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Redirect to login if wallet is not connected
  useEffect(() => {
    if (mounted && !connected) {
      router.push('/login');
    }
  }, [mounted, connected, router]);

  if (!mounted || !connected) return null;

  return (
    <div className="min-h-screen bg-[#E8E4DE] p-6 flex flex-col items-center justify-center relative overflow-hidden">
      {/* Dot pattern overlay */}
      <div 
        className="fixed inset-0 pointer-events-none z-0" 
        style={{ 
          backgroundImage: 'radial-gradient(circle, #C8C4BE 1px, transparent 1px)',
          backgroundSize: '20px 20px',
          opacity: 0.5
        }} 
      />

      <div className="max-w-4xl w-full relative z-10 space-y-12">
        <div className="text-center space-y-4">
          <div className="h-16 w-16 bg-[#FF4D00] rounded-2xl mx-auto flex items-center justify-center shadow-lg shadow-orange-200">
            <span className="text-white font-black text-2xl">M</span>
          </div>
          <h1 className="text-5xl font-black text-[#0A0A0A] tracking-tighter uppercase leading-none">
            Choose Your<br />Network Role
          </h1>
          <p className="text-[#6B6B6B] font-bold text-sm uppercase tracking-widest">
            SELECT HOW YOU WANT TO INTERACT WITH MANDORA
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Agency Role */}
          <button 
            onClick={() => router.push('/dashboard')}
            className="group bg-white border-4 border-[#D4D0CA] p-10 rounded-[48px] text-left transition-all hover:border-[#FF4D00] hover:-translate-y-2 shadow-2xl shadow-black/5"
          >
            <div className="h-16 w-16 bg-[#F5F2ED] rounded-2xl flex items-center justify-center mb-8 group-hover:bg-orange-50 transition-colors">
              <Briefcase className="h-8 w-8 text-[#0A0A0A] group-hover:text-[#FF4D00] transition-colors" />
            </div>
            <h3 className="text-3xl font-black text-[#0A0A0A] uppercase tracking-tighter mb-4">Agency</h3>
            <p className="text-[#6B6B6B] font-bold text-sm leading-relaxed mb-10">
              POST JOBS, SET GEOFENCES, AND MANAGE DECENTRALIZED LABOR FLOWS.
            </p>
            <div className="flex items-center gap-2 text-[#FF4D00] font-black text-xs uppercase tracking-widest">
              Enter Ops Console
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </div>
          </button>

          {/* Worker Role */}
          <button 
            onClick={() => router.push('/explore')}
            className="group bg-[#0A0A0A] border-4 border-[#D4D0CA] p-10 rounded-[48px] text-left transition-all hover:border-[#FF4D00] hover:-translate-y-2 shadow-2xl"
          >
            <div className="h-16 w-16 bg-[#1A1A1A] rounded-2xl flex items-center justify-center mb-8 group-hover:bg-[#FF4D00]/20 transition-colors">
              <User className="h-8 w-8 text-white group-hover:text-[#FF4D00] transition-colors" />
            </div>
            <h3 className="text-3xl font-black text-white uppercase tracking-tighter mb-4">Worker</h3>
            <p className="text-[#6B6B6B] font-bold text-sm leading-relaxed mb-10">
              EXPLORE NEARBY TASKS, PROVIDE PROOF, AND EARN IDRX INSTANTLY.
            </p>
            <div className="flex items-center gap-2 text-[#FF4D00] font-black text-xs uppercase tracking-widest">
              Find Nearby Jobs
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </div>
          </button>
        </div>

        <div className="flex items-center justify-center gap-12 pt-8 border-t border-[#D4D0CA]">
          <div className="flex items-center gap-2 opacity-50">
            <ShieldCheck className="h-4 w-4 text-[#0A0A0A]" />
            <span className="text-[10px] font-black text-[#0A0A0A] uppercase tracking-widest">Secured by Solana</span>
          </div>
          <div className="flex items-center gap-2 opacity-50">
            <MapPin className="h-4 w-4 text-[#0A0A0A]" />
            <span className="text-[10px] font-black text-[#0A0A0A] uppercase tracking-widest">Geofence Verified</span>
          </div>
        </div>
      </div>
    </div>
  );
}
