import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase/client'
import { createClient } from '@supabase/supabase-js'

// Service client for admin operations (bypasses RLS)
function getServiceClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const body = await request.json()

  const { data, error } = await supabase
    .from('jobs')
    .update(body)
    .eq('id', id)
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ job: data })
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  const { data, error } = await supabase
    .from('jobs')
    .select('*, categories(name, icon)')
    .eq('id', id)
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ job: data })
}

/**
 * POST /api/jobs/[id]/accept
 * Body: { worker_wallet: string }
 * - Upserts the worker record
 * - Atomically accepts the job (only if still 'open')
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const body = await request.json()
  const { worker_wallet } = body

  if (!worker_wallet) {
    return NextResponse.json({ error: 'worker_wallet is required' }, { status: 400 })
  }

  const sb = getServiceClient()

  // Upsert worker record
  const { data: worker, error: workerErr } = await sb
    .from('workers')
    .upsert({ wallet_address: worker_wallet }, { onConflict: 'wallet_address' })
    .select()
    .single()

  if (workerErr) {
    return NextResponse.json({ error: workerErr.message }, { status: 500 })
  }

  // Accept the job atomically (only if still open)
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
    .single()

  if (jobErr) {
    return NextResponse.json({ error: jobErr.message }, { status: 500 })
  }

  if (!job) {
    return NextResponse.json({ error: 'Job no longer available' }, { status: 409 })
  }

  return NextResponse.json({ job, worker }, { status: 200 })
}
