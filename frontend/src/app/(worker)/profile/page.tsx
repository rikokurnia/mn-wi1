'use client';

import React from 'react';
import { 
  ShieldCheck, 
  Award, 
  MapPin, 
  CheckCircle2, 
  ChevronRight,
  Settings,
  Bell,
  HelpCircle,
  LogOut,
  Zap
} from 'lucide-react';

const stats = [
  { label: 'Completed', value: '42', icon: CheckCircle2 },
  { label: 'Accuracy', value: '98%', icon: ShieldCheck },
  { label: 'Level', value: '04', icon: Award },
];

const achievements = [
  { id: 1, title: 'Early Bird', icon: '🌅', color: 'bg-amber-100/10' },
  { id: 2, title: 'Sudirman King', icon: '🏙️', color: 'bg-blue-100/10' },
  { id: 3, title: 'Trusted', icon: '✅', color: 'bg-green-100/10' },
];

export default function ProfilePage() {
  return (
    <div className="p-8 space-y-10 max-w-md mx-auto pb-24">
      {/* Profile Header */}
      <div className="flex flex-col items-center text-center space-y-4 pt-6">
        <div className="relative">
          <div className="h-32 w-32 rounded-[48px] bg-gradient-to-tr from-[#FF4D00] to-[#7B6EF6] p-1 shadow-2xl">
            <div className="h-full w-full rounded-[44px] bg-[#0A0A0A] p-1">
              <img 
                src="https://api.dicebear.com/7.x/avataaars/svg?seed=Mandora" 
                alt="avatar" 
                className="h-full w-full rounded-[40px] object-cover"
              />
            </div>
          </div>
          <div className="absolute -bottom-2 -right-2 bg-[#FF4D00] text-white px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border-4 border-[#0A0A0A]">
            LVL 4
          </div>
        </div>
        
        <div>
          <h1 className="text-3xl font-black text-white uppercase tracking-tighter leading-none">
            Riko Kurnia
          </h1>
          <p className="text-[10px] font-black text-[#6B6B6B] uppercase tracking-[0.3em] mt-2">
            TRUST SCORE: 940 / 1000
          </p>
        </div>
      </div>

      {/* Trust Progress Bar */}
      <div className="bg-[#1A1A1A] p-6 rounded-[32px] border border-white/5 space-y-4">
        <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest">
          <span className="text-[#6B6B6B]">Trust Progress</span>
          <span className="text-[#FF4D00]">94%</span>
        </div>
        <div className="h-3 w-full bg-white/5 rounded-full overflow-hidden p-0.5">
          <div className="h-full bg-gradient-to-r from-[#FF4D00] to-[#7B6EF6] rounded-full shadow-[0_0_20px_rgba(255,77,0,0.5)]" style={{ width: '94%' }} />
        </div>
        <p className="text-[9px] font-bold text-[#6B6B6B] text-center leading-relaxed">
          Maintain high accuracy to unlock high-reward Agency tasks.
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-3 gap-3">
        {stats.map((stat) => (
          <div key={stat.label} className="bg-[#1A1A1A] p-4 rounded-[28px] border border-white/5 flex flex-col items-center justify-center text-center space-y-1">
            <stat.icon className="h-4 w-4 text-[#FF4D00] mb-1" />
            <div className="text-sm font-black text-white">{stat.value}</div>
            <div className="text-[8px] font-black text-[#6B6B6B] uppercase tracking-widest">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Achievements */}
      <div className="space-y-4">
        <h3 className="text-sm font-black text-white uppercase tracking-[0.2em]">Achievements</h3>
        <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
          {achievements.map((item) => (
            <div key={item.id} className={`${item.color} h-20 w-20 flex-shrink-0 rounded-[28px] border border-white/5 flex flex-col items-center justify-center gap-1 grayscale opacity-50 hover:grayscale-0 hover:opacity-100 transition-all cursor-pointer`}>
              <span className="text-2xl">{item.icon}</span>
              <span className="text-[8px] font-black text-white uppercase tracking-tighter">{item.title}</span>
            </div>
          ))}
          <div className="h-20 w-20 flex-shrink-0 rounded-[28px] bg-white/5 border border-dashed border-white/10 flex items-center justify-center">
            <span className="text-xl opacity-20">?</span>
          </div>
        </div>
      </div>

      {/* Menu Links */}
      <div className="space-y-2">
        <h3 className="text-sm font-black text-white uppercase tracking-[0.2em] mb-4">Settings</h3>
        {[
          { label: 'Notifications', icon: Bell },
          { label: 'Identity Verification', icon: ShieldCheck, detail: 'Level 2' },
          { label: 'Security & Privacy', icon: Settings },
          { label: 'Support Center', icon: HelpCircle },
        ].map((item) => (
          <button key={item.label} className="w-full bg-[#1A1A1A]/50 border border-white/5 p-5 rounded-[28px] flex items-center justify-between group hover:bg-[#1A1A1A] transition-all">
            <div className="flex items-center gap-4">
              <div className="h-10 w-10 bg-white/5 rounded-2xl flex items-center justify-center group-hover:bg-[#FF4D00]/10 transition-colors">
                <item.icon className="h-5 w-5 text-[#6B6B6B] group-hover:text-[#FF4D00] transition-colors" />
              </div>
              <div className="text-left">
                <div className="text-xs font-black text-white uppercase tracking-tight">{item.label}</div>
                {item.detail && <div className="text-[9px] font-black text-[#FF4D00] uppercase tracking-widest mt-0.5">{item.detail}</div>}
              </div>
            </div>
            <ChevronRight className="h-5 w-5 text-[#6B6B6B]" />
          </button>
        ))}
        
        <button className="w-full mt-6 bg-red-500/10 border border-red-500/20 p-5 rounded-[28px] flex items-center justify-center gap-3 text-red-500 font-black text-xs uppercase tracking-[0.2em] hover:bg-red-500/20 transition-all">
          <LogOut className="h-4 w-4" />
          Disconnect Wallet
        </button>
      </div>
    </div>
  );
}
