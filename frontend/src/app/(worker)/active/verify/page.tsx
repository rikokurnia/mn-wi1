'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Camera, 
  MapPin, 
  ShieldCheck, 
  Zap, 
  ArrowLeft,
  Loader2,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

export default function VerificationPage() {
  const router = useRouter();
  const [step, setStep] = useState<'gps' | 'camera' | 'submitting' | 'success'>('gps');
  const [gpsLocked, setGpsLocked] = useState(false);
  const [photoTaken, setPhotoTaken] = useState(false);

  // Simulate GPS Locking
  useEffect(() => {
    if (step === 'gps') {
      const timer = setTimeout(() => {
        setGpsLocked(true);
      }, 2500);
      return () => clearTimeout(timer);
    }
  }, [step]);

  const handleCapture = () => {
    setPhotoTaken(true);
    setTimeout(() => {
      setStep('submitting');
      setTimeout(() => {
        setStep('success');
      }, 3000);
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white flex flex-col p-6 pb-24 overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-4 mb-10">
        <button onClick={() => router.back()} className="h-10 w-10 bg-white/5 rounded-2xl flex items-center justify-center">
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div>
          <h1 className="text-xl font-black uppercase tracking-tighter">Submit Proof</h1>
          <p className="text-[10px] font-black text-[#6B6B6B] uppercase tracking-widest">JOB ID: MN-2041</p>
        </div>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center space-y-12">
        
        {/* Verification Status UI */}
        <div className="w-full max-w-sm space-y-8">
          
          {/* Step 1: GPS Verification */}
          <div className={`p-6 rounded-[32px] border-2 transition-all duration-500 ${
            gpsLocked ? 'bg-[#FF4D00]/5 border-[#FF4D00]' : 'bg-white/5 border-white/5 opacity-50'
          }`}>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className={`h-10 w-10 rounded-2xl flex items-center justify-center ${gpsLocked ? 'bg-[#FF4D00] text-white shadow-[0_0_20px_rgba(255,77,0,0.4)]' : 'bg-white/10 text-white'}`}>
                  <MapPin className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-xs font-black uppercase tracking-tight">Geofence Status</p>
                  <p className={`text-[10px] font-bold ${gpsLocked ? 'text-[#FF4D00]' : 'text-[#6B6B6B]'}`}>
                    {gpsLocked ? 'Position Verified' : 'Scanning Satellite...'}
                  </p>
                </div>
              </div>
              {!gpsLocked && <Loader2 className="h-5 w-5 text-[#FF4D00] animate-spin" />}
              {gpsLocked && <CheckCircle2 className="h-5 w-5 text-[#FF4D00]" />}
            </div>
            
            {gpsLocked && (
              <div className="space-y-2">
                <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-[#6B6B6B]">
                  <span>Accuracy</span>
                  <span>1.2m</span>
                </div>
                <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                  <div className="h-full bg-[#FF4D00] w-[98%]" />
                </div>
              </div>
            )}
          </div>

          {/* Step 2: Camera Capture */}
          <div className={`relative aspect-[4/5] w-full rounded-[48px] overflow-hidden border-2 transition-all duration-500 ${
            gpsLocked ? 'border-[#FF4D00]/50' : 'border-white/5 opacity-20'
          }`}>
            {/* Viewfinder Mock */}
            <div className="absolute inset-0 bg-gradient-to-b from-transparent to-[#0A0A0A]/50 z-10" />
            <div className="absolute inset-0 flex items-center justify-center bg-[#1A1A1A]">
              {photoTaken ? (
                <div className="absolute inset-0 bg-[#FF4D00]/20 flex items-center justify-center animate-pulse">
                  <CheckCircle2 className="h-16 w-16 text-[#FF4D00]" />
                </div>
              ) : (
                <div className="text-center space-y-4">
                  <Camera className="h-12 w-12 text-[#6B6B6B] mx-auto" />
                  <p className="text-[10px] font-black text-[#6B6B6B] uppercase tracking-widest">Viewfinder Ready</p>
                </div>
              )}
              
              {/* Corner Accents */}
              <div className="absolute top-8 left-8 w-8 h-8 border-t-2 border-l-2 border-white/20 rounded-tl-xl" />
              <div className="absolute top-8 right-8 w-8 h-8 border-t-2 border-r-2 border-white/20 rounded-tr-xl" />
              <div className="absolute bottom-8 left-8 w-8 h-8 border-b-2 border-l-2 border-white/20 rounded-bl-xl" />
              <div className="absolute bottom-8 right-8 w-8 h-8 border-b-2 border-r-2 border-white/20 rounded-br-xl" />
            </div>

            {/* Scanning Line Animation */}
            {gpsLocked && !photoTaken && (
              <div className="absolute top-0 left-0 w-full h-0.5 bg-[#FF4D00] shadow-[0_0_15px_#FF4D00] animate-[scan_3s_linear_infinite] z-20" />
            )}
          </div>

        </div>
      </div>

      {/* Action Area */}
      <div className="fixed bottom-0 left-0 right-0 p-8 pt-0 bg-gradient-to-t from-[#0A0A0A] via-[#0A0A0A] to-transparent z-[1001]">
        <div className="max-w-md mx-auto">
          {step === 'success' ? (
            <button 
              onClick={() => router.push('/active')}
              className="w-full py-6 bg-green-500 text-white rounded-full font-black text-sm uppercase tracking-[0.2em] shadow-xl shadow-green-900/20 flex items-center justify-center gap-3"
            >
              <ShieldCheck className="h-5 w-5" />
              Payment Disbursed
            </button>
          ) : step === 'submitting' ? (
            <button disabled className="w-full py-6 bg-white/10 text-[#6B6B6B] rounded-full font-black text-sm uppercase tracking-[0.2em] flex items-center justify-center gap-3">
              <Loader2 className="h-5 w-5 animate-spin" />
              Syncing with Solana
            </button>
          ) : (
            <button 
              onClick={handleCapture}
              disabled={!gpsLocked}
              className={`w-full py-6 rounded-full font-black text-sm uppercase tracking-[0.2em] shadow-xl transition-all flex items-center justify-center gap-3 active:scale-[0.98] ${
                gpsLocked 
                  ? 'bg-[#FF4D00] text-white shadow-orange-900/20' 
                  : 'bg-white/5 text-[#6B6B6B] cursor-not-allowed'
              }`}
            >
              <Zap className="h-5 w-5" />
              {gpsLocked ? 'Capture & Submit' : 'Waiting for GPS...'}
            </button>
          )}
          
          <div className="mt-6 flex items-center justify-center gap-2 opacity-30">
            <AlertCircle className="h-3 w-3" />
            <p className="text-[8px] font-black uppercase tracking-widest">Proofs are permanently stored on IPFS</p>
          </div>
        </div>
      </div>

      <style jsx global>{`
        @keyframes scan {
          0% { top: 10%; }
          50% { top: 90%; }
          100% { top: 10%; }
        }
      `}</style>
    </div>
  );
}
