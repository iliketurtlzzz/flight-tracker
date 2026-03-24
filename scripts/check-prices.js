#!/usr/bin/env node
// ============================================
// Automated Price Checker -- runs via GitHub Actions
// Reads active flights from Supabase, checks Google Flights
// via SerpAPI, updates prices and logs history.
//
// Supports mixed-cabin round trips: when outbound and return
// have different seat classes, runs two one-way searches.
// ============================================

require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');
const { getJson } = require('serpapi');

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_KEY;
const SERPAPI_KEY = process.env.SERPAPI_KEY;
const DROP_THRESHOLD = 75;

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// Map Delta seat classes to Google Flights travel_class values
// 1 = Economy, 2 = Premium Economy, 3 = Business
const SEAT_CLASS_MAP = {
  'Basic Economy': 1,
  'Main Cabin': 1,
  'Comfort+': 1,
  'Premium Select': 2,
  'First Class': 3,
  'Delta One': 3,
};

// Search Google Flights via SerpAPI for a single leg
async function searchFlight(flight) {
  const travelClass = SEAT_CLASS_MAP[flight.seat_class] || 1;
  const type = flight.return_date ? 1 : 2; // 1 = round trip, 2 = one way

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

  if (stops > 0) params.stops = stops;
  if (flight.return_date) params.return_date = flight.return_date;

  try {
    const result = await getJson(params);

    const allFlights = [
      ...(result.best_flights || []),
      ...(result.other_flights || []),
    ];

    let bestPrice = null;
    let bestFlight = null;

    for (const option of allFlights) {
      const legs = option.flights || [];
      if (legs.length === 0) continue;

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

    if (bestPrice === null) {
      console.log(`  No Delta flights found for ${flight.origin} -> ${flight.destination} in ${flight.seat_class}`);
      return null;
    }

    const legs = bestFlight.flights || [];
    const stopCount = legs.length - 1;
    const stopsText = stopCount === 0 ? 'Nonstop' : `${stopCount} stop${stopCount > 1 ? 's' : ''}`;

    return {
      price: bestPrice,
      stops: stopsText,
      airline: 'Delta',
      flight_number: legs[0]?.flight_number || null,
    };
  } catch (err) {
    console.error(`  SerpAPI error for ${flight.origin} -> ${flight.destination}:`, err.message);
    return null;
  }
}

// Search mixed-cabin round trip as two one-way legs
async function searchMixedCabin(flight) {
  const outboundFlight = {
    ...flight,
    return_date: null, // force one-way
  };

  const returnFlight = {
    ...flight,
    origin: flight.destination,
    destination: flight.origin,
    departure_date: flight.return_date,
    return_date: null, // force one-way
    seat_class: flight.return_seat_class,
  };

  const [outResult, retResult] = await Promise.all([
    searchFlight(outboundFlight),
    searchFlight(returnFlight),
  ]);

  if (!outResult && !retResult) return null;

  return {
    outboundPrice: outResult ? outResult.price : null,
    returnPrice: retResult ? retResult.price : null,
    totalPrice: (outResult ? outResult.price : 0) + (retResult ? retResult.price : 0),
    outboundResult: outResult,
    returnResult: retResult,
  };
}

// Main
async function main() {
  console.log('=== Flight Price Check ===');
  console.log(`Time: ${new Date().toLocaleString('en-US', { timeZone: 'America/New_York' })} EST`);
  console.log('');

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
    const mixed = flight.return_date
      && flight.return_seat_class
      && flight.return_seat_class !== flight.seat_class;

    const classLabel = mixed
      ? `${flight.seat_class} / ${flight.return_seat_class} mixed`
      : (flight.seat_class || 'Main Cabin');

    console.log(`Checking: ${flight.origin} -> ${flight.destination} (${flight.departure_date}) [${classLabel}]`);
    console.log(`  Current price: $${flight.current_price} | Initial: $${flight.initial_price}`);

    if (mixed) {
      // Mixed-cabin: two one-way searches
      const result = await searchMixedCabin(flight);

      if (!result || (result.outboundPrice === null && result.returnPrice === null)) {
        console.log('  Skipped -- no Delta price data found\n');
        skipped++;
        await delay(2000);
        continue;
      }

      checked++;
      const newPrice = result.totalPrice;
      const oldPrice = parseFloat(flight.current_price);
      const initialPrice = parseFloat(flight.initial_price);

      console.log(`  Outbound: $${result.outboundPrice ?? 'N/A'} (${flight.seat_class})`);
      console.log(`  Return:   $${result.returnPrice ?? 'N/A'} (${flight.return_seat_class})`);
      console.log(`  Total:    $${newPrice}`);

      // Update flight
      const updateData = {
        current_price: newPrice,
        updated_at: new Date().toISOString(),
      };
      if (result.outboundPrice !== null) updateData.outbound_price = result.outboundPrice;
      if (result.returnPrice !== null) updateData.return_price = result.returnPrice;

      const { error: updateErr } = await supabase
        .from('flights')
        .update(updateData)
        .eq('id', flight.id);

      if (updateErr) console.error('  Failed to update price:', updateErr.message);

      // Log per-leg price history
      const oldOutbound = parseFloat(flight.outbound_price) || 0;
      const oldReturn = parseFloat(flight.return_price) || 0;

      if (result.outboundPrice !== null && Math.abs(result.outboundPrice - oldOutbound) > 0.01) {
        await supabase.from('price_history').insert([{
          flight_id: flight.id,
          price: result.outboundPrice,
          leg: 'outbound',
        }]);
      }
      if (result.returnPrice !== null && Math.abs(result.returnPrice - oldReturn) > 0.01) {
        await supabase.from('price_history').insert([{
          flight_id: flight.id,
          price: result.returnPrice,
          leg: 'return',
        }]);
      }

      // Deal alert
      const totalDrop = initialPrice - newPrice;
      if (totalDrop >= DROP_THRESHOLD) {
        const alert = `DEAL: ${flight.origin} -> ${flight.destination} [${classLabel}] dropped $${totalDrop.toFixed(0)} (now $${newPrice}, was $${initialPrice})`;
        console.log(`  ** ${alert}`);
        alerts.push(alert);
      }

    } else {
      // Same-cabin: single search (round-trip or one-way)
      const result = await searchFlight(flight);

      if (!result) {
        console.log('  Skipped -- no Delta price data found\n');
        skipped++;
        await delay(2000);
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

      const { error: updateErr } = await supabase
        .from('flights')
        .update({
          current_price: newPrice,
          updated_at: new Date().toISOString(),
        })
        .eq('id', flight.id);

      if (updateErr) console.error('  Failed to update price:', updateErr.message);

      if (Math.abs(newPrice - oldPrice) > 0.01) {
        await supabase.from('price_history').insert([{
          flight_id: flight.id,
          price: newPrice,
          leg: null,
        }]);
      }

      if (totalDrop >= DROP_THRESHOLD) {
        const alert = `DEAL: ${flight.origin} -> ${flight.destination} [${classLabel}] dropped $${totalDrop.toFixed(0)} (now $${newPrice}, was $${initialPrice})`;
        console.log(`  ** ${alert}`);
        alerts.push(alert);
      }
    }

    console.log('');
    await delay(2000);
  }

  console.log('=== Summary ===');
  console.log(`Total: ${flights.length} | Checked: ${checked} | Skipped: ${skipped}`);
  if (alerts.length > 0) {
    console.log(`\nDEAL ALERTS (${alerts.length}):`);
    alerts.forEach(a => console.log(`  ${a}`));
  } else {
    console.log('No deal alerts this run.');
  }
}

function delay(ms) {
  return new Promise(r => setTimeout(r, ms));
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
