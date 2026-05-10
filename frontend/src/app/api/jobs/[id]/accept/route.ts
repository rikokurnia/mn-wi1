import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase/server';
import { Connection, Keypair, PublicKey } from '@solana/web3.js';
import bs58 from 'bs58';
import { getProgram, assignWorkerTx, uuidToJobIdSync, getEscrowPDA } from '@/lib/solana/client';

/**
 * POST /api/jobs/[id]/accept
 * Body: { worker_wallet: string }
 * 1. Upserts worker record in DB
 * 2. Atomically assigns job in DB
 * 3. Calls assignWorkerTx on-chain (signed by OPS wallet = authority)
 *    so the escrow knows which worker is authorized to submitProof.
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await request.json();
  const { worker_wallet } = body;

  if (!worker_wallet) {
    return NextResponse.json({ error: 'worker_wallet is required' }, { status: 400 });
  }

  const sb = getSupabaseAdmin();

  // 1. Upsert worker record
  const { data: worker, error: workerErr } = await sb
    .from('workers')
    .upsert({ wallet_address: worker_wallet }, { onConflict: 'wallet_address' })
    .select()
    .single();

  if (workerErr) {
    return NextResponse.json({ error: workerErr.message }, { status: 500 });
  }

  // 2. Accept the job atomically (only if still open)
  const { data: job, error: jobErr } = await sb
    .from('jobs')
    .update({
      status: 'assigned',
      worker_id: worker.id,
      assigned_at: new Date().toISOString()
    })
    .eq('id', id)
    .eq('status', 'open')
    .select('*, categories(name, icon)')
    .single();

  if (jobErr) {
    return NextResponse.json({ error: jobErr.message }, { status: 500 });
  }

  if (!job) {
    return NextResponse.json({ error: 'Job no longer available' }, { status: 409 });
  }

  // 3. On-chain assignment
  // After the smart contract fix, assign_worker no longer requires the
  // authority to sign. We use the job's stored authority_pubkey for PDA
  // derivation, and any backend wallet pays the gas.
  let chainTxSig = '';
  try {
    if (!process.env.OPS_WALLET_PRIVATE_KEY) {
      throw new Error('OPS_WALLET_PRIVATE_KEY not configured');
    }
    if (!job.authority_pubkey) {
      throw new Error('Job is missing authority_pubkey. Was this job created before the escrow contract upgrade?');
    }

    const connection = new Connection(
      process.env.NEXT_PUBLIC_SOLANA_RPC || 'https://api.devnet.solana.com',
      'confirmed'
    );

    const payerKeypair = Keypair.fromSecretKey(bs58.decode(process.env.OPS_WALLET_PRIVATE_KEY));

    // Build a wallet object compatible with AnchorProvider
    const payerWallet = {
      publicKey: payerKeypair.publicKey,
      signTransaction: async (tx: any) => {
        tx.partialSign(payerKeypair);
        return tx;
      },
      signAllTransactions: async (txs: any[]) => {
        txs.forEach((tx) => tx.partialSign(payerKeypair));
        return txs;
      },
    };

    const program = getProgram(connection, payerWallet);
    // authority = the wallet that created the escrow (from job record)
    const authority = new PublicKey(job.authority_pubkey);
    const workerPubkey = new PublicKey(worker_wallet);
    const jobIdBytes = uuidToJobIdSync(id);

    chainTxSig = await assignWorkerTx(program, authority, workerPubkey, jobIdBytes);

    // Verify assignment actually landed on-chain (devnet can be flaky)
    let verified = false;
    for (let i = 0; i < 3; i++) {
      try {
        const [escrowPDA] = getEscrowPDA(authority, jobIdBytes);
        const escrow: any = await program.account.escrowAccount.fetch(escrowPDA);
        if (escrow.worker.toBase58() === worker_wallet) {
          verified = true;
          break;
        }
      } catch {
        await new Promise((r) => setTimeout(r, 1000));
      }
    }

    if (!verified) {
      throw new Error('Assignment transaction sent but could not be verified on-chain after retries');
    }
  } catch (chainErr: any) {
    // Revert DB assignment so another worker can accept
    await sb
      .from('jobs')
      .update({ status: 'open', worker_id: null, assigned_at: null })
      .eq('id', id);

    return NextResponse.json(
      { error: 'On-chain assignment failed', details: chainErr.message || 'Unknown error' },
      { status: 500 }
    );
  }

  return NextResponse.json({ job, worker, chainTxSig }, { status: 200 });
}
