'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  Briefcase, 
  CheckCircle2, 
  Wallet, 
  Settings,
  PlusCircle,
  LogOut
} from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const navItems = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Job Board', href: '/jobs', icon: Briefcase },
  { name: 'Proof Desk', href: '/proofs', icon: CheckCircle2 },
  { name: 'Treasury', href: '/treasury', icon: Wallet },
];

export default function DashboardSidebar() {
  const pathname = usePathname();

  return (
    <div className="w-72 bg-[#F5F2ED] border-r border-[#D4D0CA] flex flex-col h-screen sticky top-0 z-20">
      <div className="p-8">
        <Link href="/" className="flex items-center gap-3">
          <div className="h-10 w-10 bg-[#FF4D00] rounded-xl flex items-center justify-center shadow-lg shadow-orange-200">
            <span className="text-white font-black text-lg">M</span>
          </div>
          <span className="text-2xl font-black text-[#0A0A0A] tracking-tighter">Mandora</span>
        </Link>
      </div>

      <nav className="flex-1 px-4 space-y-1.5">
        <p className="px-4 text-[10px] font-black text-[#6B6B6B] uppercase tracking-[0.2em] mb-4">
          Management
        </p>
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-bold transition-all duration-200",
                isActive 
                  ? "bg-[#FF4D00] text-white shadow-md shadow-orange-100" 
                  : "text-[#0A0A0A] hover:bg-black/5"
              )}
            >
              <item.icon className={cn("h-5 w-5", isActive ? "text-white" : "text-[#0A0A0A]")} />
              {item.name}
            </Link>
          );
        })}
        
        <div className="pt-8 px-2">
          <Link
            href="/jobs/new"
            className="flex items-center justify-center gap-2 w-full py-4 rounded-full text-sm font-black bg-[#0A0A0A] text-white hover:bg-black/80 transition-all hover:-translate-y-0.5"
          >
            <PlusCircle className="h-5 w-5" />
            POST NEW JOB
          </Link>
        </div>
      </nav>

      <div className="p-6 border-t border-[#D4D0CA]">
        <Link
          href="/settings"
          className="flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-bold text-[#0A0A0A] hover:bg-black/5 transition-all"
        >
          <Settings className="h-5 w-5" />
          Settings
        </Link>
        <button
          className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-bold text-red-600 hover:bg-red-50 transition-all mt-1"
        >
          <LogOut className="h-5 w-5" />
          Logout
        </button>
      </div>
    </div>
  );
}
