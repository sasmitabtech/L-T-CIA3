/* Live frontend adapter for the Express API. */
(function () {
  function message(error) {
    if (error && error.status === 409) return `This request conflicts with current availability: ${error.message}`;
    return error?.message || 'Something went wrong. Please try again.';
  }

  function setBusy(button, busy, label) {
    if (!button) return;
    button.disabled = busy;
    const text = button.querySelector('span:first-child');
    if (text && label) text.textContent = busy ? 'Working...' : label;
  }

  async function handleLoginLive(event) {
    event.preventDefault();
    const form = event.target;
    if (!form.checkValidity()) return form.reportValidity();
    const email = cleanText(document.getElementById('loginEmail').value, 254).toLowerCase();
    const password = document.getElementById('loginPassword').value;
    if (!isValidEmail(email) || /\s/.test(password) || password.length < 6) {
      return showToast('Enter a valid email and a password of at least 6 characters without spaces.', 'error');
    }
    const button = document.getElementById('loginBtn');
    setBusy(button, true, 'Sign in');
    try {
      const response = await API.login({ email, password });
      saveAuth(response.data.token, response.data.user);
      showToast('Signed in successfully', 'success');
      setTimeout(() => postAuthRedirect(response.data.user), 300);
    } catch (error) {
      showToast(message(error), 'error');
    } finally { setBusy(button, false, 'Sign in'); }
  }

  async function handleRegisterLive(event) {
    event.preventDefault();
    const form = event.target;
    if (!form.checkValidity()) return form.reportValidity();
    const name = cleanText(document.getElementById('regName').value, 100);
    const email = cleanText(document.getElementById('regEmail').value, 254).toLowerCase();
    const password = document.getElementById('regPassword').value;
    const role = document.querySelector('input[name="role"]:checked')?.value;
    if (name.length < 2 || !isValidEmail(email) || /\s/.test(password) || password.length < 6 || !['guest', 'staff'].includes(role)) {
      return showToast('Enter valid account details. Passwords must be at least 6 characters without spaces.', 'error');
    }
    const button = document.getElementById('regBtn');
    setBusy(button, true, 'Create account');
    try {
      const response = await API.register({ name, email, password, role: role === 'staff' ? 'Staff' : 'Guest' });
      saveAuth(response.data.token, response.data.user);
      showToast('Account created successfully', 'success');
      setTimeout(() => postAuthRedirect(response.data.user), 300);
    } catch (error) {
      showToast(message(error), 'error');
    } finally { setBusy(button, false, 'Create account'); }
  }

  function renderSearchResults(hotels) {
    const panel = document.querySelector('.search-layout > div:last-child');
    if (!panel) return;
    panel.querySelectorAll('.hotel-group-header, .room-result').forEach((element) => element.remove());
    const count = hotels.reduce((total, hotel) => total + (hotel.roomTypes?.length || 0), 0);
    const resultCount = document.getElementById('resultCount');
    if (resultCount) resultCount.textContent = `${count} rooms`;
    if (!hotels.length) {
      const empty = document.createElement('div');
      empty.className = 'empty-state';
      empty.innerHTML = '<i class="fa-solid fa-bed"></i><p>No available rooms matched those dates.</p>';
      panel.appendChild(empty);
      return;
    }
    hotels.forEach((hotel, index) => {
      const group = document.createElement('div');
      group.className = 'hotel-group-header';
      group.innerHTML = `<div><div class="hotel-group-name">${escapeHTML(hotel.name)}</div><div style="font-size:.78rem;color:var(--text-muted);">${escapeHTML(hotel.city)} · ${Number(hotel.rating) || 0} stars · ${hotel.roomTypes.length} room types available</div></div><i class="fa-solid fa-chevron-down" style="color:var(--gold);"></i>`;
      group.addEventListener('click', () => group.nextElementSibling.classList.toggle('is-collapsed'));
      panel.appendChild(group);
      const rooms = document.createElement('div');
      rooms.dataset.hotelId = hotel._id;
      hotel.roomTypes.forEach((room) => {
        const card = document.createElement('div');
        card.className = 'room-result';
        card.innerHTML = `<div class="room-result-img"><div class="room-result-img-bg"><i class="fa-solid fa-bed"></i></div></div><div class="room-result-body"><div class="room-result-name">${escapeHTML(room.name)}</div><div class="room-result-hotel"><i class="fa-solid fa-building"></i> ${escapeHTML(hotel.name)}, ${escapeHTML(hotel.city)}</div><div class="room-result-features"><span class="room-result-feature"><i class="fa-solid fa-users" style="color:var(--gold);"></i> Up to ${positiveInteger(room.capacity) || 0} guests</span><span class="room-result-feature"><i class="fa-solid fa-door-open" style="color:var(--gold);"></i> ${positiveInteger(room.availableRooms) || 0} available</span></div></div><div class="room-result-action"><div class="text-center"><div style="font-family:var(--font-display);font-size:1.8rem;color:var(--pearl);">₹${Number(room.basePrice).toLocaleString('en-IN')}</div><div style="font-size:.72rem;color:var(--text-muted);">per night</div></div><button class="btn btn-primary btn-sm" style="width:100%;margin-top:.75rem;" data-hotel-id="${escapeHTML(hotel._id)}" data-room-type-id="${escapeHTML(room._id)}">Select</button></div>`;
        card.querySelector('button').addEventListener('click', () => bookRoom(hotel._id, room._id));
        rooms.appendChild(card);
      });
      panel.appendChild(rooms);
      if (index === hotels.length - 1) document.getElementById('searchMeta').textContent = `${hotels.length} hotels found`;
    });
  }

  async function loadSearchResultsLive() {
    if (!document.getElementById('qCity')) return;
    const checkIn = document.getElementById('qIn').value;
    const checkOut = document.getElementById('qOut').value;
    const guests = positiveInteger(document.getElementById('qGuests').value);
    if (!isValidDateRange(checkIn, checkOut) || !guests || guests > 100) {
      return showToast('Choose future dates with check-out after check-in and a positive guest count.', 'error');
    }
    try {
      const response = await API.searchHotels({ city: document.getElementById('qCity').value, checkIn: document.getElementById('qIn').value, checkOut: document.getElementById('qOut').value, guests: document.getElementById('qGuests').value });
      renderSearchResults(response.data || []);
    } catch (error) { renderSearchResults([]); showToast(message(error), 'error'); }
  }

  function runSearchLive() {
    if (!isValidDateRange(document.getElementById('qIn').value, document.getElementById('qOut').value) || !positiveInteger(document.getElementById('qGuests').value)) {
      return showToast('Choose valid future dates and a positive guest count before searching.', 'error');
    }
    const query = new URLSearchParams({ city: document.getElementById('qCity').value, checkIn: document.getElementById('qIn').value, checkOut: document.getElementById('qOut').value, guests: document.getElementById('qGuests').value });
    window.history.replaceState({}, '', `search.html?${query}`);
    loadSearchResultsLive();
  }

  function bookRoomLive(hotelId, roomTypeId) {
    const query = new URLSearchParams({ hotelId, roomTypeId, checkIn: document.getElementById('qIn')?.value || '', checkOut: document.getElementById('qOut')?.value || '', guests: document.getElementById('qGuests')?.value || '1' });
    window.location.href = `booking.html?${query}`;
  }

  async function processPaymentLive() {
    const user = requireAuth();
    if (!user) return;
    const params = new URLSearchParams(window.location.search);
    const body = { guestId: user.id || user._id, hotelId: params.get('hotelId'), roomTypeId: params.get('roomTypeId'), checkIn: params.get('checkIn'), checkOut: params.get('checkOut') };
    if (!body.hotelId || !body.roomTypeId || !body.checkIn || !body.checkOut) return showToast('Return to search and select an available room first.', 'error');
    if (!isValidDateRange(body.checkIn, body.checkOut)) return showToast('Check-out must be after check-in and dates cannot be in the past.', 'error');
    const button = document.getElementById('payBtn');
    setBusy(button, true, 'Pay & Confirm');
    try {
      const response = await API.createBooking(body);
      const booking = response.data;
      document.getElementById('bookingRef').textContent = booking._id;
      document.getElementById('confEmail').textContent = user.email || '';
      document.getElementById('conf-hotel').textContent = hotelNameFromBooking(booking) || 'Hotel';
      document.getElementById('conf-room').textContent = roomNameFromBooking(booking) || 'Room';
      document.getElementById('conf-ci').textContent = formatDate(booking.checkIn);
      document.getElementById('conf-co').textContent = formatDate(booking.checkOut);
      document.getElementById('conf-guests').textContent = `${positiveInteger(params.get('guests')) || 1} guest(s)`;
      document.getElementById('conf-total').textContent = `₹${Number(booking.totalAmount || 0).toLocaleString('en-IN')}`;
      showToast('Booking created successfully', 'success');
      if (typeof goStep === 'function') goStep(4);
    } catch (error) { renderGuestBookings([]); showToast(message(error), 'error'); }
    finally { setBusy(button, false, 'Pay & Confirm'); }
  }

  async function loadGuestBookingsLive() {
    if (!document.getElementById('upcomingCount')) return;
    const user = requireAuth();
    if (!user) return;
    try {
      const response = await API.getGuestBookings(user.id || user._id);
      window.velourBookings = response.data || [];
      const count = document.getElementById('upcomingCount');
      if (count) count.textContent = window.velourBookings.filter((booking) => ['Reserved', 'Confirmed'].includes(booking.status)).length;
      renderGuestBookings(window.velourBookings);
    } catch (error) { showToast(message(error), 'error'); }
  }

  async function cancelBookingLive(id) {
    const reason = window.prompt('Reason for cancellation (optional):', 'Changed plans');
    if (reason === null) return;
    try { await API.cancelBooking(id, cleanText(reason, 300)); showToast('Booking cancelled successfully', 'success'); loadGuestBookingsLive(); }
    catch (error) { showToast(message(error), 'error'); }
  }

  function hotelNameFromBooking(booking) { return booking.hotelId?.name || document.getElementById('sumHotel')?.textContent || 'Hotel'; }
  function roomNameFromBooking(booking) { return booking.roomTypeId?.name || document.getElementById('sumRoomName')?.textContent || 'Room'; }

  async function doCancelLive(id, button) {
    if (!window.confirm('Cancel this booking? This action cannot be undone.')) return;
    setBusy(button, true, 'Confirm cancellation');
    try {
      await API.cancelBooking(id, 'Guest requested cancellation');
      showToast('Booking cancelled successfully', 'success');
      await loadGuestBookingsLive();
    } catch (error) {
      showToast(message(error), 'error');
      setBusy(button, false, 'Confirm cancellation');
    }
  }

  async function viewInvoiceLive(bookingId) {
    try {
      const response = await API.getInvoice(bookingId);
      const invoice = response.data || {};
      document.getElementById('invoiceId').textContent = invoice.bookingId || bookingId;
      document.getElementById('invRoom').textContent = invoice.roomType || 'Room';
      document.getElementById('invCheckIn').textContent = formatDate(invoice.checkIn);
      document.getElementById('invCheckOut').textContent = formatDate(invoice.checkOut);
      document.getElementById('invNights').textContent = nightsBetween(invoice.checkIn, invoice.checkOut);
      document.getElementById('invSubtotal').textContent = `₹${Number(invoice.subtotal || 0).toLocaleString('en-IN')}`;
      document.getElementById('invTotal').textContent = `₹${Number(invoice.total || 0).toLocaleString('en-IN')}`;
      openModal('invoiceModal');
    } catch (error) { showToast(message(error), 'error'); }
  }

  async function loadAdminStatsLive() {
    if (!document.getElementById('panel-dashboard')) return;
    const user = requireStaff();
    if (!user) return;
    renderAdminBookings([]);
    renderAdminHotels([]);
    renderAdminRoomTypes([]);
    renderHousekeeping([]);
    try {
      const response = await API.getDashboardStats();
      const stats = response.data || {};
      const values = document.querySelectorAll('.stat-value');
      if (values[0] && stats.occupancyRate != null) values[0].textContent = `${stats.occupancyRate}%`;
      if (values[1] && stats.revenueToday != null) values[1].textContent = `₹${Number(stats.revenueToday).toLocaleString('en-IN')}`;
      if (values[2] && stats.activeBookings != null) values[2].textContent = stats.activeBookings;
      if (values[3] && stats.totalHotels != null) values[3].textContent = stats.totalHotels;
      const hotels = (await API.getAllHotels()).data || [];
      const bookings = (await API.getAllBookings()).data || [];
      renderAdminBookings(bookings);
      const roomTypes = (await API.getAllRoomTypes()).data || [];
      renderAdminHotels(hotels);
      renderAdminRoomTypes(roomTypes);
      const hotelSelect = document.querySelector('#addRoomTypeModal select');
      if (hotelSelect) {
        hotelSelect.replaceChildren(...hotels.map((hotel) => { const option = document.createElement('option'); option.value = hotel._id; option.textContent = `${hotel.name} (${hotel.city})`; return option; }));
      }
      const pricingRoomSelect = document.querySelector('#addPricingModal select');
      if (pricingRoomSelect) {
        pricingRoomSelect.replaceChildren(...roomTypes.map((room) => { const option = document.createElement('option'); option.value = room._id; option.textContent = room.name; return option; }));
      }
      if (hotels[0]) {
        const rooms = (await API.getHousekeepingStatus(hotels[0]._id)).data || [];
        renderHousekeeping(rooms);
      }
      await renderPricingRules(roomTypes);
    } catch (error) { showToast(message(error), 'error'); }
  }

  function renderAdminBookings(bookings) {
    const table = document.getElementById('bookingsTable');
    if (!table) return;
    table.innerHTML = bookings.length ? bookings.map((booking) => {
      const action = booking.status === 'Checked-in'
        ? `<button class="btn btn-primary btn-sm" onclick="doCheckout('${escapeHTML(booking._id)}')">Check-out</button>`
        : booking.status === 'Reserved' || booking.status === 'Confirmed'
          ? `<button class="btn btn-primary btn-sm" onclick="doCheckin('${escapeHTML(booking._id)}')">Check-in</button>`
          : '<span class="muted">No action</span>';
      return `<tr><td><strong>${escapeHTML(booking._id)}</strong></td><td>${escapeHTML(booking.guestId?.name || booking.guestId?.email || 'Guest')}</td><td>${escapeHTML(booking.hotelId?.name || 'Hotel')} / ${escapeHTML(booking.roomTypeId?.name || 'Room')}</td><td>${formatDate(booking.checkIn)}</td><td>${formatDate(booking.checkOut)}</td><td>${nightsBetween(booking.checkIn, booking.checkOut)}</td><td>₹${Number(booking.totalAmount || 0).toLocaleString('en-IN')}</td><td>${escapeHTML(booking.status)}</td><td>${action}</td></tr>`;
    }).join('') : '<tr><td colspan="9" class="empty-state">No bookings found.</td></tr>';
  }

  function renderAdminHotels(hotels) {
    const target = document.querySelector('#panel-hotels .grid-3');
    if (!target) return;
    target.innerHTML = hotels.length ? hotels.map((hotel) => `<article class="card"><div class="card-body"><div class="hotel-card-name">${escapeHTML(hotel.name)}</div><div class="hotel-card-location">${escapeHTML(hotel.city)}</div><div class="flex gap-sm"><span class="badge badge-green">${Number(hotel.rating) || 0} stars</span><button class="btn btn-outline btn-sm" onclick="showPanel('rooms', null)">Rooms</button></div></div></article>`).join('') : '<div class="empty-state"><p>No hotels found.</p></div>';
  }

  function renderAdminRoomTypes(roomTypes) {
    const target = document.querySelector('#panel-rooms tbody');
    if (!target) return;
    target.innerHTML = roomTypes.length ? roomTypes.map((room) => `<tr><td><strong>${escapeHTML(room.name)}</strong></td><td>${escapeHTML(room.hotelId?.name || 'Hotel')}</td><td>₹${Number(room.basePrice || 0).toLocaleString('en-IN')}</td><td>${positiveInteger(room.capacity) || 0}</td><td>${positiveInteger(room.totalRooms) || 0}</td><td>Live</td><td><span class="badge badge-green">Active</span></td><td><button class="btn btn-danger btn-sm" onclick="deleteRoomType('${escapeHTML(room._id)}')">Delete</button></td></tr>`).join('') : '<tr><td colspan="8" class="empty-state">No room types found.</td></tr>';
  }

  function renderHousekeeping(rooms) {
    const target = document.querySelector('#panel-housekeeping .hk-board');
    if (!target) return;
    target.innerHTML = rooms.length ? rooms.map((room) => `<button type="button" class="hk-room ${String(room.housekeepingStatus || '').toLowerCase().replace(/\s+/g, '-')}" data-room-id="${escapeHTML(room._id)}" onclick="cycleStatus(this)"><span class="hk-room-number">${escapeHTML(room.roomNumber)}</span><span class="hk-room-status">${escapeHTML(room.housekeepingStatus)}</span></button>`).join('') : '<div class="empty-state"><p>No rooms found for housekeeping.</p></div>';
  }

  async function renderPricingRules(roomTypes) {
    const target = document.getElementById('pricingList');
    if (!target) return;
    const responses = await Promise.all(roomTypes.map((room) => API.getPricingRules(room._id)));
    const rules = responses.flatMap((response) => response.data || []);
    target.innerHTML = rules.length ? rules.map((rule) => `<div class="pricing-row"><span class="pricing-badge">${escapeHTML(rule.season)}</span><span>${escapeHTML(rule.roomTypeId?.name || 'Room type')}</span><span style="margin-left:auto;color:var(--gold-bright);font-weight:600;">×${Number(rule.multiplier).toFixed(2)}</span><button class="btn btn-ghost btn-sm" onclick="deletePricing('${escapeHTML(rule._id)}')"><i class="fa-solid fa-trash"></i></button></div>`).join('') : '<div class="empty-state"><p>No pricing rules found.</p></div>';
  }

  async function deleteRoomTypeLive(id) {
    if (!window.confirm('Delete this room type?')) return;
    try { await API.deleteRoomType(id); showToast('Room type deleted', 'success'); loadAdminStatsLive(); } catch (error) { showToast(message(error), 'error'); }
  }

  async function deletePricingLive(id) {
    if (!window.confirm('Delete this pricing rule?')) return;
    try { await API.deletePricingRule(id); showToast('Pricing rule deleted', 'success'); loadAdminStatsLive(); } catch (error) { showToast(message(error), 'error'); }
  }

  async function doCheckinLive(id) {
    try { await API.checkIn(id); showToast('Check-in recorded successfully', 'success'); loadAdminStatsLive(); }
    catch (error) { showToast(message(error), 'error'); }
  }

  async function doCheckoutLive(id) {
    try { await API.checkOut(id); showToast('Check-out recorded successfully', 'success'); loadAdminStatsLive(); }
    catch (error) { showToast(message(error), 'error'); }
  }

  async function confirmBookingLive(id, button) {
    try {
      await API.updateBookingStatus(id, 'Confirmed');
      if (button) { button.textContent = 'Confirmed'; button.disabled = true; }
      showToast('Booking confirmed successfully', 'success');
    } catch (error) { showToast(message(error), 'error'); }
  }

  async function runReportLive() {
    try {
      const query = { hotelId: '', from: document.getElementById('reportFrom')?.value, to: document.getElementById('reportTo')?.value };
      const [occupancy, revenue] = await Promise.all([API.getOccupancyReport(query), API.getRevenueReport(query)]);
      showToast(`Reports loaded: ${occupancy.data?.length || 0} properties, ₹${(revenue.data || []).reduce((sum, item) => sum + (item.revenue || 0), 0).toLocaleString('en-IN')} revenue`, 'success');
    } catch (error) { showToast(message(error), 'error'); }
  }

  async function cycleStatusLive(element) {
    const roomId = element?.dataset.roomId;
    const status = element?.classList.contains('dirty') ? 'Under Maintenance' : 'Dirty';
    if (!roomId) return showToast('This room row has no database room ID yet.', 'error');
    try { await API.updateHousekeeping(roomId, status); showToast(`Room status updated to ${status}`, 'success'); }
    catch (error) { showToast(message(error), 'error'); }
  }

  async function saveHotelLive(event) {
    event.preventDefault();
    const inputs = [...event.target.querySelectorAll('input')];
    const rating = positiveNumber(event.target.querySelector('select')?.value.replace(/\D/g, ''), 0);
    try {
      const amenities = [...event.target.querySelectorAll('input[type="checkbox"]:checked')].map((input) => cleanText(input.parentElement.textContent));
      if (!cleanText(inputs[0]?.value) || !cleanText(inputs[1]?.value) || rating === null || rating > 5) return showToast('Enter a hotel name, city, and a rating from 0 to 5.', 'error');
      await API.createHotel({ name: cleanText(inputs[0].value), city: cleanText(inputs[1].value), rating, amenities });
      closeModal('addHotelModal');
      showToast('Hotel saved successfully', 'success');
    } catch (error) { showToast(message(error), 'error'); }
  }

  async function saveRoomTypeLive(event) {
    event.preventDefault();
    const inputs = [...event.target.querySelectorAll('input, select')];
    try {
      const basePrice = positiveNumber(inputs[2].value, 0.01);
      const totalRooms = positiveInteger(inputs[3].value);
      const capacity = positiveInteger(inputs[4].value);
      if (!inputs[0].value || !cleanText(inputs[1].value) || basePrice === null || !totalRooms || !capacity) return showToast('Room name, price, total rooms, and capacity must be valid positive values.', 'error');
      await API.createRoomType(inputs[0].value, { name: cleanText(inputs[1].value), basePrice, totalRooms, capacity });
      closeModal('addRoomTypeModal');
      showToast('Room type saved successfully', 'success');
    } catch (error) { showToast(message(error), 'error'); }
  }

  async function savePricingRuleLive(event) {
    event.preventDefault();
    const inputs = [...event.target.querySelectorAll('input, select')];
    try {
      const selects = [...event.target.querySelectorAll('select')];
      const multiplier = event.target.querySelector('input[type="number"]');
      const startDate = event.target.querySelector('input[type="date"]')?.value || null;
      const endDate = [...event.target.querySelectorAll('input[type="date"]')][1]?.value || null;
      const value = positiveNumber(multiplier.value, 1);
      if (!selects[0].value || value === null || (startDate && endDate && new Date(endDate) < new Date(startDate))) return showToast('Select a room type, multiplier >= 1, and a valid date range.', 'error');
      await API.createPricingRule({ roomTypeId: selects[0].value, season: cleanText(selects[2].value), multiplier: value, startDate, endDate });
      closeModal('addPricingModal');
      showToast('Pricing rule saved successfully', 'success');
    } catch (error) { showToast(message(error), 'error'); }
  }

  function renderGuestBookings(bookings) {
    const upcoming = document.querySelector('#upcoming .grid-2');
    const history = document.getElementById('historyTable');
    if (upcoming) {
      const active = bookings.filter((booking) => ['Reserved', 'Confirmed', 'Checked-in'].includes(booking.status));
      upcoming.innerHTML = active.length ? active.map((booking) => `<article class="upcoming-card"><div class="upcoming-card-accent"></div><div class="upcoming-card-body"><div class="flex justify-between items-center"><span class="badge badge-green">${escapeHTML(booking.status)}</span><span class="booking-id">${escapeHTML(booking._id)}</span></div><div class="hotel-name">${escapeHTML(booking.hotelId?.name || 'Hotel')}</div><div class="hotel-location">${escapeHTML(booking.hotelId?.city || '')}</div><div class="booking-dates">${formatDate(booking.checkIn)} <span>${nightsBetween(booking.checkIn, booking.checkOut)} nights</span> ${formatDate(booking.checkOut)}</div><div class="booking-total">₹${Number(booking.totalAmount || 0).toLocaleString('en-IN')}</div><div class="flex gap-sm"><button class="btn btn-ghost btn-sm" onclick="viewInvoice('${escapeHTML(booking._id)}')">Invoice</button><button class="btn btn-danger btn-sm" onclick="promptCancel(this)">Cancel</button></div><div class="cancel-confirm" style="display:none"><p>Cancel this booking?</p><button class="btn btn-danger btn-sm" onclick="doCancel('${escapeHTML(booking._id)}', this)">Confirm cancellation</button></div></div></article>`).join('') : '<div class="empty-state"><p>No upcoming bookings found.</p></div>';
    }
    if (history) {
      const past = bookings.filter((booking) => !['Reserved', 'Confirmed', 'Checked-in'].includes(booking.status));
      history.innerHTML = past.length ? past.map((booking) => `<tr><td><strong>${escapeHTML(booking._id)}</strong></td><td>${escapeHTML(booking.hotelId?.name || 'Hotel')}</td><td>${escapeHTML(booking.roomTypeId?.name || 'Room')}</td><td>${formatDate(booking.checkIn)} - ${formatDate(booking.checkOut)}</td><td>₹${Number(booking.totalAmount || 0).toLocaleString('en-IN')}</td><td>${escapeHTML(booking.status)}</td><td><button class="btn btn-ghost btn-sm" onclick="viewInvoice('${escapeHTML(booking._id)}')">Invoice</button></td></tr>`).join('') : '<tr><td colspan="7" class="empty-state">No booking history found.</td></tr>';
    }
  }

  document.addEventListener('DOMContentLoaded', () => {
    window.handleLogin = handleLoginLive;
    window.handleRegister = handleRegisterLive;
    window.runSearch = runSearchLive;
    window.bookRoom = bookRoomLive;
    window.processPayment = processPaymentLive;
    window.cancelBooking = cancelBookingLive;
    window.doCancel = doCancelLive;
    window.viewInvoice = viewInvoiceLive;
    window.doCheckin = doCheckinLive;
    window.doCheckout = doCheckoutLive;
    window.confirmBooking = confirmBookingLive;
    window.runReport = runReportLive;
    window.cycleStatus = cycleStatusLive;
    window.saveHotel = saveHotelLive;
    window.saveRoomType = saveRoomTypeLive;
    window.savePricingRule = savePricingRuleLive;
    window.deleteRoomType = deleteRoomTypeLive;
    window.deletePricing = deletePricingLive;
    loadSearchResultsLive();
    loadGuestBookingsLive();
    loadAdminStatsLive();
  });
}());
