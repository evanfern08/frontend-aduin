/**
 * app.js - Client-side script for ADUIN Authentication Pages
 */
document.addEventListener('DOMContentLoaded', () => {
  // Toggle password visibility
  const togglePassBtns = document.querySelectorAll('.toggle-password-btn');
  togglePassBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      const targetId = btn.getAttribute('data-target');
      const input = document.getElementById(targetId);
      const eyeIcon = btn.querySelector('.eye-icon');
      const eyeOffIcon = btn.querySelector('.eye-off-icon');

      if (input) {
        if (input.type === 'password') {
          input.type = 'text';
          if (eyeIcon) eyeIcon.classList.add('hidden');
          if (eyeOffIcon) eyeOffIcon.classList.remove('hidden');
        } else {
          input.type = 'password';
          if (eyeIcon) eyeIcon.classList.remove('hidden');
          if (eyeOffIcon) eyeOffIcon.classList.add('hidden');
        }
      }
    });
  });

  // Client-side validation handling for Login Form
  const loginForm = document.getElementById('loginForm');
  if (loginForm) {
    loginForm.addEventListener('submit', (e) => {
      const idInput = document.getElementById('loginId');
      const passInput = document.getElementById('loginPassword');
      const errorBox = document.getElementById('alertBox');

      if (!idInput.value.trim() || !passInput.value.trim()) {
        e.preventDefault();
        if (errorBox) {
          errorBox.textContent = 'Semua kolom wajib diisi.';
          errorBox.classList.remove('hidden');
        }
        if (!idInput.value.trim()) {
          idInput.focus();
        } else {
          passInput.focus();
        }
      }
    });
  }

  // Client-side validation handling for Register Form
  const registerForm = document.getElementById('registerForm');
  if (registerForm) {
    registerForm.addEventListener('submit', (e) => {
      const idInput = document.getElementById('regId');
      const emailInput = document.getElementById('regEmail');
      const passInput = document.getElementById('regPassword');
      const errorBox = document.getElementById('alertBox');

      if (!idInput.value.trim() || !emailInput.value.trim() || !passInput.value.trim()) {
        e.preventDefault();
        if (errorBox) {
          errorBox.textContent = 'Semua kolom wajib diisi.';
          errorBox.classList.remove('hidden');
        }
        if (!idInput.value.trim()) idInput.focus();
        else if (!emailInput.value.trim()) emailInput.focus();
        else passInput.focus();
      }
    });
  }

  // --- Verifikator Admin Dashboard Interactions ---
  // 1. Tab Switching for Verifikator (Dashboard, Riwayat, Statistik, Pengaturan)
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

  // 2. Modals for Approve and Reject
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

  // 3. Riwayat Filter Pills
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

  // 4. Change Password Form
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

/**
 * app.js - Client-side script for ADUIN Authentication Pages
 */
document.addEventListener('DOMContentLoaded', () => {
  // Toggle password visibility
  const togglePassBtns = document.querySelectorAll('.toggle-password-btn');
  togglePassBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      const targetId = btn.getAttribute('data-target');
      const input = document.getElementById(targetId);
      const eyeIcon = btn.querySelector('.eye-icon');
      const eyeOffIcon = btn.querySelector('.eye-off-icon');

      if (input) {
        if (input.type === 'password') {
          input.type = 'text';
          if (eyeIcon) eyeIcon.classList.add('hidden');
          if (eyeOffIcon) eyeOffIcon.classList.remove('hidden');
        } else {
          input.type = 'password';
          if (eyeIcon) eyeIcon.classList.remove('hidden');
          if (eyeOffIcon) eyeOffIcon.classList.add('hidden');
        }
      }
    });
  });

  // Client-side validation handling for Login Form
  const loginForm = document.getElementById('loginForm');
  if (loginForm) {
    loginForm.addEventListener('submit', (e) => {
      const idInput = document.getElementById('loginId');
      const passInput = document.getElementById('loginPassword');
      const errorBox = document.getElementById('alertBox');

      if (!idInput.value.trim() || !passInput.value.trim()) {
        e.preventDefault();
        if (errorBox) {
          errorBox.textContent = 'Semua kolom wajib diisi.';
          errorBox.classList.remove('hidden');
        }
        if (!idInput.value.trim()) {
          idInput.focus();
        } else {
          passInput.focus();
        }
      }
    });
  }

  // Client-side validation handling for Register Form
  const registerForm = document.getElementById('registerForm');
  if (registerForm) {
    registerForm.addEventListener('submit', (e) => {
      const idInput = document.getElementById('regId');
      const emailInput = document.getElementById('regEmail');
      const passInput = document.getElementById('regPassword');
      const errorBox = document.getElementById('alertBox');

      if (!idInput.value.trim() || !emailInput.value.trim() || !passInput.value.trim()) {
        e.preventDefault();
        if (errorBox) {
          errorBox.textContent = 'Semua kolom wajib diisi.';
          errorBox.classList.remove('hidden');
        }
        if (!idInput.value.trim()) idInput.focus();
        else if (!emailInput.value.trim()) emailInput.focus();
        else passInput.focus();
      }
    });
  }

  // --- Verifikator Admin Dashboard Interactions ---
  // 1. Tab Switching for Verifikator (Dashboard, Riwayat, Statistik, Pengaturan)
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

  // 2. Modals for Approve and Reject
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

  // 3. Riwayat Filter Pills
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

  // 4. Change Password Form
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

