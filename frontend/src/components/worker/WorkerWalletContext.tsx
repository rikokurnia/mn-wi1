'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { Keypair, PublicKey, Transaction } from '@solana/web3.js';
import bs58 from 'bs58';
import { Loader2, Phone, ArrowRight, ShieldCheck } from 'lucide-react';

interface WorkerWalletContextState {
  publicKey: PublicKey | null;
  connected: boolean;
  signTransaction: (tx: Transaction) => Promise<Transaction>;
  signAllTransactions: (txs: Transaction[]) => Promise<Transaction[]>;
  logout: () => void;
}

const WorkerWalletContext = createContext<WorkerWalletContextState>({
  publicKey: null,
  connected: false,
  signTransaction: async (tx) => tx,
  signAllTransactions: async (txs) => txs,
  logout: () => {},
});

export const useWorkerWallet = () => useContext(WorkerWalletContext);

export function WorkerWalletProvider({ children }: { children: React.ReactNode }) {
  const [keypair, setKeypair] = useState<Keypair | null>(null);
  const [loading, setLoading] = useState(true);
  const [phone, setPhone] = useState('');
  const [loggingIn, setLoggingIn] = useState(false);

  useEffect(() => {
    const savedSecret = localStorage.getItem('worker_secret');
    if (savedSecret) {
      try {
        const kp = Keypair.fromSecretKey(bs58.decode(savedSecret));
        setKeypair(kp);
      } catch (e) {
        localStorage.removeItem('worker_secret');
      }
    }
    setLoading(false);
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone || phone.length < 8) return;
    
    setLoggingIn(true);
    
    try {
      // 1. Generate Burner Wallet
      const newKeypair = Keypair.generate();
      const secret = bs58.encode(newKeypair.secretKey);
      
      // 2. Fund it with a tiny bit of SOL for gas
      await fetch('/api/fund', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ walletAddress: newKeypair.publicKey.toBase58() })
      });

      // 3. Save to local storage
      localStorage.setItem('worker_secret', secret);
      setKeypair(newKeypair);
    } catch (err) {
      console.error('Failed to create worker wallet', err);
      alert('Network error while provisioning wallet. Please try again.');
    } finally {
      setLoggingIn(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('worker_secret');
    setKeypair(null);
  };

  const signTransaction = async (tx: Transaction) => {
    if (!keypair) throw new Error('Wallet not connected');
    tx.partialSign(keypair);
    return tx;
  };

  const signAllTransactions = async (txs: Transaction[]) => {
    if (!keypair) throw new Error('Wallet not connected');
    txs.forEach(tx => tx.partialSign(keypair));
    return txs;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0A0A0A] flex flex-col items-center justify-center">
        <Loader2 className="h-10 w-10 text-[#FF4D00] animate-spin" />
      </div>
    );
  }

  if (!keypair) {
    return (
      <div className="min-h-screen bg-[#0A0A0A] text-white flex flex-col p-6 items-center justify-center overflow-hidden relative">
        <div className="absolute top-[-20%] left-[-10%] w-[120%] h-[50%] bg-[#FF4D00] rounded-full blur-[120px] opacity-20 pointer-events-none" />
        
        <div className="w-full max-w-sm space-y-10 relative z-10">
          <div className="text-center space-y-4">
            <div className="w-20 h-20 bg-white/5 border-2 border-white/10 rounded-3xl mx-auto flex items-center justify-center shadow-2xl mb-8">
              <ShieldCheck className="h-10 w-10 text-[#FF4D00]" />
            </div>
            <h1 className="text-4xl font-black uppercase tracking-tighter">Worker Portal</h1>
            <p className="text-xs font-bold text-[#6B6B6B] px-4 leading-relaxed">
              Enter your phone number to access tasks. No crypto wallet or seed phrase required.
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-[#6B6B6B] uppercase tracking-widest ml-4">PHONE NUMBER</label>
              <div className="relative">
                <input 
                  type="tel" 
                  placeholder="+62 812 3456 7890"
                  className="w-full bg-white/5 border-2 border-white/10 p-5 pl-14 rounded-[24px] font-bold text-white outline-none focus:border-[#FF4D00] transition-all focus:bg-white/10"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  disabled={loggingIn}
                />
                <Phone className="absolute left-5 top-1/2 -translate-y-1/2 h-5 w-5 text-[#6B6B6B]" />
              </div>
            </div>

            <button 
              type="submit"
              disabled={loggingIn || phone.length < 8}
              className="w-full py-6 bg-[#FF4D00] text-white rounded-[24px] font-black text-sm uppercase tracking-widest shadow-xl shadow-orange-900/20 flex items-center justify-center gap-3 active:scale-[0.98] disabled:opacity-50 transition-all"
            >
              {loggingIn ? (
                <><Loader2 className="h-5 w-5 animate-spin" /> Provisioning Account...</>
              ) : (
                <>Sign In Securely <ArrowRight className="h-5 w-5" /></>
              )}
            </button>
          </form>

          <div className="text-center space-y-2">
             <p className="text-[10px] font-black text-[#6B6B6B] uppercase tracking-widest">
               Powered by Mandora Zero-Friction Trust Protocol
             </p>
          </div>
        </div>
      </div>
    );
  }

  const value = {
    publicKey: keypair.publicKey,
    connected: true,
    signTransaction,
    signAllTransactions,
    logout,
  };

  return (
    <WorkerWalletContext.Provider value={value}>
      {children}
    </WorkerWalletContext.Provider>
  );
}
