/**
 * Run once: node scripts/fix_db.mjs
 */
import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const envPath = resolve(__dirname, '../.env.local');
const env = {};
readFileSync(envPath, 'utf-8').split('\n').forEach(line => {
  const trimmed = line.trim();
  if (!trimmed || trimmed.startsWith('#')) return;
  const idx = trimmed.indexOf('=');
  if (idx > 0) env[trimmed.slice(0, idx)] = trimmed.slice(idx + 1);
});

const sb = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);

async function main() {
  console.log('🔧 Mandora DB Fix Script\n');

  // 1. Check authority_pubkey column
  console.log('1. Checking authority_pubkey column...');
  const { data, error } = await sb.from('jobs').select('authority_pubkey').limit(1);
  if (error && error.message.includes('does not exist')) {
    console.log('   ❌ Column missing! Run this in Supabase SQL Editor:');
    console.log('');
    console.log('   ALTER TABLE jobs ADD COLUMN IF NOT EXISTS authority_pubkey TEXT;');
    console.log('   ALTER TABLE jobs ADD COLUMN IF NOT EXISTS proof_photo_url TEXT;');
    console.log('');
  } else {
    console.log('   ✅ authority_pubkey column exists');
  }

  // 2. Check proof_photo_url column
  const { error: err2 } = await sb.from('jobs').select('proof_photo_url').limit(1);
  if (err2 && err2.message.includes('does not exist')) {
    console.log('   ❌ proof_photo_url column missing — add it in Supabase SQL Editor:');
    console.log('   ALTER TABLE jobs ADD COLUMN IF NOT EXISTS proof_photo_url TEXT;');
  } else {
    console.log('   ✅ proof_photo_url column exists');
  }

  // 3. Create proofs storage bucket
  console.log('\n2. Creating proofs storage bucket...');
  const { error: bucketErr } = await sb.storage.createBucket('proofs', {
    public: true,
    allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp'],
    fileSizeLimit: 5242880,
  });

  if (!bucketErr) {
    console.log('   ✅ proofs bucket created!');
  } else if (bucketErr.message.includes('already exists')) {
    console.log('   ✅ proofs bucket already exists');
  } else {
    console.log('   ⚠️  Bucket error:', bucketErr.message);
  }

  console.log('\n✅ Done!');
}

main().catch(console.error);
