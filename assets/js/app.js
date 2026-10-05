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
});
