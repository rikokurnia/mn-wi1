import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ wallet: string }> }
) {
  const { wallet } = await params

  const sb = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  // Find the worker by wallet address
  const { data: worker, error: workerErr } = await sb
    .from('workers')
    .select('id')
    .eq('wallet_address', wallet)
    .single()

  if (workerErr || !worker) {
    return NextResponse.json({ job: null })
  }

  // Find active job for this worker (assigned, in_progress, pending_review)
  const { data: job, error: jobErr } = await sb
    .from('jobs')
    .select('*, categories(name, icon)')
    .eq('worker_id', worker.id)
    .in('status', ['assigned', 'in_progress', 'pending_review'])
    .order('assigned_at', { ascending: false })
    .limit(1)
    .single()

  if (jobErr) {
    return NextResponse.json({ job: null })
  }

  return NextResponse.json({ job })
}
