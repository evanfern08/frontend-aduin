/**
 * app.js - ADUIN Client-Side Script (FINAL)
 * Frontend only — localStorage + fetch users.json/data.json
 * ============================================================
 */
<<<<<<< HEAD
function getStoredUsers() {
  const users = JSON.parse(localStorage.getItem('aduin_users') || '[]');
  if (!Array.isArray(users)) {
    throw new Error('Data akun tidak valid di penyimpanan browser.');
  }
  return users;
}

function saveStoredUsers(users) {
  localStorage.setItem('aduin_users', JSON.stringify(users));
}

function getSession() {
  return JSON.parse(localStorage.getItem('aduin_session') || 'null');
}

function saveSession(session) {
  localStorage.setItem('aduin_session', JSON.stringify(session));
}

function dashboardForRole(role) {
  if (role === 'Verifikator') return 'verifikator/index.html';
  if (role === 'Teknisi') return 'teknisi/index.html';
  return 'pelapor/index.html';
}

document.addEventListener('DOMContentLoaded', () => {
=======
>>>>>>> 2eaa8b63bbc252fbd43e8b63c7ab6c083e9af866

/* ============================================================
 * 1. STORAGE HELPERS
 * ============================================================ */
const STORAGE_KEYS = {
  REPORTS: 'aduin_reports',
  USERS: 'aduin_users',
  SESSION: 'aduin_session',
};

function getStoredReports() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.REPORTS) || '[]');
  } catch {
    return [];
  }
}

function saveStoredReports(reports) {
  try {
    localStorage.setItem(STORAGE_KEYS.REPORTS, JSON.stringify(reports));
  } catch (e) {
    console.error('saveStoredReports error:', e);
  }
}

function getStoredUsers() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.USERS) || '[]');
  } catch {
    return [];
  }
}

function saveStoredUsers(users) {
  try {
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
  } catch (e) {
    console.error('saveStoredUsers error:', e);
  }
}

function getSession() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.SESSION) || 'null');
  } catch {
    return null;
  }
}

function saveSession(session) {
  localStorage.setItem(STORAGE_KEYS.SESSION, JSON.stringify(session));
}

function clearSession() {
  localStorage.removeItem(STORAGE_KEYS.SESSION);
}

/* ============================================================
 * 2. TOAST
 * ============================================================ */
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
  toast.textContent = message;
  container.appendChild(toast);

  requestAnimationFrame(() => toast.classList.add('show'));

  setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => toast.remove(), 300);
  }, 4000);
}

/* ============================================================
 * 3. GLOBAL: Toggle show/hide password
 * ============================================================ */
document.addEventListener('DOMContentLoaded', () => {
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
});

<<<<<<< HEAD
  // ============================================================
  // 2. LOGIN FORM - client-side validation
  // ============================================================
  const loginForm = document.getElementById('loginForm');
  if (loginForm) {
    loginForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const idInput = document.getElementById('loginId');
      const passInput = document.getElementById('loginPassword');
      const errorBox = document.getElementById('alertBox');

      if (!idInput.value.trim() || !passInput.value.trim()) {
        if (errorBox) {
          errorBox.textContent = 'Semua kolom wajib diisi.';
          errorBox.classList.remove('hidden');
        }
        if (!idInput.value.trim()) idInput.focus();
        else passInput.focus();
        return;
      }

      try {
        const loginValue = idInput.value.trim();
        const user = getStoredUsers().find((candidate) =>
          candidate.id === loginValue || candidate.email === loginValue.toLowerCase()
        );
        if (!user || user.password !== passInput.value) {
          if (errorBox) {
            errorBox.textContent = 'ID/email atau kata sandi tidak sesuai.';
            errorBox.classList.remove('hidden');
          }
          return;
        }

        const session = {
          id: user.id,
          email: user.email,
          nama: user.nama || user.id,
          role: user.role || 'Pelapor',
        };
        saveSession(session);
        window.location.href = dashboardForRole(session.role);
      } catch (error) {
        if (errorBox) {
          errorBox.textContent = `Login gagal: ${error.message}`;
          errorBox.classList.remove('hidden');
        }
      }
    });
  }

  // ============================================================
  // 3. REGISTER FORM - client-side validation
  // ============================================================
  const registerForm = document.getElementById('registerForm');
  if (registerForm) {
    registerForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const idInput = document.getElementById('regId');
      const emailInput = document.getElementById('regEmail');
      const passInput = document.getElementById('regPassword');
      const errorBox = document.getElementById('alertBox');

      if (!idInput.value.trim() || !emailInput.value.trim() || !passInput.value.trim()) {
        if (errorBox) {
          errorBox.textContent = 'Semua kolom wajib diisi.';
          errorBox.classList.remove('hidden');
        }
        if (!idInput.value.trim()) idInput.focus();
        else if (!emailInput.value.trim()) emailInput.focus();
        else passInput.focus();
        return;
      }
      if (passInput.value.length < 8) {
        if (errorBox) {
          errorBox.textContent = 'Kata sandi minimal 8 karakter.';
          errorBox.classList.remove('hidden');
        }
        passInput.focus();
        return;
      }

      try {
        const users = getStoredUsers();
        const id = idInput.value.trim();
        const email = emailInput.value.trim().toLowerCase();
        if (users.some((user) => user.id === id || user.email === email)) {
          if (errorBox) {
            errorBox.textContent = 'ID atau email tersebut sudah terdaftar.';
            errorBox.classList.remove('hidden');
          }
          return;
        }

        const user = {
          id,
          email,
          password: passInput.value,
          role: 'Pelapor',
          nama: id,
        };
        users.push(user);
        saveStoredUsers(users);
        saveSession({ id, email, nama: user.nama, role: user.role });
        window.location.href = dashboardForRole(user.role);
      } catch (error) {
        if (errorBox) {
          errorBox.textContent = `Pendaftaran gagal: ${error.message}`;
          errorBox.classList.remove('hidden');
        }
      }
    });
  }

  // ============================================================
  // 4. VERIFIKATOR DASHBOARD - tab switching
  // ============================================================
  const navButtons = document.querySelectorAll('[data-view-target]');
  const viewSections = document.querySelectorAll('[data-view-section]');

  function switchVerifikatorView(targetView) {
    viewSections.forEach((sec) => {
      if (sec.getAttribute('data-view-section') === targetView) {
        sec.classList.remove('hidden');
      } else {
        sec.classList.add('hidden');
      }
    });

    navButtons.forEach((btn) => {
      const isTarget = btn.getAttribute('data-view-target') === targetView;
      if (isTarget) {
        btn.classList.add('bg-gradient-to-r', 'from-[#30affe]', 'to-[#226cc6]', 'text-white', 'font-bold', 'shadow-md');
        btn.classList.remove('text-slate-300', 'hover:text-white', 'hover:bg-white/10');
      } else {
        btn.classList.remove('bg-gradient-to-r', 'from-[#30affe]', 'to-[#226cc6]', 'text-white', 'font-bold', 'shadow-md');
        btn.classList.add('text-slate-300', 'hover:text-white', 'hover:bg-white/10');
      }
    });

    const breadcrumbTitle = document.getElementById('headerBreadcrumbTitle');
    if (breadcrumbTitle) {
      const labels = {
        dashboard: 'Dashboard (Validasi)',
        riwayat: 'Riwayat Laporan',
        statistik: 'Statistik & Analisis',
        pengaturan: 'Profil & Pengaturan',
      };
      breadcrumbTitle.textContent = labels[targetView] || 'Dashboard';
    }
  }

  navButtons.forEach((btn) => {
    btn.addEventListener('click', (e) => {
=======
/* ============================================================
 * 4. AUTH: Register & Login
 * ============================================================ */
document.addEventListener('DOMContentLoaded', () => {
  // --- Register ---
  const registerForm = document.getElementById('registerForm');
  if (registerForm) {
    registerForm.addEventListener('submit', (e) => {
>>>>>>> 2eaa8b63bbc252fbd43e8b63c7ab6c083e9af866
      e.preventDefault();
      const id = document.getElementById('regId')?.value.trim();
      const email = document.getElementById('regEmail')?.value.trim();
      const pass = document.getElementById('regPassword')?.value.trim();
      const role = 'Pelapor';
      const alertBox = document.getElementById('alertBox');

      if (!id || !email || !pass) {
        if (alertBox) {
          alertBox.textContent = 'Semua kolom wajib diisi.';
          alertBox.classList.remove('hidden');
        }
        return;
      }

      const users = getStoredUsers();
      const dup = users.find(
        (u) => u.id === id || u.email.toLowerCase() === email.toLowerCase()
      );
      if (dup) {
        if (alertBox) {
          alertBox.textContent = 'NIM/NIP atau Email sudah terdaftar.';
          alertBox.classList.remove('hidden');
        }
        return;
      }

      users.push({
        id,
        email,
        password: pass,
        role,
        nama: id,
        avatar: id.slice(-2).toUpperCase(),
      });
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
        if (alertBox) {
          alertBox.textContent = 'Semua kolom wajib diisi.';
          alertBox.classList.remove('hidden');
        }
        return;
      }

      const users = getStoredUsers();
      const user = users.find(
        (u) => u.id === id || u.email.toLowerCase() === id.toLowerCase()
      );

      if (!user || user.password !== pass) {
        if (alertBox) {
          alertBox.textContent = 'NIM/NIP/Email atau Password salah.';
          alertBox.classList.remove('hidden');
        }
        return;
      }

      saveSession({
        id: user.id,
        email: user.email,
        role: user.role,
        nama: user.nama,
        avatar: user.avatar,
      });

      showToast(`Login berhasil sebagai ${user.role}!`, 'success');

      const redirectMap = {
        Pelapor: 'pelapor/index.html',
        Verifikator: 'verifikator/index.html',
        Teknisi: 'teknisi/index.html',
      };
      setTimeout(() => {
        window.location.href = redirectMap[user.role] || 'login.html';
      }, 600);
    });
  }
});

/* ============================================================
 * 5. HALAMAN: pengaturan.html (SHARED — semua role)
 * ============================================================ */
const USERS_JSON_PATH = 'users.json';

const MENU_ICONS = {
  home: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>',
  list: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>',
  chart: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>',
  settings: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>',
  plus: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>',
  default: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/></svg>',
};

// Menu default per role
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

async function initPengaturanPage() {
  const nav = document.getElementById('sidebarNav');
  if (!nav) return;

  // ============================================================
  // LANGKAH 1: TENTUKAN ROLE DARI URL (?role=) ATAU SESSION
  // ============================================================
  const params = new URLSearchParams(window.location.search);
  const roleFromUrl = (params.get('role') || '').toLowerCase();

  const roleMapUrlToInternal = {
    pelapor: 'Pelapor',
    verifikator: 'Verifikator',
    teknisi: 'Teknisi',
  };

  const session = getSession();

  // Prioritas: URL → Session → default Pelapor
  let roleInternal = roleMapUrlToInternal[roleFromUrl];
  if (!roleInternal && session?.role) {
    roleInternal = session.role;
  }
  if (!roleInternal) {
    roleInternal = 'Pelapor';
  }

  // ============================================================
  // LANGKAH 2: FETCH users.json
  // ============================================================
  let usersData = null;
  try {
    const res = await fetch(USERS_JSON_PATH);
    if (!res.ok) throw new Error('fetch users.json gagal');
    usersData = await res.json();
  } catch (err) {
    console.warn('users.json tidak bisa di-fetch:', err);
  }

  // ============================================================
  // LANGKAH 3: CARI USER DENGAN role_utama SESUAI roleInternal
  // ============================================================
  let user = null;
  if (usersData?.users) {
    user = usersData.users.find((u) => u.role_utama === roleInternal);
  }

  // Fallback: cari user dari session kalau tidak ketemu di JSON
  if (!user && session?.id && usersData?.users) {
    user = usersData.users.find((u) => u.id === session.id);
  }

  // Fallback terakhir: bikin object minimal
  if (!user) {
    user = {
      id: session?.id || '-',
      nama: session?.nama || `Pengguna ${roleInternal}`,
      role_utama: roleInternal,
      jabatan: roleInternal,
      avatar: session?.avatar || roleInternal.slice(0, 2).toUpperCase(),
      unit_kerja: '-',
      email: session?.email || '-',
      status: 'Aktif',
      sidebar_menu: DEFAULT_MENUS[roleInternal] || DEFAULT_MENUS.Pelapor,
    };
  }

  // Pastikan sidebar_menu ada
  if (!user.sidebar_menu || user.sidebar_menu.length === 0) {
    user.sidebar_menu = DEFAULT_MENUS[user.role_utama] || DEFAULT_MENUS.Pelapor;
  }

  // ============================================================
  // LANGKAH 4: RENDER MENU SIDEBAR
  // ============================================================
  nav.innerHTML = user.sidebar_menu
    .map((item) => {
      const isActive = item.title === 'Pengaturan';
      const iconKey = typeof item.icon === 'string' ? item.icon : 'default';
      const icon = MENU_ICONS[iconKey] || MENU_ICONS.default;
      return `
        <a href="${item.link}" class="nav-link ${isActive ? 'active' : ''}">
          ${icon}
          <span>${item.title}</span>
        </a>
      `;
    })
    .join('');

  const setText = (id, val) => {
    const el = document.getElementById(id);
    if (el) el.textContent = val || '–';
  };

  // ============================================================
  // LANGKAH 5: RENDER SIDEBAR USER CARD
  // ============================================================
  const roleMap = {
    Pelapor: 'role-pelapor',
    Verifikator: 'role-verifikator',
    Teknisi: 'role-teknisi',
  };
  const applyRoleClass = (el) => {
    if (!el) return;
    el.classList.remove('role-pelapor', 'role-verifikator', 'role-teknisi');
    const cls = roleMap[user.role_utama];
    if (cls) el.classList.add(cls);
  };

  const sidebarAvatarEl = document.getElementById('sidebarAvatar');
  if (sidebarAvatarEl) {
    sidebarAvatarEl.textContent = user.avatar;
    applyRoleClass(sidebarAvatarEl);
  }
  setText('sidebarName', user.nama);
  setText('sidebarRole', user.jabatan);

  // ============================================================
  // LANGKAH 6: RENDER KARTU PROFIL
  // ============================================================
  const profileAvatarEl = document.getElementById('profileAvatar');
  if (profileAvatarEl) {
    profileAvatarEl.textContent = user.avatar;
    applyRoleClass(profileAvatarEl);
  }
  setText('profileName', user.nama);
  setText(
    'profileId',
    (user.role_utama === 'Pelapor' ? 'NIM: ' : 'NIP: ') + user.id
  );
  setText('profileRoleBadge', user.jabatan);
  setText('profileEmail', user.email);
  setText('breadcrumbRole', user.role_utama);

  // ============================================================
  // LANGKAH 7: UPLOAD FOTO PROFIL
  // ============================================================
  const avatarInput = document.getElementById('avatarUploadInput');
  const savedAvatar = localStorage.getItem('aduin_avatar_' + user.id);

  if (savedAvatar) {
    if (profileAvatarEl) profileAvatarEl.innerHTML = `<img src="${savedAvatar}" alt="Avatar">`;
    if (sidebarAvatarEl) sidebarAvatarEl.innerHTML = `<img src="${savedAvatar}" alt="Avatar">`;
  }

  if (avatarInput && profileAvatarEl) {
    avatarInput.addEventListener('change', (e) => {
      const file = e.target.files?.[0];
      if (!file) return;
      if (!file.type.startsWith('image/')) {
        showToast('File harus berupa gambar.', 'error');
        return;
      }
      if (file.size > 2 * 1024 * 1024) {
        showToast('Ukuran gambar maksimal 2MB.', 'error');
        return;
      }
      const reader = new FileReader();
      reader.onload = (ev) => {
        const base64 = ev.target.result;
        profileAvatarEl.innerHTML = `<img src="${base64}" alt="Avatar">`;
        if (sidebarAvatarEl) sidebarAvatarEl.innerHTML = `<img src="${base64}" alt="Avatar">`;
        localStorage.setItem('aduin_avatar_' + user.id, base64);
        showToast('Foto profil berhasil diperbarui.', 'success');
      };
      reader.readAsDataURL(file);
    });
  }

  // ============================================================
  // LANGKAH 8: LOGOUT
  // ============================================================
  const btnLogout = document.getElementById('btnLogout');
  if (btnLogout) {
    btnLogout.addEventListener('click', (e) => {
      e.preventDefault();
      clearSession();
      window.location.href = 'login.html';
    });
  }

  // ============================================================
  // LANGKAH 9: FORM UBAH PASSWORD (BERLAKU UNTUK SEMUA ROLE)
  // ============================================================
  const form = document.getElementById('formUbahPassword');
  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const oldPass = document.getElementById('oldPassword')?.value;
      const newPass = document.getElementById('newPassword')?.value;
      const confirmPass = document.getElementById('confirmPassword')?.value;
      const alertBox = document.getElementById('passwordAlert');

      const showAlert = (msg, ok = true) => {
        if (!alertBox) return;
        alertBox.textContent = msg;
        alertBox.style.display = 'block';
        alertBox.style.background = ok ? '#ecfdf5' : '#fef2f2';
        alertBox.style.borderColor = ok ? '#bbf7d0' : '#fecaca';
        alertBox.style.color = ok ? '#065f46' : '#991b1b';
        setTimeout(() => (alertBox.style.display = 'none'), 4000);
      };

      if (!oldPass || !newPass || !confirmPass) {
        showAlert('Semua kolom wajib diisi.', false);
        return;
      }
      if (newPass.length < 8) {
        showAlert('Password baru minimal 8 karakter.', false);
        return;
      }
      if (newPass !== confirmPass) {
        showAlert('Konfirmasi password tidak cocok.', false);
        return;
      }

      // Cari user di localStorage berdasarkan user.id (dari URL) atau session
      const users = getStoredUsers();
      const targetId = user.id !== '-' ? user.id : (session?.id || null);
      const u = targetId ? users.find((x) => x.id === targetId) : null;

      if (!u) {
        // User belum ada di localStorage → simpan sebagai user baru
        users.push({
          id: user.id,
          email: user.email,
          password: newPass,
          role: user.role_utama,
          nama: user.nama,
          avatar: user.avatar,
        });
        saveStoredUsers(users);
        showAlert('Kata sandi berhasil diperbarui dengan aman!', true);
        form.reset();
        return;
      }

      if (u.password !== oldPass) {
        showAlert('Password lama salah.', false);
        return;
      }

      u.password = newPass;
      saveStoredUsers(users);
      showAlert('Kata sandi berhasil diperbarui dengan aman!', true);
      form.reset();
    });
  }
}

/* ============================================================
 * 6. HALAMAN: verifikator (dashboard, riwayat, statistik)
 * ============================================================ */
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

  const setText = (id, val) => {
    const el = document.getElementById(id);
    if (el) el.textContent = val;
  };
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
      ? `<button type="button" class="thumb-btn" onclick="openImageModal('${item.foto_url}')">
           <img src="${item.thumb_url}" alt="Bukti" class="thumb-img">
         </button>`
      : `<span class="text-muted">Tanpa foto</span>`;

    const aksiCell =
      item.status === 'Menunggu Verifikasi'
        ? `<div class="action-group">
             <button type="button" class="btn-icon btn-icon-success"
               onclick="openApproveModal('${item.id}', '${item.judul}')" title="Approve">✓</button>
             <button type="button" class="btn-icon btn-icon-danger"
               onclick="openRejectModal('${item.id}', '${item.judul}')" title="Reject">✕</button>
           </div>`
        : `<span class="status-pill">${item.status}</span>`;

    tr.innerHTML = `
      <td>
        <div class="cell-reporter">
          <div class="cell-avatar">${item.pelapor?.inisial || '?'}</div>
          <div>
            <span class="cell-name">${item.pelapor?.nama || '-'}</span>
            <span class="cell-meta">NIM: ${item.pelapor?.nim || '-'}</span>
          </div>
        </div>
      </td>
      <td>
        <span class="cell-name">${item.lokasi?.kode || '-'}</span>
        <span class="cell-meta">${item.lokasi?.nama || '-'}</span>
      </td>
      <td>
        <span class="status-pill">${item.kategori || '-'}</span>
        <span class="cell-meta">${item.judul || '-'}</span>
      </td>
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

  const pillMap = {
    'Menunggu Verifikasi': 'status-pill-warning',
    Disetujui: 'status-pill-info',
    'Dalam Perbaikan': 'status-pill-info',
    Selesai: 'status-pill-success',
    Ditolak: 'status-pill-danger',
  };
  const pillClass = pillMap[item.status] || 'status-pill-neutral';

  const nodes = [
    { label: 'Menunggu Verifikasi', sub: item.tanggal || '-' },
    { label: 'Disetujui', sub: 'Validasi Kajur' },
    { label: 'Dalam Perbaikan', sub: item.teknisi || 'Teknisi' },
    { label: 'Selesai', sub: 'Fasilitas Normal' },
  ];

  const timelineHTML = nodes
    .map((n, i) => {
      let cls = 'timeline-node';
      let dot = i + 1;

      if (!isRejected) {
        if (i < currentIndex) {
          cls += ' done';
          dot = '✓';
        } else if (i === currentIndex) {
          if (item.status === 'Selesai') {
            cls += ' success';
            dot = '✓';
          } else {
            cls += ' active';
            dot = i === 0 ? '✓' : i === 2 ? '⚙' : i + 1;
          }
        }
      } else if (i === 0) {
        cls += ' done';
        dot = '✓';
      }

      return `
        <div class="${cls}">
          <div class="timeline-dot">${dot}</div>
          <span class="timeline-caption">${n.label}</span>
          <span class="timeline-sub">${n.sub}</span>
        </div>
      `;
    })
    .join('');

  card.innerHTML = `
    <div class="riwayat-head">
      <div>
        <h3 class="riwayat-title">
          ${item.judul}
          <span class="riwayat-code">#${item.id}</span>
        </h3>
        <p class="riwayat-meta">
          ${item.lokasi?.nama || '-'} · Pelapor: ${item.pelapor?.nama || '-'} · ${item.tanggal || '-'} · ${item.waktu || '-'}
        </p>
      </div>
      <span class="status-pill ${pillClass}">${item.status}</span>
    </div>

    <div class="timeline-wrap">
      <div class="timeline-label">Progress Tracker Timeline</div>
      <div class="timeline">${timelineHTML}</div>
    </div>
  `;

  return card;
}

function renderStatistik(data) {
  if (!data || !data.statistik) return;
  const s = data.statistik;

  const setText = (id, val) => {
    const el = document.getElementById(id);
    if (el) el.textContent = val;
  };
  setText('statTotal', s.total_laporan + ' Tiket');
  setText('statResolusi', s.tingkat_resolusi);
  setText('statRata', s.rata_rata_penanganan);
  setText('statRespon', s.respon_verifikasi);

  const tbody = document.getElementById('rankingTableBody');
  if (tbody) {
    tbody.innerHTML = '';
    (s.ranking_lokasi || []).forEach((r) => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td><strong>#${r.peringkat}</strong></td>
        <td>${r.lokasi}</td>
        <td>${r.jumlah} Laporan</td>
      `;
      tbody.appendChild(tr);
    });
  }

  if (typeof Chart === 'undefined') return;

  const trenEl = document.getElementById('trenChart');
  if (trenEl) {
    new Chart(trenEl, {
      type: 'line',
      data: {
        labels: s.tren_mingguan?.labels || [],
        datasets: [
          {
            label: 'Jumlah Laporan',
            data: s.tren_mingguan?.data || [],
            borderColor: '#226cc6',
            backgroundColor: 'rgba(48, 175, 254, 0.15)',
            fill: true,
            tension: 0.4,
            pointBackgroundColor: '#fff',
            pointBorderColor: '#30affe',
            pointBorderWidth: 3,
            pointRadius: 5,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
          y: { beginAtZero: true, grid: { color: '#f1f5f9' } },
          x: { grid: { display: false } },
        },
      },
    });
  }

  const katEl = document.getElementById('kategoriChart');
  if (katEl) {
    new Chart(katEl, {
      type: 'doughnut',
      data: {
        labels: s.kategori_distribusi?.labels || [],
        datasets: [
          {
            data: s.kategori_distribusi?.data || [],
            backgroundColor: ['#30affe', '#226cc6', '#f59e0b', '#10b981'],
            borderWidth: 0,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { position: 'bottom', labels: { boxWidth: 12, font: { size: 11 } } },
        },
        cutout: '65%',
      },
    });
  }
}

/* ============================================================
 * 7. MODAL HELPERS (global)
 * ============================================================ */
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
          if (disposition === 'UPA PP Pusat') {
            target.status = 'Diteruskan ke Pusat';
            target.technician = 'UPA PP Pusat';
          } else {
            target.status = 'Dalam Perbaikan';
            target.technician = tech;
          }
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
      if (!reason) {
        showToast('Alasan penolakan wajib diisi.', 'error');
        return;
      }
      const code = activeReportForAction?.code;

      if (code) {
        const reports = getStoredReports();
        const target = reports.find((r) => r.id === code || r.roomCode === code);
        if (target) {
          target.status = 'Ditolak';
          target.rejectionReason = reason;
          saveStoredReports(reports);
        }
        const row = document.querySelector(`tr[data-row-id="${code}"]`);
        if (row) {
          row.style.opacity = '0.55';
          const lastCell = row.querySelector('td:last-child');
          if (lastCell)
            lastCell.innerHTML = `<span class="status-pill status-pill-danger">✕ Ditolak</span>`;
        }
      }

      showToast('Laporan ditolak dengan catatan resmi.', 'info');
      window.closeRejectModal();
    });
  }
}

/* ============================================================
 * 8. AUTO-BOOT
 * ============================================================ */
document.addEventListener('DOMContentLoaded', async () => {
<<<<<<< HEAD
  // Hanya jalan di halaman verifikator (cek keberadaan elemen khas)
  const isDashboard = document.getElementById('verifikatorTableBody');
  const isStatistik = document.getElementById('rankingTableBody');

  if (!isDashboard && !isStatistik) return;

  const data = await loadVerifikatorData();
  if (!data) return;

  if (isDashboard) {
    renderDashboard(data);
    bindVerifikatorEvents();
  }
  if (isStatistik) {
    renderStatistik(data);
  }
});
/* ============================================================
 * HALAMAN: riwayat.html (Daftar Laporan)
 * ============================================================ */

function renderRiwayat(data) {
  const list = document.getElementById('riwayatList');
  if (!list || !data) return;

  list.innerHTML = '';
  data.laporan_masuk.forEach((item) => {
    list.appendChild(buildRiwayatCard(item));
  });

  // Filter pills
  document.querySelectorAll('.filter-pill').forEach((pill) => {
    pill.addEventListener('click', () => {
      document.querySelectorAll('.filter-pill').forEach((p) => p.classList.remove('active'));
      pill.classList.add('active');

      const f = pill.getAttribute('data-filter');
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

  // Tentukan index progress berdasarkan status
  const statusOrder = ['Menunggu Verifikasi', 'Disetujui', 'Dalam Perbaikan', 'Selesai'];
  const currentIndex = statusOrder.indexOf(item.status);
  const isRejected = item.status === 'Ditolak';

  // Warna pill sesuai status
  const pillMap = {
    'Menunggu Verifikasi': 'status-pill-warning',
    'Disetujui': 'status-pill-info',
    'Dalam Perbaikan': 'status-pill-info',
    'Selesai': 'status-pill-success',
    'Ditolak': 'status-pill-danger',
  };
  const pillClass = pillMap[item.status] || 'status-pill-neutral';

  // Build timeline nodes
  const nodes = [
    { label: 'Menunggu Verifikasi', sub: item.tanggal },
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
        else { cls += ' active'; dot = i === 0 ? '✓' : (i === 2 ? '⚙' : i + 1); }
      }
    } else if (i === 0) {
      cls += ' done'; dot = '✓';
    }

    return `
      <div class="${cls}">
        <div class="timeline-dot">${dot}</div>
        <span class="timeline-caption">${n.label}</span>
        <span class="timeline-sub">${n.sub}</span>
      </div>
    `;
  }).join('');

  card.innerHTML = `
    <div class="riwayat-head">
      <div>
        <h3 class="riwayat-title">
          ${item.judul}
          <span class="riwayat-code">#${item.id}</span>
        </h3>
        <p class="riwayat-meta">
          ${item.lokasi.nama} · Pelapor: ${item.pelapor.nama} · ${item.tanggal} · ${item.waktu}
        </p>
      </div>
      <span class="status-pill ${pillClass}">${item.status}</span>
    </div>

    <div class="timeline-wrap">
      <div class="timeline-label">Progress Tracker Timeline</div>
      <div class="timeline">${timelineHTML}</div>
    </div>
  `;

  return card;
}

/* ============================================================
 * HALAMAN: pengaturan.html (ganti password)
 * ============================================================ */
function bindPengaturanForm() {
  const form = document.getElementById('changePasswordForm');
  if (!form) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const oldPass = document.getElementById('oldPassword')?.value;
    const newPass = document.getElementById('newPassword')?.value;
    const confirmPass = document.getElementById('confirmPassword')?.value;
    const alertBox = document.getElementById('passwordAlert');

    const showAlert = (msg, ok = true) => {
      if (!alertBox) return;
      alertBox.textContent = msg;
      alertBox.style.display = 'block';
      alertBox.style.background = ok ? '#ecfdf5' : '#fef2f2';
      alertBox.style.borderColor = ok ? '#bbf7d0' : '#fecaca';
      alertBox.style.color = ok ? '#065f46' : '#991b1b';
      setTimeout(() => { alertBox.style.display = 'none'; }, 4000);
    };

    if (!oldPass || !newPass || !confirmPass) {
      showAlert('Semua kolom wajib diisi.', false);
      return;
    }
    if (newPass.length < 8) {
      showAlert('Password baru minimal 8 karakter.', false);
      return;
    }
    if (newPass !== confirmPass) {
      showAlert('Konfirmasi password tidak cocok.', false);
      return;
    }

    // (FE only) cek password lama terhadap localStorage user
    try {
      const users = JSON.parse(localStorage.getItem('aduin_users') || '[]');
      const session = JSON.parse(localStorage.getItem('aduin_session') || 'null');
      const user = users.find((u) => u.id === session?.id);

      if (user && user.password !== oldPass) {
        showAlert('Password lama salah.', false);
        return;
      }
      if (user) {
        user.password = newPass;
        localStorage.setItem('aduin_users', JSON.stringify(users));
      }
    } catch (err) {
      console.warn('LocalStorage tidak tersedia:', err);
    }

    showAlert('Kata sandi berhasil diperbarui dengan aman!', true);
    form.reset();
  });
}
/* ============================================================
 * HALAMAN SHARED: pengaturan.html
 * Data profil awal dimuat dari users.json.
 * ============================================================ */

// Path relatif ke data.json dari pengaturan.html (root)
const DATA_JSON_PATH = 'users.json';
const SETTINGS_MENU_ICONS = {
  home: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>',
  list: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>',
  chart: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>',
  settings: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 1 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 1-1 1.51V21a2 2 0 1 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 1-1.51-1H3a2 2 0 1 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>',
  plus: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>',
  default: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/></svg>',
};

const SETTINGS_ROLE_MENUS = {
  Pelapor: [
    { title: 'Dashboard', link: 'pelapor/index.html', icon: 'home' },
    { title: 'Buat Laporan', link: 'pelapor/laporan.html', icon: 'plus' },
    { title: 'Daftar Laporan', link: 'pelapor/daftar_laporan.html', icon: 'list' },
    { title: 'Pengaturan', link: 'pengaturan.html', icon: 'settings' },
  ],
  Verifikator: [
    { title: 'Dashboard', link: 'verifikator/index.html', icon: 'home' },
    { title: 'Daftar Laporan', link: 'verifikator/riwayat.html', icon: 'list' },
    { title: 'Statistik', link: 'verifikator/statistik.html', icon: 'chart' },
    { title: 'Pengaturan', link: 'pengaturan.html', icon: 'settings' },
  ],
  Teknisi: [
    { title: 'Dashboard', link: 'teknisi/index.html', icon: 'home' },
    { title: 'Pengaturan', link: 'pengaturan.html', icon: 'settings' },
  ],
};

function setSettingsText(id, value) {
  const element = document.getElementById(id);
  if (element) element.textContent = value || '–';
}

function displaySettingsError(message) {
  const alertBox = document.getElementById('passwordAlert');
  if (alertBox) {
    alertBox.textContent = message;
    alertBox.style.display = 'block';
    alertBox.style.background = '#fef2f2';
    alertBox.style.borderColor = '#fecaca';
    alertBox.style.color = '#991b1b';
  }
  console.error(message);
}

async function initPengaturanPage() {
  const nav = document.getElementById('sidebarNav');
  const passwordForm = document.getElementById('formUbahPassword');
  let session;
  try {
    session = getSession();
  } catch (error) {
    displaySettingsError(`Sesi akun tidak dapat dibaca: ${error.message}`);
    return;
  }

  let data;
  try {
    const response = await fetch(DATA_JSON_PATH);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    data = await response.json();
    if (!data || !Array.isArray(data.users)) throw new Error('Format users.json tidak valid.');
  } catch (error) {
    displaySettingsError(`Data profil tidak dapat dimuat: ${error.message}`);
    return;
  }

  let storedUsers;
  let storedUser = null;
  try {
    storedUsers = getStoredUsers();
    storedUser = session && storedUsers.find((item) => item.id === session.id);
  } catch (error) {
    displaySettingsError(`Data akun tidak dapat dibaca: ${error.message}`);
    return;
  }

  let profile = data.users.find((item) => item.id === (session && session.id));
  if (!profile && storedUser) {
    profile = {
      id: storedUser.id,
      nama: storedUser.nama || storedUser.id,
      role_utama: storedUser.role || 'Pelapor',
      jabatan: storedUser.role || 'Pelapor',
      email: storedUser.email || '',
      unit_kerja: '',
    };
  }
  if (!profile && !session) {
    profile = data.users.find((item) => item.id === data.simulated_active_user_id);
  }
  if (!profile) {
    displaySettingsError('Profil pengguna tidak ditemukan. Silakan login kembali.');
    return;
  }

  if (!storedUser) {
    storedUser = storedUsers.find((item) => item.id === profile.id) || null;
  }

  const role = (session && session.id === profile.id && session.role) ||
    (storedUser && storedUser.role) || profile.role_utama || 'Pelapor';
  const name = (session && session.id === profile.id && session.nama) ||
    (storedUser && storedUser.nama) || profile.nama;
  const email = (session && session.id === profile.id && session.email) ||
    (storedUser && storedUser.email) || profile.email;
  const avatar = name.trim().split(/\s+/).slice(0, 2).map((part) => part[0]).join('').toUpperCase();
  const roleLabel = profile.jabatan || role;
  const menuItems = SETTINGS_ROLE_MENUS[role] || profile.sidebar_menu || SETTINGS_ROLE_MENUS.Pelapor;

  if (nav) {
    nav.innerHTML = menuItems.map((item) => {
      const isActive = item.title === 'Pengaturan';
      const icon = SETTINGS_MENU_ICONS[item.icon] || SETTINGS_MENU_ICONS.default;
      return `<a href="${item.link}" class="nav-link ${isActive ? 'active' : ''}"${isActive ? ' aria-current="page"' : ''}>${icon}<span>${item.title}</span></a>`;
    }).join('');
  }

  const homeLink = menuItems.find((item) => item.title === 'Dashboard');
  const brand = document.getElementById('sidebarBrand');
  if (brand && homeLink) brand.href = homeLink.link;

  setSettingsText('sidebarAvatar', avatar);
  setSettingsText('sidebarName', name);
  setSettingsText('sidebarRole', roleLabel);
  setSettingsText('profileAvatar', avatar);
  setSettingsText('profileName', name);
  setSettingsText('profileId', `${role === 'Pelapor' ? 'NIM' : 'NIP'}: ${profile.id}`);
  setSettingsText('profileRoleBadge', roleLabel);
  setSettingsText('profileUnit', profile.unit_kerja || '');
  setSettingsText('profileEmail', email || '');
  setSettingsText('breadcrumbRole', role);

  const editProfileButton = document.getElementById('editProfileName');
  if (editProfileButton) {
    editProfileButton.addEventListener('click', () => {
      const updatedName = window.prompt('Masukkan nama lengkap:', name);
      if (updatedName === null) return;
      if (!updatedName.trim()) {
        window.alert('Nama tidak boleh kosong.');
        return;
      }
      if (!storedUser || !session || session.id !== profile.id) {
        window.alert('Nama hanya dapat diubah untuk akun yang sudah login dan terdaftar.');
        return;
      }

      try {
        const users = getStoredUsers();
        const user = users.find((item) => item.id === profile.id);
        if (!user) throw new Error('Akun tidak ditemukan.');
        user.nama = updatedName.trim();
        session.nama = user.nama;
        saveStoredUsers(users);
        saveSession(session);
        setSettingsText('profileName', user.nama);
        setSettingsText('sidebarName', user.nama);
        const initials = user.nama.trim().split(/\s+/).slice(0, 2).map((part) => part[0]).join('').toUpperCase();
        setSettingsText('profileAvatar', initials);
        setSettingsText('sidebarAvatar', initials);
      } catch (error) {
        window.alert(`Nama profil tidak dapat disimpan: ${error.message}`);
      }
    });
  }

  const logoutButton = document.getElementById('btnLogout');
  if (logoutButton) {
    logoutButton.addEventListener('click', (event) => {
      event.preventDefault();
      try {
        localStorage.removeItem('aduin_session');
        window.location.href = 'login.html';
      } catch (error) {
        window.alert(`Tidak dapat keluar dari akun: ${error.message}`);
      }
    });
  }

  if (!passwordForm) return;
  passwordForm.addEventListener('submit', (event) => {
    event.preventDefault();
    const oldPassword = document.getElementById('oldPassword').value;
    const newPassword = document.getElementById('newPassword').value;
    const confirmation = document.getElementById('confirmPassword').value;
    const alertBox = document.getElementById('passwordAlert');
    const showAlert = (message, success) => {
      if (!alertBox) return;
      alertBox.textContent = message;
      alertBox.style.display = 'block';
      alertBox.style.background = success ? '#ecfdf5' : '#fef2f2';
      alertBox.style.borderColor = success ? '#bbf7d0' : '#fecaca';
      alertBox.style.color = success ? '#065f46' : '#991b1b';
    };

    if (!oldPassword || !newPassword || !confirmation) {
      showAlert('Semua kolom wajib diisi.', false);
      return;
    }
    if (newPassword.length < 8) {
      showAlert('Password baru minimal 8 karakter.', false);
      return;
    }
    if (newPassword !== confirmation) {
      showAlert('Konfirmasi password tidak cocok.', false);
      return;
    }
    if (!storedUser || !session || session.id !== profile.id) {
      showAlert('Perubahan kata sandi memerlukan akun yang sudah login.', false);
      return;
    }

<<<<<<< HEAD
    try {
      const users = getStoredUsers();
      const user = users.find((item) => item.id === profile.id);
      if (!user) throw new Error('Akun tidak ditemukan.');
      if (user.password !== oldPassword) {
        showAlert('Password lama salah.', false);
        return;
      }
      user.password = newPassword;
      saveStoredUsers(users);
      showAlert('Kata sandi berhasil diperbarui.', true);
      passwordForm.reset();
    } catch (error) {
      showAlert(`Kata sandi tidak dapat disimpan: ${error.message}`, false);
=======
    // ---------- 1. Render sidebar menu ----------
    nav.innerHTML = user.sidebar_menu.map((item) => {
      const isActive = item.title === 'Pengaturan';
      const icon = MENU_ICONS[item.icon] || MENU_ICONS.default;
      return `
        <a href="${item.link}" class="nav-link ${isActive ? 'active' : ''}">
          ${icon}
          <span>${item.title}</span>
        </a>
      `;
    }).join('');

    // ---------- 2. Render sidebar user card ----------
    const setText = (id, val) => {
      const el = document.getElementById(id);
      if (el) el.textContent = val || '–';
    };

    const sidebarAvatarEl = document.getElementById('sidebarAvatar');
    if (sidebarAvatarEl) {
      sidebarAvatarEl.textContent = user.avatar;
      sidebarAvatarEl.classList.remove('role-pelapor', 'role-verifikator', 'role-teknisi');
      const roleMap = {
        'Pelapor': 'role-pelapor',
        'Verifikator': 'role-verifikator',
        'Teknisi': 'role-teknisi',
      };
      const roleClass = roleMap[user.role_utama];
      if (roleClass) sidebarAvatarEl.classList.add(roleClass);
    }
    setText('sidebarName', user.nama);
    setText('sidebarRole', user.jabatan);

    // ---------- 3. Render kartu profil ----------
    const profileAvatarEl = document.getElementById('profileAvatar');
    if (profileAvatarEl) {
      profileAvatarEl.textContent = user.avatar;
      // Hapus class role lama (kalau ada), lalu apply yang baru
      profileAvatarEl.classList.remove('role-pelapor', 'role-verifikator', 'role-teknisi');
      const roleMap = {
        'Pelapor': 'role-pelapor',
        'Verifikator': 'role-verifikator',
        'Teknisi': 'role-teknisi',
      };
      const roleClass = roleMap[user.role_utama];
      if (roleClass) profileAvatarEl.classList.add(roleClass);
    }
    setText('profileName', user.nama);
    setText('profileId', (user.role_utama === 'Pelapor' ? 'NIM: ' : 'NIP: ') + user.id);
    setText('profileRoleBadge', user.jabatan);
    setText('profileUnit', user.unit_kerja);
    setText('profileEmail', user.email);

    // ---------- HANDLE UPLOAD FOTO PROFIL ----------
    const avatarInput = document.getElementById('avatarUploadInput');
    const avatarPreview = document.getElementById('profileAvatar');

    if (avatarInput && avatarPreview) {
      // Cek apakah ada foto tersimpan di localStorage
      const savedAvatar = localStorage.getItem('aduin_avatar_' + user.id);
      if (savedAvatar) {
        avatarPreview.innerHTML = `<img src="${savedAvatar}" alt="Avatar">`;
      }

      avatarInput.addEventListener('change', (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Validasi: hanya gambar, max 2MB
        if (!file.type.startsWith('image/')) {
          alert('File harus berupa gambar.');
          return;
        }
        if (file.size > 2 * 1024 * 1024) {
          alert('Ukuran gambar maksimal 2MB.');
          return;
        }

        // Baca sebagai base64 & simpan ke localStorage
        const reader = new FileReader();
        reader.onload = (ev) => {
          const base64 = ev.target.result;
          avatarPreview.innerHTML = `<img src="${base64}" alt="Avatar">`;
          localStorage.setItem('aduin_avatar_' + user.id, base64);

          // Sinkron ke sidebar avatar juga
          const sidebarAvatar = document.getElementById('sidebarAvatar');
          if (sidebarAvatar) {
            sidebarAvatar.innerHTML = `<img src="${base64}" alt="Avatar">`;
          }
        };
        reader.readAsDataURL(file);
      });

      // Sinkron foto ke sidebar saat load
      if (savedAvatar) {
        const sidebarAvatar = document.getElementById('sidebarAvatar');
        if (sidebarAvatar) {
          sidebarAvatar.innerHTML = `<img src="${savedAvatar}" alt="Avatar">`;
        }
      }
    }

    // ---------- 4. Breadcrumb kecil ----------
    setText('breadcrumbRole', user.role_utama);

    // ---------- 5. Handle logout (clear session) ----------
    const btnLogout = document.getElementById('btnLogout');
    if (btnLogout) {
      btnLogout.addEventListener('click', (e) => {
        e.preventDefault();
        if (typeof clearSession === 'function') clearSession();
        window.location.href = 'login.html';
      });
>>>>>>> 2c8f901c338485f59b115cd9ee34820dbb286bea
    }
  });
}
// Auto-boot kalau halaman ini punya #sidebarNav
document.addEventListener('DOMContentLoaded', () => {
=======
  // Pengaturan page
>>>>>>> 2eaa8b63bbc252fbd43e8b63c7ab6c083e9af866
  if (document.getElementById('sidebarNav')) {
    initPengaturanPage();
    return;
  }

  // Verifikator pages
  const isDashboard = document.getElementById('verifikatorTableBody');
  const isRiwayat = document.getElementById('riwayatList');
  const isStatistik = document.getElementById('rankingTableBody');

  if (isDashboard || isRiwayat || isStatistik) {
    const data = await loadVerifikatorData();
    if (!data) return;
    if (isDashboard) {
      renderDashboard(data);
      bindVerifikatorEvents();
    }
    if (isRiwayat) renderRiwayat(data);
    if (isStatistik) renderStatistik(data);
  }
});