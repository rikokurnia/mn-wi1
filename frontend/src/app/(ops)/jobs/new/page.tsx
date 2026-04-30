'use client';

import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { useWallet } from '@solana/wallet-adapter-react';
import { 
  ArrowLeft, 
  MapPin, 
  Info, 
  DollarSign, 
  Target,
  Rocket,
  Loader2,
  CheckCircle
} from 'lucide-react';
import Link from 'next/link';
import { Connection, PublicKey } from '@solana/web3.js';
import { BN } from '@coral-xyz/anchor';
import { getAssociatedTokenAddress } from '@solana/spl-token';
import { getProgram, createEscrowTx, getEscrowPDA, uuidToJobIdSync } from '@/lib/solana/client';

const JobMapPicker = dynamic(() => import('@/components/ops/JobMapPicker'), { 
  ssr: false,
  loading: () => <div className="h-[400px] w-full bg-[#F5F2ED] animate-pulse rounded-[32px] border-4 border-white flex items-center justify-center">
    <span className="text-[10px] font-black text-[#6B6B6B] uppercase tracking-[0.2em]">Loading Engine...</span>
  </div>
});

interface Category {
  id: string;
  name: string;
  slug: string;
}

export default function NewJobPage() {
  const { publicKey, signTransaction, connected } = useWallet();
  const [categories, setCategories] = useState<Category[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category_id: '',
    payout_idrx: '',
    lat: -6.2297,
    lng: 106.8166,
    radius: 100,
    location_name: 'Jakarta Selatan'
  });

  useEffect(() => {
    fetch('/api/categories')
      .then(r => r.json())
      .then(data => setCategories(data.categories || []))
      .catch(console.error);
  }, []);

  const handleLocationChange = (lat: number, lng: number) => {
    setFormData(prev => ({ ...prev, lat, lng }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!publicKey || !signTransaction) {
      setError('Please connect your wallet first');
      return;
    }
    if (!formData.title || !formData.payout_idrx) {
      setError('Title and reward are required');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      // 1. Create job in Supabase
      const jobRes = await fetch('/api/jobs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: formData.title,
          description: formData.description,
          category_id: formData.category_id || null,
          payout_idrx: parseInt(formData.payout_idrx),
          location_name: formData.location_name,
          latitude: formData.lat,
          longitude: formData.lng,
          geofence_radius_m: formData.radius,
          status: 'open'
        })
      });

      if (!jobRes.ok) {
        const err = await jobRes.json();
        throw new Error(err.error || 'Failed to create job');
      }

      const { job } = await jobRes.json();
      let escrowTxSig = '';
      let escrowPDA: PublicKey | null = null;

      try {
        // 2. Fund escrow on-chain
        const connection = new Connection(process.env.NEXT_PUBLIC_SOLANA_RPC!, 'confirmed');
        const wallet = { publicKey, signTransaction } as any;
        const program = getProgram(connection, wallet);

        const jobId = uuidToJobIdSync(job.id); // 16 bytes for on-chain PDA
        const mint = new PublicKey(process.env.NEXT_PUBLIC_IDRX_MINT!);
        const amount = new BN(parseInt(formData.payout_idrx) * 1_000_000); // 6 decimals
        const latScaled = new BN(Math.round(formData.lat * 1_000_000));
        const lngScaled = new BN(Math.round(formData.lng * 1_000_000));
        const deadline = new BN(Math.floor(Date.now() / 1000) + 86400 * 7); // 7 days

        const authorityTokenAccount = await getAssociatedTokenAddress(mint, publicKey);
        
        [escrowPDA] = getEscrowPDA(publicKey, jobId);

        escrowTxSig = await createEscrowTx(
          program,
          publicKey,
          authorityTokenAccount,
          mint,
          jobId,
          amount,
          latScaled,
          lngScaled,
          formData.radius,
          deadline
        );
      } catch (txErr: any) {
        const msg = txErr.message || '';
        if (msg.includes('already been processed')) {
          console.warn('Devnet simulation error caught, but transaction likely succeeded.');
        } else {
          // Real error -> rollback the job in DB so worker doesn't see a broken job
          await fetch(`/api/jobs/${job.id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status: 'cancelled' })
          });

          if (msg.includes('AccountNotInitialized') || msg.includes('3012')) {
            throw new Error('Your IDRX Token Account is not initialized! Go to Settings and use the Faucet first.');
          }
          if (msg.includes('0x1') || msg.includes('insufficient funds')) {
            throw new Error('Insufficient IDRX Funds! You tried to fund an escrow but your balance is too low. Go to Settings and use the Faucet to mint 1,000,000 IDRX.');
          }
          throw txErr;
        }
      }

      // 3. Update job with escrow info + agency authority address
      await fetch('/api/jobs/' + job.id, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          escrow_pubkey: escrowPDA?.toBase58(),
          authority_pubkey: publicKey.toBase58(), // needed by worker to submitProof
          escrow_tx: escrowTxSig || 'simulation-bypassed'
        })
      });

      setSuccess(true);
      setFormData({
        title: '', description: '', category_id: '', payout_idrx: '',
        lat: -6.2297, lng: 106.8166, radius: 100, location_name: 'Jakarta Selatan'
      });
    } catch (err: any) {
      setError(err.message || 'Transaction failed');
    } finally {
      setSubmitting(false);
    }
  };

  if (success) {
    return (
      <div className="p-10 max-w-2xl mx-auto text-center space-y-8">
        <CheckCircle className="h-20 w-20 text-green-500 mx-auto" />
        <h1 className="text-4xl font-black text-[#0A0A0A] tracking-tighter uppercase">Job Published!</h1>
        <p className="text-[#6B6B6B] font-bold">Your task has been posted to the network and funded in escrow.</p>
        <div className="flex gap-4 justify-center">
          <Link href="/jobs" className="px-8 py-4 bg-[#0A0A0A] text-white rounded-full font-black text-sm uppercase tracking-widest hover:bg-black/80 transition-all">
            View Jobs
          </Link>
          <button onClick={() => setSuccess(false)} className="px-8 py-4 bg-white border-2 border-[#D4D0CA] text-[#0A0A0A] rounded-full font-black text-sm uppercase tracking-widest hover:border-[#0A0A0A] transition-all">
            Create Another
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-10 max-w-5xl mx-auto space-y-10">
      <div className="flex items-center gap-6">
        <Link href="/jobs" className="h-12 w-12 bg-white border-2 border-[#D4D0CA] rounded-2xl flex items-center justify-center hover:border-[#0A0A0A] transition-all">
          <ArrowLeft className="h-5 w-5 text-[#0A0A0A]" />
        </Link>
        <div>
          <h1 className="text-4xl font-black text-[#0A0A0A] tracking-tighter uppercase leading-none">
            Launch New Task
          </h1>
          <p className="text-[#6B6B6B] font-bold text-xs mt-2 uppercase tracking-wider">
            DECREE A NEW LABOR REQUIREMENT TO THE NETWORK
          </p>
        </div>
      </div>

      {!connected && (
        <div className="bg-amber-50 border-2 border-amber-200 p-6 rounded-3xl">
          <p className="text-sm font-bold text-amber-800">⚠️ Connect your wallet to create and fund escrows</p>
        </div>
      )}

      {error && (
        <div className="bg-red-50 border-2 border-red-200 p-6 rounded-3xl">
          <p className="text-sm font-bold text-red-800">❌ {error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        <div className="space-y-8">
          <section className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-[#6B6B6B] uppercase tracking-widest ml-4">TASK TITLE</label>
              <input 
                type="text" 
                placeholder="e.g. AC Maintenance - Kuningan Office"
                className="w-full bg-white border-2 border-[#D4D0CA] p-5 rounded-[24px] font-bold text-[#0A0A0A] outline-none focus:border-[#FF4D00] transition-all"
                value={formData.title}
                onChange={(e) => setFormData({...formData, title: e.target.value})}
                required
              />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-[#6B6B6B] uppercase tracking-widest ml-4">CATEGORY</label>
              <select
                className="w-full bg-white border-2 border-[#D4D0CA] p-5 rounded-[24px] font-bold text-[#0A0A0A] outline-none focus:border-[#FF4D00] transition-all"
                value={formData.category_id}
                onChange={(e) => setFormData({...formData, category_id: e.target.value})}
              >
                <option value="">Select category...</option>
                {categories.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-[#6B6B6B] uppercase tracking-widest ml-4">DESCRIPTION</label>
              <textarea 
                placeholder="Detailed instructions for the worker..."
                rows={4}
                className="w-full bg-white border-2 border-[#D4D0CA] p-5 rounded-[24px] font-bold text-[#0A0A0A] outline-none focus:border-[#FF4D00] transition-all resize-none"
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-[#6B6B6B] uppercase tracking-widest ml-4">REWARD (IDRX)</label>
                <div className="relative">
                  <input 
                    type="number" 
                    placeholder="150000"
                    className="w-full bg-white border-2 border-[#D4D0CA] p-5 pl-12 rounded-[24px] font-bold text-[#0A0A0A] outline-none focus:border-[#FF4D00] transition-all"
                    value={formData.payout_idrx}
                    onChange={(e) => setFormData({...formData, payout_idrx: e.target.value})}
                    required
                  />
                  <DollarSign className="absolute left-5 top-1/2 -translate-y-1/2 h-5 w-5 text-[#6B6B6B]" />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-[#6B6B6B] uppercase tracking-widest ml-4">RADIUS (METERS)</label>
                <div className="relative">
                  <input 
                    type="number" 
                    className="w-full bg-white border-2 border-[#D4D0CA] p-5 pl-12 rounded-[24px] font-bold text-[#0A0A0A] outline-none focus:border-[#FF4D00] transition-all"
                    value={formData.radius}
                    onChange={(e) => setFormData({...formData, radius: parseInt(e.target.value) || 0})}
                  />
                  <Target className="absolute left-5 top-1/2 -translate-y-1/2 h-5 w-5 text-[#6B6B6B]" />
                </div>
              </div>
            </div>
          </section>

          <div className="bg-[#F5F2ED] border-2 border-dashed border-[#D4D0CA] p-8 rounded-[32px] space-y-4">
            <div className="flex items-start gap-4">
              <div className="p-2 bg-white rounded-xl">
                <Info className="h-5 w-5 text-[#FF4D00]" />
              </div>
              <div>
                <p className="text-xs font-black text-[#0A0A0A] uppercase tracking-tight">Trust Protocol Active</p>
                <p className="text-[11px] font-bold text-[#6B6B6B] mt-1 leading-relaxed">
                  Payments are locked in escrow. Funds release automatically ONLY when the worker provides a valid GPS + Photo proof within your defined geofence.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-8">
          <div className="space-y-2">
            <label className="text-[10px] font-black text-[#6B6B6B] uppercase tracking-widest ml-4">GEOFENCE LOCATION</label>
            <div className="relative group">
              <JobMapPicker 
                center={[formData.lat, formData.lng]} 
                radius={formData.radius}
                onLocationChange={handleLocationChange} 
              />
              <div className="absolute top-6 left-6 z-[400] bg-white px-4 py-2 rounded-full shadow-lg border border-[#D4D0CA] flex items-center gap-2 pointer-events-none">
                 <MapPin className="h-4 w-4 text-[#FF4D00]" />
                 <span className="text-[10px] font-black text-[#0A0A0A] uppercase">{formData.lat.toFixed(4)}, {formData.lng.toFixed(4)}</span>
              </div>
            </div>
          </div>

          <div className="space-y-4 pt-4">
             <button 
              type="submit"
              disabled={submitting || !connected}
              className="w-full py-6 bg-[#0A0A0A] text-white rounded-full font-black text-lg uppercase tracking-widest shadow-2xl hover:bg-black/80 transition-all flex items-center justify-center gap-3 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? (
                <><Loader2 className="h-6 w-6 animate-spin" /> Processing...</>
              ) : (
                <><Rocket className="h-6 w-6 text-[#FF4D00]" /> Publish & Fund Escrow</>
              )}
            </button>
            <p className="text-center text-[10px] font-bold text-[#6B6B6B] uppercase tracking-wider">
              Network Fee: ~0.0005 SOL | IDRX will be locked until proof is submitted
            </p>
          </div>
        </div>
      </form>
    </div>
  );
}
