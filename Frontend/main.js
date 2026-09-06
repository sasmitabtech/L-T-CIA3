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

  // Active nav link highlight
  const currentPath = window.location.pathname.split('/').pop();
  document.querySelectorAll('.nav-links a, .sidebar-link').forEach(link => {
    const href = link.getAttribute('href') || '';
    if (href === currentPath || (currentPath === '' && href === 'index.html')) {
      link.classList.add('active');
    }
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

// ── Toast ─────────────────────────────────────────────────
function showToast(message, type = 'info', duration = 3500) {
  const container = document.getElementById('toastContainer');
  if (!container) return;

  const icons = { success: 'fa-circle-check', error: 'fa-circle-xmark', info: 'fa-circle-info' };
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.innerHTML = `
    <i class="fa-solid ${icons[type] || icons.info}" style="color:var(--gold);"></i>
    <span>${message}</span>
    <button onclick="this.parentElement.remove()" style="margin-left:auto;background:none;border:none;color:var(--text-muted);cursor:pointer;font-size:0.9rem;">
      <i class="fa-solid fa-xmark"></i>
    </button>`;
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
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Request failed');
    return data;
  } catch (err) {
    showToast(err.message, 'error');
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

function logout() {
  clearAuth();
  showToast('Signed out successfully', 'success');
  setTimeout(() => window.location.href = 'index.html', 800);
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
window.logout      = logout;
window.openModal   = openModal;
window.closeModal  = closeModal;
window.formatDate  = formatDate;
window.nightsBetween = nightsBetween;
