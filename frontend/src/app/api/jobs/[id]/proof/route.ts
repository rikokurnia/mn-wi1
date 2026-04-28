import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Service client for admin operations (bypasses RLS)
function getServiceClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { image_base64 } = body;

    if (!image_base64) {
      return NextResponse.json({ error: 'image_base64 is required' }, { status: 400 });
    }

    const sb = getServiceClient();

    // The base64 string looks like: "data:image/jpeg;base64,/9j/4AAQSkZJRg..."
    const base64Data = image_base64.replace(/^data:image\/\w+;base64,/, '');
    const buffer = Buffer.from(base64Data, 'base64');

    // Upload to Supabase Storage
    const fileName = `job_proof_${id}.jpg`;
    const { data, error } = await sb.storage
      .from('proofs')
      .upload(fileName, buffer, {
        contentType: 'image/jpeg',
        upsert: true
      });

    if (error) {
      console.error('Storage upload error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Get public URL
    const { data: { publicUrl } } = sb.storage.from('proofs').getPublicUrl(fileName);

    return NextResponse.json({ success: true, url: publicUrl }, { status: 200 });
  } catch (err: any) {
    console.error('API Error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
