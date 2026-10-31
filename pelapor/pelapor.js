
const HIDDEN_KEY = 'aduin_pelapor_hidden';

function getHiddenIds() {
  try { return JSON.parse(localStorage.getItem(HIDDEN_KEY) || '[]'); }
  catch (e) { return []; }
}

async function loadPelaporData() {
  const res = await fetch('data.json');
  if (!res.ok) throw new Error('Gagal memuat pelapor/data.json');
  const data = await res.json();
  if (!Array.isArray(data.laporan_masuk)) {
    throw new Error('Format laporan_masuk pada pelapor/data.json tidak valid');
  }

  // Buang laporan yang sudah "dibersihkan"
  const hidden = getHiddenIds();
  data.laporan_masuk = data.laporan_masuk.filter(r => !hidden.includes(r.id));
  return data;
}

window.bersihkanRiwayatSaya = async function () {
  if (!confirm('Hapus semua riwayat laporan kamu?')) return;
  const res = await fetch('data.json');
  const data = await res.json();
  const ids = (data.laporan_masuk || []).map(r => r.id);
  localStorage.setItem(HIDDEN_KEY, JSON.stringify(ids));
  location.reload();
};

window.initPelaporPage = function initPelaporPage(initialReports) {
  "use strict";

  const REPORTS_KEY = "aduin.pelapor.reports.v1";
  const PROFILE_KEY = "aduin.pelapor.profile.v1";
  const DEFAULT_PROFILE = { name: "Rachmah Nur Chotimah" };
  let storageReadFailed = false;
  const seedReports = Array.isArray(initialReports) ? initialReports : [];

  const page = document.body;
  const appFeedback = document.createElement("p");
  appFeedback.id = "app-feedback";
  appFeedback.className = "alert-box status-pill-danger hidden";
  appFeedback.setAttribute("role", "alert");
  appFeedback.setAttribute("aria-live", "assertive");
  page.append(appFeedback);

  function showAppError(message) {
    appFeedback.textContent = message;
    appFeedback.classList.remove("hidden");
  }

  function readStorage(key, fallback) {
    try {
      const value = localStorage.getItem(key);
      return value === null ? fallback : JSON.parse(value);
    } catch (error) {
      storageReadFailed = true;
      showAppError(`Data aplikasi tidak dapat dibaca dari penyimpanan browser: ${error.message}`);
      return fallback;
    }
  }

  function writeStorage(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch (error) {
      showAppError(`Perubahan tidak dapat disimpan di browser: ${error.message}`);
      return false;
    }
  }

  function getReports() {
    const storedReports = readStorage(REPORTS_KEY, null);
    if (storedReports === null) {
      if (storageReadFailed) return [];
      if (!writeStorage(REPORTS_KEY, seedReports)) return [];
      return seedReports;
    }
    if (!Array.isArray(storedReports)) {
      showAppError("Data laporan tidak valid. Hapus data situs ADUIN dari penyimpanan browser untuk memulai ulang.");
      return [];
    }
    return storedReports;
  }

  function getProfile() {
    const session = readStorage("aduin_session", null);
    if (session && session.role === "Pelapor" && typeof session.nama === "string" && session.nama.trim()) {
      return { name: session.nama.trim() };
    }
    const profile = readStorage(PROFILE_KEY, DEFAULT_PROFILE);
    if (!profile || typeof profile.name !== "string" || !profile.name.trim()) {
      showAppError("Data profil tidak valid. Ubah profil kembali melalui halaman Pengaturan.");
      return DEFAULT_PROFILE;
    }
    return profile;
  }

  function initialsFor(name) {
    return name.trim().split(/\s+/).slice(0, 2).map((part) => part[0]).join("").toUpperCase();
  }

  function renderProfile() {
    const profile = getProfile();
    document.querySelectorAll("[data-profile-name]").forEach((element) => {
      element.textContent = profile.name;
    });
    document.querySelectorAll("[data-profile-first-name]").forEach((element) => {
      element.textContent = profile.name.trim().split(/\s+/)[0];
    });
    document.querySelectorAll("[data-profile-initials]").forEach((element) => {
      element.textContent = initialsFor(profile.name);
    });
  }

  function reportDate(date) {
    return new Intl.DateTimeFormat("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
    }).format(new Date(date));
  }

  function progressCard(report) {
    const status = report.status;
    const activeIndex = status === "Menunggu Verifikasi" ? 0 : status === "Selesai" ? 3 : 1;
    const returned = status === "Dikembalikan ke Pelapor";
    
    // 1. Ambil tanggal dari field apapun yang tersedia
    // Kalau di JSON namanya 'date', atau 'tanggal', atau 'created_at'
    const rawDate = report.tanggal || report.created_at || report.date || "-";
    
    // 2. Format tanggal biar cantik (kalau formatnya ISO)
    const formatDate = (str) => {
      if (!str || str === "-") return "-";
      // Cek kalau dia string ISO (ada huruf T)
      if (str.includes('T')) {
        return new Intl.DateTimeFormat('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }).format(new Date(str));
      }
      return str; // Kalau udah "05 Okt 2026" ya biarin aja
    };

    const tglDikirim = formatDate(rawDate);

    const steps = [
      { label: "Dikirim", sub: tglDikirim },
      // Paksa munculin tanggal yang sama buat demo biar gak strip
      { label: "Diverifikasi", sub: status !== "Menunggu Verifikasi" ? tglDikirim : "-" },
      { label: returned ? "Dikembalikan" : "Diproses", sub: returned ? "Dikembalikan ke Pelapor" : "Ditangani Teknisi" },
      { label: "Selesai", sub: status === "Selesai" ? tglDikirim : "-" },
    ];

    const container = document.createElement("div");
    container.className = "timeline-wrap";
    const caption = document.createElement("p");
    caption.className = "timeline-label";
    caption.textContent = "PROGRES LAPORAN";
    const timeline = document.createElement("div");
    timeline.className = "timeline";

    steps.forEach((label, index) => {
      const step = document.createElement("div");
      const reached = status === "Selesai" || index < activeIndex;
      const current = index === activeIndex && status !== "Selesai";
      step.className = `timeline-node${status === "Selesai" ? " success" : reached ? " done" : current ? " active" : ""}`;
      
      const marker = document.createElement("div");
      marker.className = "timeline-dot";
      marker.textContent = reached ? "✓" : String(index + 1);
      
      const text = document.createElement("span");
      text.className = "timeline-caption";
      text.textContent = label.label;
      
      const sub = document.createElement("span");
      sub.className = "timeline-sub";
      sub.textContent = label.sub;

      step.append(marker, text, sub);
      timeline.append(step);
    });
    container.append(caption, timeline);
    return container;
  }

  function reportStatusClass(status) {
    if (status === "Diproses") return "status-pill-info";
    if (status === "Selesai") return "status-pill-success";
    if (status === "Dikembalikan ke Pelapor") return "status-pill-danger";
    return "status-pill-warning";
  }

  function createReportCard(report, profileName) {
    const card = document.createElement("article");
    card.className = "glass-card riwayat-card";
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

    if (Array.isArray(report.images) && report.images.length > 0) {
      const photoGrid = document.createElement("div");
      photoGrid.className = "report-photo-grid";
      
    // Tampilkan maksimal 3 foto di preview kartu
      report.images.slice(0, 3).forEach((imgSrc) => {
      const img = document.createElement("img");
      img.src = imgSrc;
      img.className = "thumb-preview";
      photoGrid.append(img);
    });

    // Jika foto lebih dari 3, beri indikator angka tambahan (+2, dsb)
    if (report.images.length > 3) {
      const badgeMore = document.createElement("span");
      badgeMore.className = "more-photos-badge";
      badgeMore.textContent = `+${report.images.length - 3}`;
      photoGrid.append(badgeMore);
    }

    // Buka modal detail saat area foto diklik
      photoGrid.addEventListener("click", () => openDetailModal(report));
      card.append(photoGrid);
  }
    card.append(progressCard(report.status));
    card.append(progressCard(report));
    card.dataset.status = report.status;
    return card;
  }

  function openDetailModal(report) {
  // Ambil elemen modal dari daftar_laporan.html (atau buat elemen modal secara otomatis)
  let modal = document.getElementById("detail-modal");
  
  if (!modal) {
    modal = document.createElement("div");
    modal.id = "detail-modal";
    modal.className = "modal-overlay";
    document.body.append(modal);
  }

  // Render isi modal detail dengan Grid Foto
  modal.innerHTML = `
    <div class="modal-box modal-lg">
      <div class="modal-header">
        <div>
          <h3 class="modal-title">${report.title}</h3>
          <span class="modal-subtitle">${report.roomLabel}</span>
        </div>
        <button type="button" class="modal-close" id="close-modal">&times;</button>
      </div>
      <div class="modal-body">
        <p><strong>Deskripsi:</strong> ${report.description}</p>
        <p><strong>Dokumentasi Foto (${report.images ? report.images.length : 0} foto):</strong></p>
        
        <!-- GRID FOTO UTAMA DI MODAL DETAIL -->
        <div class="modal-photo-grid">
          ${(report.images || []).map((img, idx) => `
            <div class="grid-photo-item">
              <img src="${img}" alt="Dokumentasi ${idx + 1}" onclick="window.open('${img}', '_blank')" />
            </div>
          `).join('')}
        </div>
      </div>
    </div>
  `;

    modal.classList.remove("hidden");

    // Tombol tutup modal
    document.getElementById("close-modal").onclick = () => modal.classList.add("hidden");
}

  function renderReports() {
    const reports = getReports();
    const total = document.getElementById("total-reports");
    const pending = document.getElementById("pending-reports");
    const processing = document.getElementById("processing-reports");
    const completed = document.getElementById("completed-reports");
    if (total) total.textContent = String(reports.length);
    if (pending) pending.textContent = String(reports.filter((report) => report.status === "Menunggu Verifikasi").length);
    if (processing) processing.textContent = String(reports.filter((report) => report.status === "Diproses").length);
    if (completed) completed.textContent = String(reports.filter((report) => report.status === "Selesai").length);

    const dashboardTable = document.getElementById("dashboard-reports");
    if (dashboardTable) {
      const profileName = getProfile().name;
      const latestReports = [...reports]
        .sort((first, second) => new Date(second.date) - new Date(first.date))
        .slice(0, 5);
      dashboardTable.replaceChildren();
      latestReports.forEach((report) => {
        const row = document.createElement("tr");
        const reporterCell = document.createElement("td");
        reporterCell.textContent = profileName;
        const locationCell = document.createElement("td");
        locationCell.textContent = report.roomLabel;
        const categoryCell = document.createElement("td");
        categoryCell.textContent = report.category;
        const statusCell = document.createElement("td");
        const status = document.createElement("span");
        const statusClass = report.status === "Selesai"
          ? "status-pill-success"
          : report.status === "Diproses"
            ? "status-pill-info"
            : report.status === "Dikembalikan ke Pelapor"
              ? "status-pill-danger"
              : "status-pill-warning";
        status.className = `status-pill ${statusClass}`;
        status.textContent = report.status;
        statusCell.append(status);
        row.append(reporterCell, locationCell, categoryCell, statusCell);
        dashboardTable.append(row);
      });
      if (latestReports.length === 0) {
        const row = document.createElement("tr");
        const message = document.createElement("td");
        message.colSpan = 4;
        message.className = "text-muted";
        message.textContent = "Belum ada laporan. Buat laporan pertamamu untuk mulai.";
        row.append(message);
        dashboardTable.append(row);
      }
    }

    const list = document.getElementById("reports-list");
    if (!list) return;
    const selectedFilter = list.dataset.filter || "all";
    const profileName = getProfile().name;
    list.replaceChildren();
    const visibleReports = reports.filter((report) => selectedFilter === "all" || report.status === selectedFilter);
    visibleReports.forEach((report) => list.append(createReportCard(report, profileName)));
    if (visibleReports.length === 0) {
      const emptyState = document.createElement("p");
      emptyState.className = "glass-card text-muted";
      emptyState.textContent = "Belum ada laporan untuk status ini.";
      list.append(emptyState);
    }
  }

  function showFormMessage(element, message, isError) {
    if (!element) return;
    element.textContent = message;
    element.className = `alert-box status-pill ${isError ? "status-pill-danger" : "status-pill-success"}`;
  }

  function initReportForm() {
    const form = document.getElementById("report-form");
    if (!form) return;

    let selectedFiles = [];//Menyimpan file gambar yang dipilih
    
    //Set Tanggal otomatis
    const dateInput = document.getElementById("report-date");
    if (dateInput) {
      dateInput.value = `${new Intl.DateTimeFormat("id-ID", {
        dateStyle: "full",
        timeStyle: "short",
        timeZone: "Asia/Jakarta",
      }).format(new Date())} WIB`;
    }

    // GANTI BAGIAN PENANGANAN FOTO DI pelapor.js DENGAN INI:
    const photoInput = document.getElementById("report-photo");
    const photoFeedback = document.getElementById("photo-feedback");
    const dropzone = document.getElementById("photo-dropzone");
    const previewContainer = document.getElementById("photo-preview-list");
    const maxPhotoSize = 10 * 1024 * 1024;

    // Fungsi untuk memproses file baru yang dipilih
    function setPhotos(fileList) {
      if (!fileList || fileList.length === 0) return;
      const files = Array.from(fileList);
      const validFiles = [];

      for (let file of files) {
        if (!["image/png", "image/jpeg"].includes(file.type)) {
          photoFeedback.textContent = `File "${file.name}" bukan PNG/JPG.`;
          photoFeedback.className = "status-pill status-pill-danger";
          return;
        }
        if (file.size > maxPhotoSize) {
          photoFeedback.textContent = `File "${file.name}" melebihi 10MB.`;
          photoFeedback.className = "status-pill status-pill-danger";
          return;
        }
        validFiles.push(file);
      }

      // Gabungkan foto baru dengan foto yang sudah dipilih sebelumnya
      const totalFiles = [...selectedFiles, ...validFiles];

      if (totalFiles.length > 5) {
        photoFeedback.textContent = "Maksimal hanya 5 foto yang diperbolehkan.";
        photoFeedback.className = "status-pill status-pill-danger";
        selectedFiles = totalFiles.slice(0, 5); // Ambil 5 pertama
      } else {
        selectedFiles = totalFiles;
        photoFeedback.textContent = `${selectedFiles.length} foto berhasil dipilih.`;
        photoFeedback.className = "status-pill status-pill-success";
      }

      renderPreview();
    }

    // Fungsi untuk menampilkan preview gambar
    function renderPreview() {
      if (!previewContainer) return;
      previewContainer.innerHTML = "";

      if (selectedFiles.length === 0) {
        photoFeedback.textContent = "";
        return;
      }

      selectedFiles.forEach((file, index) => {
        const reader = new FileReader();
        reader.onload = (e) => {
          const wrapper = document.createElement("div");
          wrapper.style.position = "relative";
          wrapper.style.display = "inline-block";
          wrapper.style.margin = "5px";

          const img = document.createElement("img");
          img.src = e.target.result;
          img.style.width = "65px";
          img.style.height = "65px";
          img.style.objectFit = "cover";
          img.style.borderRadius = "8px";
          img.style.border = "1px solid var(--line)";

          // Tombol silang (x) hapus per foto
          const removeBtn = document.createElement("button");
          removeBtn.type = "button";
          removeBtn.innerHTML = "x";
          removeBtn.style.position = "absolute";
          removeBtn.style.top = "-6px";
          removeBtn.style.right = "-6px";
          removeBtn.style.background = "var(--red)";
          removeBtn.style.color = "#fff";
          removeBtn.style.border = "none";
          removeBtn.style.borderRadius = "50%";
          removeBtn.style.width = "20px";
          removeBtn.style.height = "20px";
          removeBtn.style.fontSize = "13px";
          removeBtn.style.fontWeight = "bold";
          removeBtn.style.cursor = "pointer";

          removeBtn.onclick = () => {
            selectedFiles.splice(index, 1);
            if (selectedFiles.length > 0) {
              photoFeedback.textContent = `${selectedFiles.length} foto berhasil dipilih.`;
              photoFeedback.className = "status-pill status-pill-success";
            }
            renderPreview();
          };

          wrapper.append(img, removeBtn);
          previewContainer.appendChild(wrapper);
        };
        reader.readAsDataURL(file);
      });
    }

    // Event listener tombol Pilih Foto
    const chooseBtn = document.getElementById("choose-report-photo");
    if (chooseBtn && photoInput) {
      chooseBtn.addEventListener("click", () => {
        photoInput.value = ""; // Reset agar bisa pilih file baru
        photoInput.click();
      });

      photoInput.addEventListener("change", () => {
        setPhotos(photoInput.files);
      });
    }

    // Event listener Dropzone (Drag & Drop)
    if (dropzone) {
      dropzone.addEventListener("dragover", (event) => {
        event.preventDefault();
        dropzone.classList.add("status-badge-success");
      });
      dropzone.addEventListener("dragleave", () => dropzone.classList.remove("status-badge-success"));
      dropzone.addEventListener("drop", (event) => {
        event.preventDefault();
        dropzone.classList.remove("status-badge-success");
        setPhotos(event.dataTransfer.files);
      });
    }
      const description = String(data.get("description")).trim();

    form.addEventListener("submit",async (event) => {
      event.preventDefault();
      const feedback = document.getElementById("report-feedback");
      if (!form.reportValidity()) return;
      
      const data = new FormData(form);
      const room = data.get("room");
      const roomOption = form.elements.room.selectedOptions[0];
      const category = data.get("category");
      const description = String(data.get("description")).trim();

    // Kompres gambar ke Base64 agar ringan disimpan di localStorage
      const readAndCompressAsBase64 = (file) => new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = (e) => {
          const img = new Image();
          img.onload = () => {
            const canvas = document.createElement("canvas");
            const MAX_WIDTH = 800;
            let width = img.width;
            let height = img.height;

            if (width > MAX_WIDTH) {
              height = Math.round((height * MAX_WIDTH) / width);
              width = MAX_WIDTH;
            }

            canvas.width = width;
            canvas.height = height;
            const ctx = canvas.getContext("2d");
            ctx.drawImage(img, 0, 0, width, height);

            resolve(canvas.toDataURL("image/jpeg", 0.7));
          };
          img.src = e.target.result;
        };
        reader.readAsDataURL(file);
      });

      let imagesArray = [];
      if (selectedFiles.length > 0) {
        try {
          imagesArray = await Promise.all(selectedFiles.map(readAndCompressAsBase64));
        } catch (err) {
          showFormMessage(feedback, "Gagal memproses file gambar. Coba lagi.", true);
          return;
        }
      }
      
      // ============================================================
      // SIMULASI SERVER TIMESTAMP
      // ============================================================
      // 1. Ambil waktu saat ini secara paksa (seperti NOW() di database)
      const now = new Date(); 
      
      // 2. Format ISO untuk disimpan sebagai timestamp presisi tinggi
      const serverTimestamp = now.toISOString(); 
      
      // 3. Format tanggal yang enak dibaca (untuk ditampilkan di UI)
      const displayDate = new Intl.DateTimeFormat("id-ID", {
        day: "2-digit", month: "short", year: "numeric",
        hour: "2-digit", minute: "2-digit"
      }).format(now) + " WIB";

      const report = {
        id: `report-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        title: `${category}: ${description.split(/[.!?]/)[0].slice(0, 55) || category}`,
        room,
        roomLabel: roomOption.textContent.trim(),
        category,
        description,
        
        // --- GANTI BAGIAN INI ---
        date: displayDate,             // Tampilan untuk user
        created_at: serverTimestamp,   // Simulasi Timestamp Database (NOW())
        status: "Menunggu Verifikasi",
        images: imagesArray // Simpan array foto di properti 'images' (bukan 'imsages')
      };

      
      if (selectedPhoto) report.photoName = selectedPhoto.name;
      const reports = getReports();
      if (!writeStorage(REPORTS_KEY, [report, ...reports])) {
        showFormMessage(feedback, "Laporan belum tersimpan. Periksa izin penyimpanan browser lalu coba lagi.", true);
        return;
      }
      window.location.href = "daftar_laporan.html";
    });
  }

  function initFilters() {
    const list = document.getElementById("reports-list");
    if (!list) return;
    document.querySelectorAll("[data-report-filter]").forEach((button) => {
      button.addEventListener("click", () => {
        document.querySelectorAll("[data-report-filter]").forEach((filterButton) => {
          filterButton.classList.remove("active");
          filterButton.setAttribute("aria-pressed", "false");
        });
        button.classList.add("active");
        button.setAttribute("aria-pressed", "true");
        list.dataset.filter = button.dataset.reportFilter;
        renderReports();
      });
    });
  }

  function initSettings() {
    const editProfile = document.getElementById("edit-profile");
    if (editProfile) {
      editProfile.addEventListener("click", () => {
        const currentName = getProfile().name;
        const name = window.prompt("Masukkan nama lengkap:", currentName);
        if (name === null) return;
        if (!name.trim()) {
          showAppError("Nama tidak boleh kosong.");
          return;
        }
        if (writeStorage(PROFILE_KEY, { name: name.trim() })) renderProfile();
      });
    }

    const passwordForm = document.getElementById("password-form");
    if (passwordForm) {
      document.querySelectorAll("[data-toggle-password]").forEach((button) => {
        button.addEventListener("click", () => {
          const input = button.parentElement.querySelector("input");
          const reveal = input.type === "password";
          input.type = reveal ? "text" : "password";
          button.setAttribute("aria-label", reveal ? "Sembunyikan kata sandi" : "Tampilkan kata sandi");
          button.textContent = reveal ? "Sembunyikan" : "Lihat";
        });
      });
      passwordForm.addEventListener("submit", (event) => {
        event.preventDefault();
        const currentPassword = document.getElementById("current-password").value;
        const newPassword = document.getElementById("new-password").value;
        const confirmation = document.getElementById("confirm-password").value;
        const feedback = document.getElementById("password-feedback");
        if (!currentPassword || !newPassword || !confirmation) {
          feedback.textContent = "Semua kolom kata sandi wajib diisi.";
          feedback.className = "alert-box status-pill status-pill-danger";
        } else if (newPassword.length < 8) {
          feedback.textContent = "Kata sandi baru minimal 8 karakter.";
          feedback.className = "alert-box status-pill status-pill-danger";
        } else if (newPassword !== confirmation) {
          feedback.textContent = "Konfirmasi kata sandi baru tidak sama.";
          feedback.className = "alert-box status-pill status-pill-danger";
        } else {
          feedback.textContent = "Data sudah valid, tetapi perubahan kata sandi belum dapat disimpan karena layanan akun/backend belum terhubung.";
          feedback.className = "alert-box status-pill status-pill-warning";
        }
        feedback.classList.remove("hidden");
      });
    }

    const photoButton = document.querySelector("[data-profile-photo-button]");
    if (photoButton) {
      const input = document.createElement("input");
      input.type = "file";
      input.accept = "image/png,image/jpeg";
      input.className = "hidden";
      const photoFeedback = document.getElementById("profile-photo-feedback");
      input.addEventListener("change", () => {
        const file = input.files[0];
        if (!file) return;
        if (file.size > 10 * 1024 * 1024 || !["image/png", "image/jpeg"].includes(file.type)) {
          photoFeedback.textContent = "Foto profil harus berupa PNG/JPG dengan ukuran maksimal 10MB.";
          photoFeedback.className = "status-pill status-pill-danger";
          input.value = "";
          return;
        }
        photoFeedback.textContent = `Foto dipilih: ${file.name}. Foto belum disimpan karena layanan profil belum terhubung.`;
        photoFeedback.className = "text-muted";
      });
      photoButton.after(input);
      photoButton.addEventListener("click", () => input.click());
    }
  }

  renderProfile();
  renderReports();
  initReportForm();
  initFilters();
  initSettings();
};
