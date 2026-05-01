import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase/server';

/**
 * GET /api/workers/[wallet]/history
 * Returns all jobs this worker has been assigned (any status).
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ wallet: string }> }
) {
  const { wallet } = await params;
  const sb = getSupabaseAdmin();


  // Find worker by wallet
  const { data: worker, error: workerErr } = await sb
    .from('workers')
    .select('id')
    .eq('wallet_address', wallet)
    .single();

  if (workerErr || !worker) {
    return NextResponse.json({ jobs: [] });
  }

  // Fetch all jobs for this worker
  const { data: jobs, error: jobErr } = await sb
    .from('jobs')
    .select('id, title, payout_idrx, status, location_name, proof_submitted_at, proof_photo_url, proof_gps_lat, proof_gps_lng, escrow_tx, escrow_pubkey, assigned_at, created_at, categories(name, icon)')
    .eq('worker_id', worker.id)
    .order('assigned_at', { ascending: false });

  if (jobErr) {
    return NextResponse.json({ jobs: [] });
  }

  return NextResponse.json({ jobs: jobs || [] });
}
