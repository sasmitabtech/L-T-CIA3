/* =========================================================
   Velour Hotels — main.js
   Navbar, AOS, Toast, Auth guards, shared utilities
   ========================================================= */

// ── AOS Init ─────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  if (typeof AOS !== 'undefined') {
    AOS.init({
      duration: 700,
      easing: 'ease-out-cubic',
      once: true,
      offset: 60,
    });
  }

  // Navbar scroll effect
  const navbar = document.getElementById('navbar');
  if (navbar) {
    window.addEventListener('scroll', () => {
      navbar.classList.toggle('scrolled', window.scrollY > 40);
    }, { passive: true });
  }

  // Hamburger menu
  const hamburger = document.getElementById('hamburger');
  const navLinks  = document.getElementById('navLinks');
  if (hamburger && navLinks) {
    hamburger.addEventListener('click', () => {
      navLinks.classList.toggle('mobile-open');
    });
  }

  // Sidebar mobile toggle
  const sidebarToggle = document.getElementById('sidebarToggle');
  const sidebar       = document.getElementById('sidebar');
  if (sidebarToggle && sidebar) {
    sidebarToggle.addEventListener('click', () => {
      sidebar.classList.toggle('open');
    });
  }

  // Active nav link highlight and role-based module visibility
  const currentPath = window.location.pathname.split('/').pop();
  const userRole = String(getUser()?.role || 'guest').toLowerCase();
  document.querySelectorAll('.nav-links a, .sidebar-link').forEach(link => {
    const href = link.getAttribute('href') || '';
    if (href === currentPath || (currentPath === '' && href === 'index.html')) {
      link.classList.add('active');
    }
    const allowedRoles = (link.dataset.roles || '').toLowerCase().split(/\s+/).filter(Boolean);
    if (allowedRoles.length && !allowedRoles.includes(userRole)) {
      link.hidden = true;
      link.setAttribute('aria-hidden', 'true');
    }
  });

  document.querySelectorAll('[data-module-panel]').forEach(panel => {
    const allowedRoles = (panel.dataset.roles || '').toLowerCase().split(/\s+/).filter(Boolean);
    if (allowedRoles.length && !allowedRoles.includes(userRole)) panel.hidden = true;
  });

  document.querySelectorAll('[data-nav-target]').forEach(link => {
    link.addEventListener('click', event => {
      const target = link.dataset.navTarget;
      if (!target || link.getAttribute('href') !== '#') return;
      event.preventDefault();
      if (typeof window.showPanel === 'function') window.showPanel(target, link);
      loadModuleData(target);
    });
  });

  // Tab system
  document.querySelectorAll('[data-tab-target]').forEach(btn => {
    btn.addEventListener('click', () => {
      const targetId = btn.dataset.tabTarget;
      const group    = btn.closest('[data-tab-group]');
      if (!group) return;
      group.querySelectorAll('[data-tab-target]').forEach(b => b.classList.remove('active'));
      group.querySelectorAll('[data-tab-panel]').forEach(p => p.style.display = 'none');
      btn.classList.add('active');
      const panel = document.querySelector(`[data-tab-panel="${targetId}"]`);
      if (panel) panel.style.display = '';
    });
  });

  // Init first tab panels
  document.querySelectorAll('[data-tab-group]').forEach(group => {
    const panels = group.querySelectorAll('[data-tab-panel]');
    panels.forEach((p, i) => { p.style.display = i === 0 ? '' : 'none'; });
    const btns = group.querySelectorAll('[data-tab-target]');
    if (btns[0]) btns[0].classList.add('active');
  });
});

async function loadModuleData(moduleName) {
  const user = getUser();
  try {
    if (moduleName === 'guest-history' && (user?.id || user?._id) && window.API?.getGuestBookings) {
      const result = await API.getGuestBookings(user.id || user._id);
      const target = document.querySelector('[data-module-output="guest-history"]');
      if (target) target.textContent = JSON.stringify(result.data || [], null, 2);
    }
    if (moduleName === 'reports' && window.API?.getOccupancyReport) {
      const from = document.getElementById('reportFrom')?.value || '';
      const to = document.getElementById('reportTo')?.value || '';
      const result = await API.getOccupancyReport({ hotelId: '', from, to });
      const target = document.querySelector('[data-module-output="reports"]');
      if (target) target.textContent = JSON.stringify(result.data || [], null, 2);
    }
    if (moduleName === 'hotels' && window.API?.getAllHotels) await API.getAllHotels();
    if (moduleName === 'rooms' && window.API?.getAllRoomTypes) await API.getAllRoomTypes();
    if (moduleName === 'housekeeping' && window.API?.getHousekeepingStatus) {
      const hotelId = document.querySelector('[data-hotel-id]')?.dataset.hotelId;
      if (hotelId) await API.getHousekeepingStatus(hotelId);
    }
  } catch (error) {
    console.error(`Failed to load ${moduleName}:`, error);
  }
}

// ── Toast ─────────────────────────────────────────────────
function showToast(message, type = 'info', duration = 3500) {
  const container = document.getElementById('toastContainer');
  if (!container) return;

  const icons = { success: 'fa-circle-check', error: 'fa-circle-xmark', info: 'fa-circle-info' };
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  const icon = document.createElement('i');
  icon.className = `fa-solid ${icons[type] || icons.info}`;
  icon.style.color = 'var(--gold)';
  const text = document.createElement('span');
  text.textContent = String(message || 'Something went wrong.');
  const close = document.createElement('button');
  close.type = 'button';
  close.setAttribute('aria-label', 'Dismiss notification');
  close.style.cssText = 'margin-left:auto;background:none;border:none;color:var(--text-muted);cursor:pointer;font-size:0.9rem;';
  close.innerHTML = '<i class="fa-solid fa-xmark"></i>';
  close.addEventListener('click', () => toast.remove());
  toast.append(icon, text, close);
  container.appendChild(toast);
  setTimeout(() => {
    toast.style.animation = 'toastIn 0.3s reverse forwards';
    setTimeout(() => toast.remove(), 300);
  }, duration);
}

// ── API Helper ────────────────────────────────────────────
const API_BASE = '/api';

async function apiRequest(method, endpoint, body = null) {
  const token = localStorage.getItem('velour_token');
  const opts = {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  };
  if (body) opts.body = JSON.stringify(body);

  try {
    const res = await fetch(`${API_BASE}${endpoint}`, opts);
    const contentType = res.headers.get('content-type') || '';
    const data = contentType.includes('application/json') ? await res.json() : {};
    if (!res.ok) {
      const statusMessages = {
        403: 'Access Denied: You do not have permission to execute this action.',
        429: 'Too many requests. Please wait a few minutes before trying again.',
      };
      if (res.status === 401) {
        clearAuth();
        if (!window.location.pathname.endsWith('login.html')) window.location.href = 'login.html';
      }
      const error = new Error(statusMessages[res.status] || data.message || 'Request failed');
      error.status = res.status;
      error.errorCode = data.errorCode;
      throw error;
    }
    return data;
  } catch (err) {
    throw err;
  }
}

// ── Auth Utilities ────────────────────────────────────────
function saveAuth(token, user) {
  localStorage.setItem('velour_token', token);
  localStorage.setItem('velour_user', JSON.stringify(user));
}

function getUser() {
  try { return JSON.parse(localStorage.getItem('velour_user')); } catch { return null; }
}

function getToken() { return localStorage.getItem('velour_token'); }

function clearAuth() {
  localStorage.removeItem('velour_token');
  localStorage.removeItem('velour_user');
}

function requireAuth(role = null) {
  const user = getUser();
  if (!user || !getToken()) {
    window.location.href = 'login.html';
    return null;
  }
  if (role && user.role !== role && user.role !== 'admin') {
    showToast('Access denied for your role', 'error');
    window.location.href = 'guest-dashboard.html';
    return null;
  }
  return user;
}

function postAuthRedirect(user) {
  if (user && (user.role === 'admin' || user.role === 'staff')) {
    window.location.href = 'dashboard.html';
  } else {
    window.location.href = 'guest-dashboard.html';
  }
}

function requireStaff() {
  const user = requireAuth();
  if (!user) return null;
  if (user.role !== 'admin' && user.role !== 'staff') {
    showToast('Staff or admin access required', 'error');
    window.location.href = 'guest-dashboard.html';
    return null;
  }
  return user;
}

function logout() {
  clearAuth();
  showToast('Signed out successfully', 'success');
  setTimeout(() => { window.location.href = 'index.html'; }, 300);
}

// ── Modal Helpers ─────────────────────────────────────────
function openModal(id) {
  const overlay = document.getElementById(id);
  if (overlay) {
    overlay.classList.add('open');
    document.body.style.overflow = 'hidden';
  }
}

function closeModal(id) {
  const overlay = document.getElementById(id);
  if (overlay) {
    overlay.classList.remove('open');
    document.body.style.overflow = '';
  }
}

document.addEventListener('click', e => {
  if (e.target.classList.contains('modal-overlay')) {
    e.target.classList.remove('open');
    document.body.style.overflow = '';
  }
});

// ── Form Validation ───────────────────────────────────────
function validateForm(formEl) {
  let valid = true;
  formEl.querySelectorAll('[required]').forEach(input => {
    const err = input.parentElement.querySelector('.form-error');
    if (!input.value.trim()) {
      input.style.borderColor = '#E56B5D';
      if (err) err.style.display = 'flex';
      valid = false;
    } else {
      input.style.borderColor = '';
      if (err) err.style.display = 'none';
    }
  });
  return valid;
}

function isValidEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/i.test(String(value || '').trim());
}

function isValidDateRange(checkIn, checkOut, allowToday = false) {
  const start = new Date(`${checkIn}T00:00:00`);
  const end = new Date(`${checkOut}T00:00:00`);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return Boolean(checkIn && checkOut && !Number.isNaN(start.getTime()) && !Number.isNaN(end.getTime()) &&
    (allowToday ? start >= today : start > today) && end > start);
}

function cleanText(value, maxLength = 200) {
  return String(value || '').replace(/[<>]/g, '').trim().slice(0, maxLength);
}

function escapeHTML(value) {
  const element = document.createElement('span');
  element.textContent = String(value ?? '');
  return element.innerHTML;
}

function positiveInteger(value) {
  const number = Number(value);
  return Number.isInteger(number) && number > 0 ? number : null;
}

function positiveNumber(value, minimum = 0) {
  const number = Number(value);
  return Number.isFinite(number) && number >= minimum ? number : null;
}

// ── Sidebar user info ─────────────────────────────────────
function populateSidebarUser() {
  const user = getUser();
  if (!user) return;
  const nameEl   = document.getElementById('sidebarUserName');
  const roleEl   = document.getElementById('sidebarUserRole');
  const avatarEl = document.getElementById('sidebarUserAvatar');
  if (nameEl)   nameEl.textContent   = user.name || user.email;
  if (roleEl)   roleEl.textContent   = user.role  || 'Guest';
  if (avatarEl) avatarEl.textContent = (user.name || 'G')[0].toUpperCase();
}

document.addEventListener('DOMContentLoaded', populateSidebarUser);

// ── Date utilities ────────────────────────────────────────
function formatDate(dateStr) {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
}

function nightsBetween(checkIn, checkOut) {
  const a = new Date(checkIn), b = new Date(checkOut);
  return Math.max(0, Math.round((b - a) / (1000 * 60 * 60 * 24)));
}

// ── Expose globals ────────────────────────────────────────
window.showToast   = showToast;
window.apiRequest  = apiRequest;
window.saveAuth    = saveAuth;
window.getUser     = getUser;
window.getToken    = getToken;
window.clearAuth   = clearAuth;
window.requireAuth = requireAuth;
window.requireStaff = requireStaff;
window.postAuthRedirect = postAuthRedirect;
window.logout      = logout;
window.openModal   = openModal;
window.closeModal  = closeModal;
window.formatDate  = formatDate;
window.nightsBetween = nightsBetween;
window.isValidEmail = isValidEmail;
window.isValidDateRange = isValidDateRange;
window.cleanText = cleanText;
window.positiveInteger = positiveInteger;
window.positiveNumber = positiveNumber;
window.escapeHTML = escapeHTML;
