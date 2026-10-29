/**
 * app.js - ADUIN Client-Side Script (GLOBAL CORE)
 * Multi-Role: Pelapor, Verifikator, Teknisi
 * Frontend only: localStorage + fetch users.json / data.json
 * ==========================================================================
 */

/* ==========================================================================
   1. STORAGE KEYS & HELPER FUNCTIONS
   ========================================================================== */
const STORAGE_KEYS = {
  REPORTS: 'aduin_reports',
  USERS: 'aduin_users',
  SESSION: 'aduin_session',
  AVATAR_PREFIX: 'aduin_avatar_',
};

function getStoredReports() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEYS.REPORTS) || '[]'); }
  catch { return []; }
}
function saveStoredReports(reports) {
  try { localStorage.setItem(STORAGE_KEYS.REPORTS, JSON.stringify(reports)); }
  catch (e) { console.error('saveStoredReports error:', e); }
}
function getStoredUsers() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEYS.USERS) || '[]'); }
  catch { return []; }
}
function saveStoredUsers(users) {
  try { localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users)); }
  catch (e) { console.error('saveStoredUsers error:', e); }
}
function getSession() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEYS.SESSION) || 'null'); }
  catch { return null; }
}
function saveSession(session) {
  localStorage.setItem(STORAGE_KEYS.SESSION, JSON.stringify(session));
}
function clearSession() {
  localStorage.removeItem(STORAGE_KEYS.SESSION);
}

/* ==========================================================================
   2. RESPONSIVE SIDEBAR (HAMBURGER)
   ========================================================================== */
function initResponsiveSidebar() {
  const sidebar = document.querySelector('.sidebar-blue');
  const mainContent = document.querySelector('.main-content');
  if (!sidebar || !mainContent) return;

  const toggle = document.createElement('button');
  toggle.type = 'button';
  toggle.className = 'sidebar-toggle';
  toggle.setAttribute('aria-label', 'Buka menu navigasi');
  toggle.setAttribute('aria-controls', 'primary-sidebar');
  toggle.setAttribute('aria-expanded', 'false');
  toggle.innerHTML = '<span></span><span></span><span></span>';
  sidebar.id = 'primary-sidebar';

  const backdrop = document.createElement('button');
  backdrop.type = 'button';
  backdrop.className = 'sidebar-backdrop';
  backdrop.setAttribute('aria-label', 'Tutup menu navigasi');
  backdrop.tabIndex = -1;

  document.body.append(backdrop, toggle);
  if (!mainContent.querySelector('.content-header')) {
    mainContent.classList.add('has-sidebar-toggle');
  }

  const closeMenu = () => {
    sidebar.classList.remove('is-open');
    document.body.classList.remove('sidebar-open');
    toggle.setAttribute('aria-expanded', 'false');
    toggle.setAttribute('aria-label', 'Buka menu navigasi');
  };

  const openMenu = () => {
    sidebar.classList.add('is-open');
    document.body.classList.add('sidebar-open');
    toggle.setAttribute('aria-expanded', 'true');
    toggle.setAttribute('aria-label', 'Tutup menu navigasi');
  };

  toggle.addEventListener('click', () => {
    if (sidebar.classList.contains('is-open')) closeMenu();
    else openMenu();
  });
  backdrop.addEventListener('click', closeMenu);
  sidebar.addEventListener('click', (event) => {
    if (event.target.closest('a')) closeMenu();
  });
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') closeMenu();
  });
  window.matchMedia('(min-width: 993px)').addEventListener('change', closeMenu);
}

/* ==========================================================================
   3. TOAST NOTIFICATION
   ========================================================================== */
function showToast(message, type = 'success') {
  let container = document.querySelector('.toast-container');
  if (!container) {
    container = document.createElement('div');
    container.className = 'toast-container';
    document.body.appendChild(container);
  }

  const toast = document.createElement('div');
  toast.className = 'toast' + (type === 'error' ? ' toast-error' : type === 'info' ? ' toast-info' : '');

  const icon = type === 'error'
      ? `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>`
      : type === 'info'
        ? `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>`
        : `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M20 6L9 17l-5-5"/></svg>`;

  toast.innerHTML = `<span style="display:flex;align-items:center;gap:8px;">${icon}<span>${message}</span></span>`;
  container.appendChild(toast);

  requestAnimationFrame(() => toast.classList.add('show'));
  setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => toast.remove(), 300);
  }, 4000);
}

/* ==========================================================================
   4. GLOBAL: TOGGLE PASSWORD
   ========================================================================== */
function initPasswordToggles() {
  document.querySelectorAll('.toggle-password-btn').forEach((btn) => {
    if (btn.dataset.bound === 'true') return;
    btn.dataset.bound = 'true';

    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const targetId = btn.getAttribute('data-target');
      const input = document.getElementById(targetId);
      if (!input) return;

      const eyeIcon = btn.querySelector('.eye-icon');
      const eyeOffIcon = btn.querySelector('.eye-off-icon');

      if (input.type === 'password') {
        input.type = 'text';
        if (eyeIcon) eyeIcon.classList.add('hidden');
        if (eyeOffIcon) eyeOffIcon.classList.remove('hidden');
      } else {
        input.type = 'password';
        if (eyeIcon) eyeIcon.classList.remove('hidden');
        if (eyeOffIcon) eyeOffIcon.classList.add('hidden');
      }
    });
  });
}

/* ==========================================================================
   5. MASTER DATA & KONFIGURASI MENU
   ========================================================================== */
const USERS_JSON_PATH = 'users.json';

const MENU_ICONS = {
  home: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>',
  list: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>',
  chart: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>',
  settings: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>',
  plus: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>',
  default: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/></svg>',
};

const DEFAULT_MENUS = {
  Pelapor: [
    { title: 'Dashboard', link: 'pelapor/index.html', icon: 'home' },
    { title: 'Buat Laporan', link: 'pelapor/laporan.html', icon: 'plus' },
    { title: 'Daftar Laporan', link: 'pelapor/daftar_laporan.html', icon: 'list' },
    { title: 'Pengaturan', link: 'pengaturan.html?role=pelapor', icon: 'settings' },
  ],
  Verifikator: [
    { title: 'Dashboard', link: 'verifikator/index.html', icon: 'home' },
    { title: 'Daftar Laporan', link: 'verifikator/riwayat.html', icon: 'list' },
    { title: 'Statistik', link: 'verifikator/statistik.html', icon: 'chart' },
    { title: 'Kelola Teknisi', link: 'verifikator/kelola-teknisi.html', icon: 'plus' },
    { title: 'Pengaturan', link: 'pengaturan.html?role=verifikator', icon: 'settings' },
  ],
  Teknisi: [
    { title: 'Dashboard', link: 'teknisi/index.html', icon: 'home' },
    { title: 'Daftar Tugas', link: 'teknisi/daftar-tugas.html', icon: 'list' },
    { title: 'Daftar Laporan', link: 'teknisi/riwayat.html', icon: 'list' },
    { title: 'Pengaturan', link: 'pengaturan.html?role=teknisi', icon: 'settings' },
  ],
};

const ROLE_URL_MAP = {
  pelapor: 'Pelapor',
  verifikator: 'Verifikator',
  teknisi: 'Teknisi',
};

const MOCK_USERS_BY_ROLE = {
  Pelapor: {
    id: '254107060052',
    nama: 'Rachmah Nur Chotimah',
    role_utama: 'Pelapor',
    jabatan: 'Mahasiswa',
    avatar: 'RN',
    email: '254107060052@student.polinema.ac.id',
    unit_kerja: 'Jurusan Teknologi Informasi',
    status: 'Aktif',
    sidebar_menu: DEFAULT_MENUS.Pelapor,
  },
  Verifikator: {
    id: '197710302005012001',
    nama: 'Mungki Astiningrum, S.T., M.Kom.',
    role_utama: 'Verifikator',
    jabatan: 'Kepala Jurusan',
    avatar: 'MA',
    email: 'mungki.astiningrum@polinema.ac.id',
    unit_kerja: 'Jurusan Teknologi Informasi',
    status: 'Aktif',
    sidebar_menu: DEFAULT_MENUS.Verifikator,
  },
  Teknisi: {
    id: 'E0009',
    nama: 'Budi Prakroso',
    role_utama: 'Teknisi',
    jabatan: 'Teknisi',
    avatar: 'BP',
    email: 'budi.prakroso@polinema.ac.id',
    unit_kerja: 'Unit Pemeliharaan Sarpras',
    status: 'Aktif',
    sidebar_menu: DEFAULT_MENUS.Teknisi,
  },
};

/* ==========================================================================
   6. AUTH: REGISTER & LOGIN
   ========================================================================== */
function initAuthForms() {
  const registerForm = document.getElementById('registerForm');
  if (registerForm) {
    registerForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const id = document.getElementById('regId')?.value.trim();
      const email = document.getElementById('regEmail')?.value.trim();
      const pass = document.getElementById('regPassword')?.value.trim();
      const role = document.getElementById('regRole')?.value || 'Pelapor';
      const alertBox = document.getElementById('alertBox');

      if (!id || !email || !pass) {
        if (alertBox) { alertBox.textContent = 'Semua kolom wajib diisi.'; alertBox.classList.remove('hidden'); }
        return;
      }

      const users = getStoredUsers();
      const dup = users.find((u) => u.id === id || u.email.toLowerCase() === email.toLowerCase());
      if (dup) {
        if (alertBox) { alertBox.textContent = 'NIM/NIP atau Email sudah terdaftar.'; alertBox.classList.remove('hidden'); }
        return;
      }

      users.push({ id, email, password: pass, role, nama: id, avatar: id.slice(-2).toUpperCase() });
      saveStoredUsers(users);
      showToast(`Pendaftaran berhasil sebagai ${role}!`, 'success');
      setTimeout(() => (window.location.href = 'login.html'), 1000);
    });
  }

  const loginForm = document.getElementById('loginForm');
  if (loginForm) {
    loginForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const id = document.getElementById('loginId')?.value.trim();
      const pass = document.getElementById('loginPassword')?.value.trim();
      const alertBox = document.getElementById('alertBox');

      if (!id || !pass) {
        if (alertBox) { alertBox.textContent = 'Semua kolom wajib diisi.'; alertBox.classList.remove('hidden'); }
        return;
      }

      const users = getStoredUsers();
      const user = users.find((u) => u.id === id || u.email.toLowerCase() === id.toLowerCase());
      if (!user || user.password !== pass) {
        if (alertBox) { alertBox.textContent = 'NIM/NIP/Email atau Password salah.'; alertBox.classList.remove('hidden'); }
        return;
      }

      saveSession({ id: user.id, email: user.email, role: user.role, nama: user.nama, avatar: user.avatar });
      showToast(`Login berhasil sebagai ${user.role}!`, 'success');

      const redirectMap = {
        Pelapor: 'pelapor/index.html',
        Verifikator: 'verifikator/index.html',
        Teknisi: 'teknisi/index.html',
      };
      setTimeout(() => { window.location.href = redirectMap[user.role] || 'login.html'; }, 600);
    });
  }
}

/* ==========================================================================
   7. HALAMAN PENGATURAN
   ========================================================================== */
async function initPengaturanPage() {
  const nav = document.getElementById('sidebarNav');
  if (!nav) return;

  initPasswordToggles();

  const params = new URLSearchParams(window.location.search);
  const roleFromUrl = (params.get('role') || '').toLowerCase();
  const session = getSession();

  const roleInternal = ROLE_URL_MAP[roleFromUrl] || session?.role || 'Pelapor';
  const dashboardLinks = {
    Pelapor: 'pelapor/index.html',
    Verifikator: 'verifikator/index.html',
    Teknisi: 'teknisi/index.html',
  };
  const brandLink = document.querySelector('.sidebar-brand');
  if (brandLink) brandLink.href = dashboardLinks[roleInternal] || dashboardLinks.Pelapor;

  let usersData = null;
  try {
    const res = await fetch(USERS_JSON_PATH);
    if (res.ok) usersData = await res.json();
  } catch (err) {
    console.warn('[initPengaturanPage] users.json tidak dapat dimuat:', err);
  }

  let user = null;
  if (roleInternal === 'Pelapor') {
    user = usersData?.users?.find((u) => u.role_utama === 'Pelapor') || { ...MOCK_USERS_BY_ROLE.Pelapor };
    user.role_utama = 'Pelapor';
    user.sidebar_menu = DEFAULT_MENUS.Pelapor;
  } else if (roleInternal === 'Verifikator') {
    user = usersData?.users?.find((u) => u.role_utama === 'Verifikator') || { ...MOCK_USERS_BY_ROLE.Verifikator };
    user.role_utama = 'Verifikator';
    user.sidebar_menu = DEFAULT_MENUS.Verifikator;
  } else if (roleInternal === 'Teknisi') {
    user = usersData?.users?.find((u) => u.role_utama === 'Teknisi') || { ...MOCK_USERS_BY_ROLE.Teknisi };
    user.role_utama = 'Teknisi';
    user.sidebar_menu = DEFAULT_MENUS.Teknisi;
  } else {
    user = { ...MOCK_USERS_BY_ROLE.Pelapor };
    user.role_utama = 'Pelapor';
    user.sidebar_menu = DEFAULT_MENUS.Pelapor;
  }

  const setText = (id, val) => {
    const el = document.getElementById(id);
    if (el) el.textContent = val || '–';
  };

  const MENU_FA_ICONS = {
    'Dashboard': 'fa-solid fa-border-all',
    'Buat Laporan': 'fa-solid fa-plus',
    'Daftar Tugas': 'fa-solid fa-list-check',
    'Daftar Laporan': 'fa-solid fa-clipboard-list',
    'Riwayat': 'fa-solid fa-clipboard-list',
    'Statistik': 'fa-solid fa-chart-simple',
    'Pengaturan': 'fa-solid fa-gear',
    'Kelola Teknisi': 'fa-solid fa-users',
  };

  nav.innerHTML = user.sidebar_menu.map((item) => {
    const isActive = item.title === 'Pengaturan';
    const faClass = MENU_FA_ICONS[item.title];
    let iconHtml = faClass ? `<i class="${faClass}"></i>` : (MENU_ICONS[item.icon] || MENU_ICONS.default);
    return `<a href="${item.link}" class="nav-link ${isActive ? 'active' : ''}">${iconHtml}<span>${item.title}</span></a>`;
  }).join('');

  const roleClassMap = { Pelapor: 'role-pelapor', Verifikator: 'role-verifikator', Teknisi: 'role-teknisi' };
  const applyRoleClass = (el) => {
    if (!el) return;
    el.classList.remove('role-pelapor', 'role-verifikator', 'role-teknisi');
    const cls = roleClassMap[user.role_utama] || 'role-pelapor';
    el.classList.add(cls);
  };

  const sidebarAvatarEl = document.getElementById('sidebarAvatar');
  if (sidebarAvatarEl) { sidebarAvatarEl.textContent = user.avatar; applyRoleClass(sidebarAvatarEl); }
  setText('sidebarName', user.nama);
  setText('sidebarRole', user.jabatan || user.role_utama);

  const profileAvatarEl = document.getElementById('profileAvatar');
  if (profileAvatarEl) { profileAvatarEl.textContent = user.avatar; applyRoleClass(profileAvatarEl); }
  setText('profileName', user.nama);

  const idPrefix = user.role_utama === 'Pelapor' ? 'NIM ' : user.role_utama === 'Teknisi' ? 'ID ' : 'NIP ';
  setText('profileId', idPrefix + user.id);
  setText('profileRoleBadge', user.jabatan || user.role_utama);
  setText('profileEmail', user.email);
  setText('breadcrumbRole', user.role_utama);

  const avatarStorageKey = STORAGE_KEYS.AVATAR_PREFIX + user.id;
  const savedAvatar = localStorage.getItem(avatarStorageKey);
  if (savedAvatar) {
    if (profileAvatarEl) profileAvatarEl.innerHTML = `<img src="${savedAvatar}" alt="${user.nama}">`;
    if (sidebarAvatarEl) sidebarAvatarEl.innerHTML = `<img src="${savedAvatar}" alt="${user.nama}">`;
  }

  const avatarInput = document.getElementById('avatarUploadInput');
  if (avatarInput && !avatarInput.dataset.bound) {
    avatarInput.dataset.bound = 'true';
    avatarInput.addEventListener('change', (e) => {
      const file = e.target.files?.[0];
      if (!file) return;
      if (!file.type.startsWith('image/')) { showToast('File harus berupa format gambar (PNG/JPG).', 'error'); return; }
      if (file.size > 2 * 1024 * 1024) { showToast('Ukuran gambar maksimal 2MB.', 'error'); return; }

      const reader = new FileReader();
      reader.onload = (ev) => {
        const base64 = ev.target.result;
        if (profileAvatarEl) profileAvatarEl.innerHTML = `<img src="${base64}" alt="${user.nama}">`;
        if (sidebarAvatarEl) sidebarAvatarEl.innerHTML = `<img src="${base64}" alt="${user.nama}">`;
        localStorage.setItem(STORAGE_KEYS.AVATAR_PREFIX + user.id, base64);
        showToast(`Foto profil ${user.nama} berhasil diperbarui!`, 'success');
      };
      reader.readAsDataURL(file);
    });
  }

  const btnLogout = document.getElementById('btnLogout');
  if (btnLogout && !btnLogout.dataset.bound) {
    btnLogout.dataset.bound = 'true';
    btnLogout.addEventListener('click', (e) => {
      e.preventDefault();
      clearSession();
      showToast('Berhasil keluar dari akun.', 'info');
      setTimeout(() => { window.location.href = 'login.html'; }, 700);
    });
  }

  setupFormUbahPassword(user);
  setupRoleSwitcherPills(user.role_utama);
}

function setupFormUbahPassword(userAktif) {
  const form = document.getElementById('formUbahPassword');
  if (!form || form.dataset.bound === 'true') return;
  form.dataset.bound = 'true';

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const oldPass = document.getElementById('oldPassword')?.value?.trim();
    const newPass = document.getElementById('newPassword')?.value?.trim();
    const confirmPass = document.getElementById('confirmPassword')?.value?.trim();
    const alertBox = document.getElementById('passwordAlert');

    const showAlert = (msg, isSuccess = true) => {
      if (!alertBox) { showToast(msg, isSuccess ? 'success' : 'error'); return; }
      alertBox.textContent = msg;
      alertBox.style.display = 'block';
      alertBox.style.background = isSuccess ? '#ecfdf5' : '#fef2f2';
      alertBox.style.borderColor = isSuccess ? '#bbf7d0' : '#fecaca';
      alertBox.style.color = isSuccess ? '#065f46' : '#991b1b';
      setTimeout(() => { alertBox.style.display = 'none'; }, 4500);
    };

    if (!oldPass || !newPass || !confirmPass) { showAlert('Semua kolom kata sandi wajib diisi.', false); return; }
    if (newPass.length < 8) { showAlert('Kata sandi baru minimal harus 8 karakter.', false); return; }
    if (newPass !== confirmPass) { showAlert('Konfirmasi kata sandi baru tidak cocok.', false); return; }

    const users = getStoredUsers();
    let account = users.find((u) => u.id === userAktif.id);

    if (account) {
      if (account.password && account.password !== oldPass) { showAlert('Kata sandi lama tidak cocok / salah.', false); return; }
      account.password = newPass;
    } else {
      users.push({ id: userAktif.id, email: userAktif.email, password: newPass, role: userAktif.role_utama, nama: userAktif.nama, avatar: userAktif.avatar });
    }

    saveStoredUsers(users);
    showAlert('Kata sandi berhasil diperbarui dengan aman!', true);
    showToast('Kata sandi berhasil diubah.', 'success');
    form.reset();
  });
}

function setupRoleSwitcherPills(currentRole) {
  const switcherBtns = document.querySelectorAll('.role-switcher-btn');
  switcherBtns.forEach((btn) => {
    const roleTarget = btn.getAttribute('data-role');
    if (roleTarget?.toLowerCase() === currentRole.toLowerCase()) {
      btn.classList.add('active');
    } else {
      btn.classList.remove('active');
    }
    if (btn.dataset.bound === 'true') return;
    btn.dataset.bound = 'true';

    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const target = btn.getAttribute('data-role');
      const url = new URL(window.location.href);
      url.searchParams.set('role', target.toLowerCase());
      window.history.pushState({}, '', url);
      initPengaturanPage();
      showToast(`Beralih ke tampilan profil: ${target}`, 'info');
    });
  });
}

/* ==========================================================================
   8. HALAMAN PELAPOR
   ========================================================================== */
async function loadPelaporData() {
  const res = await fetch('data.json');
  if (!res.ok) throw new Error('Gagal memuat pelapor/data.json');
  const data = await res.json();
  if (!Array.isArray(data.laporan_masuk)) {
    throw new Error('Format laporan_masuk pada pelapor/data.json tidak valid');
  }
  return data;
}

function createReportCard(report, profileName) {
  const card = document.createElement("article");
  card.className = "glass-card riwayat-card";
  card.style.cursor = "pointer";

  const heading = document.createElement("div");
  heading.className = "riwayat-head";
  const details = document.createElement("div");
  const title = document.createElement("h3");
  title.className = "riwayat-title";
  title.textContent = report.title;
  const location = document.createElement("p");
  location.className = "riwayat-meta";
  location.textContent = `${report.roomLabel} · ${reportDate(report.date)}`;
  const reporter = document.createElement("p");
  reporter.className = "riwayat-meta";
  reporter.textContent = `Pelapor: ${profileName} · ${report.category}`;
  details.append(title, location, reporter);

  const badge = document.createElement("span");
  badge.className = `status-pill ${reportStatusClass(report.status)}`;
  badge.textContent = report.status;
  heading.append(details, badge);
  card.append(heading);

  if (report.description) {
    const description = document.createElement("p");
    description.className = "card-subtitle";
    description.textContent = report.description;
    card.append(description);
  }
  if (report.photoName) {
    const photo = document.createElement("p");
    photo.className = "text-muted";
    photo.textContent = `Foto dipilih: ${report.photoName} (belum diunggah ke server)`;
    card.append(photo);
  }
  card.append(progressCard(report));
  card.dataset.status = report.status;

  card.addEventListener("click", () => {
    const modal = document.getElementById("modalDetailPengaduan");
    if (!modal) return;
    document.getElementById("detailJudul").textContent = report.title || "-";
    document.getElementById("detailId").textContent = "#" + (report.id || "-");
    document.getElementById("detailPelapor").textContent = profileName;
    document.getElementById("detailLokasi").textContent = report.roomLabel || "-";
    document.getElementById("detailKategori").textContent = report.category || "-";
    document.getElementById("detailStatus").textContent = report.status || "-";
    document.getElementById("detailTanggal").textContent = reportDate(report.date) || "-";
    document.getElementById("detailDeskripsi").textContent = report.description || "-";
    modal.classList.remove("hidden");
    modal.classList.add("active");
  });

  return card;
}

/* ==========================================================================
   9. HALAMAN TEKNISI
   ========================================================================== */
async function loadTeknisiData() {
  const res = await fetch('data.json');
  if (!res.ok) throw new Error('Gagal memuat teknisi/data.json');
  const data = await res.json();
  if (!Array.isArray(data.tugas_aktif) || !Array.isArray(data.riwayat)) {
    throw new Error('Format tugas_aktif atau riwayat pada teknisi/data.json tidak valid');
  }
  return data;
}

/* ==========================================================================
   10. MODAL HELPERS (GLOBAL)
   ========================================================================== */
let activeReportForAction = null;

window.openApproveModal = function (code, title) {
  activeReportForAction = { code, title };
  const modal = document.getElementById('approveModal');
  const el = document.getElementById('approveTargetTitle');
  if (el) el.textContent = `${code} - ${title}`;
  if (modal) modal.classList.remove('hidden');
};
window.closeApproveModal = function () {
  const modal = document.getElementById('approveModal');
  if (modal) modal.classList.add('hidden');
  activeReportForAction = null;
};
window.openRejectModal = function (code, title) {
  activeReportForAction = { code, title };
  const modal = document.getElementById('rejectModal');
  const el = document.getElementById('rejectTargetTitle');
  if (el) el.textContent = `${code} - ${title}`;
  if (modal) modal.classList.remove('hidden');
};
window.closeRejectModal = function () {
  const modal = document.getElementById('rejectModal');
  if (modal) modal.classList.add('hidden');
  activeReportForAction = null;
};
window.openImageModal = function (src) {
  const modal = document.getElementById('imageModal');
  const img = document.getElementById('modalImagePreview');
  if (img) img.src = src;
  if (modal) modal.classList.remove('hidden');
};
window.closeImageModal = function () {
  const modal = document.getElementById('imageModal');
  if (modal) modal.classList.add('hidden');
};

function bindVerifikatorEvents() {
  document.querySelectorAll('input[name="dispositionOption"]').forEach((radio) => {
    radio.addEventListener('change', (e) => {
      const wrap = document.getElementById('technicianPickerWrap');
      if (wrap) wrap.style.display = e.target.value === 'UPA PP Pusat' ? 'none' : 'block';
    });
  });

  const btnApprove = document.getElementById('btnConfirmApprove');
  if (btnApprove) {
    btnApprove.addEventListener('click', () => {
      const dispositionEl = document.querySelector('input[name="dispositionOption"]:checked');
      const disposition = dispositionEl ? dispositionEl.value : 'Teknisi Jurusan';
      const tech = document.getElementById('assignedTechnician')?.value || 'Pak Joko';
      const code = activeReportForAction?.code;
      if (code) {
        const reports = getStoredReports();
        const target = reports.find((r) => r.id === code || r.roomCode === code);
        if (target) {
          target.disposition = disposition;
          target.verified_at = new Date().toISOString();
          if (disposition === 'UPA PP Pusat') { target.status = 'Diteruskan ke Pusat'; target.technician = 'UPA PP Pusat'; }
          else { target.status = 'Dalam Perbaikan'; target.technician = tech; }
          saveStoredReports(reports);
        }
        const row = document.querySelector(`tr[data-row-id="${code}"]`);
        if (row) {
          row.dataset.status = disposition === 'UPA PP Pusat' ? 'Diteruskan ke Pusat' : 'Dalam Perbaikan';
          row.style.opacity = '0.55';
          const lastCell = row.querySelector('td:last-child');
          if (lastCell) lastCell.innerHTML = `<span class="status-pill">✓ ${disposition}</span>`;
        }
        document.getElementById('dashboardFilterStatus')?.dispatchEvent(new Event('change'));
      }
      showToast(`Laporan diverifikasi → ${disposition}.`, 'success');
      window.closeApproveModal();
    });
  }

  const btnReject = document.getElementById('btnConfirmReject');
  if (btnReject) {
    btnReject.addEventListener('click', () => {
      const reason = document.getElementById('rejectReason')?.value.trim();
      if (!reason) { showToast('Alasan penolakan wajib diisi.', 'error'); return; }
      const code = activeReportForAction?.code;
      if (code) {
        const reports = getStoredReports();
        const target = reports.find((r) => r.id === code || r.roomCode === code);
        if (target) { target.status = 'Ditolak'; target.rejectionReason = reason; saveStoredReports(reports); }
        const row = document.querySelector(`tr[data-row-id="${code}"]`);
        if (row) {
          row.dataset.status = 'Ditolak';
          row.style.opacity = '0.55';
          const lastCell = row.querySelector('td:last-child');
          if (lastCell) lastCell.innerHTML = `<span class="status-pill status-pill-danger">✕ Ditolak</span>`;
        }
        document.getElementById('dashboardFilterStatus')?.dispatchEvent(new Event('change'));
      }
      showToast('Laporan ditolak dengan catatan resmi.', 'info');
      window.closeRejectModal();
    });
  }
}

/* ==========================================================================
   11. AUTO INIT (GLOBAL)
   ========================================================================== */
document.addEventListener('DOMContentLoaded', async () => {
  initResponsiveSidebar();
  initPasswordToggles();
  initAuthForms();

  // Halaman Pengaturan
  if (document.getElementById('sidebarNav')) {
    initPengaturanPage();
    return;
  }

  // Halaman Pelapor
  const isPelaporPage =
    document.getElementById('total-reports') ||
    document.getElementById('reports-list') ||
    document.getElementById('report-form');

  if (isPelaporPage) {
    try {
      const data = await loadPelaporData();
      if (typeof window.initPelaporPage !== 'function') throw new Error('Inisialisasi halaman Pelapor tidak tersedia');
      window.initPelaporPage(data.laporan_masuk);
    } catch (err) {
      console.error('Gagal memuat halaman Pelapor:', err);
      showToast('Data laporan Pelapor gagal dimuat. Coba muat ulang halaman.', 'error');
    }
    return;
  }

  // Halaman Teknisi
  if (window.location.pathname.toLowerCase().includes('/teknisi/')) {
    try {
      const data = await loadTeknisiData();
      if (typeof window.initTeknisiPage !== 'function') throw new Error('Inisialisasi halaman Teknisi tidak tersedia');
      window.initTeknisiPage(data);
    } catch (err) {
      console.error('Gagal memuat halaman Teknisi:', err);
      showToast('Data Teknisi gagal dimuat. Coba muat ulang halaman.', 'error');
    }
    return;
  }

  // Halaman Verifikator
  const isDashboard = document.getElementById('verifikatorTableBody');
  const isRiwayat = document.getElementById('riwayatList');
  const isStatistik = document.getElementById('rankingTableBody');

  if (isDashboard || isRiwayat || isStatistik) {
    const data = await loadVerifikatorData();
    if (!data) return;
    if (isDashboard) { renderDashboard(data); bindVerifikatorEvents(); }
    if (isRiwayat) renderRiwayat(data);
    if (isStatistik) renderStatistik(data);
  }
});