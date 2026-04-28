'use client';

import React, { useState, useEffect, useCallback } from 'react';
import dynamic from 'next/dynamic';
import { Drawer } from 'vaul';
import { useWallet } from '@solana/wallet-adapter-react';
import { useRouter } from 'next/navigation';
import { 
  MapPin, 
  Zap, 
  Clock, 
  ShieldCheck, 
  Navigation,
  Search,
  Loader2,
  CheckCircle
} from 'lucide-react';

const JobMap = dynamic(() => import('@/components/worker/JobMap'), { 
  ssr: false,
  loading: () => <div className="h-full w-full bg-[#0A0A0A] flex items-center justify-center">
    <div className="h-10 w-10 border-4 border-[#FF4D00] border-t-transparent rounded-full animate-spin" />
  </div>
});

interface Job {
  id: string;
  title: string;
  description: string;
  payout_idrx: number;
  latitude: number;
  longitude: number;
  geofence_radius_m: number;
  location_name: string;
  escrow_pubkey: string | null;
  categories: { name: string; icon: string } | null;
}

export default function ExplorePage() {
  const { publicKey, connected } = useWallet();
  const router = useRouter();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [open, setOpen] = useState(false);
  const [accepting, setAccepting] = useState(false);
  const [accepted, setAccepted] = useState<string | null>(null);

  const loadJobs = useCallback(() => {
    fetch('/api/jobs?status=open')
      .then(r => r.json())
      .then(data => {
        setJobs(data.jobs || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  useEffect(() => {
    loadJobs();
  }, [loadJobs]);

  const handleSelectJob = (job: any) => {
    const fullJob = jobs.find(j => j.id === job.id) || null;
    setSelectedJob(fullJob);
    setOpen(true);
  };

  const handleAcceptJob = async (job: Job) => {
    if (!publicKey) {
      alert('Please connect your wallet first');
      return;
    }
    if (!connected) {
      alert('Wallet not connected');
      return;
    }

    setAccepting(true);
    try {
      const res = await fetch(`/api/jobs/${job.id}/accept`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ worker_wallet: publicKey.toBase58() })
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.error || 'Failed to accept job');
        return;
      }

      setAccepted(job.id);
      setOpen(false);

      // Redirect to active job after brief delay
      setTimeout(() => {
        router.push('/active');
      }, 800);
    } catch (err) {
      alert('Network error. Please try again.');
    } finally {
      setAccepting(false);
    }
  };

  const mapJobs = jobs.map(j => ({
    id: j.id,
    title: j.title,
    reward: j.payout_idrx.toLocaleString('id-ID'),
    lat: j.latitude,
    lng: j.longitude,
    category: j.categories?.name || 'General',
    desc: j.description || j.location_name,
  }));

  return (
    <div className="h-screen w-full relative">
      {/* Header Overlay */}
      <div className="absolute top-0 left-0 right-0 z-[500] p-6 pt-10 pointer-events-none">
        <div className="max-w-md mx-auto space-y-4">
          <div className="bg-[#1A1A1A]/80 backdrop-blur-xl p-4 rounded-3xl border border-white/5 flex items-center gap-4 pointer-events-auto shadow-2xl">
            <Search className="h-5 w-5 text-[#6B6B6B]" />
            <input 
              type="text" 
              placeholder="Search nearby tasks..." 
              className="bg-transparent border-none outline-none text-sm font-bold text-white placeholder-[#6B6B6B] flex-1"
            />
          </div>
          
          {loading && (
            <div className="flex items-center justify-center gap-2 pointer-events-auto">
              <Loader2 className="h-4 w-4 text-[#FF4D00] animate-spin" />
              <span className="text-xs font-bold text-[#6B6B6B]">Loading jobs...</span>
            </div>
          )}
        </div>
      </div>

      {/* Map Background */}
      <JobMap jobs={mapJobs} onSelectJob={handleSelectJob} />

      {/* Job Details Drawer */}
      <Drawer.Root open={open} onOpenChange={setOpen}>
        <Drawer.Portal>
          <Drawer.Overlay className="fixed inset-0 bg-black/40 z-[2000]" />
          <Drawer.Content className="bg-[#111111] border-t border-white/10 flex flex-col rounded-t-[40px] h-[70vh] fixed bottom-0 left-0 right-0 z-[2001] outline-none">
            <div className="p-4 bg-[#111111] rounded-t-[40px] flex-1">
              <div className="mx-auto w-12 h-1.5 flex-shrink-0 rounded-full bg-white/20 mb-8" />
              
              {selectedJob && (
                <div className="max-w-md mx-auto space-y-8 px-4 overflow-y-auto max-h-full pb-10">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-black text-[#FF4D00] uppercase tracking-[0.3em]">
                        {selectedJob.categories?.name || 'GENERAL'}
                      </span>
                      <div className="flex items-center gap-1 text-[#6B6B6B] text-[10px] font-black uppercase tracking-widest">
                        <Clock className="h-3 w-3" />
                        Open
                      </div>
                    </div>
                    <h2 className="text-3xl font-black text-white uppercase tracking-tighter leading-none">
                      {selectedJob.title}
                    </h2>
                  </div>

                  <div className="flex gap-4">
                    <div className="flex-1 bg-white/5 p-4 rounded-3xl border border-white/5">
                      <p className="text-[10px] font-black text-[#6B6B6B] uppercase tracking-widest mb-1">REWARD</p>
                      <p className="text-xl font-black text-[#FF4D00]">Rp {selectedJob.payout_idrx.toLocaleString('id-ID')}</p>
                    </div>
                    <div className="flex-1 bg-white/5 p-4 rounded-3xl border border-white/5">
                      <p className="text-[10px] font-black text-[#6B6B6B] uppercase tracking-widest mb-1">GEOFENCE</p>
                      <p className="text-xl font-black text-white">{selectedJob.geofence_radius_m}m</p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-sm font-black text-white uppercase tracking-widest">Requirements</h3>
                    <p className="text-xs font-bold text-[#6B6B6B] leading-relaxed">
                      {selectedJob.description || selectedJob.location_name}
                    </p>
                  </div>

                  <div className="space-y-3 pt-4">
                    {accepted === selectedJob.id ? (
                      <div className="w-full py-5 bg-green-500 text-white rounded-full font-black text-sm uppercase tracking-[0.2em] flex items-center justify-center gap-3">
                        <CheckCircle className="h-5 w-5" />
                        Job Accepted! Redirecting...
                      </div>
                    ) : (
                      <>
                        <button 
                          className="w-full py-5 bg-[#FF4D00] text-white rounded-full font-black text-sm uppercase tracking-[0.2em] shadow-xl shadow-orange-900/20 flex items-center justify-center gap-3 active:scale-[0.98] transition-transform disabled:opacity-50"
                          onClick={() => handleAcceptJob(selectedJob)}
                          disabled={accepting || !connected}
                        >
                          {accepting ? (
                            <><Loader2 className="h-5 w-5 animate-spin" /> Accepting...</>
                          ) : (
                            <><Zap className="h-5 w-5" /> Accept Job</>
                          )}
                        </button>
                        {!connected && (
                          <p className="text-[10px] text-center font-bold text-amber-500">
                            Connect wallet to accept
                          </p>
                        )}
                      </>
                    )}
                    <button className="w-full py-5 bg-white/5 border border-white/10 text-white rounded-full font-black text-sm uppercase tracking-[0.2em] flex items-center justify-center gap-3 hover:bg-white/10 transition-colors">
                      <Navigation className="h-5 w-5" />
                      Navigate
                    </button>
                  </div>

                  <div className="flex items-center justify-center gap-2 opacity-30 pt-4 pb-8">
                    <ShieldCheck className="h-4 w-4" />
                    <span className="text-[10px] font-black uppercase tracking-widest">Proof required via Mandora Protocol</span>
                  </div>
                </div>
              )}
            </div>
          </Drawer.Content>
        </Drawer.Portal>
      </Drawer.Root>
    </div>
  );
}
