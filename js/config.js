// ============================================
// SUPABASE CONFIGURATION
// ============================================
// 1. Go to https://supabase.com and create a free project
// 2. Go to Settings > API and copy your URL and anon key
// 3. Paste them below
// 4. Run the SQL from sql/setup.sql in the Supabase SQL Editor
// ============================================

const SUPABASE_URL = 'https://ebuxqvlosrdpjpfceojn.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVidXhxdmxvc3JkcGpwZmNlb2puIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM2OTI2ODIsImV4cCI6MjA4OTI2ODY4Mn0.y-nX5cCcjv9A0GdvLG0oxyap8m2BCvkM4dS3Jr2_--8';

// Alert threshold — notify when price drops more than this amount
const DROP_THRESHOLD = 75;

// Initialize Supabase client
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
