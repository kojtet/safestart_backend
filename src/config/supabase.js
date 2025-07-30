// Connect to Supabase with your service-role key
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,           // service key for full DB access
  { auth: { persistSession: false } }              // no client-side auth
);

module.exports = supabase;
