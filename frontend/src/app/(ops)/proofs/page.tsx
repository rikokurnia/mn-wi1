'use client';

import React, { useState } from 'react';
import { 
  ShieldCheck, 
  XCircle, 
  MapPin, 
  Clock, 
  ExternalLink,
  ChevronRight,
  Filter,
  Search,
  CheckCircle2
} from 'lucide-react';

const pendingProofs = [
  { id: 'PF-9021', worker: 'Riko K.', job: 'AC Maintenance - Kuningan', date: '10m ago', distance: '1.2m', reward: '150,000', status: 'pending' },
  { id: 'PF-9018', worker: 'Alex S.', job: 'Poster Audit - Sudirman', date: '25m ago', distance: '4.8m', reward: '50,000', status: 'pending' },
  { id: 'PF-8995', worker: 'Maya T.', job: 'Cleanliness Check - Menteng', date: '1h ago', distance: '0.5m', reward: '120,000', status: 'pending' },
];

export default function ProofDeskPage() {
  const [selectedProof, setSelectedProof] = useState<typeof pendingProofs[0] | null>(pendingProofs[0]);
  const [isApproving, setIsApproving] = useState(false);

  const handleApprove = () => {
    setIsApproving(true);
    setTimeout(() => {
      setIsApproving(false);
      // Logic to remove from list would go here
    }, 2000);
  };

  return (
    <div className="p-8 h-screen flex flex-col space-y-8 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-black text-[#0A0A0A] tracking-tighter uppercase leading-none">
            Proof<br />Desk
          </h1>
          <p className="text-[10px] font-black text-[#6B6B6B] uppercase tracking-[0.2em] mt-2">
            VALIDATE GEOFENCED SUBMISSIONS
          </p>
        </div>
        
        <div className="flex gap-3">
          <div className="bg-white border-2 border-[#D4D0CA] p-4 rounded-3xl flex items-center gap-6">
            <div className="text-center">
              <p className="text-[8px] font-black text-[#6B6B6B] uppercase tracking-widest">PENDING</p>
              <p className="text-xl font-black text-[#0A0A0A]">12</p>
            </div>
            <div className="w-px h-8 bg-[#D4D0CA]" />
            <div className="text-center">
              <p className="text-[8px] font-black text-[#6B6B6B] uppercase tracking-widest">APPROVED</p>
              <p className="text-xl font-black text-[#FF4D00]">1.4k</p>
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 flex gap-8 min-h-0">
        {/* Left Side: Queue */}
        <div className="w-1/3 flex flex-col space-y-4 overflow-y-auto pr-2 scrollbar-hide">
          <div className="sticky top-0 bg-[#E8E4DE] pb-4 z-10">
            <div className="bg-white border-2 border-[#D4D0CA] p-3 rounded-2xl flex items-center gap-3">
              <Search className="h-4 w-4 text-[#6B6B6B]" />
              <input type="text" placeholder="Search proofs..." className="bg-transparent border-none outline-none text-xs font-bold w-full" />
            </div>
          </div>

          {pendingProofs.map((proof) => (
            <button 
              key={proof.id}
              onClick={() => setSelectedProof(proof)}
              className={`text-left p-5 rounded-[32px] border-2 transition-all group ${
                selectedProof?.id === proof.id 
                  ? 'bg-[#0A0A0A] border-[#0A0A0A] text-white shadow-xl translate-x-2' 
                  : 'bg-white border-[#D4D0CA] hover:border-[#FF4D00]'
              }`}
            >
              <div className="flex justify-between items-start mb-2">
                <span className={`text-[9px] font-black uppercase tracking-widest ${selectedProof?.id === proof.id ? 'text-[#FF4D00]' : 'text-[#6B6B6B]'}`}>
                  {proof.id}
                </span>
                <span className="text-[9px] font-bold opacity-60">{proof.date}</span>
              </div>
              <h3 className="text-sm font-black uppercase tracking-tight mb-1 group-hover:text-[#FF4D00] transition-colors">{proof.job}</h3>
              <p className={`text-[10px] font-bold ${selectedProof?.id === proof.id ? 'text-white/60' : 'text-[#6B6B6B]'}`}>
                Worker: {proof.worker}
              </p>
            </button>
          ))}
        </div>

        {/* Right Side: Detailed View */}
        {selectedProof ? (
          <div className="flex-1 bg-white border-4 border-white rounded-[48px] shadow-2xl overflow-hidden flex flex-col relative">
            {isApproving && (
              <div className="absolute inset-0 bg-[#FF4D00]/90 z-[100] flex flex-col items-center justify-center text-white space-y-4 animate-in fade-in duration-300">
                <div className="h-20 w-20 border-8 border-white border-t-transparent rounded-full animate-spin" />
                <h2 className="text-2xl font-black uppercase tracking-widest">Releasing Escrow...</h2>
              </div>
            )}

            {/* Top Bar */}
            <div className="p-8 border-b-2 border-[#F5F2ED] flex justify-between items-center">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 bg-[#F5F2ED] rounded-2xl flex items-center justify-center">
                  <ShieldCheck className="h-6 w-6 text-[#FF4D00]" />
                </div>
                <div>
                  <h2 className="text-xl font-black text-[#0A0A0A] uppercase tracking-tighter">{selectedProof.job}</h2>
                  <p className="text-[10px] font-black text-[#6B6B6B] uppercase tracking-widest">SUBMITTED BY {selectedProof.worker}</p>
                </div>
              </div>
              <div className="flex gap-2">
                <button className="h-10 w-10 bg-[#F5F2ED] rounded-xl flex items-center justify-center hover:bg-[#FF4D00]/10 group transition-colors">
                  <ExternalLink className="h-5 w-5 text-[#6B6B6B] group-hover:text-[#FF4D00]" />
                </button>
              </div>
            </div>

            {/* Content Split */}
            <div className="flex-1 flex min-h-0 overflow-hidden">
              {/* Photo Evidence */}
              <div className="flex-1 bg-[#F5F2ED] p-8 overflow-y-auto">
                <p className="text-[10px] font-black text-[#6B6B6B] uppercase tracking-widest mb-4">PHOTO EVIDENCE</p>
                <div className="aspect-square bg-[#0A0A0A] rounded-[40px] flex items-center justify-center overflow-hidden border-4 border-white shadow-xl relative group">
                  <img 
                    src="https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&q=80&w=800" 
                    alt="Proof" 
                    className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-6">
                    <p className="text-white text-[10px] font-black uppercase tracking-widest">Captured via Mandora Secure Cam</p>
                  </div>
                </div>
              </div>

              {/* Data & Location */}
              <div className="w-[350px] p-8 border-l-2 border-[#F5F2ED] space-y-8 overflow-y-auto">
                <div className="space-y-4">
                  <p className="text-[10px] font-black text-[#6B6B6B] uppercase tracking-widest">VERIFICATION DATA</p>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-4 bg-[#F5F2ED] rounded-2xl">
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-[#FF4D00]" />
                        <span className="text-[10px] font-black uppercase tracking-tight">Geofence</span>
                      </div>
                      <span className="text-xs font-black text-[#0A0A0A]">{selectedProof.distance} offset</span>
                    </div>
                    <div className="flex items-center justify-between p-4 bg-[#F5F2ED] rounded-2xl">
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-[#FF4D00]" />
                        <span className="text-[10px] font-black uppercase tracking-tight">Timestamp</span>
                      </div>
                      <span className="text-xs font-black text-[#0A0A0A]">Valid</span>
                    </div>
                  </div>
                </div>

                <div className="p-6 bg-[#0A0A0A] rounded-[32px] text-white">
                  <p className="text-[9px] font-black text-[#6B6B6B] uppercase tracking-widest mb-1">REWARD AMOUNT</p>
                  <p className="text-2xl font-black text-[#FF4D00]">Rp {selectedProof.reward}</p>
                  <p className="text-[8px] font-bold text-white/40 mt-2">Locked in Mandora Smart Contract</p>
                </div>

                {/* Actions */}
                <div className="space-y-3 pt-4">
                  <button 
                    onClick={handleApprove}
                    className="w-full py-5 bg-[#FF4D00] text-white rounded-full font-black text-sm uppercase tracking-[0.2em] shadow-xl shadow-orange-200 flex items-center justify-center gap-3 hover:-translate-y-1 transition-all active:translate-y-0"
                  >
                    <CheckCircle2 className="h-5 w-5" />
                    Release Payment
                  </button>
                  <button className="w-full py-5 border-2 border-[#D4D0CA] text-[#0A0A0A] rounded-full font-black text-sm uppercase tracking-[0.2em] flex items-center justify-center gap-3 hover:bg-red-50 hover:border-red-200 hover:text-red-500 transition-all">
                    <XCircle className="h-5 w-5" />
                    Reject Proof
                  </button>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center text-[#6B6B6B] uppercase font-black tracking-widest text-xs">
            Select a proof to review
          </div>
        )}
      </div>
    </div>
  );
}
