'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useWallet, useConnection } from '@solana/wallet-adapter-react';
import DashboardSidebar from '@/components/ops/DashboardSidebar';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { getAssociatedTokenAddress } from '@solana/spl-token';
import { PublicKey } from '@solana/web3.js';
import { Coins, Loader2 } from 'lucide-react';

export default function OpsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { publicKey, connected, disconnecting } = useWallet();
  const { connection } = useConnection();
  const router = useRouter();
  const [mounted, setMounted] = React.useState(false);
  const [balance, setBalance] = React.useState<number | null>(null);
  const [balanceLoading, setBalanceLoading] = React.useState(false);

  const IDRX_MINT = process.env.NEXT_PUBLIC_IDRX_MINT!;
  const IDRX_DECIMALS = 6;

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!publicKey || !connected) {
      setBalance(null);
      return;
    }

    const fetchBalance = async () => {
      setBalanceLoading(true);
      try {
        const mint = new PublicKey(IDRX_MINT);
        const ata = await getAssociatedTokenAddress(mint, publicKey);
        
        try {
          const account = await connection.getTokenAccountBalance(ata);
          const val = parseInt(account.value.amount) / Math.pow(10, IDRX_DECIMALS);
          setBalance(val);
        } catch {
          // Token account doesn't exist
          setBalance(0);
        }
      } catch (err) {
        console.error('Balance fetch error:', err);
      } finally {
        setBalanceLoading(false);
      }
    };

    fetchBalance();
    const interval = setInterval(fetchBalance, 30000); // 30s refresh
    return () => clearInterval(interval);
  }, [publicKey, connected, connection, IDRX_MINT]);

  // Redirect to landing page if wallet is disconnected
  useEffect(() => {
    if (mounted && !connected && !disconnecting) {
      router.push('/');
    }
  }, [mounted, connected, disconnecting, router]);

  const formatIdrx = (val: number) => {
    if (val >= 1_000_000) return `${(val / 1_000_000).toFixed(2)}M`;
    if (val >= 1_000) return `${(val / 1_000).toFixed(1)}K`;
    return val.toLocaleString(undefined, { maximumFractionDigits: 0 });
  };

  return (
    <div className="flex min-h-screen bg-[#E8E4DE] font-sans selection:bg-[#FF4D00] selection:text-white">
      {/* Dot pattern overlay matching landing page */}
      <div 
        className="fixed inset-0 pointer-events-none z-0" 
        style={{ 
          backgroundImage: 'radial-gradient(circle, #C8C4BE 1px, transparent 1px)',
          backgroundSize: '20px 20px',
          opacity: 0.5
        }} 
      />
      
      <DashboardSidebar />
      
      <div className="flex-1 flex flex-col relative z-10">
        <header className="h-24 border-b border-[#D4D0CA] bg-[#E8E4DE]/80 backdrop-blur-xl px-10 flex items-center justify-between sticky top-0 z-20">
          <div>
            <h2 className="text-[10px] font-black text-[#6B6B6B] uppercase tracking-[0.3em]">
              Mandora Ops Console
            </h2>
            <div className="flex items-center gap-2 mt-1">
              <div className="h-2 w-2 bg-[#FF4D00] rounded-full animate-pulse" />
              <span className="text-xs font-bold text-[#0A0A0A]">Solana Devnet Active</span>
            </div>
          </div>
          
          <div className="flex items-center gap-6">
            <div className="flex items-center -space-x-2">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-8 w-8 rounded-full border-2 border-[#E8E4DE] bg-[#D4D0CA] overflow-hidden">
                  <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${i}`} alt="avatar" />
                </div>
              ))}
              <div className="h-8 px-2 min-w-[32px] rounded-full border-2 border-[#E8E4DE] bg-[#0A0A0A] text-[10px] font-bold text-white flex items-center justify-center">
                +12
              </div>
            </div>
            
            {connected && (
              <div className="flex items-center gap-2 bg-white border border-[#D4D0CA] h-12 px-5 rounded-full shadow-sm">
                <div className="h-6 w-6 bg-[#FF4D00]/10 rounded-full flex items-center justify-center">
                  <Coins className="h-3.5 w-3.5 text-[#FF4D00]" />
                </div>
                <div className="flex flex-col">
                  <span className="text-[8px] font-black text-[#6B6B6B] uppercase tracking-wider leading-none mb-0.5">
                    Agency Balance
                  </span>
                  <div className="flex items-center gap-1.5">
                    {balanceLoading && balance === null ? (
                      <Loader2 className="h-3 w-3 animate-spin text-[#0A0A0A]" />
                    ) : (
                      <span className="text-sm font-black text-[#0A0A0A]">
                        {formatIdrx(balance ?? 0)} <span className="text-[10px] text-[#6B6B6B]">IDRX</span>
                      </span>
                    )}
                  </div>
                </div>
              </div>
            )}
            
            {mounted && (
              <WalletMultiButton className="!bg-[#0A0A0A] !text-white !h-12 !px-8 !text-sm !font-bold !rounded-full hover:!bg-black/80 !transition-all !border-none !shadow-xl !shadow-black/10" />
            )}
          </div>
        </header>
        
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
