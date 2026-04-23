'use client';

import React from 'react';
import { 
  Briefcase, 
  CheckCircle2, 
  Users, 
  ArrowUpRight, 
  ArrowDownRight,
  Clock,
  ChevronRight,
  Zap
} from 'lucide-react';

const stats = [
  { 
    name: 'ACTIVE JOBS', 
    value: '12', 
    change: '+2', 
    changeType: 'positive', 
    icon: Briefcase,
    color: 'text-[#FF4D00]',
    bg: 'bg-white border-[#D4D0CA]'
  },
  { 
    name: 'PENDING REVIEW', 
    value: '04', 
    change: '-1', 
    changeType: 'negative', 
    icon: Clock,
    color: 'text-[#0A0A0A]',
    bg: 'bg-white border-[#D4D0CA]'
  },
  { 
    name: 'WORKERS ONLINE', 
    value: '28', 
    change: '+5', 
    changeType: 'positive', 
    icon: Users,
    color: 'text-[#FF4D00]',
    bg: 'bg-white border-[#D4D0CA]'
  },
  { 
    name: 'TOTAL PAID OUT', 
    value: '4.2M', 
    change: '+12%', 
    changeType: 'positive', 
    icon: Zap,
    color: 'text-[#FF4D00]',
    bg: 'bg-[#FF4D00] border-transparent text-white'
  },
];

const recentJobs = [
  { id: '1', title: 'AC Repair - Sudirman', status: 'In Progress', worker: 'Budi Santoso', amount: '150k' },
  { id: '2', title: 'House Cleaning - Kemang', status: 'Pending Review', worker: 'Siti Aminah', amount: '200k' },
  { id: '3', title: 'Plumbing - Kuningan', status: 'Open', worker: '-', amount: '120k' },
  { id: '4', title: 'Delivery - Menteng', status: 'Completed', worker: 'Agus Setiawan', amount: '50k' },
];

export default function DashboardPage() {
  return (
    <div className="p-10 space-y-12 max-w-7xl mx-auto">
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-6xl font-black text-[#0A0A0A] tracking-tighter leading-none uppercase">
            Ops<br />Overview
          </h1>
          <p className="text-[#6B6B6B] font-medium mt-4 max-w-md">
            Mandora real-time labor protocol. Monitoring 42 active nodes across Jakarta Selatan.
          </p>
        </div>
        <div className="hidden md:block text-right">
          <div className="text-[10px] font-black text-[#6B6B6B] uppercase tracking-[0.2em] mb-1">LOCAL TIME</div>
          <div className="text-xl font-black text-[#0A0A0A]">JAKARTA 14:32</div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <div key={stat.name} className={`p-8 rounded-[32px] border-2 flex flex-col justify-between h-48 transition-all hover:-translate-y-1 hover:shadow-2xl hover:shadow-orange-200/20 ${stat.bg}`}>
            <div className="flex items-start justify-between">
              <div className="text-[10px] font-black uppercase tracking-widest opacity-80">{stat.name}</div>
              <stat.icon className="h-5 w-5" />
            </div>
            <div>
              <div className="text-5xl font-black tracking-tighter leading-none mb-2">
                {stat.value}
              </div>
              <div className={`flex items-center text-xs font-black ${
                stat.changeType === 'positive' ? (stat.bg.includes('bg-[#FF4D00]') ? 'text-white' : 'text-green-600') : 'text-red-600'
              }`}>
                {stat.changeType === 'positive' ? <ArrowUpRight className="h-3 w-3 mr-1" /> : <ArrowDownRight className="h-3 w-3 mr-1" />}
                {stat.change}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        {/* Recent Jobs */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-2xl font-black text-[#0A0A0A] uppercase tracking-tighter">Recent Activity</h3>
            <button className="text-xs font-black text-[#6B6B6B] border-b-2 border-transparent hover:border-[#0A0A0A] transition-all pb-0.5">VIEW FULL BOARD</button>
          </div>
          
          <div className="space-y-3">
            {recentJobs.map((job) => (
              <div key={job.id} className="group bg-white border-2 border-[#D4D0CA] p-6 rounded-[24px] flex items-center justify-between hover:border-[#0A0A0A] transition-all cursor-pointer">
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 bg-[#F5F2ED] rounded-2xl flex items-center justify-center font-black text-xs text-[#0A0A0A]">
                    {job.id.padStart(2, '0')}
                  </div>
                  <div>
                    <div className="font-black text-[#0A0A0A] uppercase text-sm tracking-tight">{job.title}</div>
                    <div className="text-xs text-[#6B6B6B] font-bold">WORKER: {job.worker}</div>
                  </div>
                </div>
                <div className="flex items-center gap-8">
                   <div className={`text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-wider ${
                        job.status === 'Completed' ? 'bg-green-100 text-green-800' :
                        job.status === 'In Progress' ? 'bg-blue-100 text-blue-800' :
                        job.status === 'Pending Review' ? 'bg-[#FF4D00] text-white' :
                        'bg-[#D4D0CA] text-[#6B6B6B]'
                      }`}>
                    {job.status}
                  </div>
                  <div className="text-right min-w-[60px]">
                    <div className="text-lg font-black text-[#0A0A0A]">Rp {job.amount}</div>
                  </div>
                  <ChevronRight className="h-5 w-5 text-[#D4D0CA] group-hover:text-[#0A0A0A] transition-colors" />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Sidebar Actions */}
        <div className="space-y-8">
          <div className="bg-[#0A0A0A] p-10 rounded-[40px] text-white relative overflow-hidden group shadow-2xl">
            {/* Background design elements */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-[#FF4D00] rounded-full blur-[80px] opacity-20 group-hover:opacity-40 transition-opacity" />
            
            <h3 className="text-xs font-black text-[#6B6B6B] uppercase tracking-[0.3em] mb-8">Vault Balance</h3>
            <div className="text-5xl font-black tracking-tighter mb-2">12.8M</div>
            <div className="text-sm font-bold text-[#6B6B6B] mb-10">TOTAL IDRX LOCKED</div>
            
            <button className="w-full py-4 bg-[#FF4D00] text-white rounded-full font-black text-sm hover:bg-[#E64500] transition-all transform hover:scale-[1.02] active:scale-[0.98]">
              REPLENISH VAULT
            </button>
          </div>

          <div className="bg-white border-2 border-dashed border-[#D4D0CA] p-10 rounded-[40px] text-center hover:border-[#FF4D00] transition-all group">
             <div className="h-16 w-16 bg-[#F5F2ED] rounded-full mx-auto mb-6 flex items-center justify-center group-hover:bg-orange-50 transition-colors">
               <Briefcase className="h-8 w-8 text-[#0A0A0A] group-hover:text-[#FF4D00] transition-colors" />
             </div>
             <h4 className="font-black text-[#0A0A0A] uppercase tracking-tight mb-2">Need more hands?</h4>
             <p className="text-xs text-[#6B6B6B] font-bold mb-8 leading-relaxed">
               Post a new task to the Mandora network. Workers near your location will be notified instantly.
             </p>
             <button className="text-sm font-black text-[#FF4D00] hover:underline decoration-2 underline-offset-4 uppercase tracking-wider">
               CREATE JOB NOW
             </button>
          </div>
        </div>
      </div>
    </div>
  );
}
