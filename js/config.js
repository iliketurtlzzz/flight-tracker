// ============================================
// SUPABASE CONFIGURATION
// ============================================
// 1. Go to https://supabase.com and create a free project
// 2. Go to Settings > API and copy your URL and anon key
// 3. Paste them below
// 4. Run the SQL from sql/setup.sql in the Supabase SQL Editor
// ============================================

const SUPABASE_URL = 'https://qpxyblzcovidscihwrqo.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_inu2ha0hHIPY8lRrO1QSFw_8NwrhJFi';

// Alert threshold — notify when price drops more than this amount
const DROP_THRESHOLD = 75;

// Initialize Supabase client
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
