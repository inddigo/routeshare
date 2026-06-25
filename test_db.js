const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

// Read .env
const envContent = fs.readFileSync('.env', 'utf8');
const urlMatch = envContent.match(/EXPO_PUBLIC_SUPABASE_URL=(.*)/);
const keyMatch = envContent.match(/EXPO_PUBLIC_SUPABASE_ANON_KEY=(.*)/);

const supabase = createClient(urlMatch[1], keyMatch[1]);

async function check() {
  const { data, error } = await supabase.from('usuarios').select('*').limit(1);
  console.log("Data:", data);
  console.log("Error:", error);
}

check();
