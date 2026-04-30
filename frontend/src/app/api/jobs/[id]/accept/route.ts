import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { Connection, Keypair, PublicKey } from '@solana/web3.js';
import bs58 from 'bs58';
import { getProgram, getEscrowPDA, uuidToJobIdSync } from '@/lib/solana/client';

function getServiceClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

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

  const sb = getServiceClient();

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

  // 3. Call assignWorkerTx on-chain (non-fatal if escrow data missing)
  if (job.escrow_pubkey && job.authority_pubkey && process.env.OPS_WALLET_PRIVATE_KEY) {
    try {
      const connection = new Connection(process.env.NEXT_PUBLIC_SOLANA_RPC!, 'confirmed');
      const opsKeypair = Keypair.fromSecretKey(bs58.decode(process.env.OPS_WALLET_PRIVATE_KEY));
      
      // Build a server-side wallet from the OPS keypair (authority = agency wallet)
      const serverWallet = {
        publicKey: opsKeypair.publicKey,
        signTransaction: async (tx: any) => {
          tx.partialSign(opsKeypair);
          return tx;
        },
        signAllTransactions: async (txs: any[]) => {
          txs.forEach(tx => tx.partialSign(opsKeypair));
          return txs;
        },
      };

      const program = getProgram(connection, serverWallet);
      const authority = new PublicKey(job.authority_pubkey);
      const workerPubkey = new PublicKey(worker_wallet);
      const jobId = uuidToJobIdSync(job.id);

      await program.methods
        .assignWorker()
        .accounts({
          authority,
          worker: workerPubkey,
          escrow: getEscrowPDA(authority, jobId)[0],
        } as any)
        .signers([opsKeypair])
        .rpc();

      console.log(`✅ assignWorker on-chain: job=${id} worker=${worker_wallet}`);
    } catch (chainErr: any) {
      // Log but don't block — DB assignment succeeded
      console.error('assignWorkerTx failed (non-fatal):', chainErr.message);
    }
  } else {
    console.warn('assignWorkerTx skipped — missing escrow_pubkey, authority_pubkey, or OPS_WALLET_PRIVATE_KEY');
  }

  return NextResponse.json({ job, worker }, { status: 200 });
}
