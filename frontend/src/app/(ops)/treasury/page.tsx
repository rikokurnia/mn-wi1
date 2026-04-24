'use client';

import React from 'react';
import { 
  PiggyBank, 
  ArrowUpCircle, 
  History, 
  ShieldCheck, 
  CreditCard,
  Plus,
  BarChart3,
  Globe
} from 'lucide-react';

const disbursements = [
  { id: 'DB-291', to: 'Riko K.', amount: '150,000', date: 'Just now', tx: '5f9a...e3' },
  { id: 'DB-290', to: 'Alex S.', amount: '50,000', date: '2h ago', tx: '1c4b...d2' },
  { id: 'DB-289', to: 'Maya T.', amount: '120,000', date: '5h ago', tx: '9e2f...a1' },
  { id: 'DB-288', to: 'Budi W.', amount: '150,000', date: '1d ago', tx: '3a1d...c9' },
];

export default function TreasuryPage() {
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
            <h2 className="text-6xl font-black text-[#FF4D00] tracking-tighter">Rp 24.500.000</h2>
            <div className="flex items-center gap-2 text-[#6B6B6B] text-[10px] font-bold uppercase tracking-widest pt-2">
              <ShieldCheck className="h-4 w-4 text-green-500" />
              Fully Collateralized via Mandora Smart Contract
            </div>
          </div>

          <div className="mt-12 flex gap-4 relative z-10">
            <button className="px-8 py-5 bg-[#FF4D00] text-white rounded-full font-black text-sm uppercase tracking-[0.2em] shadow-xl shadow-orange-900/40 flex items-center gap-3 hover:-translate-y-1 transition-all active:translate-y-0">
              <Plus className="h-5 w-5" />
              Fund Vault
            </button>
            <button className="px-8 py-5 bg-white/10 text-white rounded-full font-black text-sm uppercase tracking-[0.2em] flex items-center gap-3 hover:bg-white/20 transition-all">
              <BarChart3 className="h-5 w-5" />
              Analytics
            </button>
          </div>
        </div>

        {/* Quick Stats Column */}
        <div className="space-y-4">
          <div className="bg-white border-2 border-[#D4D0CA] p-8 rounded-[40px] shadow-sm">
            <div className="flex items-center gap-3 text-[#6B6B6B] mb-2">
              <ArrowUpCircle className="h-4 w-4" />
              <span className="text-[10px] font-black uppercase tracking-widest">Total Disbursed</span>
            </div>
            <p className="text-2xl font-black text-[#0A0A0A]">Rp 8.4M</p>
          </div>
          <div className="bg-white border-2 border-[#D4D0CA] p-8 rounded-[40px] shadow-sm">
            <div className="flex items-center gap-3 text-[#6B6B6B] mb-2">
              <CreditCard className="h-4 w-4" />
              <span className="text-[10px] font-black uppercase tracking-widest">Active Jobs Cost</span>
            </div>
            <p className="text-2xl font-black text-[#0A0A0A]">Rp 4.2M</p>
          </div>
        </div>
      </div>

      {/* Disbursement History */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <History className="h-5 w-5 text-[#0A0A0A]" />
            <h3 className="text-sm font-black text-[#0A0A0A] uppercase tracking-[0.2em]">Recent Disbursements</h3>
          </div>
          <button className="text-[10px] font-black text-[#FF4D00] uppercase tracking-widest border-b-2 border-[#FF4D00] pb-1 hover:text-[#0A0A0A] hover:border-[#0A0A0A] transition-colors">View All Tx</button>
        </div>

        <div className="bg-white border-2 border-[#D4D0CA] rounded-[40px] overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="bg-[#F5F2ED] text-left">
                <th className="p-6 text-[10px] font-black text-[#6B6B6B] uppercase tracking-widest">Disbursement ID</th>
                <th className="p-6 text-[10px] font-black text-[#6B6B6B] uppercase tracking-widest">To Worker</th>
                <th className="p-6 text-[10px] font-black text-[#6B6B6B] uppercase tracking-widest">Amount</th>
                <th className="p-6 text-[10px] font-black text-[#6B6B6B] uppercase tracking-widest">Time</th>
                <th className="p-6 text-[10px] font-black text-[#6B6B6B] uppercase tracking-widest text-right">Solana Signature</th>
              </tr>
            </thead>
            <tbody className="divide-y-2 divide-[#F5F2ED]">
              {disbursements.map((db) => (
                <tr key={db.id} className="hover:bg-[#F5F2ED]/50 transition-colors cursor-pointer group">
                  <td className="p-6 text-xs font-black text-[#0A0A0A]">{db.id}</td>
                  <td className="p-6">
                    <div className="flex items-center gap-2">
                      <div className="h-6 w-6 rounded-lg bg-[#0A0A0A] flex items-center justify-center text-[8px] font-black text-white">{db.to[0]}</div>
                      <span className="text-xs font-bold text-[#0A0A0A]">{db.to}</span>
                    </div>
                  </td>
                  <td className="p-6 text-xs font-black text-[#FF4D00]">Rp {db.amount}</td>
                  <td className="p-6 text-xs font-bold text-[#6B6B6B]">{db.date}</td>
                  <td className="p-6 text-right">
                    <span className="text-[10px] font-mono text-[#6B6B6B] bg-[#F5F2ED] px-3 py-1 rounded-full group-hover:text-[#FF4D00] transition-colors">{db.tx}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
