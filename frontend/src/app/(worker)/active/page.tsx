'use client';
import { useEffect, useState } from 'react';
import { useWorkerWallet } from '@/components/worker/WorkerWalletContext';
import Link from 'next/link';
import { Zap, MapPin, Clock, DollarSign, Loader2, Navigation } from 'lucide-react';

interface ActiveJob {
  id: string;
  title: string;
  description: string;
  payout_idrx: number;
  location_name: string;
  latitude: number;
  longitude: number;
  geofence_radius_m: number;
  status: string;
  assigned_at: string | null;
  categories: { name: string; icon: string } | null;
}

export default function ActivePage() {
  const { publicKey, connected } = useWorkerWallet();
  const [job, setJob] = useState<ActiveJob | null>(null);
  const [loading, setLoading] = useState(true);
  const [noJob, setNoJob] = useState(false);

  useEffect(() => {
    if (!publicKey) return;

    const load = async () => {
      setLoading(true);
      try {
        // Fetch jobs assigned to this worker
        const res = await fetch(`/api/workers/${publicKey.toBase58()}/active-job`);
        if (res.ok) {
          const data = await res.json();
          setJob(data.job || null);
          setNoJob(!data.job);
        } else {
          setNoJob(true);
        }
      } catch {
        setNoJob(true);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [publicKey]);

  if (!connected) {
    return (
      <div className="h-full flex flex-col items-center justify-center p-8 text-center">
        <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center mb-6">
          <Zap className="h-10 w-10 text-[#FF4D00]" />
        </div>
        <h2 className="text-2xl font-black text-white uppercase tracking-tight mb-2">No Active Tasks</h2>
        <p className="text-sm font-bold text-[#6B6B6B]">Connect your wallet to see your assigned tasks.</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="h-full flex flex-col items-center justify-center">
        <Loader2 className="h-10 w-10 text-[#FF4D00] animate-spin mb-4" />
        <p className="text-xs font-bold text-[#6B6B6B] uppercase tracking-widest">Checking tasks...</p>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="h-full flex flex-col items-center justify-center p-8 text-center">
        <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center mb-6">
          <Zap className="h-10 w-10 text-[#FF4D00]" />
        </div>
        <h2 className="text-2xl font-black text-white uppercase tracking-tight mb-2">No Active Tasks</h2>
        <p className="text-sm font-bold text-[#6B6B6B] mb-8">Head to Explore to pick up your next gig.</p>
        <Link 
          href="/explore"
          className="px-8 py-4 bg-[#FF4D00] text-white rounded-full font-black text-sm uppercase tracking-widest shadow-xl shadow-orange-900/20"
        >
          Browse Jobs
        </Link>
      </div>
    );
  }

  // Active job found — show job card with Verify CTA
  const statusColors: Record<string, string> = {
    assigned: 'bg-amber-500/10 text-amber-500 border-amber-500/20',
    in_progress: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
    pending_review: 'bg-purple-500/10 text-purple-500 border-purple-500/20',
  };
  const statusBadge = statusColors[job.status] || 'bg-white/5 text-white border-white/10';

  return (
    <div className="h-full overflow-y-auto p-6 pb-24">
      <div className="max-w-md mx-auto space-y-6">
        {/* Header */}
        <div>
          <span className="text-[10px] font-black text-[#FF4D00] uppercase tracking-widest">
            {job.categories?.name || 'ACTIVE TASK'}
          </span>
          <h1 className="text-3xl font-black text-white uppercase tracking-tighter leading-none mt-1">
            {job.title}
          </h1>
          <div className={`inline-flex items-center gap-1.5 mt-2 px-3 py-1 rounded-full border text-[10px] font-black uppercase tracking-widest ${statusBadge}`}>
            <div className="h-1.5 w-1.5 rounded-full bg-current animate-pulse" />
            {job.status.replace('_', ' ')}
          </div>
        </div>

        {/* Reward */}
        <div className="bg-gradient-to-br from-[#FF4D00] to-[#E64500] p-6 rounded-[32px] shadow-2xl shadow-orange-900/30">
          <p className="text-[10px] font-black text-white/70 uppercase tracking-widest mb-1">Your Earnings</p>
          <p className="text-4xl font-black text-white">Rp {job.payout_idrx.toLocaleString('id-ID')}</p>
          <p className="text-[10px] font-bold text-white/60 mt-1">95% payout · Auto-releases on proof</p>
        </div>

        {/* Details */}
        <div className="space-y-4">
          <div className="bg-[#1A1A1A] p-5 rounded-[28px] border border-white/5 flex items-start gap-4">
            <div className="h-10 w-10 rounded-2xl bg-white/5 flex items-center justify-center flex-shrink-0">
              <MapPin className="h-5 w-5 text-[#FF4D00]" />
            </div>
            <div>
              <p className="text-[10px] font-black text-[#6B6B6B] uppercase tracking-widest mb-1">Location</p>
              <p className="text-sm font-bold text-white">{job.location_name}</p>
              <p className="text-[10px] font-bold text-[#6B6B6B] mt-0.5">
                {job.latitude.toFixed(4)}, {job.longitude.toFixed(4)} · {job.geofence_radius_m}m radius
              </p>
            </div>
          </div>

          {job.description && (
            <div className="bg-[#1A1A1A] p-5 rounded-[28px] border border-white/5">
              <p className="text-[10px] font-black text-[#6B6B6B] uppercase tracking-widest mb-2">Instructions</p>
              <p className="text-xs font-bold text-[#6B6B6B] leading-relaxed">{job.description}</p>
            </div>
          )}

          {job.assigned_at && (
            <div className="bg-[#1A1A1A] p-5 rounded-[28px] border border-white/5 flex items-center gap-4">
              <div className="h-10 w-10 rounded-2xl bg-white/5 flex items-center justify-center">
                <Clock className="h-5 w-5 text-[#FF4D00]" />
              </div>
              <div>
                <p className="text-[10px] font-black text-[#6B6B6B] uppercase tracking-widest mb-1">Accepted</p>
                <p className="text-xs font-bold text-white">
                  {new Date(job.assigned_at).toLocaleDateString('id-ID', { 
                    day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
                  })}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="space-y-3 pt-2">
          <a
            href={`https://www.google.com/maps/dir/?api=1&destination=${job.latitude},${job.longitude}`}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full py-5 bg-white/5 border border-white/10 text-white rounded-full font-black text-sm uppercase tracking-[0.2em] flex items-center justify-center gap-3 hover:bg-white/10 transition-colors"
          >
            <Navigation className="h-5 w-5" />
            Open in Google Maps
          </a>
          
          <Link
            href="/active/verify"
            className="w-full py-5 bg-[#FF4D00] text-white rounded-full font-black text-sm uppercase tracking-[0.2em] shadow-xl shadow-orange-900/20 flex items-center justify-center gap-3 active:scale-[0.98] transition-transform"
          >
            <Zap className="h-5 w-5" />
            I'm Here — Verify & Submit Proof
          </Link>
        </div>

        <div className="flex items-center justify-center gap-2 opacity-20 pt-2 pb-4">
          <DollarSign className="h-3 w-3" />
          <p className="text-[8px] font-black uppercase tracking-widest">Escrow locked until proof is verified</p>
        </div>
      </div>
    </div>
  );
}
