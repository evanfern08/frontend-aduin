(() => {
  "use strict";

  const STORAGE_KEY = "aduin-reports-v1";
  const technicians = ["Budi Prakroso", "Teknisi 2", "Teknisi 3"];
  const people = {
    pelapor: { name: "Rachmah Nur Chotimah", initials: "RN", title: "Mahasiswa", id: "NIM 254107060052" },
    verifikator: { name: "Mungki Astiningrum, S.T., M.Kom.", initials: "MA", title: "Verifikator", id: "NIP 197710302005012001" },
    eksekutor: { name: "Koordinator Fasilitas", initials: "KF", title: "Eksekutor", id: "Koordinator pemeliharaan" },
    teknisi: { name: "Budi Prakroso", initials: "BP", title: "Teknisi", id: "ID E0009" }
  };
  const navigation = {
    pelapor: [["dash", "▦", "Dashboard"], ["new", "＋", "Buat Laporan"], ["reports", "☰", "Riwayat"], ["settings", "⚙", "Pengaturan"]],
    verifikator: [["dash", "▦", "Dashboard"], ["review", "✓", "Verifikasi"], ["history", "☰", "Riwayat Laporan"], ["stats", "▤", "Statistik"], ["settings", "⚙", "Pengaturan"]],
    eksekutor: [["dash", "▦", "Dashboard"], ["assign", "↗", "Penugasan"], ["history", "☰", "Riwayat"], ["settings", "⚙", "Pengaturan"]],
    teknisi: [["dash", "▦", "Dashboard"], ["tasks", "⚒", "Daftar Tugas"], ["history", "☰", "Riwayat"], ["settings", "⚙", "Pengaturan"]]
  };
  const pageTitles = {
    dash: "Dashboard", new: "Buat Laporan", reports: "Riwayat Laporan",
    review: "Verifikasi Laporan", assign: "Penugasan Teknisi",
    tasks: "Daftar Tugas", history: "Riwayat", stats: "Statistik", settings: "Pengaturan"
  };
  const initialReports = [
    { id: "AD-1001", title: "Proyektor Rusak", location: "LPR 1_7B", category: "Proyektor", description: "Proyektor tidak menyala saat digunakan untuk perkuliahan.", reporter: "Rachmah Nur Chotimah", createdAt: "12 September 2026", status: "Menunggu Verifikasi", assignedTo: "", completionNote: "", evidence: [] },
    { id: "AD-1002", title: "AC Tidak Dingin", location: "RT05_5B", category: "AC / Pendingin", description: "AC menyala tetapi tidak mengeluarkan udara dingin.", reporter: "Alfatitah Alifia Putri", createdAt: "15 September 2026", status: "Menunggu Verifikasi", assignedTo: "", completionNote: "", evidence: [] },
    { id: "AD-1003", title: "Lampu Tidak Menyala", location: "LERP_7T", category: "Kelistrikan", description: "Lampu di sisi belakang ruangan tidak menyala.", reporter: "Evan Fernanda Adiwiyata", createdAt: "16 September 2026", status: "Disetujui", assignedTo: "", completionNote: "", evidence: [] },
    { id: "AD-1004", title: "Kursi Rusak", location: "R.05.01 - Ruang Kelas Teori 1", category: "Fasilitas Meja/Kursi", description: "Salah satu kaki kursi longgar dan perlu diperbaiki.", reporter: "Rachmah Nur Chotimah", createdAt: "17 September 2026", status: "Ditugaskan", assignedTo: "Budi Prakroso", completionNote: "", evidence: [] },
    { id: "AD-1005", title: "Pintu Ruang Kelas Macet", location: "R.06.04 - Ruang Dosen 4", category: "Pintu / Jendela", description: "Pintu sulit dibuka dan ditutup.", reporter: "Septya Andhita Pradhana", createdAt: "18 September 2026", status: "Dalam Perbaikan", assignedTo: "Budi Prakroso", completionNote: "", evidence: [] },
    { id: "AD-1006", title: "Stop Kontak Rusak", location: "LKJ2_7T - Lab Sistem Komputer", category: "Kelistrikan", description: "Stop kontak di dekat meja pengajar tidak berfungsi.", reporter: "Muhammad Bakhtiar Muqribillah", createdAt: "10 September 2026", status: "Selesai", assignedTo: "Budi Prakroso", completionNote: "Stop kontak diganti dan kabel dirapikan.", evidence: ["Sebelum: stop-kontak-rusak.jpg", "Sesudah: stop-kontak-baru.jpg"] },
    { id: "AD-1007", title: "Papan Tulis Retak", location: "RT06_2A", category: "Fasilitas Ruangan", description: "Permukaan papan tulis retak di bagian kanan.", reporter: "Alfatitah Alifia Putri", createdAt: "8 September 2026", status: "Ditolak", assignedTo: "", completionNote: "", evidence: [] }
  ];
  const app = document.querySelector("#app");
  const role = app?.dataset.role;
  if (!app || !people[role]) return;

  let page = "dash";
  let reports = readReports();

  function readReports() {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (!stored) return structuredClone(initialReports);
      const parsed = JSON.parse(stored);
      if (Array.isArray(parsed) && parsed.every(item => item && typeof item.id === "string" && typeof item.status === "string")) return parsed;
      console.error("Data ADUIN di browser memiliki format yang tidak sesuai; data contoh digunakan.");
    } catch (error) {
      console.error("Data ADUIN tidak dapat dibaca dari penyimpanan browser.", error);
    }
    return structuredClone(initialReports);
  }

  function persist() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(reports));
    } catch (error) {
      console.error("Perubahan ADUIN tidak dapat disimpan di browser.", error);
      toast("Perubahan tidak tersimpan. Periksa ruang penyimpanan browser.");
    }
  }

  function escapeHTML(value) {
    return String(value ?? "").replace(/[&<>"']/g, char => ({
      "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
    })[char]);
  }

  function classForStatus(status) {
    return ({
      "Menunggu Verifikasi": "pending",
      "Disetujui": "approved",
      "Ditugaskan": "assigned",
      "Dalam Perbaikan": "progress",
      "Selesai": "done",
      "Ditolak": "rejected"
    })[status] || "pending";
  }

  function badge(status) {
    return `<span class="status ${classForStatus(status)}">${escapeHTML(status)}</span>`;
  }

  function reportCard(report, actions = "") {
    return `<article class="report-card">
      <div class="report-top"><div><h3>${escapeHTML(report.title)}</h3>
        <div class="report-meta"><span>${escapeHTML(report.id)}</span><span>${escapeHTML(report.location)}</span><span>${escapeHTML(report.category)}</span></div>
        <div class="report-meta"><span>Pelapor: ${escapeHTML(report.reporter)}</span><span>${escapeHTML(report.createdAt)}</span></div>
      </div>${badge(report.status)}</div>
      <p class="report-description">${escapeHTML(report.description)}</p>
      ${report.assignedTo ? `<div class="report-meta">Teknisi: ${escapeHTML(report.assignedTo)}</div>` : ""}
      ${report.completionNote ? `<p class="report-description"><strong>Catatan perbaikan:</strong> ${escapeHTML(report.completionNote)}</p>` : ""}
      ${report.evidence?.length ? `<div class="report-meta">${report.evidence.map(item => `<span>${escapeHTML(item)}</span>`).join("")}</div>` : ""}
      ${actions ? `<div class="report-footer">${actions}</div>` : ""}
    </article>`;
  }

  function reportList(items, emptyMessage) {
    return items.length ? `<div class="report-list">${items.map(report => reportCard(report)).join("")}</div>` : `<div class="empty-state">${escapeHTML(emptyMessage)}</div>`;
  }

  function heading(title, description) {
    return `<div class="page-heading"><h2>${title}</h2><p>${description}</p></div>`;
  }

  function statCards(items) {
    return `<div class="stats-grid">${items.map(([label, count]) => `<div class="stat-card"><span>${label}</span><strong>${count}</strong></div>`).join("")}</div>`;
  }

  function counts() {
    const mine = reports.filter(report => report.reporter === people.pelapor.name);
    const list = role === "pelapor" ? mine : reports;
    return {
      total: list.length,
      pending: list.filter(report => report.status === "Menunggu Verifikasi").length,
      approved: list.filter(report => report.status === "Disetujui").length,
      assigned: list.filter(report => report.status === "Ditugaskan" || report.status === "Dalam Perbaikan").length,
      done: list.filter(report => report.status === "Selesai").length
    };
  }

  function dashboard() {
    const c = counts();
    if (role === "pelapor") {
      const mine = reports.filter(report => report.reporter === people.pelapor.name);
      return `${heading("Selamat datang, Rachmah", "Buat laporan kerusakan fasilitas dan pantau perkembangannya di sini.")}
        ${statCards([["Total laporan", mine.length], ["Menunggu verifikasi", mine.filter(r => r.status === "Menunggu Verifikasi").length], ["Dalam penanganan", mine.filter(r => ["Disetujui", "Ditugaskan", "Dalam Perbaikan"].includes(r.status)).length], ["Selesai", mine.filter(r => r.status === "Selesai").length]])}
        <section class="section-card"><div class="section-head"><div><h3>Laporan terbaru</h3><p>Perkembangan laporan yang kamu kirim.</p></div><button class="button" data-page="new">+ Buat laporan</button></div>
        ${reportList(mine.slice(0, 3), "Belum ada laporan. Gunakan tombol Buat laporan untuk memulai.")}</section>`;
    }
    if (role === "verifikator") {
      const pending = reports.filter(report => report.status === "Menunggu Verifikasi");
      return `${heading("Ringkasan verifikasi", "Periksa laporan masuk sebelum diteruskan ke proses penugasan.")}
        ${statCards([["Total laporan", c.total], ["Menunggu verifikasi", c.pending], ["Disetujui", c.approved], ["Selesai", c.done]])}
        <section class="section-card"><div class="section-head"><div><h3>Perlu diperiksa</h3><p>${pending.length} laporan menunggu keputusan.</p></div><button class="button secondary" data-page="review">Buka antrean</button></div>
        ${reportList(pending.slice(0, 3), "Tidak ada laporan yang menunggu verifikasi.")}</section>`;
    }
    if (role === "eksekutor") {
      const queue = reports.filter(report => report.status === "Disetujui");
      return `${heading("Ringkasan penugasan", "Teruskan laporan yang disetujui dan pantau pekerjaan teknisi.")}
        ${statCards([["Siap ditugaskan", queue.length], ["Sedang ditangani", reports.filter(r => ["Ditugaskan", "Dalam Perbaikan"].includes(r.status)).length], ["Selesai", c.done], ["Total laporan", c.total]])}
        <section class="section-card"><div class="section-head"><div><h3>Laporan siap ditugaskan</h3><p>Pilih teknisi pada halaman Penugasan.</p></div><button class="button secondary" data-page="assign">Buka penugasan</button></div>
        ${reportList(queue.slice(0, 3), "Belum ada laporan yang siap ditugaskan.")}</section>`;
    }
    const tasks = reports.filter(report => report.assignedTo === people.teknisi.name && ["Ditugaskan", "Dalam Perbaikan"].includes(report.status));
    return `${heading("Selamat bekerja, Budi", "Lihat tugas yang dialokasikan dan perbarui hasil perbaikannya.")}
      ${statCards([["Tugas aktif", tasks.length], ["Tugas baru", tasks.filter(r => r.status === "Ditugaskan").length], ["Dalam perbaikan", tasks.filter(r => r.status === "Dalam Perbaikan").length], ["Selesai", reports.filter(r => r.assignedTo === people.teknisi.name && r.status === "Selesai").length]])}
      <section class="section-card"><div class="section-head"><div><h3>Tugas aktif</h3><p>Perbarui status ketika pekerjaan dimulai atau selesai.</p></div><button class="button secondary" data-page="tasks">Lihat semua tugas</button></div>
      ${renderTaskList(tasks.slice(0, 3))}</section>`;
  }

  function newReportPage() {
    return `${heading("Buat laporan kerusakan", "Lengkapi detail fasilitas agar tim dapat menindaklanjuti laporanmu.")}
      <div class="notice">Data ini merupakan prototype dan disimpan di browser yang sedang digunakan.</div>
      <section class="section-card"><form id="new-report-form" class="form-grid">
        <div class="field"><label for="location">Ruangan</label><input class="input" id="location" name="location" required maxlength="80" placeholder="Contoh: LPR 1_7B"></div>
        <div class="field"><label for="category">Kategori</label><select class="select" id="category" name="category" required><option value="">Pilih kategori</option><option>AC / Pendingin</option><option>Proyektor</option><option>Fasilitas Meja/Kursi</option><option>Kelistrikan</option><option>Pintu / Jendela</option><option>Fasilitas Ruangan</option><option>Lainnya</option></select></div>
        <div class="field full"><label for="title">Nama kerusakan</label><input class="input" id="title" name="title" required maxlength="100" placeholder="Contoh: AC tidak dingin"></div>
        <div class="field full"><label for="description">Deskripsi</label><textarea class="textarea" id="description" name="description" required maxlength="1000" placeholder="Jelaskan kerusakan, lokasi spesifik, dan informasi penting lainnya."></textarea></div>
        <div class="field full"><label for="photo">Foto kerusakan (opsional)</label><input class="input" id="photo" name="photo" type="file" accept="image/png,image/jpeg"><span class="help-text">Format PNG/JPG, maksimal 10 MB. Prototype ini hanya mencatat nama file, tidak mengunggahnya ke server.</span></div>
        <div class="field full"><button class="button" type="submit">Kirim laporan</button></div>
      </form></section>`;
  }

  function reviewPage() {
    const pending = reports.filter(report => report.status === "Menunggu Verifikasi");
    return `${heading("Verifikasi laporan", "Pastikan informasi laporan cukup jelas sebelum menyetujui atau menolaknya.")}
      ${pending.length ? `<div class="report-list">${pending.map(report => reportCard(report, `<div class="button-row"><button class="button success" data-action="approve" data-id="${escapeHTML(report.id)}">Setujui laporan</button><button class="button danger" data-action="reject" data-id="${escapeHTML(report.id)}">Tolak laporan</button></div>`)).join("")}</div>` : `<div class="empty-state">Semua laporan sudah diperiksa.</div>`}`;
  }

  function assignmentPage() {
    const assignable = reports.filter(report => ["Disetujui", "Ditugaskan", "Dalam Perbaikan"].includes(report.status));
    const rows = assignable.map(report => `<tr>
      <td><strong>${escapeHTML(report.title)}</strong><div class="report-meta">${escapeHTML(report.id)} · ${escapeHTML(report.location)}</div></td>
      <td>${badge(report.status)}</td><td>${escapeHTML(report.assignedTo || "Belum ditugaskan")}</td>
      <td><div class="button-row"><select class="select" aria-label="Pilih teknisi untuk ${escapeHTML(report.title)}" data-tech-select="${escapeHTML(report.id)}">
        <option value="">Pilih teknisi</option>${technicians.map(name => `<option value="${escapeHTML(name)}" ${report.assignedTo === name ? "selected" : ""}>${escapeHTML(name)}</option>`).join("")}
      </select><button class="button" data-action="assign" data-id="${escapeHTML(report.id)}">Tugaskan</button></div></td>
    </tr>`).join("");
    return `${heading("Penugasan teknisi", "Tugaskan laporan yang disetujui kepada teknisi dan pantau progresnya.")}
      <div class="notice">Laporan hanya dapat ditugaskan setelah disetujui oleh verifikator. Penugasan akan muncul pada dashboard teknisi.</div>
      <section class="section-card"><div class="table-wrap"><table class="table"><thead><tr><th>Laporan</th><th>Status</th><th>Teknisi</th><th>Aksi</th></tr></thead>
      <tbody>${rows || `<tr><td colspan="4"><div class="empty-state">Belum ada laporan yang disetujui untuk ditugaskan.</div></td></tr>`}</tbody></table></div></section>`;
  }

  function completionForm(report) {
    return `<form class="completion-form form-grid" data-complete-form="${escapeHTML(report.id)}">
      <div class="field full"><label for="note-${escapeHTML(report.id)}">Catatan perbaikan</label><textarea class="textarea" id="note-${escapeHTML(report.id)}" name="note" required maxlength="500" placeholder="Jelaskan tindakan perbaikan yang dilakukan."></textarea></div>
      <div class="field"><label for="before-${escapeHTML(report.id)}">Foto sebelum (opsional)</label><input class="input" id="before-${escapeHTML(report.id)}" name="before" type="file" accept="image/png,image/jpeg"></div>
      <div class="field"><label for="after-${escapeHTML(report.id)}">Foto sesudah (opsional)</label><input class="input" id="after-${escapeHTML(report.id)}" name="after" type="file" accept="image/png,image/jpeg"></div>
      <div class="field full"><span class="help-text">File bukti hanya dicatat namanya pada prototype ini dan tidak diunggah ke server.</span><button class="button success" type="submit">Simpan hasil dan tandai selesai</button></div>
    </form>`;
  }

  function renderTaskList(tasks) {
    if (!tasks.length) return `<div class="empty-state">Tidak ada tugas aktif yang ditugaskan kepadamu.</div>`;
    return `<div class="report-list">${tasks.map(report => {
      const action = report.status === "Ditugaskan"
        ? `<button class="button" data-action="start" data-id="${escapeHTML(report.id)}">Mulai perbaikan</button>`
        : completionForm(report);
      return reportCard(report, action);
    }).join("")}</div>`;
  }

  function taskPage() {
    const tasks = reports.filter(report => report.assignedTo === people.teknisi.name && ["Ditugaskan", "Dalam Perbaikan"].includes(report.status));
    return `${heading("Tugas perbaikan", "Mulai pekerjaan dan simpan catatan setelah fasilitas berhasil diperbaiki.")}
      ${renderTaskList(tasks)}`;
  }

  function statsPage() {
    const statuses = ["Menunggu Verifikasi", "Disetujui", "Ditugaskan", "Dalam Perbaikan", "Selesai", "Ditolak"];
    const byCategory = new Map();
    const byLocation = new Map();
    reports.forEach(report => {
      byCategory.set(report.category, (byCategory.get(report.category) || 0) + 1);
      byLocation.set(report.location, (byLocation.get(report.location) || 0) + 1);
    });
    return `${heading("Statistik laporan", "Ringkasan status, kategori, dan lokasi laporan fasilitas.")}
      ${statCards(statuses.map(status => [status, reports.filter(report => report.status === status).length]))}
      <div class="form-grid">
        <section class="section-card"><div class="section-head"><div><h3>Laporan berdasarkan kategori</h3><p>Jumlah laporan pada setiap kategori.</p></div></div>
          <div class="table-wrap"><table class="table"><thead><tr><th>Kategori</th><th>Jumlah</th></tr></thead><tbody>
          ${[...byCategory.entries()].sort((a, b) => b[1] - a[1]).map(([category, total]) => `<tr><td>${escapeHTML(category)}</td><td>${total}</td></tr>`).join("")}
          </tbody></table></div></section>
        <section class="section-card"><div class="section-head"><div><h3>Laporan berdasarkan lokasi</h3><p>Lokasi dengan laporan terbanyak.</p></div></div>
          <div class="table-wrap"><table class="table"><thead><tr><th>Lokasi</th><th>Jumlah</th></tr></thead><tbody>
          ${[...byLocation.entries()].sort((a, b) => b[1] - a[1]).map(([location, total]) => `<tr><td>${escapeHTML(location)}</td><td>${total}</td></tr>`).join("")}
          </tbody></table></div></section>
      </div>`;
  }

  function historyPage() {
    let items = reports;
    if (role === "pelapor") items = reports.filter(report => report.reporter === people.pelapor.name);
    if (role === "teknisi") items = reports.filter(report => report.assignedTo === people.teknisi.name);
    const description = role === "pelapor" ? "Semua laporan yang kamu kirim dan status terbarunya."
      : role === "verifikator" ? "Status seluruh laporan yang sudah masuk."
      : role === "eksekutor" ? "Pantau laporan yang telah ditugaskan dan hasil penanganannya."
      : "Tugas yang pernah dialokasikan kepadamu beserta catatan penyelesaiannya.";
    return `${heading(role === "teknisi" ? "Riwayat perbaikan" : "Riwayat laporan", description)}
      ${reportList(items.slice().reverse(), "Belum ada riwayat laporan.")}`;
  }

  function settingsPage() {
    const person = people[role];
    return `${heading("Profil dan pengaturan", "Informasi akun yang sedang digunakan pada prototype.")}
      <section class="section-card profile-card"><div class="avatar">${person.initials}</div><div><h3>${escapeHTML(person.name)}</h3><p>${escapeHTML(person.id)} · ${escapeHTML(person.title)}</p></div></section>
      <div class="notice">Versi ini belum terhubung ke layanan akun. Pengelolaan password dan data pengguna perlu diintegrasikan dengan backend.</div>`;
  }

  function content() {
    if (page === "new" && role === "pelapor") return newReportPage();
    if (page === "review" && role === "verifikator") return reviewPage();
    if (page === "assign" && role === "eksekutor") return assignmentPage();
    if (page === "tasks" && role === "teknisi") return taskPage();
    if (page === "stats" && role === "verifikator") return statsPage();
    if (page === "history" || page === "reports") return historyPage();
    if (page === "settings") return settingsPage();
    return dashboard();
  }

  function render() {
    const person = people[role];
    const title = pageTitles[page] || "Dashboard";
    app.innerHTML = `<div class="app">
      <aside class="sidebar"><a class="brand" href="../index.html"><span class="brand-mark">A</span><span><strong>ADUIN</strong><small>Facility Reporting</small></span></a>
        <div class="nav-label">Menu utama</div><nav class="nav-list" aria-label="Navigasi utama">
        ${navigation[role].map(([id, icon, label]) => `<button class="nav-link ${page === id || (id === "history" && page === "reports") ? "active" : ""}" data-page="${id}"><span class="nav-icon" aria-hidden="true">${icon}</span><span>${label}</span></button>`).join("")}
        </nav><div class="sidebar-footer"><div class="user-block"><div class="avatar">${person.initials}</div><div class="user-meta"><strong>${escapeHTML(person.name)}</strong><small>${escapeHTML(person.title)}</small></div></div><a class="role-switch" href="../index.html">← Ganti peran</a></div>
      </aside><main class="workspace"><header class="topbar"><div><small>ADUIN · ${escapeHTML(person.title)}</small><h1>${title}</h1></div><span class="top-role">${escapeHTML(person.title)}</span></header>
        <div class="content">${content()}</div></main>
      </div><div id="toast-region" aria-live="polite"></div>`;
  }

  function toast(message) {
    const region = document.querySelector("#toast-region");
    if (!region) return;
    region.innerHTML = `<div class="toast" role="status">${escapeHTML(message)}</div>`;
    window.setTimeout(() => region.replaceChildren(), 3200);
  }

  function updateReport(id, changes) {
    const report = reports.find(item => item.id === id);
    if (!report) {
      toast("Laporan tidak ditemukan.");
      return false;
    }
    Object.assign(report, changes);
    persist();
    return true;
  }

  app.addEventListener("click", event => {
    const pageButton = event.target.closest("[data-page]");
    if (pageButton) {
      page = pageButton.dataset.page;
      render();
      return;
    }
    const actionButton = event.target.closest("[data-action]");
    if (!actionButton) return;
    const { action, id } = actionButton.dataset;
    if (action === "approve" || action === "reject") {
      const status = action === "approve" ? "Disetujui" : "Ditolak";
      if (updateReport(id, { status })) {
        toast(`Laporan ${status.toLowerCase()}.`);
        render();
      }
      return;
    }
    if (action === "assign") {
      const select = app.querySelector(`[data-tech-select="${CSS.escape(id)}"]`);
      if (!select?.value) {
        toast("Pilih teknisi terlebih dahulu.");
        return;
      }
      const report = reports.find(item => item.id === id);
      if (!report || !["Disetujui", "Ditugaskan", "Dalam Perbaikan"].includes(report.status)) {
        toast("Laporan belum disetujui dan tidak dapat ditugaskan.");
        return;
      }
      if (updateReport(id, { status: "Ditugaskan", assignedTo: select.value })) {
        toast("Laporan berhasil ditugaskan.");
        render();
      }
      return;
    }
    if (action === "start" && updateReport(id, { status: "Dalam Perbaikan" })) {
      toast("Status tugas diperbarui: dalam perbaikan.");
      render();
    }
  });

  app.addEventListener("submit", event => {
    const form = event.target;
    if (!(form instanceof HTMLFormElement)) return;
    event.preventDefault();
    if (form.id === "new-report-form") {
      const data = new FormData(form);
      const photo = data.get("photo");
      if (photo instanceof File && photo.size > 0 && (!["image/png", "image/jpeg"].includes(photo.type) || photo.size > 10 * 1024 * 1024)) {
        toast("Foto harus PNG/JPG dan berukuran maksimal 10 MB.");
        return;
      }
      const title = String(data.get("title") || "").trim();
      const description = String(data.get("description") || "").trim();
      const location = String(data.get("location") || "").trim();
      if (!title || !description || !location) {
        toast("Lengkapi semua informasi laporan.");
        return;
      }
      const id = `AD-${String(Date.now()).slice(-6)}`;
      reports.unshift({
        id, title, location, category: String(data.get("category") || ""),
        description, reporter: people.pelapor.name,
        createdAt: new Date().toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" }),
        status: "Menunggu Verifikasi", assignedTo: "", completionNote: "",
        evidence: photo instanceof File && photo.size ? [`Foto: ${photo.name}`] : []
      });
      persist();
      page = "reports";
      render();
      toast("Laporan berhasil dibuat.");
      return;
    }
    const reportId = form.dataset.completeForm;
    if (reportId) {
      const data = new FormData(form);
      const note = String(data.get("note") || "").trim();
      const evidence = [];
      for (const fieldName of ["before", "after"]) {
        const file = data.get(fieldName);
        if (file instanceof File && file.size > 0) {
          if (!["image/png", "image/jpeg"].includes(file.type) || file.size > 10 * 1024 * 1024) {
            toast("Foto bukti harus PNG/JPG dan berukuran maksimal 10 MB.");
            return;
          }
          evidence.push(`${fieldName === "before" ? "Sebelum" : "Sesudah"}: ${file.name}`);
        }
      }
      if (!note) {
        toast("Isi catatan perbaikan terlebih dahulu.");
        return;
      }
      if (updateReport(reportId, { status: "Selesai", completionNote: note, evidence })) {
        toast("Perbaikan dicatat sebagai selesai.");
        render();
      }
    }
  });

  render();
})();
