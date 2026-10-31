/* ==========================================================================
   ADUIN - MODUL VERIFIKATOR (Dashboard, Riwayat, Statistik, Kelola Teknisi)
   ========================================================================== */

const DEV_MODE = true; // ubah ke false saat demo/presentasi

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

  let laporan = data.laporan_masuk || [];
  try {
    const stored = localStorage.getItem('aduin_reports');
    if (stored) laporan = JSON.parse(stored);
  } catch (e) { }

  list.innerHTML = '';
  laporan.forEach((item) => list.appendChild(buildRiwayatCard(item)));

  document.querySelectorAll('.filter-pill').forEach((pill) => {
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

  const statusOrder = ['Menunggu Verifikasi', 'Disetujui', 'Dalam Perbaikan', 'Diteruskan ke Pusat', 'Selesai'];
  const currentIndex = statusOrder.indexOf(item.status);
  const isRejected = item.status === 'Ditolak';

  const isPusat = item.status === 'Diteruskan ke Pusat' || item.disposition === 'UPA PP Pusat';

  const pillMap = {
    'Menunggu Verifikasi': 'status-pill-warning',
    'Disetujui': 'status-pill-info',
    'Dalam Perbaikan': 'status-pill-info',
    'Diteruskan ke Pusat': 'status-pill-purple',
    'Selesai': 'status-pill-success',
    'Ditolak': 'status-pill-danger'
  };
  const pillClass = pillMap[item.status] || 'status-pill-neutral';

  const nodes = [
    { label: 'Menunggu Verifikasi', sub: item.tanggal || '-' },
    { label: 'Disetujui', sub: 'Validasi Kajur' },
    { label: isPusat ? 'UPA PP Pusat' : 'Dalam Perbaikan', sub: isPusat ? 'Diserahkan ke Pusat' : (item.teknisi || 'Teknisi') },
    { label: 'Selesai', sub: 'Fasilitas Normal' },
  ];

  const timelineHTML = nodes.map((n, i) => {
    let cls = 'timeline-node';
    let dot = i + 1;

    let adjustedIndex = currentIndex;
    if (item.status === 'Diteruskan ke Pusat') adjustedIndex = 2;

    if (!isRejected) {
      if (i < adjustedIndex) { cls += ' done'; dot = '✓'; }
      else if (i === adjustedIndex) {
        if (item.status === 'Selesai') { cls += ' success'; dot = '✓'; }
        else { cls += ' active'; dot = i === 0 ? '✓' : i === 2 ? '⚙' : i + 1; }
      }
    } else if (i === 0) { cls += ' done'; dot = '✓'; }

    return `<div class="${cls}"><div class="timeline-dot">${dot}</div><span class="timeline-caption">${n.label}</span><span class="timeline-sub">${n.sub}</span></div>`;
  }).join('');

  card.innerHTML = `
    <div class="riwayat-head">
      <div>
        <h3 class="riwayat-title">${item.judul}<span class="riwayat-code">#${item.id}</span></h3>
        <p class="riwayat-meta">${item.lokasi?.nama || '-'} · Pelapor: ${item.pelapor?.nama || '-'} · ${item.tanggal || '-'} · ${item.waktu || '-'}</p>
      </div>
      <div style="display: flex; flex-direction: column; align-items: flex-end; gap: 8px;">
        <span class="status-pill ${pillClass}">${item.status}</span>
      </div>
    </div>

    <div class="timeline-wrap">
      <div class="timeline-label">Progress Tracker Timeline</div>
      <div class="timeline">${timelineHTML}</div>
    </div>
  `;

  card.addEventListener('click', (e) => {
    window.bukaModalDetail(item);
  });

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

  // LOGIKA MENAMPILKAN FOTO
  const fotoContainer = document.getElementById('detailFotoContainer');
  const imgElement = document.getElementById('detailFoto');

  if (item.foto_url && item.foto_url.trim() !== "") {
    // Jika ada URL foto, pasang gambar dan tampilkan container
    imgElement.src = item.foto_url;
    fotoContainer.style.display = 'block';
  } else {
    // Jika tidak ada foto (seperti laporan "Kursi Rusak"), sembunyikan container
    imgElement.src = '';
    foto

    // 4. Tampilkan Modal
    const modal = document.getElementById('modalDetailPengaduan');
    if (modal) {
      modal.classList.remove('hidden');
      modal.classList.add('flex');
      modal.classList.add('active');
    }
  };

  const footer = document.getElementById('detailFooter');
  const btn = document.getElementById('btnSelesaiPusat');
  if (footer && btn) {
    const isPusat = item.status === 'Diteruskan ke Pusat';
    footer.style.display = isPusat ? 'block' : 'none';
    btn.onclick = isPusat ? () => window.tandaiSelesaiPusat(item.id) : null;
  }

  const modal = document.getElementById('modalDetailPengaduan');
  if (modal) {
    modal.classList.remove('hidden');
    modal.classList.add('flex');
    modal.classList.add('active'); // Tambahin active
  }
};

window.tandaiSelesaiPusat = function (id) {
  if (!confirm('Penanganan di UPA PP Pusat sudah selesai? Status akan diubah menjadi Selesai.')) return;

  const reports = getStoredReports();
  const target = reports.find(r => r.id === id);
  if (!target) { showToast('Laporan tidak ditemukan.', 'error'); return; }

  target.status = 'Selesai';
  saveStoredReports(reports);
  showToast('Status laporan diubah menjadi Selesai!', 'success');

  const modal = document.getElementById('modalDetailPengaduan');
  if (modal) {
    modal.classList.add('hidden');
    modal.classList.remove('flex');
    modal.classList.remove('active'); // Tambahin active
  }

  loadVerifikatorData().then(data => {
    if (data) renderRiwayat({ ...data, laporan_masuk: getStoredReports() });
  });
};


window.tandaiSelesaiPusat = function (id) {
  if (!confirm('Penanganan di UPA PP Pusat sudah selesai? Status akan diubah menjadi Selesai.')) return;

  const reports = getStoredReports();
  const target = reports.find(r => r.id === id);
  if (!target) { showToast('Laporan tidak ditemukan.', 'error'); return; }

  target.status = 'Selesai';
  saveStoredReports(reports);
  showToast('Status laporan diubah menjadi Selesai!', 'success');

  const modal = document.getElementById('modalDetailPengaduan');
  if (modal) { modal.classList.add('hidden'); modal.classList.remove('flex'); }

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
   MODUL: KELOLA TEKNISI (verifikator/kelola_teknisi.html)
   ========================================================================== */

let daftarTeknisi = [];

async function loadDataTeknisi() {
  try {
    const res = await fetch('../data.json');
    if (!res.ok) throw new Error('Gagal fetch data.json');
    const json = await res.json();
    daftarTeknisi = json.teknisi || [];
  } catch (err) {
    console.warn('[loadDataTeknisi] gagal:', err);
    daftarTeknisi = [
      { id: 'T001', nama: 'Pak Joko', nip: 'E0010', spesialisasi: 'AC / Pendingin', status: 'Aktif', tugas_berjalan: 2 },
      { id: 'T002', nama: 'Pak Agus', nip: 'E0011', spesialisasi: 'Kelistrikan', status: 'Aktif', tugas_berjalan: 1 },
      { id: 'T003', nama: 'Pak Doni', nip: 'E0012', spesialisasi: 'Furnitur', status: 'Cuti', tugas_berjalan: 0 },
    ];
  }
  renderTabelTeknisi();
}

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

    const statusClass = t.status === 'Aktif'
      ? 'status-pill status-pill-success'
      : t.status === 'Cuti'
        ? 'status-pill status-pill-warning'
        : 'status-pill status-pill-danger';

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

function bukaModalTeknisi(id = null) {
  const modal = document.getElementById('modalTeknisi');
  const title = document.getElementById('modalTeknisiTitle');
  const form = document.getElementById('formTeknisi');
  if (!modal) return;

  form.reset();
  document.getElementById('teknisiId').value = '';

  if (id) {
    const t = daftarTeknisi.find((x) => x.id === id);
    if (!t) return;

    title.textContent = 'Edit Data Teknisi';
    document.getElementById('teknisiId').value = t.id;
    document.getElementById('namaTeknisi').value = t.nama;
    document.getElementById('nipTeknisi').value = t.nip;
    document.getElementById('spesialisasiTeknisi').value = t.spesialisasi;
    document.getElementById('statusTeknisi').value = t.status;
  } else {
    title.textContent = 'Tambah Teknisi Baru';
  }

  modal.classList.remove('hidden');
}

function tutupModalTeknisi() {
  const modal = document.getElementById('modalTeknisi');
  if (modal) modal.classList.add('hidden');
}

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
    const t = daftarTeknisi.find((x) => x.id === id);
    if (t) {
      t.nama = nama;
      t.nip = nip;
      t.spesialisasi = spesialisasi;
      t.status = status;
    }
    showToast('Data teknisi berhasil diperbarui.', 'success');
  } else {
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

function hapusTeknisi(id) {
  const t = daftarTeknisi.find((x) => x.id === id);
  if (!t) return;

  if (!confirm(`Yakin ingin menghapus teknisi "${t.nama}"?`)) return;

  daftarTeknisi = daftarTeknisi.filter((x) => x.id !== id);
  showToast(`Teknisi "${t.nama}" telah dihapus.`, 'info');
  renderTabelTeknisi();
}

/* ==========================================================================
   AUTO INIT (VERIFIKATOR & KELOLA TEKNISI)
   ========================================================================== */
document.addEventListener('DOMContentLoaded', async () => {
  // Init Kelola Teknisi
  if (document.getElementById('tabelTeknisiBody')) {
    loadDataTeknisi();
    return;
  }

  // Init Halaman Verifikator Lainnya
  const isDashboard = document.getElementById('verifikatorTableBody');
  const isRiwayat = document.getElementById('riwayatList');
  const isStatistik = document.getElementById('rankingTableBody');

  if (isDashboard || isRiwayat || isStatistik) {
    const data = await loadVerifikatorData();
    if (!data) return;
    if (isDashboard) renderDashboard(data);
    if (isRiwayat) renderRiwayat(data);
    if (isStatistik) renderStatistik(data);
  }
});