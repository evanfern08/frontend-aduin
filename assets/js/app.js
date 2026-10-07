/**
 * app.js - Client-side script for ADUIN Authentication Pages
 * (single DOMContentLoaded, no duplicates)
 */
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

  // ============================================================
  // 1. TOGGLE PASSWORD VISIBILITY
  // ============================================================
  const togglePassBtns = document.querySelectorAll('.toggle-password-btn');
  togglePassBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      const targetId = btn.getAttribute('data-target');
      const input = document.getElementById(targetId);
      const eyeIcon = btn.querySelector('.eye-icon');
      const eyeOffIcon = btn.querySelector('.eye-off-icon');

      if (!input) return;

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
      const roleInput = document.getElementById('regRole');
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
          role: roleInput.value,
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
      e.preventDefault();
      const target = btn.getAttribute('data-view-target');
      if (target) switchVerifikatorView(target);
    });
  });

  // ============================================================
  // 5. MODALS (approve / reject / image)
  // ============================================================
  const approveModal = document.getElementById('approveModal');
  const rejectModal = document.getElementById('rejectModal');
  const imageModal = document.getElementById('imageModal');

  window.openApproveModal = function (reportCode, reportTitle) {
    if (!approveModal) return;
    const targetTitle = document.getElementById('approveTargetTitle');
    if (targetTitle) targetTitle.textContent = reportCode + ' - ' + reportTitle;
    approveModal.classList.remove('hidden');
    approveModal.classList.add('flex');
  };
  window.closeApproveModal = function () {
    if (!approveModal) return;
    approveModal.classList.add('hidden');
    approveModal.classList.remove('flex');
  };

  window.openRejectModal = function (reportCode, reportTitle) {
    if (!rejectModal) return;
    const targetTitle = document.getElementById('rejectTargetTitle');
    if (targetTitle) targetTitle.textContent = reportCode + ' - ' + reportTitle;
    rejectModal.classList.remove('hidden');
    rejectModal.classList.add('flex');
  };
  window.closeRejectModal = function () {
    if (!rejectModal) return;
    rejectModal.classList.add('hidden');
    rejectModal.classList.remove('flex');
  };

  window.openImageModal = function (src) {
    if (!imageModal) return;
    const modalImg = document.getElementById('modalImagePreview');
    if (modalImg) modalImg.src = src;
    imageModal.classList.remove('hidden');
    imageModal.classList.add('flex');
  };
  window.closeImageModal = function () {
    if (!imageModal) return;
    imageModal.classList.add('hidden');
    imageModal.classList.remove('flex');
  };

  // ============================================================
  // 6. RIWAYAT FILTER PILLS
  // ============================================================
  const filterPills = document.querySelectorAll('.riwayat-filter-pill');
  filterPills.forEach((pill) => {
    pill.addEventListener('click', () => {
      filterPills.forEach((p) => {
        p.classList.remove('bg-[#091441]', 'text-white');
        p.classList.add('bg-slate-100', 'text-slate-600');
      });
      pill.classList.remove('bg-slate-100', 'text-slate-600');
      pill.classList.add('bg-[#091441]', 'text-white');

      const filterVal = pill.getAttribute('data-filter');
      const cards = document.querySelectorAll('.riwayat-card');
      cards.forEach((card) => {
        const cardStatus = card.getAttribute('data-status');
        if (filterVal === 'Semua' || cardStatus === filterVal) {
          card.classList.remove('hidden');
        } else {
          card.classList.add('hidden');
        }
      });
    });
  });

  // ============================================================
  // 7. CHANGE PASSWORD FORM
  // ============================================================
  const changePasswordForm = document.getElementById('changePasswordForm');
  if (changePasswordForm) {
    changePasswordForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const oldPass = document.getElementById('oldPassword')?.value;
      const newPass = document.getElementById('newPassword')?.value;
      const confirmPass = document.getElementById('confirmPassword')?.value;
      const alertBox = document.getElementById('passwordAlert');

      if (!oldPass || !newPass || !confirmPass) {
        alert('Semua kolom kata sandi wajib diisi.');
        return;
      }
      if (newPass !== confirmPass) {
        alert('Konfirmasi kata sandi baru tidak cocok!');
        return;
      }

      if (alertBox) {
        alertBox.textContent = 'Kata sandi berhasil diperbarui dengan aman!';
        alertBox.classList.remove('hidden');
        changePasswordForm.reset();
        setTimeout(() => alertBox.classList.add('hidden'), 4000);
      } else {
        alert('Kata sandi berhasil diperbarui!');
        changePasswordForm.reset();
      }
    });
  }
});
/* ============================================================
 * ADUIN - Verifikator (Vanilla) Module
 * Fetch data dari ../verifikator/data.json & render ke UI
 * ============================================================ */

// ------------------------------------------------------------
// STATE
// ------------------------------------------------------------
let activeReportForAction = null;
let verifikatorData = null;

// ------------------------------------------------------------
// FETCH DATA
// ------------------------------------------------------------
async function loadVerifikatorData() {
  try {
    const res = await fetch('../verifikator/data.json');
    if (!res.ok) throw new Error('Gagal memuat data.json');
    verifikatorData = await res.json();
    return verifikatorData;
  } catch (err) {
    console.error(err);
    showToast('Gagal memuat data verifikator.', 'error');
    return null;
  }
}

// ------------------------------------------------------------
// RENDER DASHBOARD (index.html)
// ------------------------------------------------------------
function renderDashboard(data) {
  if (!data) return;

  // 1. Metric cards
  const setText = (id, val) => {
    const el = document.getElementById(id);
    if (el) el.textContent = val;
  };
  setText('metricMenunggu', data.summary_dashboard.menunggu_verifikasi);
  setText('metricDiproses', data.summary_dashboard.diproses);
  setText('metricSelesai', data.summary_dashboard.selesai);
  setText('metricDitolak', data.summary_dashboard.ditolak);

  // 2. Tabel laporan masuk
  const tbody = document.getElementById('verifikatorTableBody');
  if (!tbody) return;
  tbody.innerHTML = '';

  data.laporan_masuk.forEach((item) => {
    const tr = document.createElement('tr');
    tr.setAttribute('data-row-id', item.id);

    const fotoCell = item.thumb_url
      ? `<button type="button" class="thumb-btn" onclick="openImageModal('${item.foto_url}')">
           <img src="${item.thumb_url}" alt="Bukti" class="thumb-img">
         </button>`
      : `<span class="text-muted">Tanpa foto</span>`;

    const aksiCell = item.status === 'Menunggu Verifikasi'
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
          <div class="cell-avatar">${item.pelapor.inisial}</div>
          <div>
            <span class="cell-name">${item.pelapor.nama}</span>
            <span class="cell-meta">NIM: ${item.pelapor.nim}</span>
          </div>
        </div>
      </td>
      <td>
        <span class="cell-name">${item.lokasi.kode}</span>
        <span class="cell-meta">${item.lokasi.nama}</span>
      </td>
      <td>
        <span class="status-pill">${item.kategori}</span>
        <span class="cell-meta">${item.judul}</span>
      </td>
      <td class="text-center">${fotoCell}</td>
      <td class="text-right">${aksiCell}</td>
    `;
    tbody.appendChild(tr);
  });

  // 3. Search filter
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

// ------------------------------------------------------------
// RENDER STATISTIK (statistik.html)
// ------------------------------------------------------------
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

  // Ranking table
  const tbody = document.getElementById('rankingTableBody');
  if (tbody) {
    tbody.innerHTML = '';
    s.ranking_lokasi.forEach((r) => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td><strong>#${r.peringkat}</strong></td>
        <td>${r.lokasi}</td>
        <td>${r.jumlah} Laporan</td>
      `;
      tbody.appendChild(tr);
    });
  }

  // Charts (Chart.js)
  if (typeof Chart !== 'undefined') {
    // Line chart
    const trenEl = document.getElementById('trenChart');
    if (trenEl) {
      new Chart(trenEl, {
        type: 'line',
        data: {
          labels: s.tren_mingguan.labels,
          datasets: [{
            label: 'Jumlah Laporan',
            data: s.tren_mingguan.data,
            borderColor: '#226cc6',
            backgroundColor: 'rgba(48, 175, 254, 0.15)',
            fill: true,
            tension: 0.4,
            pointBackgroundColor: '#fff',
            pointBorderColor: '#30affe',
            pointBorderWidth: 3,
            pointRadius: 5,
          }],
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

    // Donut chart
    const katEl = document.getElementById('kategoriChart');
    if (katEl) {
      new Chart(katEl, {
        type: 'doughnut',
        data: {
          labels: s.kategori_distribusi.labels,
          datasets: [{
            data: s.kategori_distribusi.data,
            backgroundColor: ['#30affe', '#226cc6', '#f59e0b', '#10b981'],
            borderWidth: 0,
          }],
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
}

// ------------------------------------------------------------
// MODAL HELPERS
// ------------------------------------------------------------
window.openApproveModal = function (reportCode, reportTitle) {
  activeReportForAction = { code: reportCode, title: reportTitle };
  const modal = document.getElementById('approveModal');
  const title = document.getElementById('approveTargetTitle');
  if (title) title.textContent = `${reportCode} - ${reportTitle}`;
  if (modal) modal.classList.remove('hidden');
};

window.closeApproveModal = function () {
  const modal = document.getElementById('approveModal');
  if (modal) modal.classList.add('hidden');
  activeReportForAction = null;
};

window.openRejectModal = function (reportCode, reportTitle) {
  activeReportForAction = { code: reportCode, title: reportTitle };
  const modal = document.getElementById('rejectModal');
  const title = document.getElementById('rejectTargetTitle');
  if (title) title.textContent = `${reportCode} - ${reportTitle}`;
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

// ------------------------------------------------------------
// BIND HANDLERS (dipanggil setelah DOM ready)
// ------------------------------------------------------------
function bindVerifikatorEvents() {
  // Sembunyikan dropdown teknisi kalau pilih UPA PP Pusat
  document.querySelectorAll('input[name="dispositionOption"]').forEach((radio) => {
    radio.addEventListener('change', (e) => {
      const wrap = document.getElementById('technicianPickerWrap');
      if (wrap) wrap.style.display = e.target.value === 'UPA PP Pusat' ? 'none' : 'block';
    });
  });

  // Konfirmasi Approve
  const btnApprove = document.getElementById('btnConfirmApprove');
  if (btnApprove) {
    btnApprove.addEventListener('click', () => {
      const dispositionEl = document.querySelector('input[name="dispositionOption"]:checked');
      const disposition = dispositionEl ? dispositionEl.value : 'Teknisi Jurusan';
      const tech = document.getElementById('assignedTechnician')?.value || 'Pak Joko';
      const code = activeReportForAction?.code;

      if (code) {
        const reports = getStoredReports ? getStoredReports() : [];
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
          if (typeof saveStoredReports === 'function') saveStoredReports(reports);
        }
        // Update baris tabel
        const row = document.querySelector(`tr[data-row-id="${code}"]`);
        if (row) {
          row.style.opacity = '0.55';
          row.querySelector('td:last-child').innerHTML =
            `<span class="status-pill">✓ ${disposition}</span>`;
        }
      }

      showToast(`Laporan diverifikasi → ${disposition}.`, 'success');
      window.closeApproveModal();
    });
  }

  // Konfirmasi Reject
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
        const reports = getStoredReports ? getStoredReports() : [];
        const target = reports.find((r) => r.id === code || r.roomCode === code);
        if (target) {
          target.status = 'Ditolak';
          target.rejectionReason = reason;
          if (typeof saveStoredReports === 'function') saveStoredReports(reports);
        }
        const row = document.querySelector(`tr[data-row-id="${code}"]`);
        if (row) {
          row.style.opacity = '0.55';
          row.querySelector('td:last-child').innerHTML =
            `<span class="status-pill status-pill-danger">✕ Ditolak</span>`;
        }
      }

      showToast('Laporan ditolak dengan catatan resmi.', 'info');
      window.closeRejectModal();
    });
  }
}

// ------------------------------------------------------------
// AUTO-BOOT saat DOM ready
// ------------------------------------------------------------
document.addEventListener('DOMContentLoaded', async () => {
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
 * HALAMAN SHARED: pengaturan.html (semua role)
 * - Render sidebar dinamis sesuai session
 * - Render kartu profil dinamis
 * - Handle form ganti password
 * ============================================================ */

// Konfigurasi menu per role
const ROLE_CONFIG = {
  Pelapor: {
    home: 'pelapor/index.html',
    unit: 'Mahasiswa / Dosen',
    access: 'Pelapor',
    menus: [
      { label: 'Dashboard', href: 'pelapor/index.html' },
      { label: 'Buat Pengaduan', href: 'pelapor/index.html#new' },
      { label: 'Riwayat Saya', href: 'pelapor/index.html#my' },
      { label: 'Pengaturan', href: 'pengaturan.html', active: true },
    ],
  },
  Verifikator: {
    home: 'verifikator/index.html',
    unit: 'Jurusan Teknologi Informasi',
    access: 'Verifikator Utama',
    menus: [
      { label: 'Dashboard', href: 'verifikator/index.html' },
      { label: 'Daftar Laporan', href: 'verifikator/riwayat.html' },
      { label: 'Statistik', href: 'verifikator/statistik.html' },
      { label: 'Pengaturan', href: 'pengaturan.html', active: true },
    ],
  },
  Teknisi: {
    home: 'teknisi/index.html',
    unit: 'Unit Sarpras JTI',
    access: 'Teknisi Lapangan',
    menus: [
      { label: 'Dashboard', href: 'teknisi/index.html' },
      { label: 'Tugas Saya', href: 'teknisi/index.html#tasks' },
      { label: 'Riwayat', href: 'teknisi/index.html#history' },
      { label: 'Pengaturan', href: 'pengaturan.html', active: true },
    ],
  },
};

// Icon SVG per menu (biar konsisten)
const MENU_ICONS = {
  Dashboard: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>',
  'Daftar Laporan': '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>',
  Statistik: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>',
  Pengaturan: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>',
  default: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/></svg>',
};

// Inisialisasi halaman pengaturan
function initPengaturanPage() {
  let session;
  try {
    session = getSession();
  } catch (error) {
    console.error('Sesi akun tidak dapat dibaca:', error);
    window.location.replace('login.html');
    return;
  }

  // Guard: harus login
  if (!session || !session.id) {
    window.location.replace('login.html');
    return;
  }

  const cfg = ROLE_CONFIG[session.role] || ROLE_CONFIG.Pelapor;

  // -------- Render sidebar menu --------
  const nav = document.getElementById('sidebarNav');
  if (nav) {
    nav.innerHTML = cfg.menus.map((m) => `
      <a href="${m.href}" class="nav-link ${m.active ? 'active' : ''}">
        ${MENU_ICONS[m.label] || MENU_ICONS.default}
        <span>${m.label}</span>
      </a>
    `).join('');
  }
  const brand = document.getElementById('sidebarBrand');
  if (brand) brand.href = cfg.home;

  // -------- Render profil sidebar --------
  const setText = (id, val) => {
    const el = document.getElementById(id);
    if (el) el.textContent = val;
  };

  setText('sidebarAvatar', session.avatar || session.nama?.slice(0, 2).toUpperCase() || '?');
  setText('sidebarName', session.nama || '–');
  setText('sidebarRole', session.role || '–');

  // -------- Render kartu profil --------
  setText('profileAvatar', session.avatar || session.nama?.slice(0, 2).toUpperCase() || '?');
  setText('profileName', session.nama || '–');
  setText('profileId', (session.role === 'Pelapor' ? 'NIM: ' : 'NIP: ') + (session.id || '–'));
  setText('profileRoleBadge', session.role || '–');
  setText('profileUnit', cfg.unit);
  setText('profileEmail', session.email || '–');
  setText('profileAccess', cfg.access);

  const editProfileName = document.getElementById('editProfileName');
  if (editProfileName) {
    editProfileName.addEventListener('click', () => {
      const name = window.prompt('Masukkan nama lengkap:', session.nama || session.id);
      if (name === null) return;
      if (!name.trim()) {
        window.alert('Nama tidak boleh kosong.');
        return;
      }

      try {
        const users = getStoredUsers();
        const user = users.find((candidate) => candidate.id === session.id);
        if (!user) {
          window.alert('Akun tidak ditemukan. Silakan login kembali.');
          return;
        }
        session.nama = name.trim();
        user.nama = session.nama;
        saveStoredUsers(users);
        saveSession(session);
        setText('profileName', session.nama);
        setText('sidebarName', session.nama);
        setText('profileAvatar', session.nama.slice(0, 2).toUpperCase());
        setText('sidebarAvatar', session.nama.slice(0, 2).toUpperCase());
      } catch (error) {
        window.alert(`Nama profil tidak dapat disimpan: ${error.message}`);
      }
    });
  }

  const logout = document.getElementById('btnLogout');
  if (logout) {
    logout.addEventListener('click', (event) => {
      event.preventDefault();
      try {
        localStorage.removeItem('aduin_session');
        window.location.href = 'login.html';
      } catch (error) {
        window.alert(`Tidak dapat keluar dari akun: ${error.message}`);
      }
    });
  }

  // -------- Handle form ganti password --------
  const form = document.getElementById('formUbahPassword');
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

    // Cek password lama terhadap user yang sedang login
    try {
      const users = getStoredUsers();
      const user = users.find((u) => u.id === session.id);

      if (!user) {
        showAlert('Akun tidak ditemukan. Silakan login kembali.', false);
        return;
      }
      if (user.password !== oldPass) {
        showAlert('Password lama salah.', false);
        return;
      }

      user.password = newPass;
      saveStoredUsers(users);
      showAlert('Kata sandi berhasil diperbarui dengan aman!', true);
      form.reset();
    } catch (error) {
      showAlert(`Kata sandi tidak dapat disimpan: ${error.message}`, false);
    }
  });
}

// Auto-boot kalau kita ada di pengaturan.html
document.addEventListener('DOMContentLoaded', () => {
  if (document.getElementById('formUbahPassword')) {
    initPengaturanPage();
  }
});