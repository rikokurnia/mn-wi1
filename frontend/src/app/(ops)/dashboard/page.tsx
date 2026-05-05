'use client';

import React, { useState, useEffect } from 'react';

import { 
  Briefcase, 
  CheckCircle2, 
  Users, 
  Clock,
  Zap,
  X,
  Loader2,
  Camera
} from 'lucide-react';
import Link from 'next/link';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;

interface DashJob {
  id: string;
  title: string;
  payout_idrx: number;
  status: string;
  proof_submitted_at: string | null;
  proof_photo_url: string | null;
  escrow_pubkey: string | null;
  escrow_tx: string | null;
  authority_pubkey: string | null;
  workers: { wallet_address: string } | null;
}

export default function DashboardPage() {
  const [jobs, setJobs] = useState<DashJob[]>([]);
  const [loading, setLoading] = useState(true);
  const [storyOpen, setStoryOpen] = useState<DashJob | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const fetchJobs = async () => {
    try {
      const statuses = ['open', 'assigned', 'pending_review', 'completed'];
      const results = await Promise.all(
        statuses.map(s => fetch(`/api/jobs?status=${s}`).then(r => r.json()).then(d => d.jobs || []))
      );
      const all = results.flat();
      // Sort newest first
      all.sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
      setJobs(all);
    } catch {
      setJobs([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchJobs(); }, []);

  const pendingReviewJobs = jobs.filter(j => j.status === 'pending_review' || j.status === 'completed');
  const uniqueWorkers = new Set(jobs.filter(j => j.workers?.wallet_address).map(j => j.workers!.wallet_address)).size;
  const totalPaidOut = jobs.filter(j => j.status === 'completed').reduce((sum, j) => sum + (j.payout_idrx || 0), 0);
  const activeCount = jobs.filter(j => j.status !== 'completed' && j.status !== 'cancelled').length;
  const pendingCount = jobs.filter(j => j.status === 'pending_review').length;

  const formatIdrx = (val: number) => {
    if (val >= 1_000_000) return `${(val / 1_000_000).toFixed(1)}M`;
    if (val >= 1_000) return `${(val / 1_000).toFixed(0)}K`;
    return val.toLocaleString('id-ID');
  };

  const getProofImgUrl = (job: DashJob) => {
    if (job.proof_photo_url) return job.proof_photo_url;
    return `${supabaseUrl}/storage/v1/object/public/proofs/job_proof_${job.id}.jpg`;
  };

  const handleApprove = async () => {
    if (!storyOpen) return;

    setActionLoading('approve');
    try {
      // submitProof is trustless — escrow auto-releases on-chain. Just update DB.
      await fetch(`/api/jobs/${storyOpen.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'completed' })
      });

      setStoryOpen(null);
      setLoading(true);
      await fetchJobs();
    } catch (err: any) {
      alert(`Approve failed: ${err.message}`);
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async () => {
    if (!storyOpen) return;

    setActionLoading('reject');
    try {
      // submitProof already settled escrow on-chain. Just mark cancelled in DB.
      await fetch(`/api/jobs/${storyOpen.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'cancelled' })
      });

      setStoryOpen(null);
      setLoading(true);
      await fetchJobs();
    } catch (err: any) {
      alert(`Reject failed: ${err.message}`);
    } finally {
      setActionLoading(null);
    }
  };

  const stats = [
    { 
      name: 'ACTIVE JOBS', 
      value: activeCount.toString(), 
      icon: Briefcase,
      bg: 'bg-white border-[#D4D0CA]'
    },
    { 
      name: 'PENDING REVIEW', 
      value: pendingCount.toString(), 
      icon: Clock,
      bg: 'bg-white border-[#D4D0CA]'
    },
    { 
      name: 'WORKERS', 
      value: uniqueWorkers.toString(), 
      icon: Users,
      bg: 'bg-white border-[#D4D0CA]'
    },
    { 
      name: 'TOTAL PAID OUT', 
      value: formatIdrx(totalPaidOut), 
      icon: Zap,
      bg: 'bg-[#FF4D00] border-transparent text-white'
    },
  ];

  return (
    <div className="p-4 md:p-10 space-y-8 md:space-y-12 max-w-7xl mx-auto relative pb-24 md:pb-10">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-4xl md:text-6xl font-black text-[#0A0A0A] tracking-tighter leading-none uppercase">
            Ops<br />Overview
          </h1>
          <p className="text-sm md:text-base text-[#6B6B6B] font-medium mt-4 max-w-md">
            Mandora real-time labor protocol. Monitoring active nodes across Jakarta Selatan.
          </p>
        </div>
      </div>

      {/* Live Stories Section */}
      {pendingReviewJobs.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-xs font-black text-[#6B6B6B] uppercase tracking-[0.2em]">Live Proofs</h3>
          <div className="flex items-center gap-4 overflow-x-auto pb-4 -mx-4 px-4 md:mx-0 md:px-0">
            {pendingReviewJobs.map((job) => (
              <div 
                key={job.id} 
                onClick={() => setStoryOpen(job)}
                className="flex flex-col items-center gap-2 cursor-pointer group flex-shrink-0"
              >
                <div className={`w-14 h-14 md:w-16 md:h-16 rounded-full p-[3px] ${
                  job.status === 'completed' 
                    ? 'bg-gradient-to-tr from-green-400 to-emerald-400' 
                    : 'bg-gradient-to-tr from-[#FF4D00] to-amber-400'
                } group-hover:scale-105 transition-transform`}>
                  <div className="w-full h-full rounded-full border-2 border-white overflow-hidden bg-[#F5F2ED]">
                    <img 
                      src={getProofImgUrl(job)} 
                      alt="Proof" 
                      className="w-full h-full object-cover" 
                      onError={(e) => {
                        (e.currentTarget as HTMLImageElement).style.display = 'none';
                      }} 
                    />
                  </div>
                </div>
                <div className="text-[10px] font-black uppercase text-[#0A0A0A] max-w-[56px] md:max-w-[64px] truncate text-center">
                  {job.workers?.wallet_address ? job.workers.wallet_address.slice(0, 4) + '..' : 'WORKER'}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
        {stats.map((stat) => (
          <div key={stat.name} className={`p-4 md:p-8 rounded-[20px] md:rounded-[32px] border-2 flex flex-col justify-between h-32 md:h-48 transition-all hover:-translate-y-1 hover:shadow-2xl hover:shadow-orange-200/20 ${stat.bg}`}>
            <div className="flex items-start justify-between">
              <div className="text-[8px] md:text-[10px] font-black uppercase tracking-widest opacity-80">{stat.name}</div>
              <stat.icon className="h-4 w-4 md:h-5 md:w-5" />
            </div>
            <div>
              <div className="text-2xl md:text-5xl font-black tracking-tighter leading-none mb-1 md:mb-2">
                {loading ? '...' : stat.value}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 md:gap-12">
        {/* Recent Jobs */}
        <div className="lg:col-span-2 space-y-4 md:space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-xl md:text-2xl font-black text-[#0A0A0A] uppercase tracking-tighter">Recent Activity</h3>
          </div>
          
          <div className="space-y-3">
            {loading ? (
              <div className="animate-pulse bg-[#F5F2ED] h-24 rounded-[24px]" />
            ) : jobs.length === 0 ? (
              <div className="p-8 md:p-10 text-center border-2 border-dashed border-[#D4D0CA] rounded-[24px]">
                <p className="text-sm font-bold text-[#6B6B6B]">No active jobs found.</p>
              </div>
            ) : (
              jobs.slice(0, 10).map((job) => (
                <div key={job.id} className="group bg-white border-2 border-[#D4D0CA] p-4 md:p-6 rounded-[20px] md:rounded-[24px] flex flex-col md:flex-row md:items-center justify-between hover:border-[#0A0A0A] transition-all">
                  <div className="flex items-center gap-3 md:gap-4">
                    <div className="h-10 w-10 md:h-12 md:w-12 bg-[#F5F2ED] rounded-xl md:rounded-2xl flex items-center justify-center flex-shrink-0">
                      <Briefcase className="h-4 w-4 md:h-5 md:w-5 text-[#6B6B6B]" />
                    </div>
                    <div className="min-w-0">
                      <div className="font-black text-[#0A0A0A] uppercase text-xs md:text-sm tracking-tight truncate">{job.title}</div>
                      <div className="text-[10px] md:text-xs text-[#6B6B6B] font-bold truncate">
                        WORKER: {job.workers?.wallet_address 
                          ? `${job.workers.wallet_address.slice(0, 4)}...${job.workers.wallet_address.slice(-4)}` 
                          : 'Waiting...'}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between md:justify-end w-full md:w-auto gap-4 md:gap-8 mt-3 md:mt-0 pt-3 md:pt-0 border-t md:border-t-0 border-[#F5F2ED]">
                     <div className={`text-[8px] md:text-[10px] font-black px-2 md:px-3 py-1 rounded-full uppercase tracking-wider whitespace-nowrap ${
                          job.status === 'completed' ? 'bg-green-100 text-green-800' :
                          job.status === 'assigned' ? 'bg-blue-100 text-blue-800' :
                          job.status === 'pending_review' ? 'bg-[#FF4D00] text-white' :
                          job.status === 'cancelled' ? 'bg-red-100 text-red-600' :
                          'bg-[#D4D0CA] text-[#6B6B6B]'
                        }`}>
                      {job.status.replace('_', ' ')}
                    </div>
                    <div className="text-right">
                      <div className="text-base md:text-lg font-black text-[#0A0A0A] whitespace-nowrap">Rp {job.payout_idrx?.toLocaleString('id-ID')}</div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Sidebar Actions */}
        <div className="space-y-6 md:space-y-8">
          <div className="bg-white border-2 border-dashed border-[#D4D0CA] p-8 md:p-10 rounded-[32px] md:rounded-[40px] text-center hover:border-[#FF4D00] transition-all group cursor-pointer">
             <Link href="/jobs/new" className="block">
               <div className="h-14 w-14 md:h-16 md:w-16 bg-[#F5F2ED] rounded-full mx-auto mb-4 md:mb-6 flex items-center justify-center group-hover:bg-orange-50 transition-colors">
                 <Briefcase className="h-6 w-6 md:h-8 md:w-8 text-[#0A0A0A] group-hover:text-[#FF4D00] transition-colors" />
               </div>
               <h4 className="font-black text-[#0A0A0A] uppercase tracking-tight mb-2 text-sm md:text-base">Need more hands?</h4>
               <p className="text-[10px] md:text-xs text-[#6B6B6B] font-bold mb-6 md:mb-8 leading-relaxed">
                 Post a new task to the Mandora network. Workers near your location will be notified instantly.
               </p>
               <span className="text-xs md:text-sm font-black text-[#FF4D00] hover:underline decoration-2 underline-offset-4 uppercase tracking-wider">
                 CREATE JOB NOW
               </span>
             </Link>
          </div>
        </div>
      </div>

      {/* Story Modal */}
      {storyOpen && (
        <div className="fixed inset-0 z-[5000] bg-black/90 flex items-center justify-center backdrop-blur-sm" onClick={() => setStoryOpen(null)}>
          <div className="relative w-full max-w-sm aspect-[9/16] bg-[#111] rounded-3xl overflow-hidden border-2 border-white/10" onClick={e => e.stopPropagation()}>
            {/* Loading overlay */}
            {actionLoading && (
              <div className={`absolute inset-0 z-[200] flex flex-col items-center justify-center text-white space-y-4 ${
                actionLoading === 'approve' ? 'bg-[#FF4D00]/90' : 'bg-red-600/90'
              }`}>
                <Loader2 className="h-16 w-16 animate-spin" />
                <h2 className="text-xl font-black uppercase tracking-widest">
                  {actionLoading === 'approve' ? 'Releasing Escrow...' : 'Rejecting...'}
                </h2>
              </div>
            )}

            {/* Header */}
            <div className="absolute top-0 left-0 right-0 p-4 bg-gradient-to-b from-black/80 to-transparent z-10 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full border border-white/20 bg-[#222] overflow-hidden">
                   <img 
                    src={getProofImgUrl(storyOpen)} 
                    className="w-full h-full object-cover" 
                    onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }} 
                   />
                </div>
                <div>
                  <div className="text-white font-black text-xs uppercase">
                    {storyOpen.workers?.wallet_address ? storyOpen.workers.wallet_address.slice(0, 4) + '...' + storyOpen.workers.wallet_address.slice(-4) : 'Worker'}
                  </div>
                  <div className="text-white/60 font-bold text-[10px]">
                    {storyOpen.proof_submitted_at ? new Date(storyOpen.proof_submitted_at).toLocaleTimeString() : '—'}
                  </div>
                </div>
              </div>
              <button onClick={() => setStoryOpen(null)} className="text-white/80 hover:text-white">
                <X className="h-6 w-6" />
              </button>
            </div>

            {/* Story Image */}
            <img 
              src={getProofImgUrl(storyOpen)} 
              className="w-full h-full object-cover"
              onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }}
              alt="Proof"
            />

            {/* Bottom Info */}
            <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/90 via-black/50 to-transparent">
              <h3 className="text-white font-black text-xl uppercase leading-tight mb-2">{storyOpen.title}</h3>
              <div className="flex items-center gap-2 mb-6">
                <div className="bg-[#FF4D00] text-white text-[10px] font-black px-2 py-1 rounded uppercase">GPS VERIFIED</div>
                <div className="bg-white/20 text-white text-[10px] font-black px-2 py-1 rounded uppercase">Rp {storyOpen.payout_idrx?.toLocaleString('id-ID')}</div>
              </div>

              {storyOpen.status === 'pending_review' && (
                <div className="flex gap-3">
                  <button 
                    onClick={handleApprove}
                    disabled={!!actionLoading}
                    className="flex-1 bg-white text-black py-4 rounded-xl font-black text-xs uppercase tracking-wider hover:bg-gray-200 disabled:opacity-50"
                  >
                    Approve & Pay
                  </button>
                  <button 
                    onClick={handleReject}
                    disabled={!!actionLoading}
                    className="flex-1 bg-white/10 text-white py-4 rounded-xl font-black text-xs uppercase tracking-wider hover:bg-white/20 disabled:opacity-50"
                  >
                    Reject
                  </button>
                </div>
              )}
              {storyOpen.status === 'completed' && (
                <div className="w-full bg-green-500/20 border border-green-500 text-green-400 py-4 rounded-xl font-black text-xs uppercase tracking-wider text-center flex items-center justify-center gap-2">
                  <CheckCircle2 className="h-4 w-4" /> Paid Successfully
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
