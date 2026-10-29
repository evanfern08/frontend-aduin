<?php
// ==================================================================
// MODUL: AUTH - LOGIN
// Mata Kuliah: Pemrograman Web
// Deskripsi: Memvalidasi kredensial pengguna (email & password)
// ==================================================================

// 1. Hubungkan koneksi database dan helper fungsi
require_once __DIR__ . '/../koneksi.php';
require_once __DIR__ . '/../fungsi.php';

cors();

// 2. Batasi metode akses (hanya POST yang diizinkan)
if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST') {
    json_response(null, 'Metode tidak diizinkan. Gunakan POST.', 405);
}

// 3. Tangkap data dari request body / form
$input    = get_input();
$email    = trim($input['email'] ?? '');
$password = trim($input['password'] ?? '');

// 4. Validasi input
if (empty($email) || empty($password)) {
    json_response(null, 'Email dan password wajib diisi.', 400);
}

// 5. Cari pengguna di database berdasarkan email
try {
    $stmt = $pdo->prepare("SELECT * FROM users WHERE email = :email LIMIT 1");
    $stmt->execute([':email' => $email]);
    $user = $stmt->fetch();

    if ($user) {
        // Cek password baik yang berupa teks biasa maupun hash bcrypt
        $isValidPassword = ($password === $user['password']) || password_verify($password, $user['password']);

        if ($isValidPassword) {
            json_response([
                'id_user'   => (int)$user['id_user'],
                'nama'      => $user['nama'],
                'email'     => $user['email'],
                'role'      => $user['role'],
                'foto_user' => $user['foto_user'] ?? null
            ], 'Login berhasil.');
        }
    }

    json_response(null, 'Email atau password salah.', 401);

} catch (PDOException $e) {
    json_response(null, 'Kesalahan database: ' . $e->getMessage(), 500);
}
