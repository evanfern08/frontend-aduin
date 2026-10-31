<?php
// ==================================================================
// MODUL: AUTH - REGISTRASI PENGGUNA BARU
// Mata Kuliah: Pemrograman Web
// Deskripsi: Mendaftarkan mahasiswa atau dosen baru ke database
// ==================================================================

// 1. Hubungkan koneksi database dan helper fungsi
require_once __DIR__ . '/../koneksi.php';
require_once __DIR__ . '/../fungsi.php';

cors();

// 2. Batasi metode akses
if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST') {
    json_response(null, 'Metode tidak diizinkan. Gunakan POST.', 405);
}

// 3. Tangkap data input
$input    = get_input();
$nama     = trim($input['nama'] ?? '');
$email    = trim($input['email'] ?? '');
$password = trim($input['password'] ?? '');
$role     = trim($input['role'] ?? 'mahasiswa');

// 4. Validasi input wajib
if (empty($nama) || empty($email) || empty($password)) {
    json_response(null, 'Nama, email, dan password wajib diisi.', 400);
}

$rolesValid = ['mahasiswa', 'dosen', 'sekjur', 'teknisi'];
if (!in_array($role, $rolesValid, true)) {
    json_response(null, 'Role pengguna tidak valid.', 400);
}

try {
    // 5. Pastikan email belum pernah terdaftar
    $cekStmt = $pdo->prepare("SELECT id_user FROM users WHERE email = :email LIMIT 1");
    $cekStmt->execute([':email' => $email]);
    if ($cekStmt->fetch()) {
        json_response(null, 'Email ini sudah terdaftar. Silakan gunakan email lain.', 409);
    }

    $pdo->beginTransaction();

    // 6. Enkripsi password menggunakan bcrypt standar PHP
    $hashedPassword = password_hash($password, PASSWORD_DEFAULT);

    // 7. Simpan data ke tabel users
    $sqlUser = "INSERT INTO users (nama, email, password, role)
                VALUES (:nama, :email, :password, :role)
                RETURNING id_user";
    $stmtUser = $pdo->prepare($sqlUser);
    $stmtUser->execute([
        ':nama'     => $nama,
        ':email'    => $email,
        ':password' => $hashedPassword,
        ':role'     => $role
    ]);
    $idUser = (int)$stmtUser->fetchColumn();

    // 8. Simpan ke tabel detail sesuai role
    if ($role === 'mahasiswa') {
        $nim   = trim($input['nim'] ?? '');
        $prodi = trim($input['prodi'] ?? 'Teknologi Informasi');
        $sqlMhs = "INSERT INTO mahasiswa (nim, prodi, id_user) VALUES (:nim, :prodi, :id_user)";
        $pdo->prepare($sqlMhs)->execute([':nim' => $nim, ':prodi' => $prodi, ':id_user' => $idUser]);
    } elseif ($role === 'dosen') {
        $nip    = trim($input['nip'] ?? '');
        $bidang = trim($input['bidang_keahlian'] ?? 'Dosen JTI');
        $sqlDsn = "INSERT INTO dosen (nip, bidang_keahlian, id_user) VALUES (:nip, :bidang, :id_user)";
        $pdo->prepare($sqlDsn)->execute([':nip' => $nip, ':bidang' => $bidang, ':id_user' => $idUser]);
    }

    $pdo->commit();

    json_response([
        'id_user' => $idUser,
        'role'    => $role,
        'nama'    => $nama
    ], 'Registrasi akun berhasil.', 201);

} catch (Exception $e) {
    if ($pdo->inTransaction()) {
        $pdo->rollBack();
    }
    json_response(null, 'Gagal melakukan registrasi: ' . $e->getMessage(), 500);
}
