// ============================================
// Flight Tracker App — Single screen, all flights
// ============================================

let allFlights = [];

// ---- Initialization ----
document.addEventListener('DOMContentLoaded', () => {
  loadFlights();

  document.getElementById('flight-form').addEventListener('submit', handleAddFlight);
  document.getElementById('filter-status').addEventListener('change', renderFlights);
  document.getElementById('refresh-btn').addEventListener('click', loadFlights);

  document.getElementById('modal-close').addEventListener('click', closeModal);
  document.getElementById('modal-overlay').addEventListener('click', (e) => {
    if (e.target === e.currentTarget) closeModal();
  });
});

// ---- Toast Notifications ----
function showToast(message, type = 'success') {
  const container = document.getElementById('toast-container');
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.textContent = message;
  container.appendChild(toast);
  setTimeout(() => toast.remove(), 4000);
}

// ---- CRUD Operations ----
async function loadFlights() {
  const loadingEl = document.getElementById('loading-state');
  const emptyEl = document.getElementById('empty-state');
  const listEl = document.getElementById('flights-list');

  loadingEl.classList.remove('hidden');
  emptyEl.classList.add('hidden');
  listEl.innerHTML = '';

  try {
    const { data, error } = await supabase
      .from('flights')
      .select('*, price_history(*)')
      .order('created_at', { ascending: false });

    if (error) throw error;

    allFlights = data || [];
    updateStats();
    renderFlights();
    checkForDeals();
  } catch (err) {
    console.error('Failed to load flights:', err);
    showToast('Failed to load flights. Check Supabase config.', 'error');
  } finally {
    loadingEl.classList.add('hidden');
  }
}

async function handleAddFlight(e) {
  e.preventDefault();

  const flight = {
    origin: document.getElementById('origin').value.trim().toUpperCase(),
    destination: document.getElementById('destination').value.trim().toUpperCase(),
    airline: document.getElementById('airline').value.trim() || null,
    departure_date: document.getElementById('departure-date').value,
    return_date: document.getElementById('return-date').value || null,
    initial_price: parseFloat(document.getElementById('current-price').value),
    current_price: parseFloat(document.getElementById('current-price').value),
    notes: document.getElementById('notes').value.trim() || null,
    status: 'active',
  };

  try {
    const { data, error } = await supabase
      .from('flights')
      .insert([flight])
      .select()
      .single();

    if (error) throw error;

    // Add initial price to history
    await supabase.from('price_history').insert([{
      flight_id: data.id,
      price: flight.initial_price,
    }]);

    showToast(`Tracking ${flight.origin} → ${flight.destination}!`);
    document.getElementById('flight-form').reset();
    loadFlights();
  } catch (err) {
    console.error('Failed to add flight:', err);
    showToast('Failed to add flight. Check your connection.', 'error');
  }
}

async function updateFlightPrice(flightId) {
  const input = document.querySelector(`[data-price-input="${flightId}"]`);
  if (!input) return;

  const newPrice = parseFloat(input.value);
  if (isNaN(newPrice) || newPrice < 0) {
    showToast('Enter a valid price', 'error');
    return;
  }

  try {
    const { error: updateError } = await supabase
      .from('flights')
      .update({ current_price: newPrice, updated_at: new Date().toISOString() })
      .eq('id', flightId);

    if (updateError) throw updateError;

    await supabase.from('price_history').insert([{
      flight_id: flightId,
      price: newPrice,
    }]);

    showToast('Price updated!');
    loadFlights();
  } catch (err) {
    console.error('Failed to update price:', err);
    showToast('Failed to update price.', 'error');
  }
}

async function deleteFlight(flightId) {
  if (!confirm('Remove this flight from tracking?')) return;

  try {
    await supabase.from('price_history').delete().eq('flight_id', flightId);
    const { error } = await supabase.from('flights').delete().eq('id', flightId);
    if (error) throw error;

    showToast('Flight removed.');
    loadFlights();
  } catch (err) {
    console.error('Failed to delete flight:', err);
    showToast('Failed to remove flight.', 'error');
  }
}

async function toggleStatus(flightId, currentStatus) {
  const newStatus = currentStatus === 'active' ? 'expired' : 'active';
  try {
    const { error } = await supabase
      .from('flights')
      .update({ status: newStatus })
      .eq('id', flightId);
    if (error) throw error;
    loadFlights();
  } catch (err) {
    showToast('Failed to update status.', 'error');
  }
}

// ---- Rendering ----
function renderFlights() {
  const listEl = document.getElementById('flights-list');
  const emptyEl = document.getElementById('empty-state');
  const filter = document.getElementById('filter-status').value;

  let flights = allFlights;
  if (filter === 'active') flights = flights.filter(f => f.status === 'active');
  else if (filter === 'deal') flights = flights.filter(f => (f.initial_price - f.current_price) >= 75);
  else if (filter === 'expired') flights = flights.filter(f => f.status === 'expired');

  if (flights.length === 0) {
    listEl.innerHTML = '';
    emptyEl.classList.remove('hidden');
    return;
  }

  emptyEl.classList.add('hidden');
  listEl.innerHTML = flights.map(renderFlightCard).join('');

  // Attach event listeners
  listEl.querySelectorAll('[data-action]').forEach(btn => {
    btn.addEventListener('click', () => {
      const action = btn.dataset.action;
      const id = btn.dataset.id;
      if (action === 'update-price') updateFlightPrice(id);
      else if (action === 'delete') deleteFlight(id);
      else if (action === 'toggle') toggleStatus(id, btn.dataset.status);
      else if (action === 'history') showPriceHistory(id);
    });
  });
}

function renderFlightCard(flight) {
  const priceDrop = flight.initial_price - flight.current_price;
  const isDeal = priceDrop >= 75;
  const priceDiff = flight.current_price - flight.initial_price;
  const pctChange = ((priceDiff / flight.initial_price) * 100).toFixed(1);
  const priceChanged = Math.abs(priceDiff) > 0.01;

  const departDate = flight.departure_date ? new Date(flight.departure_date + 'T00:00:00').toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric'
  }) : '';

  const returnDate = flight.return_date ? new Date(flight.return_date + 'T00:00:00').toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric'
  }) : '';

  const historyCount = flight.price_history ? flight.price_history.length : 0;

  return `
    <div class="flight-card ${isDeal ? 'is-deal' : ''}">
      <div class="flight-route">
        <span class="airport-code">${flight.origin}</span>
        <span class="route-arrow">${flight.return_date ? '⇄' : '→'}</span>
        <span class="airport-code">${flight.destination}</span>
        ${flight.airline ? `<span class="flight-airline">${flight.airline}</span>` : ''}
      </div>

      <div class="flight-details">
        <div class="flight-detail">
          <span class="label">Depart:</span> ${departDate}
        </div>
        ${returnDate ? `<div class="flight-detail"><span class="label">Return:</span> ${returnDate}</div>` : ''}
        ${flight.notes ? `<div class="flight-detail"><span class="label">Notes:</span> ${flight.notes}</div>` : ''}
      </div>

      <div class="price-section">
        <span class="price-current ${isDeal ? 'under-target' : ''}">$${flight.current_price.toFixed(2)}</span>
        ${priceChanged ? `<span class="price-original">$${flight.initial_price.toFixed(2)}</span>` : ''}
        ${priceChanged ? `<span class="price-change ${priceDiff < 0 ? 'down' : 'up'}">${priceDiff < 0 ? '↓' : '↑'} ${Math.abs(pctChange)}%</span>` : ''}

        <div class="flight-actions">
          <input type="number" data-price-input="${flight.id}" placeholder="New price" min="0" step="0.01"
            style="width:100px; padding:0.3rem 0.5rem; font-size:0.85rem;">
          <button class="btn btn-small btn-secondary" data-action="update-price" data-id="${flight.id}">Update</button>
          <button class="btn btn-small btn-secondary" data-action="history" data-id="${flight.id}">History (${historyCount})</button>
          <button class="btn btn-small btn-secondary" data-action="toggle" data-id="${flight.id}" data-status="${flight.status}">
            ${flight.status === 'active' ? 'Archive' : 'Reactivate'}
          </button>
          <button class="btn btn-small btn-danger" data-action="delete" data-id="${flight.id}">✕</button>
        </div>
      </div>

      <div class="flight-meta">
        <span>Added ${new Date(flight.created_at).toLocaleDateString()}</span>
        <span>Status: ${flight.status}</span>
      </div>
    </div>
  `;
}

// ---- Stats ----
function updateStats() {
  document.getElementById('stat-total').textContent = allFlights.length;
  document.getElementById('stat-deals').textContent = allFlights.filter(f => (f.initial_price - f.current_price) >= 75).length;
  document.getElementById('stat-active').textContent = allFlights.filter(f => f.status === 'active').length;
}

// ---- Deal Alerts ----
function checkForDeals() {
  const deals = allFlights.filter(f => f.status === 'active' && (f.initial_price - f.current_price) >= 75);
  deals.forEach(f => {
    const drop = (f.initial_price - f.current_price).toFixed(0);
    showToast(`ALERT: ${f.origin} → ${f.destination} dropped $${drop}! Now $${f.current_price}`, 'deal');
  });
}

// ---- Price History Modal ----
function showPriceHistory(flightId) {
  const flight = allFlights.find(f => f.id === flightId);
  if (!flight) return;

  const modal = document.getElementById('modal-overlay');
  const title = document.getElementById('modal-title');
  const body = document.getElementById('modal-body');

  title.textContent = `${flight.origin} → ${flight.destination} Price History`;

  const history = (flight.price_history || []).sort((a, b) =>
    new Date(b.created_at) - new Date(a.created_at)
  );

  if (history.length === 0) {
    body.innerHTML = '<p style="color:var(--text-muted)">No price history yet.</p>';
  } else {
    body.innerHTML = history.map(h => `
      <div class="price-history-item">
        <span>$${h.price.toFixed(2)}</span>
        <span style="color:var(--text-muted)">${new Date(h.created_at).toLocaleString()}</span>
      </div>
    `).join('');
  }

  modal.classList.remove('hidden');
}

function closeModal() {
  document.getElementById('modal-overlay').classList.add('hidden');
}

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') closeModal();
});
