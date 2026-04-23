'use client';

import React, { useState } from 'react';
import dynamic from 'next/dynamic';
import { 
  ArrowLeft, 
  MapPin, 
  Info, 
  DollarSign, 
  Target,
  Rocket
} from 'lucide-react';
import Link from 'next/link';

// Dynamically import map to avoid SSR window error
const JobMapPicker = dynamic(() => import('@/components/ops/JobMapPicker'), { 
  ssr: false,
  loading: () => <div className="h-[400px] w-full bg-[#F5F2ED] animate-pulse rounded-[32px] border-4 border-white flex items-center justify-center">
    <span className="text-[10px] font-black text-[#6B6B6B] uppercase tracking-[0.2em]">Loading Engine...</span>
  </div>
});

export default function NewJobPage() {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    reward: '',
    lat: -6.2297, // Default to Sudirman, Jakarta
    lng: 106.8166,
    radius: 100
  });

  const handleLocationChange = (lat: number, lng: number) => {
    setFormData(prev => ({ ...prev, lat, lng }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Deploying Job:', formData);
    // Logic for smart contract call would go here
  };

  return (
    <div className="p-10 max-w-5xl mx-auto space-y-10">
      <div className="flex items-center gap-6">
        <Link href="/dashboard" className="h-12 w-12 bg-white border-2 border-[#D4D0CA] rounded-2xl flex items-center justify-center hover:border-[#0A0A0A] transition-all">
          <ArrowLeft className="h-5 w-5 text-[#0A0A0A]" />
        </Link>
        <div>
          <h1 className="text-4xl font-black text-[#0A0A0A] tracking-tighter uppercase leading-none">
            Launch New Task
          </h1>
          <p className="text-[#6B6B6B] font-bold text-xs mt-2 uppercase tracking-wider">
            DECREE A NEW LABOR REQUIREMENT TO THE NETWORK
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Left Side: Form Fields */}
        <div className="space-y-8">
          <section className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-[#6B6B6B] uppercase tracking-widest ml-4">TASK TITLE</label>
              <input 
                type="text" 
                placeholder="e.g. AC Maintenance - Kuningan Office"
                className="w-full bg-white border-2 border-[#D4D0CA] p-5 rounded-[24px] font-bold text-[#0A0A0A] outline-none focus:border-[#FF4D00] transition-all"
                value={formData.title}
                onChange={(e) => setFormData({...formData, title: e.target.value})}
              />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-[#6B6B6B] uppercase tracking-widest ml-4">DESCRIPTION</label>
              <textarea 
                placeholder="Detailed instructions for the worker..."
                rows={4}
                className="w-full bg-white border-2 border-[#D4D0CA] p-5 rounded-[24px] font-bold text-[#0A0A0A] outline-none focus:border-[#FF4D00] transition-all resize-none"
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-[#6B6B6B] uppercase tracking-widest ml-4">REWARD (IDRX)</label>
                <div className="relative">
                  <input 
                    type="number" 
                    placeholder="150000"
                    className="w-full bg-white border-2 border-[#D4D0CA] p-5 pl-12 rounded-[24px] font-bold text-[#0A0A0A] outline-none focus:border-[#FF4D00] transition-all"
                    value={formData.reward}
                    onChange={(e) => setFormData({...formData, reward: e.target.value})}
                  />
                  <DollarSign className="absolute left-5 top-1/2 -translate-y-1/2 h-5 w-5 text-[#6B6B6B]" />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-[#6B6B6B] uppercase tracking-widest ml-4">RADIUS (METERS)</label>
                <div className="relative">
                  <input 
                    type="number" 
                    className="w-full bg-white border-2 border-[#D4D0CA] p-5 pl-12 rounded-[24px] font-bold text-[#0A0A0A] outline-none focus:border-[#FF4D00] transition-all"
                    value={formData.radius}
                    onChange={(e) => setFormData({...formData, radius: parseInt(e.target.value) || 0})}
                  />
                  <Target className="absolute left-5 top-1/2 -translate-y-1/2 h-5 w-5 text-[#6B6B6B]" />
                </div>
              </div>
            </div>
          </section>

          <div className="bg-[#F5F2ED] border-2 border-dashed border-[#D4D0CA] p-8 rounded-[32px] space-y-4">
            <div className="flex items-start gap-4">
              <div className="p-2 bg-white rounded-xl">
                <Info className="h-5 w-5 text-[#FF4D00]" />
              </div>
              <div>
                <p className="text-xs font-black text-[#0A0A0A] uppercase tracking-tight">Trust Protocol Active</p>
                <p className="text-[11px] font-bold text-[#6B6B6B] mt-1 leading-relaxed">
                  Payments are locked in escrow. Funds release automatically ONLY when the worker provides a valid GPS + Photo proof within your defined geofence.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: Map Picker */}
        <div className="space-y-8">
          <div className="space-y-2">
            <label className="text-[10px] font-black text-[#6B6B6B] uppercase tracking-widest ml-4">GEOFENCE LOCATION</label>
            <div className="relative group">
              <JobMapPicker 
                center={[formData.lat, formData.lng]} 
                radius={formData.radius}
                onLocationChange={handleLocationChange} 
              />
              <div className="absolute top-6 left-6 z-[400] bg-white px-4 py-2 rounded-full shadow-lg border border-[#D4D0CA] flex items-center gap-2 pointer-events-none">
                 <MapPin className="h-4 w-4 text-[#FF4D00]" />
                 <span className="text-[10px] font-black text-[#0A0A0A] uppercase">{formData.lat.toFixed(4)}, {formData.lng.toFixed(4)}</span>
              </div>
            </div>
          </div>

          <div className="space-y-4 pt-4">
             <button 
              type="submit"
              className="w-full py-6 bg-[#0A0A0A] text-white rounded-full font-black text-lg uppercase tracking-widest shadow-2xl hover:bg-black/80 transition-all flex items-center justify-center gap-3 active:scale-[0.98]"
            >
              <Rocket className="h-6 w-6 text-[#FF4D00]" />
              Publish to Network
            </button>
            <p className="text-center text-[10px] font-bold text-[#6B6B6B] uppercase tracking-wider">
              Network Fee: 0.0005 SOL
            </p>
          </div>
        </div>
      </form>
    </div>
  );
}
