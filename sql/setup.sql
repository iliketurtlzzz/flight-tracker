-- ============================================
-- Flight Tracker - Supabase Setup
-- ============================================
-- Run this in your Supabase SQL Editor (https://supabase.com/dashboard)
-- Go to: SQL Editor > New Query > Paste this > Run
-- ============================================

-- Flights table
CREATE TABLE IF NOT EXISTS flights (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  origin TEXT NOT NULL,
  destination TEXT NOT NULL,
  airline TEXT,
  departure_date DATE NOT NULL,
  return_date DATE,
  initial_price DECIMAL(10,2) NOT NULL,
  current_price DECIMAL(10,2) NOT NULL,
  stops TEXT,
  flight_number TEXT,
  notes TEXT,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'expired', 'booked')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Price history table
CREATE TABLE IF NOT EXISTS price_history (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  flight_id UUID REFERENCES flights(id) ON DELETE CASCADE,
  price DECIMAL(10,2) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for fast queries
CREATE INDEX IF NOT EXISTS idx_flights_status ON flights(status);
CREATE INDEX IF NOT EXISTS idx_price_history_flight ON price_history(flight_id);

-- Enable Row Level Security (RLS)
ALTER TABLE flights ENABLE ROW LEVEL SECURITY;
ALTER TABLE price_history ENABLE ROW LEVEL SECURITY;

-- Allow all operations for anonymous users (since we use anon key)
CREATE POLICY "Allow all access to flights"
  ON flights FOR ALL
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow all access to price_history"
  ON price_history FOR ALL
  USING (true)
  WITH CHECK (true);
