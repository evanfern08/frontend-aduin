<?php
// ==================================================================
// MODUL: VERIFIKATOR - DASHBOARD PENGADUAN
// Mata Kuliah: Pemrograman Web
// Deskripsi: Menampilkan seluruh daftar pengaduan untuk ditinjau Sekjur
// ==================================================================

// 1. Hubungkan koneksi database dan helper fungsi
require_once __DIR__ . '/../koneksi.php';
require_once __DIR__ . '/../fungsi.php';

cors();

// 2. Query seluruh pengaduan yang masuk dari yang paling baru
try {
    $sql = "SELECT p.*,
                   p.id_fasilitas AS id_kategori,
                   p.judul_laporan AS judul_keluhan,
                   p.id_verifikator AS id_sekjur,
                   r.nama_ruangan,
                   r.lantai,
                   k.nama_kategori,
                   u.nama AS nama_pelapor,
                   u.email AS email_pelapor,
                   uv.nama AS nama_verifikator
            FROM pengaduan p
            JOIN ruangan r ON p.id_ruangan = r.id_ruangan
            JOIN kategori_fasilitas k ON p.id_fasilitas = k.id_fasilitas
            JOIN users u ON p.id_pelapor = u.id_user
            LEFT JOIN users uv ON p.id_verifikator = uv.id_user
            ORDER BY p.tanggal_lapor DESC";

    $stmt = $pdo->query($sql);
    $data = $stmt->fetchAll();

    json_response($data, 'Data dashboard verifikator berhasil dimuat.');

} catch (PDOException $e) {
    json_response(null, 'Gagal memuat data dashboard: ' . $e->getMessage(), 500);
}
