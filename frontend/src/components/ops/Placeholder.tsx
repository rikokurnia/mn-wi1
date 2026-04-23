'use client';

import React from 'react';

export default function PlaceholderPage({ title }: { title: string }) {
  return (
    <div className="p-10 max-w-7xl mx-auto flex flex-col items-center justify-center min-h-[60vh] text-center">
      <div className="h-20 w-20 bg-[#F5F2ED] rounded-full flex items-center justify-center mb-6">
        <div className="h-4 w-4 bg-[#FF4D00] rounded-full animate-ping" />
      </div>
      <h1 className="text-4xl font-black text-[#0A0A0A] tracking-tighter uppercase mb-4">
        {title}<br />UNDER CONSTRUCTION
      </h1>
      <p className="text-[#6B6B6B] font-bold text-xs uppercase tracking-[0.2em]">
        MANDORA LABOR PROTOCOL — SYSTEM CORE UPDATING
      </p>
    </div>
  );
}
