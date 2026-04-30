'use client';

import React, { useState, useEffect } from 'react';
import { useWorkerWallet } from '@/components/worker/WorkerWalletContext';
import { Connection, PublicKey } from '@solana/web3.js';
import { getAssociatedTokenAddress } from '@solana/spl-token';
import { 
  TrendingUp, 
  ArrowDownLeft, 
  Wallet as WalletIcon,
  Zap,
  ExternalLink,
  Loader2,
  Camera,
  Clock,
  CheckCircle2
} from 'lucide-react';

const IDRX_DECIMALS = 6;
const IDRX_MINT = process.env.NEXT_PUBLIC_IDRX_MINT!;
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;

interface HistoryJob {
  id: string;
  title: string;
  payout_idrx: number;
  status: string;
  proof_submitted_at: string | null;
  proof_photo_url: string | null;
  escrow_tx: string | null;
  created_at: string;
}

export default function WalletPage() {
  const { publicKey, connected, logout } = useWorkerWallet();
  const [balance, setBalance] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState<HistoryJob[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);

  useEffect(() => {
    if (!publicKey || !connected) {
      setBalance(null);
      setHistory([]);
      return;
    }

    const loadBalance = async () => {
      setLoading(true);
      try {
        const connection = new Connection(process.env.NEXT_PUBLIC_SOLANA_RPC!, 'confirmed');
        const mint = new PublicKey(IDRX_MINT);
        const ata = await getAssociatedTokenAddress(mint, publicKey);
        
        try {
          const account = await connection.getTokenAccountBalance(ata);
          const raw = account.value.amount;
          const idrx = parseInt(raw) / Math.pow(10, IDRX_DECIMALS);
          setBalance(idrx);
        } catch {
          setBalance(0);
        }
      } catch {
        setBalance(null);
      } finally {
        setLoading(false);
      }
    };

    const loadHistory = async () => {
      setHistoryLoading(true);
      try {
        const res = await fetch(`/api/workers/${publicKey.toBase58()}/history`);
        const data = await res.json();
        setHistory(data.jobs || []);
      } catch {
        setHistory([]);
      } finally {
        setHistoryLoading(false);
      }
    };

    loadBalance();
    loadHistory();
    const interval = setInterval(loadBalance, 15000);
    return () => clearInterval(interval);
  }, [publicKey, connected]);

  const formatIdrx = (val: number) => {
    if (val >= 1_000_000) return `${(val / 1_000_000).toFixed(2)}M`;
    if (val >= 1_000) return `${(val / 1_000).toFixed(1)}K`;
    return val.toFixed(IDRX_DECIMALS > 0 ? 2 : 0);
  };

  // Compute this month's earnings
  const now = new Date();
  const thisMonthEarnings = history
    .filter(j => j.status === 'completed' && j.proof_submitted_at && new Date(j.proof_submitted_at).getMonth() === now.getMonth() && new Date(j.proof_submitted_at).getFullYear() === now.getFullYear())
    .reduce((sum, j) => sum + (j.payout_idrx || 0), 0);

  const completedCount = history.filter(j => j.status === 'completed').length;

  const getProofImgUrl = (job: HistoryJob) => {
    if (job.proof_photo_url) return job.proof_photo_url;
    return `${supabaseUrl}/storage/v1/object/public/proofs/job_proof_${job.id}.jpg`;
  };

  if (!connected) {
    return (
      <div className="p-8 max-w-md mx-auto flex flex-col items-center justify-center min-h-[60vh]">
        <div className="h-16 w-16 bg-white/5 rounded-full flex items-center justify-center mb-6">
          <WalletIcon className="h-8 w-8 text-[#FF4D00]" />
        </div>
        <h2 className="text-2xl font-black text-white uppercase tracking-tight text-center mb-2">Connect Wallet</h2>
        <p className="text-sm font-bold text-[#6B6B6B] text-center">Connect your Phantom wallet to view your IDRX balance and earnings.</p>
      </div>
    );
  }

  return (
    <div className="p-8 space-y-10 max-w-md mx-auto pb-32">
      {/* Header */}
      <div className="flex items-center justify-between pt-4">
        <div>
          <h1 className="text-4xl font-black text-white tracking-tighter uppercase leading-none">
            Your<br />Vault
          </h1>
          <p className="text-[10px] font-black text-[#6B6B6B] uppercase tracking-[0.2em] mt-2">
            MANDORA IDRX TREASURY
          </p>
        </div>
        <button onClick={logout} className="h-12 w-12 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center hover:bg-white/10 transition-colors">
          <WalletIcon className="h-6 w-6 text-[#FF4D00]" />
        </button>
      </div>

      {/* Balance Card */}
      <div className="bg-gradient-to-br from-[#FF4D00] to-[#E64500] p-8 rounded-[40px] shadow-2xl shadow-orange-900/40 relative overflow-hidden group">
        <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-3xl group-hover:scale-125 transition-transform duration-700" />
        
        <div className="space-y-1 relative z-10">
          <p className="text-[10px] font-black text-white/70 uppercase tracking-widest">IDRX BALANCE</p>
          {loading && balance === null ? (
            <div className="flex items-center gap-2">
              <Loader2 className="h-6 w-6 text-white/70 animate-spin" />
              <span className="text-2xl font-black text-white/70">Loading...</span>
            </div>
          ) : (
            <div className="flex items-baseline gap-2">
              <span className="text-4xl font-black text-white tracking-tighter">
                Rp {formatIdrx(balance ?? 0)}
              </span>
              <div className="flex items-center text-[10px] font-black text-white/90 bg-white/20 px-2 py-0.5 rounded-full">
                <TrendingUp className="h-3 w-3 mr-1" />
                IDRX
              </div>
            </div>
          )}
          <p className="text-[9px] font-bold text-white/50 mt-1">
            {publicKey?.toBase58().slice(0, 6)}...{publicKey?.toBase58().slice(-4)} · Devnet
          </p>
        </div>

        <div className="mt-10 flex gap-3 relative z-10">
          <button disabled className="flex-1 py-4 bg-white text-[#FF4D00] rounded-full font-black text-xs uppercase tracking-widest opacity-50 cursor-not-allowed">
            Cash Out
          </button>
          <a 
            href={`https://solscan.io/account/${publicKey?.toBase58()}?cluster=devnet`}
            target="_blank"
            rel="noopener noreferrer"
            className="h-12 w-12 bg-white/20 backdrop-blur-md text-white rounded-full flex items-center justify-center hover:bg-white/30 transition-all"
          >
            <ExternalLink className="h-5 w-5" />
          </a>
        </div>
      </div>

      {/* Stats Mini Grid */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-[#1A1A1A] p-6 rounded-[32px] border border-white/5">
          <p className="text-[9px] font-black text-[#6B6B6B] uppercase tracking-widest mb-1">THIS MONTH</p>
          <p className="text-xl font-black text-white uppercase tracking-tighter">
            Rp {historyLoading ? '...' : formatIdrx(thisMonthEarnings)}
          </p>
        </div>
        <div className="bg-[#1A1A1A] p-6 rounded-[32px] border border-white/5">
          <p className="text-[9px] font-black text-[#6B6B6B] uppercase tracking-widest mb-1">COMPLETED</p>
          <p className="text-xl font-black text-[#FF4D00] uppercase tracking-tighter">
            {historyLoading ? '...' : `${completedCount} Jobs`}
          </p>
        </div>
      </div>

      {/* Transaction History */}
      <div className="space-y-4">
        <h3 className="text-xs font-black text-white uppercase tracking-[0.2em]">Transaction History</h3>
        
        {historyLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-5 w-5 text-[#FF4D00] animate-spin" />
          </div>
        ) : history.length === 0 ? (
          <div className="bg-[#1A1A1A] p-8 rounded-[32px] border border-white/5 text-center">
            <p className="text-sm font-bold text-[#6B6B6B]">No jobs yet. Accept a task from Explore to get started!</p>
          </div>
        ) : (
          <div className="space-y-3">
            {history.map((job) => (
              <div key={job.id} className="bg-[#1A1A1A] p-4 rounded-[24px] border border-white/5 flex items-center gap-4 group hover:border-white/10 transition-all">
                {/* Photo Thumbnail */}
                <div className="h-14 w-14 rounded-2xl bg-[#0A0A0A] overflow-hidden flex-shrink-0 border border-white/5">
                  <img 
                    src={getProofImgUrl(job)} 
                    alt="" 
                    className="h-full w-full object-cover"
                    onError={(e) => {
                      (e.currentTarget as HTMLImageElement).style.display = 'none';
                    }}
                  />
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-black text-white uppercase tracking-tight truncate">{job.title}</span>
                    <span className={`text-[8px] font-black px-1.5 py-0.5 rounded uppercase flex-shrink-0 ${
                      job.status === 'completed' ? 'bg-green-500/20 text-green-400' :
                      job.status === 'pending_review' ? 'bg-[#FF4D00]/20 text-[#FF4D00]' :
                      job.status === 'cancelled' ? 'bg-red-500/20 text-red-400' :
                      'bg-white/10 text-[#6B6B6B]'
                    }`}>
                      {job.status === 'pending_review' ? 'review' : job.status}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-black text-[#FF4D00]">
                      {job.status === 'completed' ? '+' : ''}Rp {job.payout_idrx?.toLocaleString('id-ID')}
                    </span>
                    <span className="text-[9px] font-bold text-[#6B6B6B]">
                      {job.proof_submitted_at 
                        ? new Date(job.proof_submitted_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })
                        : new Date(job.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}
                    </span>
                  </div>
                </div>

                {/* Tx Link */}
                {job.escrow_tx && job.escrow_tx !== 'simulation-bypassed' && (
                  <a
                    href={`https://solscan.io/tx/${job.escrow_tx}?cluster=devnet`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="h-8 w-8 bg-white/5 rounded-lg flex items-center justify-center flex-shrink-0 hover:bg-white/10 transition-colors"
                  >
                    <ExternalLink className="h-3.5 w-3.5 text-[#6B6B6B]" />
                  </a>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
