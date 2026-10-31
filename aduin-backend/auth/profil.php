<?php
// ==================================================================
// MODUL: AUTH - PROFIL PENGGUNA
// Mata Kuliah: Pemrograman Web
// Deskripsi: Menampilkan dan memperbarui data profil pengguna
// ==================================================================

// 1. Hubungkan koneksi database dan helper fungsi
require_once __DIR__ . '/../koneksi.php';
require_once __DIR__ . '/../fungsi.php';

cors();

$method = $_SERVER['REQUEST_METHOD'] ?? 'GET';

// 2. GET: Ambil detail profil pengguna berdasarkan id_user
if ($method === 'GET') {
    $idUser = (int)($_GET['id_user'] ?? $_GET['id'] ?? 0);

    if ($idUser <= 0) {
        json_response(null, 'Parameter ID user tidak valid.', 400);
    }

    try {
        $stmt = $pdo->prepare("SELECT id_user, nama, email, role, foto_user FROM users WHERE id_user = :id");
        $stmt->execute([':id' => $idUser]);
        $user = $stmt->fetch();

        if (!$user) {
            json_response(null, 'Data pengguna tidak ditemukan.', 404);
        }

        json_response($user, 'Data profil berhasil diambil.');
    } catch (PDOException $e) {
        json_response(null, 'Gagal mengambil data profil: ' . $e->getMessage(), 500);
    }
}

// 3. POST / PUT: Perbarui nama atau informasi profil
if (in_array($method, ['POST', 'PUT'])) {
    $input  = get_input();
    $idUser = (int)($input['id_user'] ?? $_GET['id_user'] ?? 0);
    $nama   = trim($input['nama'] ?? '');

    if ($idUser <= 0 || empty($nama)) {
        json_response(null, 'ID user dan nama wajib diisi.', 400);
    }

    try {
        $stmt = $pdo->prepare("UPDATE users SET nama = :nama WHERE id_user = :id_user");
        $stmt->execute([
            ':nama'    => $nama,
            ':id_user' => $idUser
        ]);

        json_response(null, 'Profil berhasil diperbarui.');
    } catch (PDOException $e) {
        json_response(null, 'Gagal memperbarui profil: ' . $e->getMessage(), 500);
    }
}

json_response(null, 'Metode HTTP tidak didukung.', 405);
