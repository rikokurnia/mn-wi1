'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useWallet } from '@solana/wallet-adapter-react';
import DashboardSidebar from '@/components/ops/DashboardSidebar';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';

export default function OpsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { connected, disconnecting } = useWallet();
  const router = useRouter();
  const [mounted, setMounted] = React.useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Redirect to landing page if wallet is disconnected
  useEffect(() => {
    if (mounted && !connected && !disconnecting) {
      router.push('/');
    }
  }, [mounted, connected, disconnecting, router]);

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
            
            <WalletMultiButton className="!bg-[#0A0A0A] !text-white !h-12 !px-8 !text-sm !font-bold !rounded-full hover:!bg-black/80 !transition-all !border-none !shadow-xl !shadow-black/10" />
          </div>
        </header>
        
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
