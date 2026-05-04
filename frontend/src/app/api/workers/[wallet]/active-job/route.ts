import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase/server'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ wallet: string }> }
) {
  const { wallet } = await params

  const sb = getSupabaseAdmin()

  // Find the worker by wallet address
  const { data: worker, error: workerErr } = await sb
    .from('workers')
    .select('id')
    .eq('wallet_address', wallet)
    .single()

  if (workerErr || !worker) {
    return NextResponse.json({ job: null })
  }

  // Find active jobs for this worker (assigned, in_progress, pending_review)
  const { data: jobs, error: jobErr } = await sb
    .from('jobs')
    .select('*, categories(name, icon)')
    .eq('worker_id', worker.id)
    .in('status', ['assigned', 'in_progress', 'pending_review'])
    .order('assigned_at', { ascending: false })

  if (jobErr) {
    return NextResponse.json({ jobs: [] })
  }

  return NextResponse.json({ jobs: jobs || [] })
}
