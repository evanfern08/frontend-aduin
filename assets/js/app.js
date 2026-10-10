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
    { title: 'Buat Laporan', link: 'pelapor/buat_laporan.html', icon: 'plus' },
    { title: 'Daftar Laporan', link: 'pelapor/riwayat.html', icon: 'list' },
    { title: 'Pengaturan', link: 'pengaturan.html?role=pelapor', icon: 'settings' },
  ],
  Verifikator: [
    { title: 'Dashboard', link: 'verifikator/index.html', icon: 'home' },
    { title: 'Daftar Laporan', link: 'verifikator/riwayat.html', icon: 'list' },
    { title: 'Statistik', link: 'verifikator/statistik.html', icon: 'chart' },
    { title: 'Pengaturan', link: 'pengaturan.html?role=verifikator', icon: 'settings' },
  ],
  Teknisi: [
    { title: 'Dashboard', link: 'teknisi/index.html', icon: 'home' },
    { title: 'Daftar Tugas', link: 'teknisi/daftar-tugas.html', icon: 'plus' },
    { title: 'Riwayat', link: 'teknisi/riwayat.html', icon: 'list' },
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

  // ---- LANGKAH 2: FETCH users.json ----
  let usersData = null;
  try {
    const res = await fetch(USERS_JSON_PATH);
    if (res.ok) usersData = await res.json();
  } catch (err) {
    console.warn('[initPengaturanPage] users.json tidak dapat dimuat:', err);
  }

  // ---- LANGKAH 3: CARI USER YANG COCOK ----
  let user = null;
  if (usersData?.users) {
    user = usersData.users.find((u) => u.role_utama === roleInternal);
  }
  if (!user) {
    user = { ...(MOCK_USERS_BY_ROLE[roleInternal] || MOCK_USERS_BY_ROLE.Pelapor) };
  }

  user.role_utama = roleInternal;
  if (!user.sidebar_menu || user.sidebar_menu.length === 0) {
    user.sidebar_menu = DEFAULT_MENUS[roleInternal] || DEFAULT_MENUS.Pelapor;
  }

  const setText = (id, val) => {
    const el = document.getElementById(id);
    if (el) el.textContent = val || '–';
  };

  // ---- LANGKAH 4: RENDER MENU SIDEBAR ----
  nav.innerHTML = user.sidebar_menu.map((item) => {
    const isActive = item.title === 'Pengaturan';
    const iconKey = typeof item.icon === 'string' ? item.icon : 'default';
    const iconSvg = MENU_ICONS[iconKey] || MENU_ICONS.default;
    return `<a href="${item.link}" class="nav-link ${isActive ? 'active' : ''}">${iconSvg}<span>${item.title}</span></a>`;
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
   9. HALAMAN VERIFIKATOR (dashboard, riwayat, statistik)
   ========================================================================== */
async function loadVerifikatorData() {
  try {
    const res = await fetch('data.json');
    if (!res.ok) throw new Error('Gagal memuat data.json');
    return await res.json();
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
  tbody.innerHTML = '';

  (data.laporan_masuk || []).forEach((item) => {
    const tr = document.createElement('tr');
    tr.setAttribute('data-row-id', item.id);
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
      <td><div class="cell-reporter"><div class="cell-avatar">${item.pelapor?.inisial || '?'}</div><div><span class="cell-name">${item.pelapor?.nama || '-'}</span><span class="cell-meta">NIM: ${item.pelapor?.nim || '-'}</span></div></div></td>
      <td><span class="cell-name">${item.lokasi?.kode || '-'}</span><span class="cell-meta">${item.lokasi?.nama || '-'}</span></td>
      <td><span class="status-pill">${item.kategori || '-'}</span><span class="cell-meta">${item.judul || '-'}</span></td>
      <td class="text-center">${fotoCell}</td>
      <td class="text-right">${aksiCell}</td>
    `;
    tbody.appendChild(tr);
  });

  const searchInput = document.getElementById('tableSearchInput');
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      const q = e.target.value.toLowerCase().trim();
      tbody.querySelectorAll('tr').forEach((row) => {
        row.style.display = row.textContent.toLowerCase().includes(q) ? '' : 'none';
      });
    });
  }
}

function renderRiwayat(data) {
  const list = document.getElementById('riwayatList');
  if (!list || !data) return;
  list.innerHTML = '';
  (data.laporan_masuk || []).forEach((item) => list.appendChild(buildRiwayatCard(item)));
  document.querySelectorAll('.filter-pill').forEach((pill) => {
    pill.addEventListener('click', () => {
      document.querySelectorAll('.filter-pill').forEach((p) => p.classList.remove('active'));
      pill.classList.add('active');
      const f = pill.getAttribute('data-filter');
      document.querySelectorAll('.riwayat-card').forEach((card) => {
        const s = card.getAttribute('data-status');
        card.style.display = f === 'Semua' || s === f ? '' : 'none';
      });
    });
  });
}

function buildRiwayatCard(item) {
  const card = document.createElement('div');
  card.className = 'glass-card riwayat-card';
  card.setAttribute('data-status', item.status);
  const statusOrder = ['Menunggu Verifikasi', 'Disetujui', 'Dalam Perbaikan', 'Selesai'];
  const currentIndex = statusOrder.indexOf(item.status);
  const isRejected = item.status === 'Ditolak';
  const pillMap = { 'Menunggu Verifikasi': 'status-pill-warning', Disetujui: 'status-pill-info', 'Dalam Perbaikan': 'status-pill-info', Selesai: 'status-pill-success', Ditolak: 'status-pill-danger' };
  const pillClass = pillMap[item.status] || 'status-pill-neutral';
  const nodes = [
    { label: 'Menunggu Verifikasi', sub: item.tanggal || '-' },
    { label: 'Disetujui', sub: 'Validasi Kajur' },
    { label: 'Dalam Perbaikan', sub: item.teknisi || 'Teknisi' },
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
  card.innerHTML = `
    <div class="riwayat-head"><div><h3 class="riwayat-title">${item.judul}<span class="riwayat-code">#${item.id}</span></h3><p class="riwayat-meta">${item.lokasi?.nama || '-'} · Pelapor: ${item.pelapor?.nama || '-'} · ${item.tanggal || '-'} · ${item.waktu || '-'}</p></div><span class="status-pill ${pillClass}">${item.status}</span></div>
    <div class="timeline-wrap"><div class="timeline-label">Progress Tracker Timeline</div><div class="timeline">${timelineHTML}</div></div>
  `;
  return card;
}

function renderStatistik(data) {
  if (!data || !data.statistik) return;
  const s = data.statistik;
  const setText = (id, val) => { const el = document.getElementById(id); if (el) el.textContent = val; };
  setText('statTotal', s.total_laporan + ' Tiket');
  setText('statResolusi', s.tingkat_resolusi);
  setText('statRata', s.rata_rata_penanganan);
  setText('statRespon', s.respon_verifikasi);
  const tbody = document.getElementById('rankingTableBody');
  if (tbody) {
    tbody.innerHTML = '';
    (s.ranking_lokasi || []).forEach((r) => {
      const tr = document.createElement('tr');
      tr.innerHTML = `<td><strong>#${r.peringkat}</strong></td><td>${r.lokasi}</td><td>${r.jumlah} Laporan</td>`;
      tbody.appendChild(tr);
    });
  }
  if (typeof Chart === 'undefined') return;
  const trenEl = document.getElementById('trenChart');
  if (trenEl) {
    new Chart(trenEl, {
      type: 'line',
      data: { labels: s.tren_mingguan?.labels || [], datasets: [{ label: 'Jumlah Laporan', data: s.tren_mingguan?.data || [], borderColor: '#226cc6', backgroundColor: 'rgba(48, 175, 254, 0.15)', fill: true, tension: 0.4, pointBackgroundColor: '#fff', pointBorderColor: '#30affe', pointBorderWidth: 3, pointRadius: 5 }] },
      options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { y: { beginAtZero: true, grid: { color: '#f1f5f9' } }, x: { grid: { display: false } } } },
    });
  }
  const katEl = document.getElementById('kategoriChart');
  if (katEl) {
    new Chart(katEl, {
      type: 'doughnut',
      data: { labels: s.kategori_distribusi?.labels || [], datasets: [{ data: s.kategori_distribusi?.data || [], backgroundColor: ['#30affe', '#226cc6', '#f59e0b', '#10b981'], borderWidth: 0 }] },
      options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'bottom', labels: { boxWidth: 12, font: { size: 11 } } } }, cutout: '65%' },
    });
  }
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
          if (disposition === 'UPA PP Pusat') { target.status = 'Diteruskan ke Pusat'; target.technician = 'UPA PP Pusat'; }
          else { target.status = 'Dalam Perbaikan'; target.technician = tech; }
          saveStoredReports(reports);
        }
        const row = document.querySelector(`tr[data-row-id="${code}"]`);
        if (row) {
          row.style.opacity = '0.55';
          const lastCell = row.querySelector('td:last-child');
          if (lastCell) lastCell.innerHTML = `<span class="status-pill">✓ ${disposition}</span>`;
        }
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
          row.style.opacity = '0.55';
          const lastCell = row.querySelector('td:last-child');
          if (lastCell) lastCell.innerHTML = `<span class="status-pill status-pill-danger">✕ Ditolak</span>`;
        }
      }
      showToast('Laporan ditolak dengan catatan resmi.', 'info');
      window.closeRejectModal();
    });
  }
}

/* ==========================================================================
   11. AUTO INIT
   ========================================================================== */
document.addEventListener('DOMContentLoaded', async () => {
  initPasswordToggles();
  initAuthForms();

  // Halaman Pengaturan
  if (document.getElementById('sidebarNav')) {
    initPengaturanPage();
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