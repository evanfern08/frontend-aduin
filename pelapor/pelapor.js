(() => {
  "use strict";

  const REPORTS_KEY = "aduin.pelapor.reports.v1";
  const PROFILE_KEY = "aduin.pelapor.profile.v1";
  const DEFAULT_PROFILE = { name: "Rachmah Nur Chotimah" };
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
  appFeedback.className = "hidden fixed bottom-4 right-4 z-50 max-w-md rounded-xl bg-red-700 px-5 py-3 text-sm font-medium text-white shadow-lg";
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

  function statusStyle(status) {
    if (status === "Diproses") return "bg-[#C7EAFF] text-[#1D5B8F]";
    if (status === "Selesai") return "bg-[#B6E6B3] text-[#4E8C4A]";
    if (status === "Dikembalikan ke Pelapor") return "bg-[#F7B2AD] text-[#7F1D1D]";
    return "bg-[#FAD09C] text-[#7C5826]";
  }

  function iconFor(category) {
    if (category === "Proyektor") return "fa-video";
    if (category === "AC / Pendingin") return "fa-snowflake";
    if (category === "Kelistrikan / Lampu") return "fa-lightbulb";
    return "fa-chair";
  }

  function progressCard(status) {
    const activeIndex = status === "Menunggu Verifikasi" ? 0 : status === "Selesai" ? 2 : 1;
    const returned = status === "Dikembalikan ke Pelapor";
    const color = returned ? "#991B1B" : status === "Selesai" ? "#5BB85D" : status === "Menunggu Verifikasi" ? "#F59E0B" : "#2CA4FF";
    const steps = ["Menunggu verifikasi", returned ? "Dikembalikan ke Pelapor" : "Diproses", "Selesai"];
    const container = document.createElement("div");
    container.className = "mt-5 flex items-center";

    steps.forEach((label, index) => {
      const step = document.createElement("div");
      step.className = "flex flex-col items-center text-center";
      const marker = document.createElement("div");
      const reached = returned ? index < 1 : index <= activeIndex;
      marker.className = `w-7 h-7 rounded-full flex items-center justify-center ${reached ? "text-white" : "border-2 border-slate-400 bg-white"}`;
      if (reached) marker.style.backgroundColor = color;
      if (index === activeIndex && !returned) {
        marker.className = "w-7 h-7 rounded-full border-4 bg-white flex items-center justify-center";
        marker.style.borderColor = color;
        const dot = document.createElement("span");
        dot.className = "w-2.5 h-2.5 rounded-full";
        dot.style.backgroundColor = color;
        marker.append(dot);
      } else if (reached) {
        marker.innerHTML = '<i class="fa-solid fa-check text-xs" aria-hidden="true"></i>';
      }
      const text = document.createElement("span");
      text.className = `text-[11px] mt-1.5 ${reached || index === activeIndex ? "font-semibold" : "font-medium text-slate-400"}`;
      text.style.color = reached || index === activeIndex ? color : "";
      text.textContent = label;
      step.append(marker, text);
      container.append(step);

      if (index < steps.length - 1) {
        const line = document.createElement("div");
        line.className = "flex-1 h-1 -mt-5 mx-1";
        line.style.backgroundColor = (returned ? index < 1 : index < activeIndex) ? color : "#cbd5e1";
        container.append(line);
      }
    });
    return container;
  }

  function createReportCard(report) {
    const card = document.createElement("article");
    card.className = "bg-white rounded-2xl p-6 border border-slate-300/80 flex items-start gap-6";

    const icon = document.createElement("div");
    icon.className = "w-16 h-16 rounded-2xl bg-[#A9D6FF] text-[#1D88E5] flex items-center justify-center shrink-0 mt-1";
    const iconElement = document.createElement("i");
    iconElement.className = `fa-solid ${iconFor(report.category)} text-2xl`;
    iconElement.setAttribute("aria-hidden", "true");
    icon.append(iconElement);

    const content = document.createElement("div");
    content.className = "flex-1 min-w-0";
    const heading = document.createElement("div");
    heading.className = "flex flex-wrap items-start justify-between gap-2";
    const details = document.createElement("div");
    const title = document.createElement("h4");
    title.className = "text-lg font-bold text-slate-900";
    title.textContent = report.title;
    const location = document.createElement("p");
    location.className = "text-xs text-slate-500 mt-0.5";
    location.textContent = `${report.roomLabel} · ${reportDate(report.date)}`;
    details.append(title, location);

    const badge = document.createElement("span");
    badge.className = `px-5 py-1 rounded-full text-xs font-bold ${statusStyle(report.status)}`;
    badge.textContent = report.status;
    heading.append(details, badge);
    content.append(heading);

    if (report.description) {
      const description = document.createElement("p");
      description.className = "text-sm text-slate-600 mt-3";
      description.textContent = report.description;
      content.append(description);
    }
    if (report.photoName) {
      const photo = document.createElement("p");
      photo.className = "text-xs text-slate-500 mt-2";
      photo.textContent = `Foto dipilih: ${report.photoName} (belum diunggah ke server)`;
      content.append(photo);
    }
    content.append(progressCard(report.status));
    card.append(icon, content);
    card.dataset.status = report.status;
    return card;
  }

  function renderReports() {
    const reports = getReports();
    const total = document.getElementById("total-reports");
    const processing = document.getElementById("processing-reports");
    const completed = document.getElementById("completed-reports");
    if (total) total.textContent = String(reports.length);
    if (processing) processing.textContent = String(reports.filter((report) => report.status === "Diproses").length);
    if (completed) completed.textContent = String(reports.filter((report) => report.status === "Selesai").length);

    const list = document.getElementById("reports-list");
    if (!list) return;
    const selectedFilter = list.dataset.filter || "all";
    list.replaceChildren();
    const visibleReports = reports.filter((report) => selectedFilter === "all" || report.status === selectedFilter);
    visibleReports.forEach((report) => list.append(createReportCard(report)));
    if (visibleReports.length === 0) {
      const emptyState = document.createElement("p");
      emptyState.className = "rounded-2xl border border-slate-200 bg-white p-8 text-center text-slate-500";
      emptyState.textContent = "Belum ada laporan untuk status ini.";
      list.append(emptyState);
    }
  }

  function showFormMessage(element, message, isError) {
    if (!element) return;
    element.textContent = message;
    element.className = `text-sm text-center ${isError ? "text-red-700" : "text-emerald-700"}`;
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
        photoFeedback.className = "text-xs text-red-700 mt-2";
        return;
      }
      if (file.size > maxPhotoSize) {
        selectedPhoto = null;
        photoInput.value = "";
        photoFeedback.textContent = "Ukuran foto melebihi batas 10MB.";
        photoFeedback.className = "text-xs text-red-700 mt-2";
        return;
      }
      selectedPhoto = file;
      photoFeedback.textContent = `Foto dipilih: ${file.name}`;
      photoFeedback.className = "text-xs text-emerald-700 mt-2";
    }

    document.getElementById("choose-report-photo").addEventListener("click", () => photoInput.click());
    photoInput.addEventListener("change", () => setPhoto(photoInput.files[0]));
    dropzone.addEventListener("dragover", (event) => {
      event.preventDefault();
      dropzone.classList.add("border-[#38A3FF]");
    });
    dropzone.addEventListener("dragleave", () => dropzone.classList.remove("border-[#38A3FF]"));
    dropzone.addEventListener("drop", (event) => {
      event.preventDefault();
      dropzone.classList.remove("border-[#38A3FF]");
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
          filterButton.className = "px-6 py-2 rounded-full bg-white text-slate-800 hover:bg-slate-100 text-sm font-medium border border-slate-400 transition";
        });
        button.className = "px-6 py-2 rounded-full bg-[#13294B] text-white text-sm font-medium border border-[#13294B] transition";
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
          feedback.className = "text-sm mt-4 text-red-700";
        } else if (newPassword.length < 8) {
          feedback.textContent = "Kata sandi baru minimal 8 karakter.";
          feedback.className = "text-sm mt-4 text-red-700";
        } else if (newPassword !== confirmation) {
          feedback.textContent = "Konfirmasi kata sandi baru tidak sama.";
          feedback.className = "text-sm mt-4 text-red-700";
        } else {
          feedback.textContent = "Data sudah valid, tetapi perubahan kata sandi belum dapat disimpan karena layanan akun/backend belum terhubung.";
          feedback.className = "text-sm mt-4 text-amber-700";
        }
      });
    }

    const photoButton = document.querySelector("[data-profile-photo-button]");
    if (photoButton) {
      const input = document.createElement("input");
      input.type = "file";
      input.accept = "image/png,image/jpeg";
      input.className = "sr-only";
      input.addEventListener("change", () => {
        const file = input.files[0];
        if (!file) return;
        if (file.size > 10 * 1024 * 1024 || !["image/png", "image/jpeg"].includes(file.type)) {
          showAppError("Foto profil harus berupa PNG/JPG dengan ukuran maksimal 10MB.");
          input.value = "";
          return;
        }
        const avatar = document.querySelector("[data-profile-initials].w-28");
        if (avatar) {
          const imageUrl = URL.createObjectURL(file);
          avatar.style.backgroundImage = `url("${imageUrl}")`;
          avatar.style.backgroundSize = "cover";
          avatar.style.backgroundPosition = "center";
          avatar.textContent = "";
        }
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
