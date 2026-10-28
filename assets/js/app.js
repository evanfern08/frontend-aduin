/**
 * app.js - ADUIN Client-Side Script (FINAL GABUNGAN)
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
   2. TOAST NOTIFICATION COMPONENT
   ========================================================================== */
function showToast(message, type = 'success') {
  let container = document.querySelector('.toast-container');
  if (!container) {
    container = document.createElement('div');
    container.className = 'toast-container';
    document.body.appendChild(container);
  }

  const toast = document.createElement('div');
  toast.className =
    'toast' +
    (type === 'error' ? ' toast-error' : type === 'info' ? ' toast-info' : '');

  const icon =
    type === 'error'
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
   3. GLOBAL: TOGGLE SHOW/HIDE PASSWORD
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
   4. MASTER DATA PENGGUNA & MENU CONFIG
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
   5. AUTH: REGISTER & LOGIN
   ========================================================================== */
function initAuthForms() {
  // --- Register ---
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

  // --- Login ---
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
   6. HALAMAN PENGATURAN — initPengaturanPage()
   ========================================================================== */
async function initPengaturanPage() {
  const nav = document.getElementById('sidebarNav');
  if (!nav) return;

  initPasswordToggles();

  // ---- LANGKAH 1: TENTUKAN ROLE AKTIF ----
  const params = new URLSearchParams(window.location.search);
  const roleFromUrl = (params.get('role') || '').toLowerCase();
  const session = getSession();

  const roleInternal =
    ROLE_URL_MAP[roleFromUrl] ||
    session?.role ||
    'Pelapor';
  const dashboardLinks = {
    Pelapor: 'pelapor/index.html',
    Verifikator: 'verifikator/index.html',
    Teknisi: 'teknisi/index.html',
  };
  const brandLink = document.querySelector('.sidebar-brand');
  if (brandLink) brandLink.href = dashboardLinks[roleInternal] || dashboardLinks.Pelapor;

  // ---- LANGKAH 2: FETCH users.json ----
  let usersData = null;
  try {
    const res = await fetch(USERS_JSON_PATH);
    if (res.ok) usersData = await res.json();
  } catch (err) {
    console.warn('[initPengaturanPage] users.json tidak dapat dimuat:', err);
  }

  // ---- LANGKAH 3: AMBIL USER SESUAI ROLE (IF-ELSE EKSPLISIT) ----
  let user = null;

  if (roleInternal === 'Pelapor') {
    // --- PENGATURAN PELAPOR ---
    if (usersData?.users) {
      user = usersData.users.find((u) => u.role_utama === 'Pelapor');
    }
    if (!user) {
      user = { ...MOCK_USERS_BY_ROLE.Pelapor };
    }
    user.role_utama = 'Pelapor';
    if (!user.sidebar_menu || user.sidebar_menu.length === 0) {
      user.sidebar_menu = DEFAULT_MENUS.Pelapor;
    }

  } else if (roleInternal === 'Verifikator') {
    // --- PENGATURAN VERIFIKATOR ---
    if (usersData?.users) {
      user = usersData.users.find((u) => u.role_utama === 'Verifikator');
    }
    if (!user) {
      user = { ...MOCK_USERS_BY_ROLE.Verifikator };
    }
    user.role_utama = 'Verifikator';
    if (!user.sidebar_menu || user.sidebar_menu.length === 0) {
      user.sidebar_menu = DEFAULT_MENUS.Verifikator;
    }

  } else if (roleInternal === 'Teknisi') {
    // --- PENGATURAN TEKNISI ---
    if (usersData?.users) {
      user = usersData.users.find((u) => u.role_utama === 'Teknisi');
    }
    if (!user) {
      user = { ...MOCK_USERS_BY_ROLE.Teknisi };
    }
    user.role_utama = 'Teknisi';
    if (!user.sidebar_menu || user.sidebar_menu.length === 0) {
      user.sidebar_menu = DEFAULT_MENUS.Teknisi;
    }

  } else {
    // --- FALLBACK (role tidak dikenali) → Pelapor ---
    user = { ...MOCK_USERS_BY_ROLE.Pelapor };
    user.role_utama = 'Pelapor';
    user.sidebar_menu = DEFAULT_MENUS.Pelapor;
  }

  const setText = (id, val) => {
    const el = document.getElementById(id);
    if (el) el.textContent = val || '–';
  };


  // ---- LANGKAH 4: RENDER MENU SIDEBAR ----
  // Satu peta ikon untuk semua role (Font Awesome, berdasarkan judul menu)
  const MENU_FA_ICONS = {
    'Dashboard': 'fa-solid fa-border-all',
    'Buat Laporan': 'fa-solid fa-plus',
    'Daftar Tugas': 'fa-solid fa-list-check',
    'Daftar Laporan': 'fa-solid fa-clipboard-list',
    'Riwayat': 'fa-solid fa-clipboard-list',
    'Statistik': 'fa-solid fa-chart-simple',
    'Pengaturan': 'fa-solid fa-gear',
  };

  nav.innerHTML = user.sidebar_menu.map((item) => {
    const isActive = item.title === 'Pengaturan';
    const faClass = MENU_FA_ICONS[item.title];

    let iconHtml;
    if (faClass) {
      iconHtml = `<i class="${faClass}"></i>`;
    } else {
      const iconKey = typeof item.icon === 'string' ? item.icon : 'default';
      iconHtml = MENU_ICONS[iconKey] || MENU_ICONS.default;
    }

    return `<a href="${item.link}" class="nav-link ${isActive ? 'active' : ''}">${iconHtml}<span>${item.title}</span></a>`;
  }).join('');

  // ---- LANGKAH 5: WARNA AVATAR BERDASARKAN ROLE ----
  const roleClassMap = { Pelapor: 'role-pelapor', Verifikator: 'role-verifikator', Teknisi: 'role-teknisi' };
  const applyRoleClass = (el) => {
    if (!el) return;
    el.classList.remove('role-pelapor', 'role-verifikator', 'role-teknisi');
    const cls = roleClassMap[user.role_utama] || 'role-pelapor';
    el.classList.add(cls);
  };

  const sidebarAvatarEl = document.getElementById('sidebarAvatar');
  if (sidebarAvatarEl) {
    sidebarAvatarEl.textContent = user.avatar;
    applyRoleClass(sidebarAvatarEl);
  }
  setText('sidebarName', user.nama);
  setText('sidebarRole', user.jabatan || user.role_utama);

  // ---- LANGKAH 6: KARTU PROFIL ----
  const profileAvatarEl = document.getElementById('profileAvatar');
  if (profileAvatarEl) {
    profileAvatarEl.textContent = user.avatar;
    applyRoleClass(profileAvatarEl);
  }
  setText('profileName', user.nama);

  const idPrefix = user.role_utama === 'Pelapor' ? 'NIM ' : user.role_utama === 'Teknisi' ? 'ID ' : 'NIP ';
  setText('profileId', idPrefix + user.id);
  setText('profileRoleBadge', user.jabatan || user.role_utama);
  setText('profileEmail', user.email);
  setText('breadcrumbRole', user.role_utama);

  // ---- LANGKAH 7: UPLOAD FOTO PROFIL ----
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

  // ---- LANGKAH 8: LOGOUT ----
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

  // ---- LANGKAH 9: FORM UBAH PASSWORD ----
  setupFormUbahPassword(user);

  // ---- LANGKAH 10: ROLE SWITCHER PILLS ----
  setupRoleSwitcherPills(user.role_utama);
}

/* ==========================================================================
   7. LOGIKA FORM UBAH PASSWORD (UNIVERSAL)
   ========================================================================== */
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
      if (account.password && account.password !== oldPass) {
        showAlert('Kata sandi lama tidak cocok / salah.', false);
        return;
      }
      account.password = newPass;
    } else {
      users.push({
        id: userAktif.id,
        email: userAktif.email,
        password: newPass,
        role: userAktif.role_utama,
        nama: userAktif.nama,
        avatar: userAktif.avatar,
      });
    }

    saveStoredUsers(users);
    showAlert('Kata sandi berhasil diperbarui dengan aman!', true);
    showToast('Kata sandi berhasil diubah.', 'success');
    form.reset();
  });
}

/* ==========================================================================
   8. ROLE SWITCHER INTERAKTIF
   ========================================================================== */
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
   ALUR STATUS, CHANGE LOG & SINKRONISASI ANTAR PERAN (revisi #6 & #8) ORANG 3
   ========================================================================== */
const SYNC_KEYS = {
  CHANGELOG: 'aduin_changelog',
  STATUS_SYNC: 'aduin_status_sync',       // dibaca halaman pelapor
  Q_TEKNISI: 'aduin_queue_teknisi',       // verifikator -> teknisi
  Q_VERIFIKATOR: 'aduin_queue_verifikator' // teknisi -> verifikator
};
const STATUS_REVIEW = 'Menunggu Review Hasil';
const VERIFIKATOR_NAME = 'Mungki Astiningrum, S.T., M.Kom.';

const AKSI_LABEL = {
  SETUJUI_LAPORAN: 'Laporan Disetujui',
  TOLAK_LAPORAN: 'Laporan Ditolak',
  TEKNISI_SELESAI: 'Teknisi Menandai Selesai',
  TERIMA_HASIL: 'Hasil Perbaikan Diterima',
  TOLAK_HASIL: 'Tolak Hasil Perbaikan',
  BATAL_TOLAK: 'Batal Penolakan',
};

function readJSON(key, fallback) {
  try { const v = JSON.parse(localStorage.getItem(key)); return v ?? fallback; }
  catch { return fallback; }
}
function writeJSON(key, value) {
  try { localStorage.setItem(key, JSON.stringify(value)); }
  catch (e) { console.error('writeJSON error:', e); }
}
function pushQueue(key, event) {
  const q = readJSON(key, []);
  q.push(event);
  writeJSON(key, q);
}
function escapeHtml(str) {
  return String(str ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

/* ---- Change log ---- */
function getChangeLog(reportId) {
  const all = readJSON(SYNC_KEYS.CHANGELOG, []);
  return reportId ? all.filter((l) => l.reportId === reportId) : all;
}
function addChangeLog({ reportId, aksi, oleh, dari, ke, alasan }) {
  const all = readJSON(SYNC_KEYS.CHANGELOG, []);
  all.unshift({
    id: 'LOG-' + Date.now(),
    reportId, aksi, oleh, dari, ke,
    alasan: alasan || '-',
    waktu: new Date().toISOString(),
  });
  writeJSON(SYNC_KEYS.CHANGELOG, all);
}

/* ---- Status yang dilihat pelapor ---- */
function toPelaporStatus(status) {
  if (status === 'Menunggu Verifikasi' || status === 'Selesai') return status;
  if (status === 'Ditolak') return 'Dikembalikan ke Pelapor';
  return 'Diproses'; // Disetujui, Dalam Perbaikan, Menunggu Review Hasil, Diteruskan ke Pusat
}

/* ---- SATU-SATUNYA pintu untuk mengubah status laporan ---- */
function updateReportStatus(id, newStatus, opts = {}) {
  const { oleh = VERIFIKATOR_NAME, aksi, alasan, extra = {}, notePelapor = '' } = opts;
  const reports = getStoredReports();
  const target = reports.find((r) => r.id === id || r.roomCode === id);
  if (!target) return null;

  const dari = target.status;
  target.status = newStatus;
  Object.assign(target, extra);
  saveStoredReports(reports);

  addChangeLog({ reportId: target.id, aksi, oleh, dari, ke: newStatus, alasan });

  const sync = readJSON(SYNC_KEYS.STATUS_SYNC, {});
  sync[target.id] = {
    status: toPelaporStatus(newStatus),
    note: notePelapor,
    updatedAt: new Date().toISOString(),
  };
  writeJSON(SYNC_KEYS.STATUS_SYNC, sync);
  return target;
}

/* ---- #6: Teknisi menandai selesai -> masuk antrean review Kajur ---- */
function consumeVerifikatorQueue() {
  const queue = readJSON(SYNC_KEYS.Q_VERIFIKATOR, []);
  if (!queue.length) return;
  queue.forEach((ev) => {
    if (ev.type !== 'HASIL_SELESAI') return;
    updateReportStatus(ev.reportId, STATUS_REVIEW, {
      oleh: `${ev.teknisi || 'Teknisi'} (Teknisi)`,
      aksi: 'TEKNISI_SELESAI',
      alasan: ev.catatan,
      extra: { hasilCatatan: ev.catatan, hasilFotoSesudah: ev.fotoSesudah || '' },
      notePelapor: 'Perbaikan selesai dikerjakan, menunggu pemeriksaan hasil oleh Kajur.',
    });
  });
  writeJSON(SYNC_KEYS.Q_VERIFIKATOR, []);
}

/* ---- #6: Kajur menerima / menolak hasil ---- */
window.terimaHasilPerbaikan = function (id) {
  if (!confirm('Terima hasil perbaikan? Status laporan menjadi Selesai (final).')) return;
  updateReportStatus(id, 'Selesai', {
    aksi: 'TERIMA_HASIL',
    alasan: 'Hasil perbaikan diterima.',
    notePelapor: 'Perbaikan selesai dan sudah diverifikasi Kajur.',
  });
  pushQueue(SYNC_KEYS.Q_TEKNISI, { type: 'DITERIMA', reportId: id, waktu: new Date().toISOString() });
  showToast('Hasil perbaikan diterima. Laporan Selesai.', 'success');
  refreshRiwayat();
};

window.tolakHasilPerbaikan = function (id, alasan) {
  const cur = getStoredReports().find((r) => r.id === id);
  if (!cur) return;
  const revisiKe = (cur.revisi_ke || 0) + 1;
  updateReportStatus(id, 'Dalam Perbaikan', {
    aksi: 'TOLAK_HASIL',
    alasan,
    extra: { revisi_ke: revisiKe, catatan_revisi: alasan },
    notePelapor: 'Hasil perbaikan belum memenuhi standar, teknisi mengerjakan ulang.',
  });
  pushQueue(SYNC_KEYS.Q_TEKNISI, {
    type: 'REVISI', reportId: id, alasan,
    oleh: VERIFIKATOR_NAME, waktu: new Date().toISOString(),
  });
  showToast('Hasil ditolak. Laporan kembali ke teknisi.', 'info');
};

/* ---- #8: Batal penolakan ---- */
window.batalkanPenolakan = function (id, alasan) {
  updateReportStatus(id, 'Menunggu Verifikasi', {
    aksi: 'BATAL_TOLAK',
    alasan,
    extra: { rejectionReason: '' },
    notePelapor: 'Penolakan dibatalkan, laporan ditinjau ulang oleh Kajur.',
  });
  showToast('Penolakan dibatalkan. Laporan kembali ke antrean verifikasi.', 'success');
};

/* ---- Modal aksi (dipakai riwayat.html) ---- */
let aksiAktif = null;
const AKSI_CONFIG = {
  'tolak-hasil': {
    title: 'Tolak Hasil Perbaikan',
    desc: 'Laporan kembali ke "Dalam Perbaikan" dan muncul lagi di tab "Sedang Dikerjakan" milik teknisi.',
    label: 'Alasan penolakan (jadi catatan revisi teknisi)',
    placeholder: 'Contoh: AC masih bocor, foto sesudah tidak jelas.',
    btn: 'Tolak Hasil Perbaikan', cls: 'btn btn-danger',
  },
  'batal-tolak': {
    title: 'Batalkan Penolakan',
    desc: 'Status laporan kembali ke "Menunggu Verifikasi" sehingga bisa diputuskan ulang. Pembatalan dicatat di change log.',
    label: 'Alasan pembatalan',
    placeholder: 'Contoh: Salah menekan tombol tolak.',
    btn: 'Kembalikan ke Antrean', cls: 'btn btn-success',
  },
};

window.bukaModalAksi = function (jenis, item) {
  const cfg = AKSI_CONFIG[jenis];
  const modal = document.getElementById('modalAksiStatus');
  if (!cfg || !modal) return;
  aksiAktif = { jenis, id: item.id };
  document.getElementById('aksiTitle').textContent = cfg.title;
  document.getElementById('aksiTarget').textContent = `#${item.id} - ${item.judul}`;
  document.getElementById('aksiDesc').textContent = cfg.desc;
  document.getElementById('aksiLabel').textContent = cfg.label;
  const ta = document.getElementById('aksiAlasan');
  ta.value = ''; ta.placeholder = cfg.placeholder;
  const btn = document.getElementById('btnAksiKonfirmasi');
  btn.textContent = cfg.btn; btn.className = cfg.cls;
  modal.classList.remove('hidden');
};
window.tutupModalAksi = function () {
  document.getElementById('modalAksiStatus')?.classList.add('hidden');
  aksiAktif = null;
};
window.konfirmasiAksi = function () {
  if (!aksiAktif) return;
  const alasan = document.getElementById('aksiAlasan').value.trim();
  if (!alasan) { showToast('Alasan wajib diisi.', 'error'); return; }
  if (aksiAktif.jenis === 'tolak-hasil') window.tolakHasilPerbaikan(aksiAktif.id, alasan);
  else window.batalkanPenolakan(aksiAktif.id, alasan);
  window.tutupModalAksi();
  refreshRiwayat();
};

function refreshRiwayat() {
  renderRiwayat({ laporan_masuk: getStoredReports() });
  document.querySelector('.filter-pill.active')?.click(); // pertahankan filter aktif
}

/* ---- Tampilan change log di modal detail ---- */
function renderChangeLogHTML(reportId) {
  const logs = getChangeLog(reportId);
  if (!logs.length) return '<p class="text-muted" style="font-size:12px;">Belum ada perubahan status.</p>';
  return logs.map((l) => {
    const waktu = new Date(l.waktu).toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short', timeZone: 'Asia/Jakarta' });
    return `
      <div style="border-left:3px solid #cbd5e1; padding:4px 0 4px 10px; margin-bottom:10px; font-size:12px;">
        <strong>${escapeHtml(AKSI_LABEL[l.aksi] || l.aksi)}</strong>
        <span style="color:#94a3b8;"> · ${waktu} WIB</span><br>
        <span>Oleh: ${escapeHtml(l.oleh)}</span><br>
        <span>${escapeHtml(l.dari)} → <strong>${escapeHtml(l.ke)}</strong></span><br>
        <span style="color:#475569;">Alasan: ${escapeHtml(l.alasan)}</span>
      </div>`;
  }).join('');
}

/* ==========================================================================
   9. HALAMAN VERIFIKATOR (dashboard, riwayat, statistik)
   ========================================================================== */

const DEV_MODE = false; // ubah ke false saat demo/presentasi

const REPORT_MONTHS = {
  jan: 0, januari: 0, feb: 1, februari: 1, mar: 2, maret: 2,
  apr: 3, april: 3, mei: 4, jun: 5, juni: 5, jul: 6, juli: 6,
  agu: 7, agustus: 7, sep: 8, september: 8, okt: 9, oktober: 9,
  nov: 10, november: 10, des: 11, desember: 11
};

function parseReportDate(value) {
  if (!value) return null;
  const isoMatch = String(value).match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (isoMatch) return new Date(Date.UTC(Number(isoMatch[1]), Number(isoMatch[2]) - 1, Number(isoMatch[3])));

  const match = String(value).trim().match(/^(\d{1,2})\s+([A-Za-z]+)\s+(\d{4})$/);
  if (!match) return null;
  const month = REPORT_MONTHS[match[2].toLowerCase()];
  if (month === undefined) return null;
  return new Date(Date.UTC(Number(match[3]), month, Number(match[1])));
}

function dateToInputValue(date) {
  if (!date) return '';
  return `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, '0')}-${String(date.getUTCDate()).padStart(2, '0')}`;
}

function getReportLocationKey(report) {
  return report.lokasi?.kode || report.lokasi?.nama || report.roomCode || report.roomLabel || '';
}

function getReportLocationLabel(report) {
  const key = getReportLocationKey(report);
  const name = report.lokasi?.nama || report.roomLabel || '';
  return name && key !== name ? `${key} - ${name}` : key;
}

function populateReportFilter(select, reports, kind) {
  if (!select) return;
  const firstOption = select.options[0];
  const options = new Map();
  reports.forEach((report) => {
    let value;
    let label;
    if (kind === 'category') {
      value = report.kategori || report.category || '';
      label = value;
    } else if (kind === 'room') {
      value = getReportLocationKey(report);
      label = getReportLocationLabel(report);
    } else {
      value = report.status || '';
      label = value;
    }
    if (value && !options.has(value)) options.set(value, label);
  });

  select.replaceChildren(firstOption);
  [...options.entries()]
    .sort((a, b) => a[1].localeCompare(b[1], 'id'))
    .forEach(([value, label]) => {
      const option = document.createElement('option');
      option.value = value;
      option.textContent = label;
      select.appendChild(option);
    });
}

function readReportFilters(prefix) {
  return {
    category: document.getElementById(`${prefix}FilterCategory`)?.value || '',
    from: document.getElementById(`${prefix}FilterFrom`)?.value || '',
    to: document.getElementById(`${prefix}FilterTo`)?.value || '',
    room: document.getElementById(`${prefix}FilterRoom`)?.value || '',
    status: document.getElementById(`${prefix}FilterStatus`)?.value || ''
  };
}

function reportMatchesFilters(report, filters) {
  if (filters.category && (report.kategori || report.category || '') !== filters.category) return false;
  if (filters.room && getReportLocationKey(report) !== filters.room) return false;
  if (filters.status && report.status !== filters.status) return false;
  const reportDate = parseReportDate(report.tanggal || report.date);
  if (filters.from && (!reportDate || dateToInputValue(reportDate) < filters.from)) return false;
  if (filters.to && (!reportDate || dateToInputValue(reportDate) > filters.to)) return false;
  return true;
}

function bindReportFilters(prefix, onChange) {
  const filterIds = [
    `${prefix}FilterCategory`,
    `${prefix}FilterFrom`,
    `${prefix}FilterTo`,
    `${prefix}FilterRoom`,
    `${prefix}FilterStatus`
  ];
  filterIds.forEach((id) => {
    const control = document.getElementById(id);
    if (control) control.addEventListener('change', onChange);
  });
  const reset = document.getElementById(`${prefix}FilterReset`);
  if (reset) {
    reset.addEventListener('click', () => {
      filterIds.forEach((id) => {
        const control = document.getElementById(id);
        if (control) control.value = '';
      });
      onChange();
    });
  }
}

async function loadVerifikatorData() {
  try {
    const res = await fetch('data.json');
    if (!res.ok) throw new Error('Gagal memuat data.json');
    const data = await res.json();

    if ((DEV_MODE || !localStorage.getItem('aduin_reports')) && data.laporan_masuk) {
      localStorage.setItem('aduin_reports', JSON.stringify(data.laporan_masuk));
    }
    consumeVerifikatorQueue();
    return data;
  } catch (err) {
    console.warn('loadVerifikatorData gagal:', err);
    return null;
  }
  
}

function renderDashboard(data) {
  if (!data) return;
  const setText = (id, val) => { const el = document.getElementById(id); if (el) el.textContent = val; };
  setText('metricMenunggu', data.summary_dashboard?.menunggu_verifikasi ?? '–');
  setText('metricDiproses', data.summary_dashboard?.diproses ?? '–');
  setText('metricSelesai', data.summary_dashboard?.selesai ?? '–');
  setText('metricDitolak', data.summary_dashboard?.ditolak ?? '–');

  const tbody = document.getElementById('verifikatorTableBody');
  if (!tbody) return;
  const reports = getStoredReports();
  const reportItems = Array.isArray(reports) && reports.length ? reports : (data.laporan_masuk || []);
  populateReportFilter(document.getElementById('dashboardFilterCategory'), reportItems, 'category');
  populateReportFilter(document.getElementById('dashboardFilterRoom'), reportItems, 'room');
  populateReportFilter(document.getElementById('dashboardFilterStatus'), reportItems, 'status');
  tbody.innerHTML = '';

  reportItems.forEach((item) => {
    const tr = document.createElement('tr');
    tr.setAttribute('data-row-id', item.id);
    tr.dataset.status = item.status || '';
    const fotoCell = item.thumb_url
      ? `<button type="button" class="thumb-btn" onclick="openImageModal('${item.foto_url}')"><img src="${item.thumb_url}" alt="Bukti" class="thumb-img"></button>`
      : `<span class="text-muted">Tanpa foto</span>`;
    const aksiCell = item.status === 'Menunggu Verifikasi'
      ? `<div class="action-group">
           <button type="button" class="btn-icon btn-icon-success" onclick="openApproveModal('${item.id}', '${item.judul}')" title="Approve">✓</button>
           <button type="button" class="btn-icon btn-icon-danger" onclick="openRejectModal('${item.id}', '${item.judul}')" title="Reject">✕</button>
         </div>`
      : `<span class="status-pill">${item.status}</span>`;

    tr.innerHTML = `
      <td>
        <div class="cell-reporter">
          <div class="cell-avatar">${item.pelapor?.inisial || '?'}</div>
          <div>
            <span class="cell-name" style="display: block;">${item.pelapor?.nama || '-'}</span>
            <span class="cell-meta" style="display: block; margin-top: 3px;">NIM: ${item.pelapor?.nim || '-'}</span>
          </div>
        </div>
      </td>
      <td>
        <div>
          <span class="cell-name" style="display: block;">${item.lokasi?.kode || '-'}</span>
          <span class="cell-meta" style="display: block; margin-top: 3px;">${item.lokasi?.nama || '-'}</span>
        </div>
      </td>
      <td>
        <div>
          <span class="status-pill">${item.kategori || '-'}</span>
          <span class="cell-meta" style="display: block; margin-top: 6px;">${item.judul || '-'}</span>
        </div>
      </td>
      <td class="text-center">${fotoCell}</td>
      <td class="text-right">${aksiCell}</td>
    `;
    tbody.appendChild(tr);
  });

  const searchInput = document.getElementById('tableSearchInput');
  const result = document.getElementById('dashboardFilterResult');
  const applyFilters = () => {
    const filters = readReportFilters('dashboard');
    const query = searchInput?.value.toLowerCase().trim() || '';
    let visibleCount = 0;
    tbody.querySelectorAll('tr').forEach((row, index) => {
      const report = { ...reportItems[index], status: row.dataset.status || reportItems[index].status };
      const visible = reportMatchesFilters(report, filters) &&
        row.textContent.toLowerCase().includes(query);
      row.style.display = visible ? '' : 'none';
      if (visible) visibleCount += 1;
    });
    if (result) result.textContent = `Menampilkan ${visibleCount} dari ${reportItems.length} laporan.`;
  };
  if (searchInput) searchInput.addEventListener('input', applyFilters);
  bindReportFilters('dashboard', applyFilters);
  applyFilters();
}

function renderRiwayat(data) {
  const list = document.getElementById('riwayatList');
  if (!list || !data) return;

  // Ambil data dari localStorage (biar statusnya up-to-date)
  let laporan = data.laporan_masuk || [];
  try {
    const stored = localStorage.getItem('aduin_reports');
    if (stored) laporan = JSON.parse(stored);
  } catch (e) { }

  list.innerHTML = '';
  laporan.forEach((item) => list.appendChild(buildRiwayatCard(item)));

  // Logika Filter Pills
  document.querySelectorAll('.filter-pill').forEach((pill) => {
    // Hapus event lama biar gak dobel
    const newPill = pill.cloneNode(true);
    pill.parentNode.replaceChild(newPill, pill);

    newPill.addEventListener('click', () => {
      document.querySelectorAll('.filter-pill').forEach((p) => p.classList.remove('active'));
      newPill.classList.add('active');
      const f = newPill.getAttribute('data-filter');

      document.querySelectorAll('.riwayat-card').forEach((card) => {
        const s = card.getAttribute('data-status');
        card.style.display = (f === 'Semua' || s === f) ? '' : 'none';
      });
    });
  });
}

function buildRiwayatCard(item) {
  const card = document.createElement('div');
  card.className = 'glass-card riwayat-card';
  card.setAttribute('data-status', item.status);
  card.style.cursor = 'pointer';

  const isRejected = item.status === 'Ditolak';
  const isReview = item.status === STATUS_REVIEW;
  const isPusat = item.status === 'Diteruskan ke Pusat' || item.disposition === 'UPA PP Pusat';

  const stepMap = {
    'Menunggu Verifikasi': 0, 'Disetujui': 1, 'Dalam Perbaikan': 2,
    'Diteruskan ke Pusat': 2, [STATUS_REVIEW]: 3, 'Selesai': 3,
  };
  const currentIndex = stepMap[item.status] ?? 0;

  const pillMap = {
    'Menunggu Verifikasi': 'status-pill-warning',
    'Disetujui': 'status-pill-info',
    'Dalam Perbaikan': 'status-pill-info',
    [STATUS_REVIEW]: 'status-pill-warning',
    'Diteruskan ke Pusat': 'status-pill-purple',
    'Selesai': 'status-pill-success',
    'Ditolak': 'status-pill-danger',
  };
  const pillClass = pillMap[item.status] || 'status-pill-neutral';

  const subProses = isPusat ? 'Diserahkan ke Pusat'
    : isReview ? 'Menunggu review Kajur'
    : item.revisi_ke ? `Revisi ke-${item.revisi_ke} · ${item.teknisi || 'Teknisi'}`
    : (item.teknisi || 'Teknisi');

  const nodes = [
    { label: 'Menunggu Verifikasi', sub: item.tanggal || '-' },
    { label: 'Disetujui', sub: 'Validasi Kajur' },
    { label: isPusat ? 'UPA PP Pusat' : 'Dalam Perbaikan', sub: subProses },
    { label: 'Menunggu Review Hasil', sub: 'Pemeriksaan hasil oleh Kajur' },
    { label: 'Selesai', sub: 'Fasilitas Normal' },
  ];

  const timelineHTML = nodes.map((n, i) => {
    let cls = 'timeline-node';
    let dot = i + 1;
    if (!isRejected) {
      if (i < currentIndex) { cls += ' done'; dot = '✓'; }
      else if (i === currentIndex) {
        if (item.status === 'Selesai') { cls += ' success'; dot = '✓'; }
        else { cls += ' active'; dot = i === 0 ? '✓' : i === 2 ? '⚙' : i + 1; }
      }
    } else if (i === 0) { cls += ' done'; dot = '✓'; }
    return `<div class="${cls}"><div class="timeline-dot">${dot}</div><span class="timeline-caption">${n.label}</span><span class="timeline-sub">${n.sub}</span></div>`;
  }).join('');

  // Tombol aksi
  let actionHTML = '';
  if (isReview) {
    actionHTML = `
      <button type="button" class="btn btn-success" data-act="terima-hasil">✓ Terima Hasil</button>
      <button type="button" class="btn btn-danger" data-act="tolak-hasil">Tolak Hasil Perbaikan</button>`;
  } else if (isRejected) {
    actionHTML = `<button type="button" class="btn btn-ghost" data-act="batal-tolak" style="border:1px solid #cbd5e1;">↺ Batal Penolakan</button>`;
  }

  // Catatan kontekstual
  let noteHTML = '';
  if (isRejected && item.rejectionReason) {
    noteHTML = `<p style="font-size:12px;color:#b91c1c;margin-top:10px;">Alasan penolakan: ${escapeHtml(item.rejectionReason)}</p>`;
  } else if (item.status === 'Dalam Perbaikan' && item.catatan_revisi) {
    noteHTML = `<p style="font-size:12px;color:#b45309;margin-top:10px;">Catatan revisi dikirim ke teknisi: ${escapeHtml(item.catatan_revisi)}</p>`;
  }

  card.innerHTML = `
    <div class="riwayat-head">
      <div>
        <h3 class="riwayat-title">${item.judul}<span class="riwayat-code">#${item.id}</span></h3>
        <p class="riwayat-meta">${item.lokasi?.nama || '-'} · Pelapor: ${item.pelapor?.nama || '-'} · ${item.tanggal || '-'} · ${item.waktu || '-'}</p>
      </div>
      <div style="display:flex; flex-direction:column; align-items:flex-end; gap:8px;">
        <span class="status-pill ${pillClass}">${item.status}</span>
      </div>
    </div>
    ${noteHTML}
    <div class="timeline-wrap">
      <div class="timeline-label">Progress Tracker Timeline</div>
      <div class="timeline">${timelineHTML}</div>
    </div>
    ${actionHTML ? `<div style="display:flex; gap:8px; justify-content:flex-end; margin-top:14px;">${actionHTML}</div>` : ''}
  `;

  card.querySelectorAll('[data-act]').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation(); // jangan buka modal detail
      if (btn.dataset.act === 'terima-hasil') window.terimaHasilPerbaikan(item.id);
      else window.bukaModalAksi(btn.dataset.act, item);
    });
  });

  card.addEventListener('click', () => window.bukaModalDetail(item));
  return card;
}
  

window.bukaModalDetail = function (item) {
  const setText = (id, val) => { const el = document.getElementById(id); if (el) el.textContent = val; };
  setText('detailJudul', item.judul || '-');
  setText('detailId', '#' + (item.id || '-'));
  setText('detailPelapor', item.pelapor?.nama || '-');
  setText('detailLokasi', item.lokasi?.nama || '-');
  setText('detailKategori', item.kategori || '-');
  setText('detailStatus', item.status || '-');
  setText('detailTanggal', `${item.tanggal || '-'} · ${item.waktu || '-'}`);
  setText('detailDeskripsi', item.deskripsi || '-');

  const logEl = document.getElementById('detailChangeLog');
  if (logEl) logEl.innerHTML = renderChangeLogHTML(item.id);

  const hasilEl = document.getElementById('detailHasil');
  if (hasilEl) {
    if (item.hasilCatatan) {
      hasilEl.style.display = 'block';
      hasilEl.innerHTML = `<strong>Hasil kerja teknisi:</strong><br>${escapeHtml(item.hasilCatatan)}` +
        (item.hasilFotoSesudah ? `<img src="${item.hasilFotoSesudah}" alt="Foto sesudah" style="max-width:100%;border-radius:8px;margin-top:8px;">` : '');
    } else {
      hasilEl.style.display = 'none';
    }
  }
  const footer = document.getElementById('detailFooter');
  const btn = document.getElementById('btnSelesaiPusat');
  if (footer && btn) {
    const isPusat = item.status === 'Diteruskan ke Pusat';
    footer.style.display = isPusat ? 'block' : 'none';
    btn.onclick = isPusat ? () => window.tandaiSelesaiPusat(item.id) : null;
  }

  const modal = document.getElementById('modalDetailPengaduan');
  if (modal) { modal.classList.remove('hidden'); modal.classList.add('flex'); }
};


window.tandaiSelesaiPusat = function (id) {
  if (!confirm('Penanganan di UPA PP Pusat sudah selesai? Status akan diubah menjadi Selesai.')) return;

  const reports = getStoredReports();
  const target = reports.find(r => r.id === id);
  if (!target) { showToast('Laporan tidak ditemukan.', 'error'); return; }

  target.status = 'Selesai';
  saveStoredReports(reports);
  showToast('Status laporan diubah menjadi Selesai!', 'success');

  // Tutup modal
  const modal = document.getElementById('modalDetailPengaduan');
  if (modal) { modal.classList.add('hidden'); modal.classList.remove('flex'); }

  // Render ulang
  loadVerifikatorData().then(data => {
    if (data) renderRiwayat({ ...data, laporan_masuk: getStoredReports() });
  });
};

function renderStatistik(data) {
  if (!data || !data.statistik) return;
  const s = data.statistik;
  const setText = (id, val) => { const el = document.getElementById(id); if (el) el.textContent = val; };
  setText('statTotal', s.total_laporan + ' Tiket');
  setText('statResolusi', s.tingkat_resolusi);
  setText('statRata', s.rata_rata_penanganan);
  setText('statRespon', s.respon_verifikasi);

  const tbody = document.getElementById('rankingTableBody');
  const renderRanking = (ranking) => {
    if (!tbody) return;
    tbody.innerHTML = '';
    ranking.forEach((r, index) => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td><strong>#${r.peringkat || index + 1}</strong></td>
        <td>${r.lokasi}</td>
        <td style="text-align: right; padding-right: 24px;">${r.jumlah} Laporan</td>
      `;
      tbody.appendChild(tr);
    });
  };
  renderRanking(s.ranking_lokasi || []);

  const reports = getStoredReports();
  const reportItems = Array.isArray(reports) && reports.length ? reports : (data.laporan_masuk || []);
  populateReportFilter(document.getElementById('statFilterCategory'), reportItems, 'category');
  populateReportFilter(document.getElementById('statFilterRoom'), reportItems, 'room');
  populateReportFilter(document.getElementById('statFilterStatus'), reportItems, 'status');
  const filterResult = document.getElementById('statFilterResult');
  const statTotalNote = document.querySelector('#statTotal')?.parentElement.querySelector('.metric-note');
  const statResolutionNote = document.querySelector('#statResolusi')?.parentElement.querySelector('.metric-note');
  const statAverageNote = document.querySelector('#statRata')?.parentElement.querySelector('.metric-note');
  const statResponseNote = document.querySelector('#statRespon')?.parentElement.querySelector('.metric-note');

  const renderCharts = (trendLabels, trendData, categoryLabels, categoryData) => {
    if (typeof Chart === 'undefined') return;
    const trenEl = document.getElementById('trenChart');
    const katEl = document.getElementById('kategoriChart');
    if (trenEl) {
      const existing = Chart.getChart(trenEl);
      if (existing) existing.destroy();
      new Chart(trenEl, {
        type: 'line',
        data: { labels: trendLabels, datasets: [{ label: 'Jumlah Laporan', data: trendData, borderColor: '#226cc6', backgroundColor: 'rgba(48, 175, 254, 0.15)', fill: true, tension: 0.4, pointBackgroundColor: '#fff', pointBorderColor: '#30affe', pointBorderWidth: 3, pointRadius: 5 }] },
        options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { y: { beginAtZero: true, grid: { color: '#f1f5f9' } }, x: { grid: { display: false } } } },
      });
    }

    if (katEl) {
      const existing = Chart.getChart(katEl);
      if (existing) existing.destroy();
      new Chart(katEl, {
        type: 'doughnut',
        data: { labels: categoryLabels, datasets: [{ data: categoryData, backgroundColor: ['#30affe', '#226cc6', '#f59e0b', '#10b981', '#8b5cf6', '#ef4444'], borderWidth: 0 }] },
        options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'bottom', labels: { boxWidth: 12, font: { size: 11 } } } }, cutout: '65%' },
      });
    }
  };

  const applyFilters = () => {
    const filters = readReportFilters('stat');
    const hasFilters = Object.values(filters).some(Boolean);
    const filteredReports = reportItems.filter((report) => reportMatchesFilters(report, filters));
    if (filterResult) filterResult.textContent = hasFilters
      ? `Statistik menampilkan ${filteredReports.length} dari ${reportItems.length} laporan.`
      : `Menampilkan ringkasan seluruh ${s.total_laporan} laporan.`;

    if (!hasFilters) {
      setText('statTotal', `${s.total_laporan} Tiket`);
      setText('statResolusi', s.tingkat_resolusi);
      setText('statRata', s.rata_rata_penanganan);
      setText('statRespon', s.respon_verifikasi);
      if (statTotalNote) statTotalNote.textContent = '↑ +14.2% dari bulan lalu';
      if (statResolutionNote) statResolutionNote.textContent = 'Target Sarpras tercapai';
      if (statAverageNote) statAverageNote.textContent = 'Per perbaikan';
      if (statResponseNote) statResponseNote.textContent = 'Disposisi cepat Kajur';
      renderRanking(s.ranking_lokasi || []);
      renderCharts(
        s.tren_mingguan?.labels || [],
        s.tren_mingguan?.data || [],
        s.kategori_distribusi?.labels || [],
        s.kategori_distribusi?.data || []
      );
      return;
    }

    const resolved = filteredReports.filter((report) => report.status === 'Selesai').length;
    const resolution = filteredReports.length ? (resolved / filteredReports.length) * 100 : 0;
    setText('statTotal', `${filteredReports.length} Tiket`);
    setText('statResolusi', `${resolution.toFixed(1)}%`);
    setText('statRata', '—');
    setText('statRespon', '—');
    if (statTotalNote) statTotalNote.textContent = 'Sesuai filter yang dipilih';
    if (statResolutionNote) statResolutionNote.textContent = 'Laporan selesai dari hasil filter';
    if (statAverageNote) statAverageNote.textContent = 'Data durasi tidak tersedia';
    if (statResponseNote) statResponseNote.textContent = 'Data waktu respon tidak tersedia';

    const categoryCounts = new Map();
    const roomCounts = new Map();
    const datedReports = [];
    filteredReports.forEach((report) => {
      const category = report.kategori || report.category || 'Tidak berkategori';
      categoryCounts.set(category, (categoryCounts.get(category) || 0) + 1);
      const roomLabel = getReportLocationLabel(report) || 'Tidak diketahui';
      roomCounts.set(roomLabel, (roomCounts.get(roomLabel) || 0) + 1);
      const date = parseReportDate(report.tanggal || report.date);
      if (date) datedReports.push(date);
    });

    const ranking = [...roomCounts.entries()]
      .sort((a, b) => b[1] - a[1])
      .map(([lokasi, jumlah], index) => ({ peringkat: index + 1, lokasi, jumlah }));
    renderRanking(ranking);

    let endDate = datedReports.length
      ? new Date(datedReports.reduce((latest, date) => Math.max(latest, date.getTime()), 0))
      : null;
    if (!endDate && filters.to) endDate = parseReportDate(filters.to);
    if (!endDate) endDate = new Date();
    const trendDates = Array.from({ length: 7 }, (_, index) => {
      const date = new Date(endDate);
      date.setUTCDate(date.getUTCDate() - (6 - index));
      return date;
    });
    const trendCounts = trendDates.map((date) => filteredReports.filter((report) => {
      const reportDate = parseReportDate(report.tanggal || report.date);
      return reportDate && dateToInputValue(reportDate) === dateToInputValue(date);
    }).length);

    renderCharts(
      trendDates.map((date) => date.toLocaleDateString('id-ID', { day: '2-digit', month: 'short', timeZone: 'UTC' })),
      trendCounts,
      [...categoryCounts.keys()],
      [...categoryCounts.values()]
    );
  };

  bindReportFilters('stat', applyFilters);
  applyFilters();
}

/* ==========================================================================
   10. HALAMAN PELAPOR
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
  card.style.cursor = "pointer"; // Tambahkan pointer biar bisa diklik

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
  card.append(progressCard(report.status));
  card.dataset.status = report.status;

  // ==========================================
  // TAMBAHKAN EVENT KLIK UNTUK MEMBUKA DETAIL
  // ==========================================
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
   11. HALAMAN TEKNISI
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
   12. MODAL HELPERS (GLOBAL)
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
        const isPusat = disposition === 'UPA PP Pusat';
        updateReportStatus(code, isPusat ? 'Diteruskan ke Pusat' : 'Dalam Perbaikan', {
          aksi: 'SETUJUI_LAPORAN',
          alasan: `Disposisi: ${disposition}${isPusat ? '' : ' - ' + tech}`,
          extra: {
            disposition,
            verified_at: new Date().toISOString(),
            technician: isPusat ? 'UPA PP Pusat' : tech,
          },
          notePelapor: 'Laporan sudah diverifikasi dan diteruskan.',
        });
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
   13. AUTO INIT
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
      if (typeof window.initPelaporPage !== 'function') {
        throw new Error('Inisialisasi halaman Pelapor tidak tersedia');
      }
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
      const data = await loadTeknisiData(); // Ini harus fetch data.json
      if (typeof window.initTeknisiPage !== 'function') {
        throw new Error('Inisialisasi halaman Teknisi tidak tersedia');
      }
      window.initTeknisiPage(data); // Lempar data.json ke teknisi.js
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

/* ==========================================================================
   MODUL: KELOLA TEKNISI (verifikator/kelola_teknisi.html)
   ========================================================================== */

// State array teknisi
let daftarTeknisi = [];

// Ambil data teknisi dari data.json
async function loadDataTeknisi() {
  try {
    const res = await fetch('../data.json');   // sesuaikan path kalau perlu
    if (!res.ok) throw new Error('Gagal fetch data.json');
    const json = await res.json();
    daftarTeknisi = json.teknisi || [];
  } catch (err) {
    console.warn('[loadDataTeknisi] gagal:', err);
    // fallback lokal kalau fetch gagal
    daftarTeknisi = [
      { id: 'T001', nama: 'Pak Joko', nip: 'E0010', spesialisasi: 'AC / Pendingin', status: 'Aktif', tugas_berjalan: 2 },
      { id: 'T002', nama: 'Pak Agus', nip: 'E0011', spesialisasi: 'Kelistrikan', status: 'Aktif', tugas_berjalan: 1 },
      { id: 'T003', nama: 'Pak Doni', nip: 'E0012', spesialisasi: 'Furnitur', status: 'Cuti', tugas_berjalan: 0 },
    ];
  }
  renderTabelTeknisi();
}

// Render tabel teknisi
function renderTabelTeknisi() {
  const tbody = document.getElementById('tabelTeknisiBody');
  if (!tbody) return;

  tbody.innerHTML = '';

  if (daftarTeknisi.length === 0) {
    tbody.innerHTML = `<tr><td colspan="7" class="text-center" style="padding: 32px; color: var(--muted);">Belum ada data teknisi.</td></tr>`;
    return;
  }

  daftarTeknisi.forEach((t, index) => {
    const tr = document.createElement('tr');

    // Badge warna status
    const statusClass = t.status === 'Aktif'
      ? 'status-pill status-pill-success'
      : t.status === 'Cuti'
        ? 'status-pill status-pill-warning'
        : 'status-pill status-pill-danger';

    // Badge tugas berjalan
    const tugasClass = t.tugas_berjalan > 0 ? 'status-pill status-pill-info' : 'status-pill status-pill-neutral';

    tr.innerHTML = `
  <td class="text-center" style="color: var(--muted); font-weight: 700;">${index + 1}</td>
  <td>
    <div class="cell-reporter">
      <div class="avatar-circle">
        ${t.nama.split(' ').map(x => x[0]).join('').slice(0, 2).toUpperCase()}
      </div>
      <div>
        <span class="cell-name">${t.nama}</span>
      </div>
    </div>
  </td>
  <td><span class="cell-name">${t.nip}</span></td>
  <td><span class="status-pill status-pill-info">${t.spesialisasi}</span></td>
  <td><span class="${statusClass}">${t.status}</span></td>
  <td>
    <!-- Hapus class text-center di sini biar rata kiri -->
    <span class="${tugasClass}">${t.tugas_berjalan} tugas</span>
  </td>
  <td class="text-right">
    <div class="action-group" style="justify-content: flex-end;">
      <button type="button" class="btn-icon" title="Edit" onclick="bukaModalTeknisi('${t.id}')"
        style="color: var(--blue-dark); border-color: #bfdbfe; background: #eff6ff;">✎</button>
      <button type="button" class="btn-icon btn-icon-danger" title="Hapus" onclick="hapusTeknisi('${t.id}')">🗑</button>
    </div>
  </td>
`;

    tbody.appendChild(tr);
  });
}

// Buka modal (tambah / edit)
function bukaModalTeknisi(id = null) {
  const modal = document.getElementById('modalTeknisi');
  const title = document.getElementById('modalTeknisiTitle');
  const form = document.getElementById('formTeknisi');
  if (!modal) return;

  form.reset();
  document.getElementById('teknisiId').value = '';

  if (id) {
    // Mode Edit
    const t = daftarTeknisi.find((x) => x.id === id);
    if (!t) return;

    title.textContent = 'Edit Data Teknisi';
    document.getElementById('teknisiId').value = t.id;
    document.getElementById('namaTeknisi').value = t.nama;
    document.getElementById('nipTeknisi').value = t.nip;
    document.getElementById('spesialisasiTeknisi').value = t.spesialisasi;
    document.getElementById('statusTeknisi').value = t.status;
  } else {
    // Mode Tambah
    title.textContent = 'Tambah Teknisi Baru';
  }

  modal.classList.remove('hidden');
}

// Tutup modal
function tutupModalTeknisi() {
  const modal = document.getElementById('modalTeknisi');
  if (modal) modal.classList.add('hidden');
}

// Simpan (tambah / update)
function simpanTeknisi(event) {
  event.preventDefault();

  const id = document.getElementById('teknisiId').value;
  const nama = document.getElementById('namaTeknisi').value.trim();
  const nip = document.getElementById('nipTeknisi').value.trim();
  const spesialisasi = document.getElementById('spesialisasiTeknisi').value;
  const status = document.getElementById('statusTeknisi').value;

  if (!nama || !nip || !spesialisasi || !status) {
    alert('Semua kolom wajib diisi!');
    return;
  }

  if (id) {
    // Update
    const t = daftarTeknisi.find((x) => x.id === id);
    if (t) {
      t.nama = nama;
      t.nip = nip;
      t.spesialisasi = spesialisasi;
      t.status = status;
    }
    showToast('Data teknisi berhasil diperbarui.', 'success');
  } else {
    // Tambah baru
    const newId = 'T' + String(Date.now()).slice(-4);
    daftarTeknisi.push({
      id: newId,
      nama: nama,
      nip: nip,
      spesialisasi: spesialisasi,
      status: status,
      tugas_berjalan: 0,
    });
    showToast('Teknisi baru berhasil ditambahkan.', 'success');
  }

  tutupModalTeknisi();
  renderTabelTeknisi();
}

// Hapus
function hapusTeknisi(id) {
  const t = daftarTeknisi.find((x) => x.id === id);
  if (!t) return;

  if (!confirm(`Yakin ingin menghapus teknisi "${t.nama}"?`)) return;

  daftarTeknisi = daftarTeknisi.filter((x) => x.id !== id);
  showToast(`Teknisi "${t.nama}" telah dihapus.`, 'info');
  renderTabelTeknisi();
}

// Auto-init kalau di halaman kelola_teknisi
document.addEventListener('DOMContentLoaded', () => {
  if (document.getElementById('tabelTeknisiBody')) {
    loadDataTeknisi();
  }
});

/* ==========================================================================
   FUNGSI MODAL DETAIL PENGADUAN (GLOBAL)
   ========================================================================== */
function bukaDetail(item) {
  const modal = document.getElementById('modalDetailPengaduan');
  if (!modal) return; // skip kalau modal tidak ada di halaman ini

  document.getElementById('detailJudul').textContent = item.judul || '-';
  document.getElementById('detailId').textContent = '#' + (item.id || '-');
  document.getElementById('detailPelapor').textContent = item.pelapor?.nama || '-';
  document.getElementById('detailLokasi').textContent = `${item.lokasi?.kode || ''} - ${item.lokasi?.nama || ''}`;
  document.getElementById('detailKategori').textContent = item.kategori || '-';
  document.getElementById('detailStatus').textContent = item.status || '-';
  document.getElementById('detailTanggal').textContent = `${item.tanggal || '-'} · ${item.waktu || '-'}`;
  document.getElementById('detailDeskripsi').textContent = item.deskripsi || '-';

  modal.classList.remove('hidden');
  modal.classList.add('active'); // buat kompatibilitas CSS lama
}

function tutupDetail() {
  const modal = document.getElementById('modalDetailPengaduan');
  if (modal) {
    modal.classList.add('hidden');
    modal.classList.remove('active');
  }
}