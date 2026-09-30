const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;

const configured = !!(supabaseUrl && supabaseKey && supabaseKey !== 'your_anon_key_here');
if (!configured) {
  console.warn('⚠️ Supabase URL or Anon Key is missing. Check your .env file. Serving offline data.');
}

// Abort slow requests so an unreachable DB fails fast and the offline fallback kicks in.
const fetchWithTimeout = (url, opts = {}) => fetch(url, { ...opts, signal: opts.signal || AbortSignal.timeout(8000) });

const supabase = configured
  ? createClient(supabaseUrl, supabaseKey, { global: { fetch: fetchWithTimeout } })
  : null;

module.exports = { supabase, configured };
