'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { 
  PlusCircle, 
  Search, 
  MapPin,
  Loader2,
  ExternalLink,
  CheckCircle2,
  Clock,
  Zap,
  XCircle
} from 'lucide-react';

interface Job {
  id: string;
  title: string;
  location_name: string;
  status: string;
  payout_idrx: number;
  escrow_pubkey: string | null;
  escrow_tx: string | null;
  created_at: string;
  assigned_at: string | null;
  proof_submitted_at: string | null;
  workers?: { wallet_address: string } | null;
  categories?: { name: string; icon: string } | null;
}

const STATUS_TABS = [
  { key: 'all', label: 'All' },
  { key: 'open', label: 'Open' },
  { key: 'assigned', label: 'Assigned' },
  { key: 'pending_review', label: 'Pending Review' },
  { key: 'completed', label: 'Completed' },
  { key: 'cancelled', label: 'Cancelled' },
];

const statusStyle: Record<string, string> = {
  open: 'bg-green-100 text-green-800',
  assigned: 'bg-blue-100 text-blue-800',
  pending_review: 'bg-[#FF4D00]/10 text-[#FF4D00]',
  completed: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-600',
};

export default function JobBoardPage() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');
  const [search, setSearch] = useState('');

  useEffect(() => {
    const fetchAll = async () => {
      setLoading(true);
      try {
        // Fetch all jobs across all statuses
        const statuses = ['open', 'assigned', 'pending_review', 'completed', 'cancelled'];
        const results = await Promise.all(
          statuses.map(s => 
            fetch(`/api/jobs?status=${s}`).then(r => r.json()).then(d => d.jobs || [])
          )
        );
        setJobs(results.flat());
      } catch {
        setJobs([]);
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, []);

  const filtered = useMemo(() => {
    let list = jobs;
    if (activeTab !== 'all') {
      list = list.filter(j => j.status === activeTab);
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(j => j.title.toLowerCase().includes(q) || j.location_name?.toLowerCase().includes(q));
    }
    return list;
  }, [jobs, activeTab, search]);

  const tabCounts = useMemo(() => {
    const counts: Record<string, number> = { all: jobs.length };
    jobs.forEach(j => { counts[j.status] = (counts[j.status] || 0) + 1; });
    return counts;
  }, [jobs]);

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

      {/* Search + Filter Tabs */}
      <div className="space-y-4">
        <div className="flex-1 relative max-w-lg">
          <input 
            type="text" 
            placeholder="Search tasks..." 
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full bg-white border-2 border-[#D4D0CA] p-4 pl-12 rounded-2xl font-bold text-sm outline-none focus:border-[#0A0A0A] transition-all"
          />
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-[#6B6B6B]" />
        </div>

        <div className="flex gap-2 flex-wrap">
          {STATUS_TABS.map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`px-5 py-2.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${
                activeTab === tab.key
                  ? 'bg-[#0A0A0A] text-white shadow-md'
                  : 'bg-white border-2 border-[#D4D0CA] text-[#6B6B6B] hover:border-[#0A0A0A]'
              }`}
            >
              {tab.label}
              <span className="ml-2 opacity-60">{tabCounts[tab.key] || 0}</span>
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20 gap-3">
          <Loader2 className="h-6 w-6 text-[#FF4D00] animate-spin" />
          <span className="text-sm font-bold text-[#6B6B6B]">Loading jobs...</span>
        </div>
      ) : (
        <div className="bg-white border-2 border-[#D4D0CA] rounded-[32px] overflow-hidden shadow-2xl shadow-black/5">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-[#F5F2ED] border-b-2 border-[#D4D0CA]">
                <th className="px-8 py-6 text-[10px] font-black text-[#6B6B6B] uppercase tracking-[0.2em]">Job ID</th>
                <th className="px-8 py-6 text-[10px] font-black text-[#6B6B6B] uppercase tracking-[0.2em]">Task Details</th>
                <th className="px-8 py-6 text-[10px] font-black text-[#6B6B6B] uppercase tracking-[0.2em]">Location</th>
                <th className="px-8 py-6 text-[10px] font-black text-[#6B6B6B] uppercase tracking-[0.2em]">Reward</th>
                <th className="px-8 py-6 text-[10px] font-black text-[#6B6B6B] uppercase tracking-[0.2em]">Status</th>
                <th className="px-8 py-6 text-[10px] font-black text-[#6B6B6B] uppercase tracking-[0.2em]">Escrow</th>
                <th className="px-8 py-6 text-[10px] font-black text-[#6B6B6B] uppercase tracking-[0.2em]">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y-2 divide-[#F5F2ED]">
              {filtered.map((job) => (
                <tr key={job.id} className="hover:bg-[#F5F2ED]/50 transition-colors group">
                  <td className="px-8 py-6 text-sm font-black text-[#6B6B6B]">{job.id.slice(0, 8)}</td>
                  <td className="px-8 py-6">
                    <div className="font-black text-[#0A0A0A] uppercase text-sm tracking-tight">{job.title}</div>
                    {job.categories && <div className="text-[10px] font-bold text-[#6B6B6B] mt-0.5">{job.categories.name}</div>}
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-2 text-xs font-bold text-[#6B6B6B]">
                      <MapPin className="h-3 w-3" />
                      {job.location_name}
                    </div>
                  </td>
                  <td className="px-8 py-6 font-black text-sm text-[#FF4D00]">Rp {job.payout_idrx?.toLocaleString('id-ID')}</td>
                  <td className="px-8 py-6">
                    <span className={`text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-wider ${statusStyle[job.status] || 'bg-[#D4D0CA] text-[#6B6B6B]'}`}>
                      {job.status.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="px-8 py-6">
                    {job.escrow_pubkey ? (
                      <a
                        href={`https://solscan.io/account/${job.escrow_pubkey}?cluster=devnet`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[10px] font-black text-green-600 uppercase hover:text-[#FF4D00] flex items-center gap-1"
                      >
                        Funded <ExternalLink className="h-3 w-3" />
                      </a>
                    ) : (
                      <span className="text-[10px] font-black text-amber-600 uppercase">—</span>
                    )}
                  </td>
                  <td className="px-8 py-6 text-xs font-bold text-[#6B6B6B]">
                    {new Date(job.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-8 py-12 text-center text-sm font-bold text-[#6B6B6B]">
                    {jobs.length === 0 ? (
                      <>No jobs yet. <Link href="/jobs/new" className="text-[#FF4D00] hover:underline">Create your first job →</Link></>
                    ) : (
                      'No jobs match the current filter.'
                    )}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
