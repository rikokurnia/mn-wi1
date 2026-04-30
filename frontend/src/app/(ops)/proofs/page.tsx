'use client';

import React, { useState, useEffect } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';

import { 
  ShieldCheck, 
  XCircle, 
  MapPin, 
  Clock, 
  ExternalLink,
  Search,
  CheckCircle2,
  Loader2,
  Camera,
  Navigation
} from 'lucide-react';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;

interface ProofJob {
  id: string;
  title: string;
  payout_idrx: number;
  status: string;
  location_name: string;
  latitude: number;
  longitude: number;
  geofence_radius_m: number;
  proof_submitted_at: string | null;
  proof_photo_url: string | null;
  proof_gps_lat: number | null;
  proof_gps_lng: number | null;
  escrow_pubkey: string | null;
  escrow_tx: string | null;
  authority_pubkey: string | null;
  workers: { wallet_address: string } | null;
}

export default function ProofDeskPage() {
  const { publicKey } = useWallet();
  const [jobs, setJobs] = useState<ProofJob[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedJob, setSelectedJob] = useState<ProofJob | null>(null);
  const [actionLoading, setActionLoading] = useState<'approve' | 'reject' | null>(null);
  const [search, setSearch] = useState('');
  const [imgError, setImgError] = useState<Record<string, boolean>>({});

  const fetchProofs = async () => {
    try {
      const res = await fetch('/api/jobs?status=pending_review');
      const data = await res.json();
      setJobs(data.jobs || []);
      // Auto-select first job
      if (data.jobs?.length > 0 && !selectedJob) {
        setSelectedJob(data.jobs[0]);
      }
    } catch {
      setJobs([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchProofs(); }, []);

  const getProofImgUrl = (job: ProofJob) => {
    if (job.proof_photo_url) return job.proof_photo_url;
    // Fallback: try the standard storage path
    return `${supabaseUrl}/storage/v1/object/public/proofs/job_proof_${job.id}.jpg`;
  };

  const handleApprove = async () => {
    if (!selectedJob) return;

    setActionLoading('approve');
    try {
      // NOTE: submitProof is trustless — it already auto-releases IDRX on-chain
      // when GPS is validated. approveReleaseTx would fail with InvalidEscrowStatus
      // because the escrow is already settled. We only need to update the DB.
      await fetch(`/api/jobs/${selectedJob.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'completed' })
      });

      setSelectedJob(null);
      setLoading(true);
      await fetchProofs();
    } catch (err: any) {
      console.error('Approve failed:', err);
      alert(`Failed to update job: ${err.message}`);
    } finally {
      setActionLoading(null);
    }
  };


  const handleReject = async () => {
    if (!selectedJob) return;

    setActionLoading('reject');
    try {
      // NOTE: submitProof already settled the escrow on-chain (trustless auto-release).
      // cancelEscrowTx would fail with InvalidEscrowStatus. We just mark as cancelled in DB.
      await fetch(`/api/jobs/${selectedJob.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'cancelled' })
      });

      setSelectedJob(null);
      setLoading(true);
      await fetchProofs();
    } catch (err: any) {
      alert(`Reject failed: ${err.message}`);
    } finally {
      setActionLoading(null);

    }
  };

  const filteredJobs = search.trim()
    ? jobs.filter(j => j.title.toLowerCase().includes(search.toLowerCase()) || j.workers?.wallet_address?.includes(search))
    : jobs;

  // Calculate GPS offset distance
  const calcOffset = (job: ProofJob) => {
    if (!job.proof_gps_lat || !job.proof_gps_lng) return '—';
    const dLat = (job.proof_gps_lat - job.latitude) * 111320;
    const dLng = (job.proof_gps_lng - job.longitude) * 111320 * Math.cos(job.latitude * Math.PI / 180);
    const dist = Math.sqrt(dLat * dLat + dLng * dLng);
    return `${dist.toFixed(1)}m offset`;
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
              <p className="text-xl font-black text-[#0A0A0A]">{jobs.length}</p>
            </div>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex-1 flex items-center justify-center gap-3">
          <Loader2 className="h-6 w-6 text-[#FF4D00] animate-spin" />
          <span className="text-sm font-bold text-[#6B6B6B]">Loading proofs...</span>
        </div>
      ) : jobs.length === 0 ? (
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center space-y-4">
            <CheckCircle2 className="h-16 w-16 text-green-400 mx-auto opacity-40" />
            <p className="text-sm font-black text-[#6B6B6B] uppercase tracking-widest">All caught up!</p>
            <p className="text-xs font-bold text-[#6B6B6B]">No proofs waiting for review.</p>
          </div>
        </div>
      ) : (
        <div className="flex-1 flex gap-8 min-h-0">
          {/* Left Side: Queue */}
          <div className="w-1/3 flex flex-col space-y-4 overflow-y-auto pr-2 scrollbar-hide">
            <div className="sticky top-0 bg-[#E8E4DE] pb-4 z-10">
              <div className="bg-white border-2 border-[#D4D0CA] p-3 rounded-2xl flex items-center gap-3">
                <Search className="h-4 w-4 text-[#6B6B6B]" />
                <input
                  type="text"
                  placeholder="Search proofs..."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  className="bg-transparent border-none outline-none text-xs font-bold w-full"
                />
              </div>
            </div>

            {filteredJobs.map((job) => (
              <button 
                key={job.id}
                onClick={() => setSelectedJob(job)}
                className={`text-left p-5 rounded-[32px] border-2 transition-all group ${
                  selectedJob?.id === job.id 
                    ? 'bg-[#0A0A0A] border-[#0A0A0A] text-white shadow-xl translate-x-2' 
                    : 'bg-white border-[#D4D0CA] hover:border-[#FF4D00]'
                }`}
              >
                <div className="flex justify-between items-start mb-2">
                  <span className={`text-[9px] font-black uppercase tracking-widest ${selectedJob?.id === job.id ? 'text-[#FF4D00]' : 'text-[#6B6B6B]'}`}>
                    {job.id.slice(0, 8)}
                  </span>
                  <span className="text-[9px] font-bold opacity-60">
                    {job.proof_submitted_at ? new Date(job.proof_submitted_at).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) : '—'}
                  </span>
                </div>
                <h3 className="text-sm font-black uppercase tracking-tight mb-1 group-hover:text-[#FF4D00] transition-colors">{job.title}</h3>
                <p className={`text-[10px] font-bold ${selectedJob?.id === job.id ? 'text-white/60' : 'text-[#6B6B6B]'}`}>
                  Worker: {job.workers?.wallet_address ? `${job.workers.wallet_address.slice(0, 4)}...${job.workers.wallet_address.slice(-4)}` : 'Unknown'}
                </p>
              </button>
            ))}
          </div>

          {/* Right Side: Detailed View */}
          {selectedJob ? (
            <div className="flex-1 bg-white border-4 border-white rounded-[48px] shadow-2xl overflow-hidden flex flex-col relative">
              {actionLoading && (
                <div className={`absolute inset-0 z-[100] flex flex-col items-center justify-center text-white space-y-4 animate-in fade-in duration-300 ${
                  actionLoading === 'approve' ? 'bg-[#FF4D00]/90' : 'bg-red-600/90'
                }`}>
                  <div className="h-20 w-20 border-8 border-white border-t-transparent rounded-full animate-spin" />
                  <h2 className="text-2xl font-black uppercase tracking-widest">
                    {actionLoading === 'approve' ? 'Releasing Escrow...' : 'Rejecting & Refunding...'}
                  </h2>
                </div>
              )}

              {/* Top Bar */}
              <div className="p-8 border-b-2 border-[#F5F2ED] flex justify-between items-center">
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 bg-[#F5F2ED] rounded-2xl flex items-center justify-center">
                    <ShieldCheck className="h-6 w-6 text-[#FF4D00]" />
                  </div>
                  <div>
                    <h2 className="text-xl font-black text-[#0A0A0A] uppercase tracking-tighter">{selectedJob.title}</h2>
                    <p className="text-[10px] font-black text-[#6B6B6B] uppercase tracking-widest">
                      WORKER: {selectedJob.workers?.wallet_address ? `${selectedJob.workers.wallet_address.slice(0, 6)}...${selectedJob.workers.wallet_address.slice(-4)}` : '—'}
                    </p>
                  </div>
                </div>
                {selectedJob.escrow_tx && selectedJob.escrow_tx !== 'simulation-bypassed' && (
                  <a
                    href={`https://solscan.io/tx/${selectedJob.escrow_tx}?cluster=devnet`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="h-10 w-10 bg-[#F5F2ED] rounded-xl flex items-center justify-center hover:bg-[#FF4D00]/10 group transition-colors"
                  >
                    <ExternalLink className="h-5 w-5 text-[#6B6B6B] group-hover:text-[#FF4D00]" />
                  </a>
                )}
              </div>

              {/* Content Split */}
              <div className="flex-1 flex min-h-0 overflow-hidden">
                {/* Photo Evidence */}
                <div className="flex-1 bg-[#F5F2ED] p-8 overflow-y-auto">
                  <p className="text-[10px] font-black text-[#6B6B6B] uppercase tracking-widest mb-4">PHOTO EVIDENCE</p>
                  <div className="aspect-square bg-[#0A0A0A] rounded-[40px] flex items-center justify-center overflow-hidden border-4 border-white shadow-xl relative group">
                    {imgError[selectedJob.id] ? (
                      <div className="flex flex-col items-center justify-center gap-3 text-white/40 w-full h-full">
                        <Camera className="h-12 w-12 opacity-30" />
                        <span className="text-xs font-black uppercase tracking-widest">No photo uploaded</span>
                      </div>
                    ) : (
                      <img 
                        src={getProofImgUrl(selectedJob)} 
                        alt="Worker Proof Photo" 
                        className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity duration-500"
                        onError={() => setImgError(prev => ({ ...prev, [selectedJob.id]: true }))}
                      />
                    )}
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-6">
                      <div className="flex items-center gap-2">
                        <Camera className="h-3 w-3 text-white/80" />
                        <p className="text-white text-[10px] font-black uppercase tracking-widest">Captured via Mandora Worker App</p>
                      </div>
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
                        <span className="text-xs font-black text-[#0A0A0A]">{calcOffset(selectedJob)}</span>
                      </div>
                      <div className="flex items-center justify-between p-4 bg-[#F5F2ED] rounded-2xl">
                        <div className="flex items-center gap-2">
                          <Navigation className="h-4 w-4 text-[#FF4D00]" />
                          <span className="text-[10px] font-black uppercase tracking-tight">GPS</span>
                        </div>
                        <span className="text-[10px] font-black text-[#0A0A0A]">
                          {selectedJob.proof_gps_lat?.toFixed(4)}, {selectedJob.proof_gps_lng?.toFixed(4)}
                        </span>
                      </div>
                      <div className="flex items-center justify-between p-4 bg-[#F5F2ED] rounded-2xl">
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-[#FF4D00]" />
                          <span className="text-[10px] font-black uppercase tracking-tight">Timestamp</span>
                        </div>
                        <span className="text-xs font-black text-[#0A0A0A]">
                          {selectedJob.proof_submitted_at 
                            ? new Date(selectedJob.proof_submitted_at).toLocaleString('id-ID', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })
                            : '—'}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="p-6 bg-[#0A0A0A] rounded-[32px] text-white">
                    <p className="text-[9px] font-black text-[#6B6B6B] uppercase tracking-widest mb-1">REWARD AMOUNT</p>
                    <p className="text-2xl font-black text-[#FF4D00]">Rp {selectedJob.payout_idrx?.toLocaleString('id-ID')}</p>
                    <p className="text-[8px] font-bold text-white/40 mt-2">Locked in Mandora Smart Contract</p>
                  </div>

                  {/* Actions */}
                  <div className="space-y-3 pt-4">
                    <button 
                      onClick={handleApprove}
                      disabled={!!actionLoading || !publicKey}
                      className="w-full py-5 bg-[#FF4D00] text-white rounded-full font-black text-sm uppercase tracking-[0.2em] shadow-xl shadow-orange-200 flex items-center justify-center gap-3 hover:-translate-y-1 transition-all active:translate-y-0 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {actionLoading === 'approve' ? (
                        <><Loader2 className="h-5 w-5 animate-spin" /> Processing...</>
                      ) : (
                        <><CheckCircle2 className="h-5 w-5" /> Release Payment</>
                      )}
                    </button>
                    <button 
                      onClick={handleReject}
                      disabled={!!actionLoading || !publicKey}
                      className="w-full py-5 border-2 border-[#D4D0CA] text-[#0A0A0A] rounded-full font-black text-sm uppercase tracking-[0.2em] flex items-center justify-center gap-3 hover:bg-red-50 hover:border-red-200 hover:text-red-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {actionLoading === 'reject' ? (
                        <><Loader2 className="h-5 w-5 animate-spin" /> Processing...</>
                      ) : (
                        <><XCircle className="h-5 w-5" /> Reject Proof</>
                      )}
                    </button>
                    {!publicKey && (
                      <p className="text-center text-[10px] font-bold text-amber-600">Connect your wallet to approve or reject.</p>
                    )}
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
      )}
    </div>
  );
}
