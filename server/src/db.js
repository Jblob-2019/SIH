const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey || supabaseKey === 'your_anon_key_here') {
  console.warn('⚠️ Supabase URL or Anon Key is missing. Check your .env file.');
}

const supabase = createClient(supabaseUrl, supabaseKey);

module.exports = { supabase };
