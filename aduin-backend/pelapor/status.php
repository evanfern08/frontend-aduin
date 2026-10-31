<?php
// ==================================================================
// MODUL: PELAPOR - RIWAYAT ALUR STATUS PENGADUAN
// Mata Kuliah: Pemrograman Web
// Deskripsi: Menampilkan alur riwayat verifikasi dan penanganan aduan
// Parameter: ?id_pengaduan=1
// ==================================================================

// 1. Hubungkan koneksi database dan helper fungsi
require_once __DIR__ . '/../koneksi.php';
require_once __DIR__ . '/../fungsi.php';

cors();

// 2. Ambil parameter ID pengaduan
$idPengaduan = (int)($_GET['id_pengaduan'] ?? $_GET['id'] ?? 0);

if ($idPengaduan <= 0) {
    json_response(null, 'Parameter ID pengaduan (id_pengaduan) tidak valid.', 400);
}

// 3. Query riwayat perubahan status dari tabel riwayat_status
try {
    $sql = "SELECT rs.*, u.nama AS nama_pengubah, u.role AS role_pengubah
            FROM riwayat_status rs
            JOIN users u ON rs.changed_by = u.id_user
            WHERE rs.id_pengaduan = :id_pengaduan
            ORDER BY rs.timestamp ASC";

    $stmt = $pdo->prepare($sql);
    $stmt->execute([':id_pengaduan' => $idPengaduan]);
    $data = $stmt->fetchAll();

    json_response($data, 'Riwayat alur status pengaduan berhasil dimuat.');

} catch (PDOException $e) {
    json_response(null, 'Gagal memuat status pengaduan: ' . $e->getMessage(), 500);
}
