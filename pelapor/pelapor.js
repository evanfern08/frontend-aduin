(() => {
  "use strict";

  const REPORTS_KEY = "aduin.pelapor.reports.v1";
  const PROFILE_KEY = "aduin.pelapor.profile.v1";
  const DEFAULT_PROFILE = { name: "Rachmah Nur Chotimah" };
  let storageReadFailed = false;
  const INITIAL_REPORTS = [
    {
      id: "sample-projector",
      title: "Proyektor Rusak",
      room: "LPR 1_7B",
      roomLabel: "LPR 1_7B (Lantai 1 - Lab Pemrograman 1)",
      category: "Proyektor",
      description: "Proyektor tidak dapat menampilkan gambar dengan jelas.",
      date: "2026-09-12T08:00:00.000Z",
      status: "Diproses",
    },
    {
      id: "sample-ac",
      title: "AC Tidak Dingin",
      room: "RT05_5B",
      roomLabel: "RT05_5B (Lantai 1 - Ruang Teori 05)",
      category: "AC / Pendingin",
      description: "AC tidak terasa dingin meskipun sudah dinyalakan.",
      date: "2026-09-15T08:00:00.000Z",
      status: "Menunggu Verifikasi",
    },
    {
      id: "sample-lamp",
      title: "Lampu Tidak Menyala",
      room: "LERP_7T",
      roomLabel: "LERP_7T (Lantai 7 - Lab ERP)",
      category: "Kelistrikan / Lampu",
      description: "Lampu di ruangan tidak menyala.",
      date: "2026-09-05T08:00:00.000Z",
      status: "Selesai",
    },
    {
      id: "sample-door",
      title: "Pintu Ruang Kelas Rusak",
      room: "LIG 1_7T",
      roomLabel: "LIG 1_7T (Lantai 7 - Lab Visi Komputer)",
      category: "Fasilitas Meja/Kursi",
      description: "Pintu ruang kelas sulit dibuka dan ditutup.",
      date: "2026-08-28T08:00:00.000Z",
      status: "Dikembalikan ke Pelapor",
    },
  ];

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
      if (!writeStorage(REPORTS_KEY, INITIAL_REPORTS)) return [];
      return INITIAL_REPORTS;
    }
    if (!Array.isArray(storedReports)) {
      showAppError("Data laporan tidak valid. Hapus data situs ADUIN dari penyimpanan browser untuk memulai ulang.");
      return [];
    }
    return storedReports;
  }

  function getProfile() {
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

  function progressCard(status) {
    const activeIndex = status === "Menunggu Verifikasi" ? 0 : status === "Selesai" ? 2 : 1;
    const returned = status === "Dikembalikan ke Pelapor";
    const steps = [
      { label: "Dikirim", state: "Menunggu verifikasi" },
      { label: returned ? "Dikembalikan" : "Diproses", state: returned ? "Dikembalikan ke Pelapor" : "Diproses" },
      { label: "Selesai", state: "Selesai" },
    ];
    const container = document.createElement("div");
    container.className = "timeline-wrap";
    const caption = document.createElement("p");
    caption.className = "timeline-label";
    caption.textContent = "Progres laporan";
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
      step.append(marker, text);
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
    if (report.photoName) {
      const photo = document.createElement("p");
      photo.className = "text-muted";
      photo.textContent = `Foto dipilih: ${report.photoName} (belum diunggah ke server)`;
      card.append(photo);
    }
    card.append(progressCard(report.status));
    card.dataset.status = report.status;
    return card;
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

    const dateInput = document.getElementById("report-date");
    if (dateInput) {
      dateInput.value = `${new Intl.DateTimeFormat("id-ID", {
        dateStyle: "full",
        timeStyle: "short",
        timeZone: "Asia/Jakarta",
      }).format(new Date())} WIB`;
    }

    const photoInput = document.getElementById("report-photo");
    const photoFeedback = document.getElementById("photo-feedback");
    const dropzone = document.getElementById("photo-dropzone");
    const maxPhotoSize = 10 * 1024 * 1024;
    let selectedPhoto = null;

    function setPhoto(file) {
      if (!file) return;
      if (!["image/png", "image/jpeg"].includes(file.type)) {
        selectedPhoto = null;
        photoInput.value = "";
        photoFeedback.textContent = "Pilih foto dalam format PNG atau JPG.";
        photoFeedback.className = "status-pill status-pill-danger";
        return;
      }
      if (file.size > maxPhotoSize) {
        selectedPhoto = null;
        photoInput.value = "";
        photoFeedback.textContent = "Ukuran foto melebihi batas 10MB.";
        photoFeedback.className = "status-pill status-pill-danger";
        return;
      }
      selectedPhoto = file;
      photoFeedback.textContent = `Foto dipilih: ${file.name}`;
      photoFeedback.className = "status-pill status-pill-success";
    }

    document.getElementById("choose-report-photo").addEventListener("click", () => photoInput.click());
    photoInput.addEventListener("change", () => setPhoto(photoInput.files[0]));
    dropzone.addEventListener("dragover", (event) => {
      event.preventDefault();
      dropzone.classList.add("status-badge-success");
    });
    dropzone.addEventListener("dragleave", () => dropzone.classList.remove("status-badge-success"));
    dropzone.addEventListener("drop", (event) => {
      event.preventDefault();
      dropzone.classList.remove("status-badge-success");
      setPhoto(event.dataTransfer.files[0]);
    });

    form.addEventListener("submit", (event) => {
      event.preventDefault();
      const feedback = document.getElementById("report-feedback");
      if (!form.reportValidity()) return;
      const data = new FormData(form);
      const room = data.get("room");
      const roomOption = form.elements.room.selectedOptions[0];
      const category = data.get("category");
      const description = String(data.get("description")).trim();
      const report = {
        id: `report-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        title: `${category}: ${description.split(/[.!?]/)[0].slice(0, 55) || category}`,
        room,
        roomLabel: roomOption.textContent.trim(),
        category,
        description,
        date: new Date().toISOString(),
        status: "Menunggu Verifikasi",
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
})();
