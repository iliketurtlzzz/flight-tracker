#!/usr/bin/env node
// ============================================
// Automated Price Checker -- runs via GitHub Actions
// Reads active flights from Supabase, checks Google Flights
// via SerpAPI, updates prices and logs history.
//
// IMPORTANT: Only tracks Delta flights. Only compares prices
// within the SAME seat class the user originally selected.
// ============================================

require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');
const { getJson } = require('serpapi');

// Config from environment variables (set in GitHub Secrets)
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_KEY;
const SERPAPI_KEY = process.env.SERPAPI_KEY;
const DROP_THRESHOLD = 75; // Alert if price drops $75+

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// Map Delta seat classes to Google Flights travel_class values
// Google Flights only has 4 cabin classes:
//   1 = Economy, 2 = Premium Economy, 3 = Business, 4 = First
//
// Delta class mapping:
//   Basic Economy  -> Economy (1)       -- Google doesn't separate Basic from Main
//   Main Cabin     -> Economy (1)
//   Comfort+       -> Economy (1)       -- Delta upsell within economy cabin
//   Premium Select -> Premium Economy (2)
//   First Class    -> Business (3)      -- domestic first = Google "business"
//   Delta One      -> Business (3)      -- international business class product
const SEAT_CLASS_MAP = {
  'Basic Economy': 1,
  'Main Cabin': 1,
  'Comfort+': 1,
  'Premium Select': 2,
  'First Class': 3,
  'Delta One': 3,
};

// Search Google Flights via SerpAPI for a specific flight
async function searchFlight(flight) {
  const travelClass = SEAT_CLASS_MAP[flight.seat_class] || 1;
  const type = flight.return_date ? 1 : 2; // 1 = round trip, 2 = one way

  // Determine stop filter for SerpAPI
  // SerpAPI stops param: 0 = any, 1 = nonstop, 2 = 1 stop or fewer, 3 = 2 stops or fewer
  let stops = 0;
  if (flight.stops === 'Nonstop') stops = 1;
  else if (flight.stops === '1 stop') stops = 2;

  const params = {
    engine: 'google_flights',
    departure_id: flight.origin,
    arrival_id: flight.destination,
    outbound_date: flight.departure_date,
    type: type,
    travel_class: travelClass,
    adults: 1,
    currency: 'USD',
    hl: 'en',
    api_key: SERPAPI_KEY,
  };

  if (stops > 0) {
    params.stops = stops;
  }

  if (flight.return_date) {
    params.return_date = flight.return_date;
  }

  try {
    const result = await getJson(params);

    // Combine best_flights and other_flights
    const allFlights = [
      ...(result.best_flights || []),
      ...(result.other_flights || []),
    ];

    // Find Delta-only flights (ALL legs must be Delta)
    let bestPrice = null;
    let bestFlight = null;

    for (const option of allFlights) {
      const legs = option.flights || [];
      if (legs.length === 0) continue;

      // Every leg must be Delta -- no codeshares or mixed carriers
      const allDelta = legs.every(f =>
        (f.airline || '').toLowerCase().includes('delta')
      );

      if (!allDelta) continue;
      if (option.price == null) continue;

      if (bestPrice === null || option.price < bestPrice) {
        bestPrice = option.price;
        bestFlight = option;
      }
    }

    // Do NOT fall back to non-Delta flights -- skip if no Delta found
    if (bestPrice === null) {
      console.log(`  No Delta flights found for ${flight.origin} -> ${flight.destination} in ${flight.seat_class}`);
      return null;
    }

    const legs = bestFlight.flights || [];
    const stopCount = legs.length - 1;
    const stopsText = stopCount === 0 ? 'Nonstop' : `${stopCount} stop${stopCount > 1 ? 's' : ''}`;
    const flightNum = legs[0]?.flight_number || null;

    return {
      price: bestPrice,
      stops: stopsText,
      airline: 'Delta',
      flight_number: flightNum,
      seat_class_searched: flight.seat_class,
      travel_class_used: travelClass,
      raw: bestFlight,
    };
  } catch (err) {
    console.error(`  SerpAPI error for ${flight.origin} -> ${flight.destination}:`, err.message);
    return null;
  }
}

// Main: check all active flights
async function main() {
  console.log('=== Flight Price Check ===');
  console.log(`Time: ${new Date().toLocaleString('en-US', { timeZone: 'America/New_York' })} EST`);
  console.log('');

  // Fetch all active flights
  const { data: flights, error } = await supabase
    .from('flights')
    .select('*')
    .eq('status', 'active');

  if (error) {
    console.error('Failed to fetch flights:', error.message);
    process.exit(1);
  }

  if (!flights || flights.length === 0) {
    console.log('No active flights to check.');
    return;
  }

  console.log(`Checking ${flights.length} active flight(s)...\n`);

  const alerts = [];
  let checked = 0;
  let skipped = 0;

  for (const flight of flights) {
    const classLabel = flight.seat_class || 'Main Cabin';
    console.log(`Checking: ${flight.origin} -> ${flight.destination} (${flight.departure_date}) [${classLabel}]`);
    console.log(`  Current price: $${flight.current_price} | Initial: $${flight.initial_price}`);

    const result = await searchFlight(flight);

    if (!result) {
      console.log('  Skipped -- no Delta price data found for this seat class\n');
      skipped++;
      continue;
    }

    checked++;
    const newPrice = result.price;
    const oldPrice = parseFloat(flight.current_price);
    const initialPrice = parseFloat(flight.initial_price);
    const priceDiff = oldPrice - newPrice;
    const totalDrop = initialPrice - newPrice;

    const arrow = priceDiff > 0 ? 'DOWN' : priceDiff < 0 ? 'UP' : 'SAME';
    console.log(`  New price: $${newPrice} (${arrow} $${Math.abs(priceDiff).toFixed(2)} from last check)`);
    console.log(`  Seat class: ${classLabel} | Stops: ${result.stops}`);

    // Update the flight price
    const { error: updateErr } = await supabase
      .from('flights')
      .update({
        current_price: newPrice,
        updated_at: new Date().toISOString(),
      })
      .eq('id', flight.id);

    if (updateErr) {
      console.error(`  Failed to update price:`, updateErr.message);
    }

    // Log to price history (skip if price unchanged to reduce noise)
    if (Math.abs(newPrice - oldPrice) > 0.01) {
      await supabase.from('price_history').insert([{
        flight_id: flight.id,
        price: newPrice,
      }]);
      console.log('  Price history logged.');
    } else {
      console.log('  Price unchanged, skipping history log.');
    }

    // Check if this is a deal alert ($75+ drop from initial)
    if (totalDrop >= DROP_THRESHOLD) {
      const alert = `DEAL: ${flight.origin} -> ${flight.destination} [${classLabel}] dropped $${totalDrop.toFixed(0)} (now $${newPrice}, was $${initialPrice})`;
      console.log(`  ** ${alert}`);
      alerts.push(alert);
    }

    console.log('');

    // Small delay between API calls
    await new Promise(r => setTimeout(r, 2000));
  }

  // Summary
  console.log('=== Summary ===');
  console.log(`Total: ${flights.length} | Checked: ${checked} | Skipped: ${skipped}`);
  if (alerts.length > 0) {
    console.log(`\nDEAL ALERTS (${alerts.length}):`);
    alerts.forEach(a => console.log(`  ${a}`));
  } else {
    console.log('No deal alerts this run.');
  }
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
