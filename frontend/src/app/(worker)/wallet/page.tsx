'use client';

import React from 'react';
import { 
  TrendingUp, 
  ArrowDownLeft, 
  ArrowUpRight, 
  Wallet as WalletIcon,
  Zap,
  ExternalLink
} from 'lucide-react';

const transactions = [
  { id: 'TX-4921', job: 'AC Maintenance - Kuningan', date: 'Oct 24, 2023', amount: '150,000', type: 'credit', status: 'Completed' },
  { id: 'TX-4812', job: 'Poster Audit - Sudirman', date: 'Oct 22, 2023', amount: '50,000', type: 'credit', status: 'Completed' },
  { id: 'TX-4755', job: 'Cash-out to Bank', date: 'Oct 20, 2023', amount: '200,000', type: 'debit', status: 'Processing' },
  { id: 'TX-4610', job: 'Cleanliness Check - Menteng', date: 'Oct 18, 2023', amount: '120,000', type: 'credit', status: 'Completed' },
];

export default function WalletPage() {
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
          <p className="text-[10px] font-black text-white/70 uppercase tracking-widest">TOTAL EARNINGS</p>
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-black text-white tracking-tighter">Rp 1.420.000</span>
            <div className="flex items-center text-[10px] font-black text-white/90 bg-white/20 px-2 py-0.5 rounded-full">
              <TrendingUp className="h-3 w-3 mr-1" />
              +12%
            </div>
          </div>
        </div>

        <div className="mt-10 flex gap-3 relative z-10">
          <button className="flex-1 py-4 bg-white text-[#FF4D00] rounded-full font-black text-xs uppercase tracking-widest hover:bg-white/90 transition-all active:scale-[0.98]">
            Cash Out
          </button>
          <button className="h-12 w-12 bg-white/20 backdrop-blur-md text-white rounded-full flex items-center justify-center hover:bg-white/30 transition-all">
            <ExternalLink className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Stats Mini Grid */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-[#1A1A1A] p-6 rounded-[32px] border border-white/5">
          <p className="text-[9px] font-black text-[#6B6B6B] uppercase tracking-widest mb-1">THIS MONTH</p>
          <p className="text-xl font-black text-white uppercase tracking-tighter">Rp 540k</p>
        </div>
        <div className="bg-[#1A1A1A] p-6 rounded-[32px] border border-white/5">
          <p className="text-[9px] font-black text-[#6B6B6B] uppercase tracking-widest mb-1">GAS SAVED</p>
          <p className="text-xl font-black text-[#FF4D00] uppercase tracking-tighter">0.04 SOL</p>
        </div>
      </div>

      {/* History */}
      <div className="space-y-6 pb-12">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-black text-white uppercase tracking-[0.2em]">Activity History</h3>
          <button className="text-[10px] font-black text-[#6B6B6B] uppercase tracking-widest border-b border-[#6B6B6B] pb-0.5">Filter</button>
        </div>

        <div className="space-y-4">
          {transactions.map((tx) => (
            <div key={tx.id} className="bg-[#1A1A1A]/50 border border-white/5 p-5 rounded-[28px] flex items-center justify-between hover:bg-[#1A1A1A] transition-all group cursor-pointer">
              <div className="flex items-center gap-4">
                <div className={`h-10 w-10 rounded-2xl flex items-center justify-center ${
                  tx.type === 'credit' ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'
                }`}>
                  {tx.type === 'credit' ? <ArrowDownLeft className="h-5 w-5" /> : <ArrowUpRight className="h-5 w-5" />}
                </div>
                <div>
                  <div className="text-xs font-black text-white uppercase tracking-tight group-hover:text-[#FF4D00] transition-colors">{tx.job}</div>
                  <div className="text-[10px] font-bold text-[#6B6B6B] mt-1">{tx.date}</div>
                </div>
              </div>
              <div className="text-right">
                <div className={`text-sm font-black ${tx.type === 'credit' ? 'text-white' : 'text-[#6B6B6B]'}`}>
                  {tx.type === 'credit' ? '+' : '-'}{tx.amount}
                </div>
                <div className={`text-[8px] font-black uppercase tracking-widest mt-1 ${
                  tx.status === 'Completed' ? 'text-green-500/50' : 'text-amber-500/50'
                }`}>
                  {tx.status}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
