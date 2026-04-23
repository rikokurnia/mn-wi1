'use client';

import React from 'react';

export default function WorkerPlaceholder({ title, icon: Icon }: { title: string, icon: any }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] p-10 text-center space-y-8">
      <div className="relative">
        <div className="h-24 w-24 bg-[#1A1A1A] rounded-[32px] flex items-center justify-center border border-white/5">
          <Icon className="h-10 w-10 text-[#FF4D00]" />
        </div>
        <div className="absolute -top-2 -right-2 h-6 w-6 bg-[#FF4D00] rounded-full border-4 border-[#0A0A0A] animate-pulse" />
      </div>
      
      <div className="space-y-2">
        <h1 className="text-4xl font-black text-white uppercase tracking-tighter leading-none">
          {title}
        </h1>
        <p className="text-[10px] font-black text-[#6B6B6B] uppercase tracking-[0.3em]">
          Mandora Worker Protocol — v0.1.0
        </p>
      </div>

      <div className="max-w-xs bg-white/5 p-6 rounded-[32px] border border-white/5">
        <p className="text-xs font-bold text-[#6B6B6B] leading-relaxed">
          The {title} engine is currently being synced with the Solana mainnet-beta cluster. 
          Expect full activation by the hackathon submission.
        </p>
      </div>
    </div>
  );
}
