'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  Map as MapIcon, 
  Zap, 
  Wallet, 
  User 
} from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

import { WorkerWalletProvider } from '@/components/worker/WorkerWalletContext';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const navItems = [
  { name: 'Explore', href: '/explore', icon: MapIcon },
  { name: 'Active', href: '/active', icon: Zap },
  { name: 'Wallet', href: '/wallet', icon: Wallet },
  { name: 'Profile', href: '/profile', icon: User },
];

export default function WorkerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  return (
    <WorkerWalletProvider>
      <div className="flex flex-col min-h-screen bg-[#0A0A0A] text-white font-sans overflow-hidden">
        {/* Main Content */}
        <main className="flex-1 relative pb-20">
          {children}
        </main>

        {/* Bottom Navigation (Mobile Only / Centered for desktop demo) */}
        <nav className="fixed bottom-0 left-0 right-0 z-[1000] px-6 pb-6 pt-2 pointer-events-none">
          <div className="max-w-md mx-auto bg-[#1A1A1A]/80 backdrop-blur-2xl border border-white/10 rounded-full flex items-center justify-around p-2 pointer-events-auto shadow-2xl shadow-black">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    "flex flex-col items-center justify-center p-3 rounded-full transition-all relative overflow-hidden group",
                    isActive ? "text-[#FF4D00]" : "text-[#6B6B6B] hover:text-white"
                  )}
                >
                  <item.icon className={cn("h-6 w-6 relative z-10 transition-transform", isActive && "scale-110")} />
                  {isActive && (
                    <div className="absolute inset-0 bg-[#FF4D00]/10 rounded-full animate-pulse" />
                  )}
                  <span className={cn(
                    "text-[8px] font-black uppercase tracking-widest mt-1 opacity-0 transition-opacity",
                    isActive && "opacity-100"
                  )}>
                    {item.name}
                  </span>
                </Link>
              );
            })}
          </div>
        </nav>
      </div>
    </WorkerWalletProvider>
  );
}
