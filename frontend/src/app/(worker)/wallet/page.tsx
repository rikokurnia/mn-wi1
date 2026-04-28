'use client';

import React, { useState, useEffect } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { Connection, PublicKey } from '@solana/web3.js';
import { getAssociatedTokenAddress } from '@solana/spl-token';
import { 
  TrendingUp, 
  ArrowDownLeft, 
  ArrowUpRight,
  Wallet as WalletIcon,
  Zap,
  ExternalLink,
  Loader2
} from 'lucide-react';

const IDRX_DECIMALS = 6;
const IDRX_MINT = process.env.NEXT_PUBLIC_IDRX_MINT!;

export default function WalletPage() {
  const { publicKey, connected } = useWallet();
  const [balance, setBalance] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!publicKey || !connected) {
      setBalance(null);
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
          // ATA doesn't exist yet — balance is 0
          setBalance(0);
        }
      } catch {
        setBalance(null);
      } finally {
        setLoading(false);
      }
    };

    loadBalance();
    const interval = setInterval(loadBalance, 15000); // refresh every 15s
    return () => clearInterval(interval);
  }, [publicKey, connected]);

  const formatIdrx = (val: number) => {
    if (val >= 1_000_000) return `${(val / 1_000_000).toFixed(2)}M`;
    if (val >= 1_000) return `${(val / 1_000).toFixed(1)}K`;
    return val.toFixed(IDRX_DECIMALS > 0 ? 2 : 0);
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
    <div className="p-8 space-y-10 max-w-md mx-auto">
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
        <div className="h-12 w-12 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center">
          <WalletIcon className="h-6 w-6 text-[#FF4D00]" />
        </div>
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
          <p className="text-xl font-black text-white uppercase tracking-tighter">Rp 0</p>
        </div>
        <div className="bg-[#1A1A1A] p-6 rounded-[32px] border border-white/5">
          <p className="text-[9px] font-black text-[#6B6B6B] uppercase tracking-widest mb-1">GAS SAVED</p>
          <p className="text-xl font-black text-[#FF4D00] uppercase tracking-tighter">0 SOL</p>
        </div>
      </div>

      {/* How it works */}
      <div className="bg-[#1A1A1A] p-6 rounded-[32px] border border-white/5">
        <h3 className="text-xs font-black text-white uppercase tracking-widest mb-4">How Payment Works</h3>
        <div className="space-y-3">
          {[
            { icon: Zap, label: 'Complete a task', desc: 'Submit GPS + photo proof' },
            { icon: TrendingUp, label: 'Auto-release', desc: 'IDRX sent to your wallet instantly' },
            { icon: ArrowDownLeft, label: 'Track earnings', desc: 'Balance updates in real-time' },
          ].map(({ icon: Icon, label, desc }) => (
            <div key={label} className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-xl bg-[#FF4D00]/10 flex items-center justify-center flex-shrink-0">
                <Icon className="h-4 w-4 text-[#FF4D00]" />
              </div>
              <div>
                <p className="text-xs font-black text-white">{label}</p>
                <p className="text-[10px] font-bold text-[#6B6B6B]">{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
