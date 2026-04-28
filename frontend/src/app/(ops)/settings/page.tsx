'use client';

import React, { useState } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { Settings as SettingsIcon, Coins, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';

export default function SettingsPage() {
  const { publicKey } = useWallet();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  const requestTokens = async () => {
    if (!publicKey) {
      setError('Please connect your wallet first');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const res = await fetch('/api/mint', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          walletAddress: publicKey.toBase58(),
          amount: 10000,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to request tokens');
      }

      setSuccess('Successfully received 10,000 IDRX!');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-10 space-y-12 max-w-7xl mx-auto">
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-6xl font-black text-[#0A0A0A] tracking-tighter leading-none uppercase">
            Platform<br />Settings
          </h1>
          <p className="text-[#6B6B6B] font-medium mt-4 max-w-md">
            Manage your agency wallet and testnet configuration.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white border-2 border-[#D4D0CA] p-8 rounded-[32px]">
            <div className="flex items-center gap-4 mb-8">
              <div className="h-12 w-12 bg-[#F5F2ED] rounded-2xl flex items-center justify-center">
                <Coins className="h-6 w-6 text-[#FF4D00]" />
              </div>
              <div>
                <h3 className="text-xl font-black text-[#0A0A0A] uppercase tracking-tight">IDRX Testnet Faucet</h3>
                <p className="text-xs text-[#6B6B6B] font-bold">Request mock IDRX tokens for Devnet testing</p>
              </div>
            </div>

            <div className="bg-[#F5F2ED] rounded-2xl p-6 mb-8 border border-[#D4D0CA]/50">
              <div className="text-[10px] font-black text-[#6B6B6B] uppercase tracking-[0.2em] mb-2">Connected Wallet</div>
              <div className="font-mono text-sm font-bold text-[#0A0A0A] break-all">
                {publicKey ? publicKey.toBase58() : 'Not connected'}
              </div>
            </div>

            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-2xl flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-red-600 mt-0.5" />
                <div className="text-sm font-bold text-red-800">{error}</div>
              </div>
            )}

            {success && (
              <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-2xl flex items-start gap-3">
                <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5" />
                <div className="text-sm font-bold text-green-800">{success}</div>
              </div>
            )}

            <button
              onClick={requestTokens}
              disabled={loading || !publicKey}
              className="w-full flex items-center justify-center gap-2 bg-[#0A0A0A] text-white py-4 rounded-xl font-black text-sm uppercase tracking-wider hover:bg-[#FF4D00] transition-colors disabled:opacity-50 disabled:hover:bg-[#0A0A0A]"
            >
              {loading ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  MINTING TOKENS...
                </>
              ) : (
                'REQUEST 10,000 IDRX'
              )}
            </button>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-[#F5F2ED] border-2 border-[#D4D0CA] p-8 rounded-[32px] hover:border-[#0A0A0A] transition-colors">
            <SettingsIcon className="h-8 w-8 text-[#0A0A0A] mb-6" />
            <h4 className="font-black text-[#0A0A0A] uppercase tracking-tight mb-2">Why do I need IDRX?</h4>
            <p className="text-xs text-[#6B6B6B] font-bold leading-relaxed mb-6">
              When creating a job on the Mandora network, agencies must lock up the exact payout amount in the smart contract escrow. This guarantees payment to workers upon successful verification.
            </p>
            <p className="text-xs text-[#6B6B6B] font-bold leading-relaxed">
              Use the faucet on this page to load your devnet wallet with mock IDRX for testing.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
