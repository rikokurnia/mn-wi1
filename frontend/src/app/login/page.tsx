'use client';

import { useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const { connected } = useWallet();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (connected) {
      router.push('/onboarding');
    }
  }, [connected, router]);

  if (!mounted) return null;

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#E8E4DE] p-6 relative overflow-hidden">
      {/* Dot pattern overlay */}
      <div 
        className="fixed inset-0 pointer-events-none z-0" 
        style={{ 
          backgroundImage: 'radial-gradient(circle, #C8C4BE 1px, transparent 1px)',
          backgroundSize: '20px 20px',
          opacity: 0.5
        }} 
      />

      <div className="max-w-md w-full bg-white border-2 border-[#D4D0CA] rounded-[40px] shadow-2xl p-12 text-center relative z-10 transition-all hover:border-[#FF4D00]">
        <div className="mb-10">
          <div className="h-16 w-16 bg-[#FF4D00] rounded-2xl mx-auto mb-6 flex items-center justify-center shadow-lg shadow-orange-200">
            <span className="text-white font-black text-2xl">M</span>
          </div>
          <h1 className="text-4xl font-black text-[#0A0A0A] tracking-tighter uppercase mb-4">
            Authorize<br />Access
          </h1>
          <p className="text-[#6B6B6B] font-bold text-sm leading-relaxed px-4">
            CONNECT YOUR SOLANA WALLET TO ENTER THE MANDORA OPS CONSOLE.
          </p>
        </div>

        <div className="flex justify-center mb-10">
          <WalletMultiButton className="!bg-[#0A0A0A] hover:!bg-black/80 !transition-all !rounded-full !h-14 !px-10 !text-sm !font-black !uppercase !tracking-widest !shadow-xl !shadow-black/10" />
        </div>

        <div className="pt-8 border-t border-[#D4D0CA]">
          <p className="text-[10px] font-black text-[#6B6B6B] uppercase tracking-[0.2em] leading-loose">
            MANDORA LABOR PROTOCOL — SECURE ON-CHAIN VERIFICATION<br />
            JAKARTA, ID
          </p>
        </div>
      </div>
    </div>
  );
}
