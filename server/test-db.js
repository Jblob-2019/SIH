require('dotenv').config();
const { supabase } = require('./src/db');
const store = require('./src/supabaseStore');

async function check() {
  console.log('Testing Supabase Connection...');
  console.log('URL:', process.env.SUPABASE_URL);
  
  try {
    const { data, error } = await supabase.from('water_bodies').select('*').limit(3);
    if (error) {
      console.error('ERROR connecting to Supabase:', error.message);
      return;
    }
    console.log('✅ Connection successful!');
    console.log(`Found ${data.length} water bodies in the database.`);
    if (data.length > 0) {
      console.log('Sample data:', data[0].name);
    } else {
      console.warn('⚠️ No water bodies found. Did you run the SQL script to seed the data?');
    }

    console.log('\nTesting Dashboard Metrics Endpoint...');
    const metrics = await store.metrics();
    console.log('Metrics:', metrics);

  } catch (err) {
    console.error('Exception during connection test:', err);
  }
}

check();
