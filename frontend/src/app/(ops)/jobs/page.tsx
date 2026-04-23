'use client';

import React from 'react';
import Link from 'next/link';
import { 
  PlusCircle, 
  Search, 
  Filter,
  MoreVertical,
  MapPin
} from 'lucide-react';

const activeJobs = [
  { id: 'JOB-001', title: 'AC Maintenance - Sudirman', location: 'Jakarta Selatan', workers: 2, status: 'Active', reward: '150k' },
  { id: 'JOB-002', title: 'Billboard Cleaning - Kuningan', location: 'Jakarta Selatan', workers: 0, status: 'Draft', reward: '500k' },
  { id: 'JOB-003', title: 'Flyer Distribution - Menteng', location: 'Jakarta Pusat', workers: 12, status: 'Active', reward: '25k' },
];

export default function JobBoardPage() {
  return (
    <div className="p-10 space-y-10 max-w-7xl mx-auto">
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-6xl font-black text-[#0A0A0A] tracking-tighter leading-none uppercase">
            Job Board
          </h1>
          <p className="text-[#6B6B6B] font-medium mt-4 max-w-md">
            Manage your decentralized labor pool. Track verification statuses and release payments.
          </p>
        </div>
        <Link 
          href="/jobs/new"
          className="bg-[#FF4D00] text-white px-8 py-4 rounded-full font-black text-sm uppercase tracking-widest shadow-xl shadow-orange-100 hover:bg-[#E64500] transition-all"
        >
          Post New Job
        </Link>
      </div>

      <div className="flex gap-4">
        <div className="flex-1 relative">
          <input 
            type="text" 
            placeholder="Search tasks..." 
            className="w-full bg-white border-2 border-[#D4D0CA] p-4 pl-12 rounded-2xl font-bold text-sm outline-none focus:border-[#0A0A0A] transition-all"
          />
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-[#6B6B6B]" />
        </div>
        <button className="bg-white border-2 border-[#D4D0CA] p-4 rounded-2xl flex items-center gap-2 font-black text-xs uppercase tracking-widest hover:border-[#0A0A0A] transition-all">
          <Filter className="h-4 w-4" />
          Filter
        </button>
      </div>

      <div className="bg-white border-2 border-[#D4D0CA] rounded-[32px] overflow-hidden shadow-2xl shadow-black/5">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-[#F5F2ED] border-b-2 border-[#D4D0CA]">
              <th className="px-8 py-6 text-[10px] font-black text-[#6B6B6B] uppercase tracking-[0.2em]">Job ID</th>
              <th className="px-8 py-6 text-[10px] font-black text-[#6B6B6B] uppercase tracking-[0.2em]">Task Details</th>
              <th className="px-8 py-6 text-[10px] font-black text-[#6B6B6B] uppercase tracking-[0.2em]">Location</th>
              <th className="px-8 py-6 text-[10px] font-black text-[#6B6B6B] uppercase tracking-[0.2em]">Workers</th>
              <th className="px-8 py-6 text-[10px] font-black text-[#6B6B6B] uppercase tracking-[0.2em]">Reward</th>
              <th className="px-8 py-6 text-[10px] font-black text-[#6B6B6B] uppercase tracking-[0.2em]">Status</th>
              <th className="px-8 py-6"></th>
            </tr>
          </thead>
          <tbody className="divide-y-2 divide-[#F5F2ED]">
            {activeJobs.map((job) => (
              <tr key={job.id} className="hover:bg-[#F5F2ED]/50 transition-colors group">
                <td className="px-8 py-6 text-sm font-black text-[#6B6B6B]">{job.id}</td>
                <td className="px-8 py-6">
                  <div className="font-black text-[#0A0A0A] uppercase text-sm tracking-tight">{job.title}</div>
                </td>
                <td className="px-8 py-6">
                  <div className="flex items-center gap-2 text-xs font-bold text-[#6B6B6B]">
                    <MapPin className="h-3 w-3" />
                    {job.location}
                  </div>
                </td>
                <td className="px-8 py-6 font-black text-sm text-[#0A0A0A]">{job.workers} Active</td>
                <td className="px-8 py-6 font-black text-sm text-[#FF4D00]">Rp {job.reward}</td>
                <td className="px-8 py-6">
                  <span className={`text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-wider ${
                    job.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-[#D4D0CA] text-[#6B6B6B]'
                  }`}>
                    {job.status}
                  </span>
                </td>
                <td className="px-8 py-6 text-right">
                  <button className="p-2 hover:bg-[#D4D0CA] rounded-lg transition-colors">
                    <MoreVertical className="h-5 w-5 text-[#6B6B6B]" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
