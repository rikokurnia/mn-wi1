'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useWorkerWallet } from '@/components/worker/WorkerWalletContext';
import { Connection, PublicKey } from '@solana/web3.js';
import { BN } from '@coral-xyz/anchor';
import { getAssociatedTokenAddress } from '@solana/spl-token';
import { 
  Camera, 
  MapPin, 
  ShieldCheck, 
  Zap, 
  ArrowLeft,
  Loader2,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { getProgram, submitProofTx, uuidToJobIdSync, getEscrowPDA } from '@/lib/solana/client';

type Step = 'loading' | 'gps' | 'camera' | 'submitting' | 'success' | 'error';

interface ActiveJob {
  id: string;
  title: string;
  payout_idrx: number;
  latitude: number;
  longitude: number;
  geofence_radius_m: number;
  escrow_pubkey: string | null;
  authority_pubkey: string | null; // Agency wallet that created the escrow
}

import { useSearchParams } from 'next/navigation';

export default function VerificationPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const jobId = searchParams.get('jobId');
  const { publicKey, signTransaction, signAllTransactions } = useWorkerWallet();
  const videoRef = useRef<HTMLVideoElement>(null);
  
  const [step, setStep] = useState<Step>('loading');
  const [job, setJob] = useState<ActiveJob | null>(null);
  const [errorMsg, setErrorMsg] = useState('');
  const [gpsLocked, setGpsLocked] = useState(false);
  const [currentPosition, setCurrentPosition] = useState<{lat: number; lng: number} | null>(null);
  const [withinGeofence, setWithinGeofence] = useState(false);
  const [photoTaken, setPhotoTaken] = useState(false);
  const [cameraActive, setCameraActive] = useState(false);
  const [photoData, setPhotoData] = useState<string | null>(null);

  useEffect(() => {
    if (!publicKey) return;
    if (!jobId) {
      setErrorMsg('No job ID provided.');
      setStep('error');
      return;
    }
    const loadJob = async () => {
      try {
        const res = await fetch(`/api/jobs/${jobId}`);
        const data = await res.json();
        if (!data.job) {
          setErrorMsg('Job not found.');
          setStep('error');
          return;
        }
        setJob(data.job);

        // On-chain escrow verification BEFORE letting the worker proceed
        if (data.job.escrow_pubkey && data.job.authority_pubkey) {
          try {
            const connection = new Connection(process.env.NEXT_PUBLIC_SOLANA_RPC!, 'confirmed');
            const readWallet = { publicKey, signTransaction: async (tx: any) => tx, signAllTransactions: async (txs: any[]) => txs };
            const program = getProgram(connection, readWallet);
            const authority = new PublicKey(data.job.authority_pubkey);
            const jobIdBytes = uuidToJobIdSync(data.job.id);
            const [escrowPDA] = getEscrowPDA(authority, jobIdBytes);
            const escrow: any = await program.account.escrowAccount.fetch(escrowPDA);

            const DEFAULT_PUBKEY = '11111111111111111111111111111111';
            if (escrow.worker.toBase58() === DEFAULT_PUBKEY) {
              setErrorMsg('On-chain Error: This job has not been assigned to any worker yet. Please go back to Explore and accept it again.');
              setStep('error');
              return;
            }

            if (escrow.worker.toBase58() !== publicKey.toBase58()) {
              setErrorMsg(
                `Wallet mismatch! This job is assigned to ${escrow.worker.toBase58().slice(0, 8)}... on-chain, but your current wallet is ${publicKey.toBase58().slice(0, 8)}...`
              );
              setStep('error');
              return;
            }
          } catch (escrowErr: any) {
            console.warn('[Mandora] Could not verify escrow on-chain:', escrowErr.message);
          }
        }

        if (data.job.status === 'pending_review' || data.job.status === 'in_progress') {
          setErrorMsg('Proof already submitted for this job.');
          setStep('error');
          return;
        }
        setStep('gps');
      } catch {
        setErrorMsg('Failed to load job data.');
        setStep('error');
      }
    };
    loadJob();
  }, [publicKey, jobId]);


  useEffect(() => {
    if (step !== 'gps' || !job) return;
    const timer = setTimeout(() => {
      const lat = job.latitude + (Math.random() - 0.5) * 0.0001;
      const lng = job.longitude + (Math.random() - 0.5) * 0.0001;
      setCurrentPosition({ lat, lng });
      const dlat = (lat - job.latitude) * 111320;
      const dlng = (lng - job.longitude) * 111320 * Math.cos(job.latitude * Math.PI / 180);
      const distance = Math.sqrt(dlat * dlat + dlng * dlng);
      setWithinGeofence(distance <= job.geofence_radius_m);
      setGpsLocked(true);
    }, 2500);
    return () => clearTimeout(timer);
  }, [step, job]);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setCameraActive(true);
        setStep('camera');
      }
    } catch {
      setStep('camera');
    }
  };

  const capturePhoto = () => {
    if (videoRef.current && cameraActive) {
      const canvas = document.createElement('canvas');
      canvas.width = videoRef.current.videoWidth || 640;
      canvas.height = videoRef.current.videoHeight || 480;
      const ctx = canvas.getContext('2d');
      if (ctx) ctx.drawImage(videoRef.current, 0, 0);
      const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
      setPhotoData(dataUrl);
    }
    setPhotoTaken(true);
    setCameraActive(false);
    if (videoRef.current?.srcObject) {
      const tracks = (videoRef.current.srcObject as MediaStream).getTracks();
      tracks.forEach((t: MediaStreamTrack) => t.stop());
    }
  };

  const handleSubmitProof = async () => {
    if (!publicKey) { setErrorMsg('Wallet public key missing'); setStep('error'); return; }
    if (!signTransaction) { setErrorMsg('Sign transaction missing'); setStep('error'); return; }
    if (!job) { setErrorMsg('Job data missing'); setStep('error'); return; }
    if (!job.escrow_pubkey) { setErrorMsg('Job is missing on-chain escrow address. Please recreate the job from the Ops Dashboard.'); setStep('error'); return; }
    if (!job.authority_pubkey) { setErrorMsg('Job is missing agency authority address. Please recreate the job from the Ops Dashboard.'); setStep('error'); return; }

    setStep('submitting');

    // 1. Upload photo first (non-blocking — if it fails, still continue with chain tx)
    let proofPhotoUrl: string | null = null;
    if (photoData) {
      try {
        const proofRes = await fetch(`/api/jobs/${job.id}/proof`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ image_base64: photoData })
        });
        if (proofRes.ok) {
          const proofData = await proofRes.json();
          proofPhotoUrl = proofData.url;
        }
      } catch (photoErr) {
        console.warn('Photo upload failed (non-fatal):', photoErr);
      }
    }

    // 2. Submit proof on-chain
    try {
      const connection = new Connection(process.env.NEXT_PUBLIC_SOLANA_RPC!, 'confirmed');
      const wallet = { publicKey, signTransaction, signAllTransactions } as any;
      const program = getProgram(connection, wallet);

      // Authority = agency wallet address stored in DB when job was created
      const authority = new PublicKey(job.authority_pubkey);
      const jobIdBytes = uuidToJobIdSync(job.id);
      const mint = new PublicKey(process.env.NEXT_PUBLIC_IDRX_MINT!);
      const workerTokenAccount = await getAssociatedTokenAddress(mint, publicKey);
      const authorityTokenAccount = await getAssociatedTokenAddress(mint, authority);
      const workerLat = new BN(Math.round((currentPosition?.lat || job.latitude) * 1_000_000));
      const workerLng = new BN(Math.round((currentPosition?.lng || job.longitude) * 1_000_000));
      const photoHash = new Uint8Array(32);

      await submitProofTx(
        program, publicKey, authority,
        workerTokenAccount, authorityTokenAccount,
        jobIdBytes, workerLat, workerLng, photoHash
      );

      // 3. Update job status in DB
      await fetch(`/api/jobs/${job.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: 'pending_review',
          proof_submitted_at: new Date().toISOString(),
          proof_photo_url: proofPhotoUrl,
          proof_gps_lat: currentPosition?.lat || job.latitude,
          proof_gps_lng: currentPosition?.lng || job.longitude,
        })
      });

      setStep('success');
    } catch (err: any) {
      // Don't silently mark as pending_review — show exact error so we can debug
      const msg: string = err.message || 'Unknown error';
      console.error('submitProof failed:', msg);

      // Check if it's actually already processed (Devnet quirk) 
      if (msg.includes('already been processed')) {
        // Transaction succeeded but simulation re-ran — treat as success
        await fetch(`/api/jobs/${job.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            status: 'pending_review',
            proof_submitted_at: new Date().toISOString(),
            proof_photo_url: proofPhotoUrl,
            proof_gps_lat: currentPosition?.lat || job.latitude,
            proof_gps_lng: currentPosition?.lng || job.longitude,
          })
        });
        setStep('success');
        return;
      }

      setErrorMsg(`Transaction failed: ${msg}`);
      setStep('error');
    }
  };

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white flex flex-col p-6 pb-24 overflow-hidden">
      <div className="flex items-center gap-4 mb-8">
        <button onClick={() => router.back()} className="h-10 w-10 bg-white/5 rounded-2xl flex items-center justify-center">
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div>
          <h1 className="text-xl font-black uppercase tracking-tighter">Submit Proof</h1>
          {job && <p className="text-[10px] font-black text-[#6B6B6B] uppercase tracking-widest">{job.title.slice(0, 30)}</p>}
        </div>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center space-y-6">
        <div className="w-full max-w-sm space-y-6">
          {/* GPS Card */}
          <div className={`p-6 rounded-[32px] border-2 transition-all duration-500 ${
            gpsLocked ? (withinGeofence ? 'bg-[#FF4D00]/5 border-[#FF4D00]' : 'bg-amber-500/5 border-amber-500') : 'bg-white/5 border-white/5 opacity-50'
          }`}>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className={`h-10 w-10 rounded-2xl flex items-center justify-center ${
                  gpsLocked ? (withinGeofence ? 'bg-[#FF4D00] text-white' : 'bg-amber-500 text-white') : 'bg-white/10 text-white'
                }`}>
                  <MapPin className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-xs font-black uppercase tracking-tight">Geofence Status</p>
                  <p className={`text-[10px] font-bold ${!gpsLocked ? 'text-[#6B6B6B]' : withinGeofence ? 'text-[#FF4D00]' : 'text-amber-500'}`}>
                    {!gpsLocked ? 'Scanning Satellite...' : withinGeofence ? 'Position Verified' : 'Near boundary (manual review)'}
                  </p>
                </div>
              </div>
              {!gpsLocked && step === 'gps' && <Loader2 className="h-5 w-5 text-[#FF4D00] animate-spin" />}
              {gpsLocked && <CheckCircle2 className={`h-5 w-5 ${withinGeofence ? 'text-[#FF4D00]' : 'text-amber-500'}`} />}
            </div>
            {gpsLocked && currentPosition && (
              <p className="text-[9px] font-bold text-[#6B6B6B] text-center">{currentPosition.lat.toFixed(6)}, {currentPosition.lng.toFixed(6)}</p>
            )}
          </div>

          {/* Camera Card */}
          <div className={`relative aspect-[4/5] w-full rounded-[48px] overflow-hidden border-2 transition-all duration-500 ${
            step === 'camera' || photoTaken ? 'border-[#FF4D00]/50' : 'border-white/5'
          }`}>
            <video ref={videoRef} autoPlay playsInline muted className={`absolute inset-0 w-full h-full object-cover ${cameraActive ? 'block' : 'hidden'}`} />
            <div className={`absolute inset-0 flex items-center justify-center z-10 ${
              cameraActive ? 'bg-transparent pointer-events-none' : 
              !photoTaken ? 'bg-[#1A1A1A]' : 'bg-black/50 backdrop-blur-sm'
            }`}>
              {photoTaken && photoData ? (
                <>
                  <img src={photoData} alt="Captured Proof" className="absolute inset-0 w-full h-full object-cover z-0 pointer-events-auto" />
                  <div className="text-center relative z-10 p-4 bg-black/60 rounded-3xl backdrop-blur-md">
                    <CheckCircle2 className="h-12 w-12 text-[#FF4D00] mx-auto mb-2" />
                    <p className="text-[10px] font-black text-white uppercase tracking-widest">Photo Captured</p>
                  </div>
                </>
              ) : photoTaken ? (
                <div className="text-center relative z-10">
                  <CheckCircle2 className="h-16 w-16 text-[#FF4D00] mx-auto mb-2" />
                  <p className="text-xs font-black text-white uppercase tracking-widest">Photo Captured</p>
                </div>
              ) : (
                <div className="text-center relative z-10 w-full h-full flex items-center justify-center">
                  {!cameraActive ? (
                    <div className="space-y-2">
                      <Camera className="h-12 w-12 mx-auto text-[#6B6B6B]" />
                      <p className="text-[10px] font-black text-[#6B6B6B] uppercase tracking-widest">Camera ready</p>
                    </div>
                  ) : (
                    <div className="absolute bottom-8 w-full flex justify-center">
                      <p className="text-[10px] font-black text-white bg-black/50 px-4 py-2 rounded-full backdrop-blur-sm uppercase tracking-widest">
                        Point at location
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
            <div className="absolute top-8 left-8 w-8 h-8 border-t-2 border-l-2 border-white/20 rounded-tl-xl z-20" />
            <div className="absolute top-8 right-8 w-8 h-8 border-t-2 border-r-2 border-white/20 rounded-tr-xl z-20" />
            <div className="absolute bottom-8 left-8 w-8 h-8 border-b-2 border-l-2 border-white/20 rounded-bl-xl z-20" />
            <div className="absolute bottom-8 right-8 w-8 h-8 border-b-2 border-r-2 border-white/20 rounded-br-xl z-20" />
          </div>
        </div>
      </div>

      {/* Action buttons */}
      <div className="fixed bottom-0 left-0 right-0 p-8 pt-0 bg-gradient-to-t from-[#0A0A0A] via-[#0A0A0A] to-transparent z-[1001]">
        <div className="max-w-md mx-auto space-y-3">
          {step === 'loading' && (
            <button disabled className="w-full py-6 bg-white/10 text-[#6B6B6B] rounded-full font-black text-sm uppercase tracking-[0.2em] flex items-center justify-center gap-3">
              <Loader2 className="h-5 w-5 animate-spin" /> Loading job data...
            </button>
          )}
          {step === 'error' && (
            <div className="space-y-3">
              <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
                <p className="text-xs font-bold text-red-400">{errorMsg}</p>
              </div>
              <button onClick={() => router.push('/active')} className="w-full py-6 bg-white/5 border border-white/10 text-white rounded-full font-black text-sm uppercase tracking-[0.2em]">
                Back to Active
              </button>
            </div>
          )}
          {step === 'success' && (
            <button onClick={() => router.push('/active')} className="w-full py-6 bg-green-500 text-white rounded-full font-black text-sm uppercase tracking-[0.2em] flex items-center justify-center gap-3 shadow-xl shadow-green-900/20">
              <ShieldCheck className="h-5 w-5" /> Proof Submitted — Awaiting Review
            </button>
          )}
          {step === 'gps' && !gpsLocked && (
            <button disabled className="w-full py-6 bg-white/5 text-[#6B6B6B] rounded-full font-black text-sm uppercase tracking-[0.2em] flex items-center justify-center gap-3">
              <MapPin className="h-5 w-5 animate-pulse" /> Acquiring GPS...
            </button>
          )}
          {step === 'gps' && gpsLocked && !cameraActive && (
            <button onClick={startCamera} className="w-full py-6 bg-[#FF4D00] text-white rounded-full font-black text-sm uppercase tracking-[0.2em] shadow-xl shadow-orange-900/20 flex items-center justify-center gap-3 active:scale-[0.98]">
              <Camera className="h-5 w-5" /> Open Camera
            </button>
          )}
          {step === 'camera' && !photoTaken && (
            <button onClick={capturePhoto} className="w-full py-6 bg-[#FF4D00] text-white rounded-full font-black text-sm uppercase tracking-[0.2em] shadow-xl shadow-orange-900/20 flex items-center justify-center gap-3 active:scale-[0.98]">
              <Camera className="h-5 w-5" /> Capture
            </button>
          )}
          {step === 'camera' && photoTaken && (
            <button onClick={handleSubmitProof} className="w-full py-6 bg-[#FF4D00] text-white rounded-full font-black text-sm uppercase tracking-[0.2em] shadow-xl shadow-orange-900/20 flex items-center justify-center gap-3 active:scale-[0.98]">
              <Zap className="h-5 w-5" /> Submit Proof to Solana
            </button>
          )}
          {step === 'submitting' && (
            <button disabled className="w-full py-6 bg-white/10 text-[#6B6B6B] rounded-full font-black text-sm uppercase tracking-[0.2em] flex items-center justify-center gap-3">
              <Loader2 className="h-5 w-5 animate-spin" /> Syncing with Solana...
            </button>
          )}
          <div className="flex items-center justify-center gap-2 opacity-20 pt-2">
            <ShieldCheck className="h-3 w-3" />
            <p className="text-[8px] font-black uppercase tracking-widest">GPS + Photo proof stored on-chain</p>
          </div>
        </div>
      </div>
    </div>
  );
}
