// ============================================
// SUPABASE CONFIGURATION
// ============================================
// 1. Go to https://supabase.com and create a free project
// 2. Go to Settings > API and copy your URL and anon key
// 3. Paste them below
// 4. Run the SQL from sql/setup.sql in the Supabase SQL Editor
// ============================================

const SUPABASE_URL = 'YOUR_SUPABASE_URL';
const SUPABASE_ANON_KEY = 'YOUR_SUPABASE_ANON_KEY';

// Default target price for alerts
const DEFAULT_TARGET_PRICE = 75;

// Initialize Supabase client
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
