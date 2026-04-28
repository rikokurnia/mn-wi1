import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

const env = fs.readFileSync('.env.local', 'utf8');
const SUPABASE_URL = env.match(/NEXT_PUBLIC_SUPABASE_URL=(.*)/)[1];
const SUPABASE_KEY = env.match(/SUPABASE_SERVICE_ROLE_KEY=(.*)/)[1];

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function check() {
  console.log('Creating bucket...');
  const { data: bucket, error: bucketError } = await supabase.storage.createBucket('proofs', { public: true });
  console.log('Bucket:', bucket, bucketError);
  
  const { data: upload, error: uploadError } = await supabase.storage.from('proofs').upload('test.txt', 'hello world', { upsert: true });
  console.log('Upload:', upload, uploadError);
}
check();
