'use client';

import React, { useState, useEffect } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { Connection, PublicKey } from '@solana/web3.js';
import { getAssociatedTokenAddress } from '@solana/spl-token';
import { 
  PiggyBank, 
  ArrowUpCircle, 
  History, 
  ShieldCheck, 
  CreditCard,
  Globe,
  ExternalLink,
  Loader2,
  ArrowRight
} from 'lucide-react';
import Link from 'next/link';

const IDRX_MINT = process.env.NEXT_PUBLIC_IDRX_MINT!;
const IDRX_DECIMALS = 6;

interface CompletedJob {
  id: string;
  title: string;
  payout_idrx: number;
  status: string;
  escrow_tx: string | null;
  proof_submitted_at: string | null;
  created_at: string;
  workers: { wallet_address: string } | null;
}

export default function TreasuryPage() {
  const { publicKey, connected } = useWallet();
  const [balance, setBalance] = useState<number | null>(null);
  const [completedJobs, setCompletedJobs] = useState<CompletedJob[]>([]);
  const [activeJobs, setActiveJobs] = useState<CompletedJob[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Fetch on-chain balance
        if (publicKey) {
          const connection = new Connection(process.env.NEXT_PUBLIC_SOLANA_RPC!, 'confirmed');
          const mint = new PublicKey(IDRX_MINT);
          const ata = await getAssociatedTokenAddress(mint, publicKey);
          try {
            const acct = await connection.getTokenAccountBalance(ata);
            setBalance(parseInt(acct.value.amount) / Math.pow(10, IDRX_DECIMALS));
          } catch {
            setBalance(0);
          }
        }

        // Fetch completed jobs (disbursements)
        const completedRes = await fetch('/api/jobs?status=completed');
        const completedData = await completedRes.json();
        setCompletedJobs(completedData.jobs || []);

        // Fetch active cost (open + assigned + pending_review)
        const [openRes, assignedRes, pendingRes] = await Promise.all([
          fetch('/api/jobs?status=open').then(r => r.json()),
          fetch('/api/jobs?status=assigned').then(r => r.json()),
          fetch('/api/jobs?status=pending_review').then(r => r.json()),
        ]);
        setActiveJobs([
          ...(openRes.jobs || []),
          ...(assignedRes.jobs || []),
          ...(pendingRes.jobs || []),
        ]);
      } catch (err) {
        console.error('Treasury fetch error:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [publicKey]);

  const totalDisbursed = completedJobs.reduce((sum, j) => sum + (j.payout_idrx || 0), 0);
  const activeJobsCost = activeJobs.reduce((sum, j) => sum + (j.payout_idrx || 0), 0);

  const formatIdrx = (val: number) => {
    if (val >= 1_000_000) return `${(val / 1_000_000).toFixed(1)}M`;
    if (val >= 1_000) return `${(val / 1_000).toFixed(0)}K`;
    return val.toLocaleString('id-ID');
  };

  return (
    <div className="p-8 space-y-10">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-black text-[#0A0A0A] tracking-tighter uppercase leading-none">
            Agency<br />Treasury
          </h1>
          <p className="text-[10px] font-black text-[#6B6B6B] uppercase tracking-[0.2em] mt-2">
            IDRX STABLECOIN ESCROW MANAGEMENT
          </p>
        </div>
        <div className="h-16 w-16 bg-[#0A0A0A] rounded-[32px] flex items-center justify-center shadow-xl shadow-black/10">
          <PiggyBank className="h-8 w-8 text-[#FF4D00]" />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Vault Balance */}
        <div className="lg:col-span-2 bg-[#0A0A0A] p-10 rounded-[48px] text-white relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-8">
            <Globe className="h-40 w-40 text-white/5 -mr-10 -mt-10 rotate-12 group-hover:scale-110 transition-transform duration-700" />
          </div>
          
          <div className="space-y-2 relative z-10">
            <p className="text-[10px] font-black text-[#6B6B6B] uppercase tracking-widest">CURRENT VAULT BALANCE</p>
            {loading ? (
              <div className="flex items-center gap-3">
                <Loader2 className="h-8 w-8 text-[#FF4D00] animate-spin" />
                <span className="text-2xl font-black text-[#6B6B6B]">Loading...</span>
              </div>
            ) : (
              <h2 className="text-6xl font-black text-[#FF4D00] tracking-tighter">
                Rp {balance !== null ? formatIdrx(balance) : '—'}
              </h2>
            )}
            <div className="flex items-center gap-2 text-[#6B6B6B] text-[10px] font-bold uppercase tracking-widest pt-2">
              <ShieldCheck className="h-4 w-4 text-green-500" />
              {connected ? 'On-chain balance via Solana Devnet' : 'Connect wallet to see balance'}
            </div>
          </div>

          <div className="mt-12 flex gap-4 relative z-10">
            <Link 
              href="/settings"
              className="px-8 py-5 bg-[#FF4D00] text-white rounded-full font-black text-sm uppercase tracking-[0.2em] shadow-xl shadow-orange-900/40 flex items-center gap-3 hover:-translate-y-1 transition-all active:translate-y-0"
            >
              <ArrowRight className="h-5 w-5" />
              Fund via Faucet
            </Link>
            {publicKey && (
              <a
                href={`https://solscan.io/account/${publicKey.toBase58()}?cluster=devnet`}
                target="_blank"
                rel="noopener noreferrer"
                className="px-8 py-5 bg-white/10 text-white rounded-full font-black text-sm uppercase tracking-[0.2em] flex items-center gap-3 hover:bg-white/20 transition-all"
              >
                <ExternalLink className="h-5 w-5" />
                Solscan
              </a>
            )}
          </div>
        </div>

        {/* Quick Stats Column */}
        <div className="space-y-4">
          <div className="bg-white border-2 border-[#D4D0CA] p-8 rounded-[40px] shadow-sm">
            <div className="flex items-center gap-3 text-[#6B6B6B] mb-2">
              <ArrowUpCircle className="h-4 w-4" />
              <span className="text-[10px] font-black uppercase tracking-widest">Total Disbursed</span>
            </div>
            <p className="text-2xl font-black text-[#0A0A0A]">
              Rp {loading ? '...' : formatIdrx(totalDisbursed)}
            </p>
            <p className="text-[9px] font-bold text-[#6B6B6B] mt-1">{completedJobs.length} jobs completed</p>
          </div>
          <div className="bg-white border-2 border-[#D4D0CA] p-8 rounded-[40px] shadow-sm">
            <div className="flex items-center gap-3 text-[#6B6B6B] mb-2">
              <CreditCard className="h-4 w-4" />
              <span className="text-[10px] font-black uppercase tracking-widest">Active Jobs Cost</span>
            </div>
            <p className="text-2xl font-black text-[#0A0A0A]">
              Rp {loading ? '...' : formatIdrx(activeJobsCost)}
            </p>
            <p className="text-[9px] font-bold text-[#6B6B6B] mt-1">{activeJobs.length} jobs in escrow</p>
          </div>
        </div>
      </div>

      {/* Disbursement History */}
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <History className="h-5 w-5 text-[#0A0A0A]" />
          <h3 className="text-sm font-black text-[#0A0A0A] uppercase tracking-[0.2em]">Disbursement History</h3>
        </div>

        <div className="bg-white border-2 border-[#D4D0CA] rounded-[40px] overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="bg-[#F5F2ED] text-left">
                <th className="p-6 text-[10px] font-black text-[#6B6B6B] uppercase tracking-widest">Job</th>
                <th className="p-6 text-[10px] font-black text-[#6B6B6B] uppercase tracking-widest">To Worker</th>
                <th className="p-6 text-[10px] font-black text-[#6B6B6B] uppercase tracking-widest">Amount</th>
                <th className="p-6 text-[10px] font-black text-[#6B6B6B] uppercase tracking-widest">Date</th>
                <th className="p-6 text-[10px] font-black text-[#6B6B6B] uppercase tracking-widest text-right">Tx Signature</th>
              </tr>
            </thead>
            <tbody className="divide-y-2 divide-[#F5F2ED]">
              {loading ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center">
                    <Loader2 className="h-5 w-5 text-[#FF4D00] animate-spin mx-auto" />
                  </td>
                </tr>
              ) : completedJobs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-sm font-bold text-[#6B6B6B]">
                    No disbursements yet. Complete a job cycle to see transactions here.
                  </td>
                </tr>
              ) : (
                completedJobs.map((job) => (
                  <tr key={job.id} className="hover:bg-[#F5F2ED]/50 transition-colors cursor-pointer group">
                    <td className="p-6">
                      <div className="text-xs font-black text-[#0A0A0A] uppercase">{job.title}</div>
                      <div className="text-[9px] font-bold text-[#6B6B6B] mt-0.5">{job.id.slice(0, 8)}</div>
                    </td>
                    <td className="p-6">
                      <div className="flex items-center gap-2">
                        <div className="h-6 w-6 rounded-lg bg-[#0A0A0A] flex items-center justify-center text-[8px] font-black text-white">
                          {job.workers?.wallet_address?.[0]?.toUpperCase() || 'W'}
                        </div>
                        <span className="text-xs font-bold text-[#0A0A0A]">
                          {job.workers?.wallet_address
                            ? `${job.workers.wallet_address.slice(0, 4)}...${job.workers.wallet_address.slice(-4)}`
                            : '—'}
                        </span>
                      </div>
                    </td>
                    <td className="p-6 text-xs font-black text-[#FF4D00]">Rp {job.payout_idrx?.toLocaleString('id-ID')}</td>
                    <td className="p-6 text-xs font-bold text-[#6B6B6B]">
                      {job.proof_submitted_at 
                        ? new Date(job.proof_submitted_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })
                        : new Date(job.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}
                    </td>
                    <td className="p-6 text-right">
                      {job.escrow_tx && job.escrow_tx !== 'simulation-bypassed' ? (
                        <a
                          href={`https://solscan.io/tx/${job.escrow_tx}?cluster=devnet`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[10px] font-mono text-[#6B6B6B] bg-[#F5F2ED] px-3 py-1 rounded-full group-hover:text-[#FF4D00] transition-colors inline-flex items-center gap-1"
                        >
                          {job.escrow_tx.slice(0, 8)}...
                          <ExternalLink className="h-3 w-3" />
                        </a>
                      ) : (
                        <span className="text-[10px] font-mono text-[#6B6B6B]">—</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
