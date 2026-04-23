'use client';

import React, { useState } from 'react';
import dynamic from 'next/dynamic';
import { Drawer } from 'vaul';
import { 
  MapPin, 
  Zap, 
  Clock, 
  ShieldCheck, 
  Navigation,
  Search,
  X
} from 'lucide-react';

const JobMap = dynamic(() => import('@/components/worker/JobMap'), { 
  ssr: false,
  loading: () => <div className="h-full w-full bg-[#0A0A0A] flex items-center justify-center">
    <div className="h-10 w-10 border-4 border-[#FF4D00] border-t-transparent rounded-full animate-spin" />
  </div>
});

const MOCK_JOBS = [
  { id: '1', title: 'AC Maintenance - Kuningan', reward: '150,000', lat: -6.2297, lng: 106.8166, category: 'Technical', desc: 'Verify and clean the outdoor unit of AC at Kuningan Office Tower. Must be within 50m of coordinates.' },
  { id: '2', title: 'Poster Audit - Sudirman', reward: '50,000', lat: -6.2247, lng: 106.8216, category: 'Audit', desc: 'Confirm presence of Mandora posters at the Sudirman bus stop. Photo proof required.' },
  { id: '3', title: 'Cleanliness Check - Menteng', reward: '120,000', lat: -6.2147, lng: 106.8316, category: 'Review', desc: 'Report on the hygiene of the Menteng public park area. GPS verification mandatory.' },
];

export default function ExplorePage() {
  const [selectedJob, setSelectedJob] = useState<typeof MOCK_JOBS[0] | null>(null);
  const [open, setOpen] = useState(false);

  const handleSelectJob = (job: typeof MOCK_JOBS[0]) => {
    setSelectedJob(job);
    setOpen(true);
  };

  return (
    <div className="h-screen w-full relative">
      {/* Header Overlay */}
      <div className="absolute top-0 left-0 right-0 z-[500] p-6 pt-10 pointer-events-none">
        <div className="max-w-md mx-auto space-y-4">
          <div className="bg-[#1A1A1A]/80 backdrop-blur-xl p-4 rounded-3xl border border-white/5 flex items-center gap-4 pointer-events-auto shadow-2xl">
            <Search className="h-5 w-5 text-[#6B6B6B]" />
            <input 
              type="text" 
              placeholder="Search nearby tasks..." 
              className="bg-transparent border-none outline-none text-sm font-bold text-white placeholder-[#6B6B6B] flex-1"
            />
          </div>
          
          <div className="flex gap-2 pointer-events-auto overflow-x-auto pb-2 scrollbar-hide">
            {['All', 'Technical', 'Audit', 'Review', 'Urgent'].map((cat) => (
              <button key={cat} className="whitespace-nowrap px-4 py-2 bg-[#1A1A1A] border border-white/5 rounded-full text-[10px] font-black uppercase tracking-widest hover:bg-[#FF4D00] transition-colors">
                {cat}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Map Background */}
      <JobMap jobs={MOCK_JOBS} onSelectJob={handleSelectJob} />

      {/* Job Details Drawer */}
      <Drawer.Root open={open} onOpenChange={setOpen}>
        <Drawer.Portal>
          <Drawer.Overlay className="fixed inset-0 bg-black/40 z-[2000]" />
          <Drawer.Content className="bg-[#111111] border-t border-white/10 flex flex-col rounded-t-[40px] h-[70vh] fixed bottom-0 left-0 right-0 z-[2001] outline-none">
            <div className="p-4 bg-[#111111] rounded-t-[40px] flex-1">
              <div className="mx-auto w-12 h-1.5 flex-shrink-0 rounded-full bg-white/20 mb-8" />
              
              {selectedJob && (
                <div className="max-w-md mx-auto space-y-8 px-4 overflow-y-auto max-h-full pb-10">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-black text-[#FF4D00] uppercase tracking-[0.3em]">{selectedJob.category}</span>
                      <div className="flex items-center gap-1 text-[#6B6B6B] text-[10px] font-black uppercase tracking-widest">
                        <Clock className="h-3 w-3" />
                        2h left
                      </div>
                    </div>
                    <h2 className="text-3xl font-black text-white uppercase tracking-tighter leading-none">
                      {selectedJob.title}
                    </h2>
                  </div>

                  <div className="flex gap-4">
                    <div className="flex-1 bg-white/5 p-4 rounded-3xl border border-white/5">
                      <p className="text-[10px] font-black text-[#6B6B6B] uppercase tracking-widest mb-1">REWARD</p>
                      <p className="text-xl font-black text-[#FF4D00]">Rp {selectedJob.reward}</p>
                    </div>
                    <div className="flex-1 bg-white/5 p-4 rounded-3xl border border-white/5">
                      <p className="text-[10px] font-black text-[#6B6B6B] uppercase tracking-widest mb-1">GEOFENCE</p>
                      <p className="text-xl font-black text-white">50m</p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-sm font-black text-white uppercase tracking-widest">Requirements</h3>
                    <p className="text-xs font-bold text-[#6B6B6B] leading-relaxed">
                      {selectedJob.desc}
                    </p>
                  </div>

                  <div className="space-y-3 pt-4">
                    <button className="w-full py-5 bg-[#FF4D00] text-white rounded-full font-black text-sm uppercase tracking-[0.2em] shadow-xl shadow-orange-900/20 flex items-center justify-center gap-3 active:scale-[0.98] transition-transform">
                      <Zap className="h-5 w-5" />
                      Accept Job
                    </button>
                    <button className="w-full py-5 bg-white/5 border border-white/10 text-white rounded-full font-black text-sm uppercase tracking-[0.2em] flex items-center justify-center gap-3 hover:bg-white/10 transition-colors">
                      <Navigation className="h-5 w-5" />
                      Navigate
                    </button>
                  </div>

                  <div className="flex items-center justify-center gap-2 opacity-30 pt-4 pb-8">
                    <ShieldCheck className="h-4 w-4" />
                    <span className="text-[10px] font-black uppercase tracking-widest">Proof required via Mandora Protocol</span>
                  </div>
                </div>
              )}
            </div>
          </Drawer.Content>
        </Drawer.Portal>
      </Drawer.Root>
    </div>
  );
}
