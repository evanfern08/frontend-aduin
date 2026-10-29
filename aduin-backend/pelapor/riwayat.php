<?php
// ==================================================================
// MODUL: PELAPOR - RIWAYAT PENGADUAN
// Mata Kuliah: Pemrograman Web
// Deskripsi: Menampilkan daftar pengaduan milik pelapor tertentu
// Parameter: ?id_pelapor=1
// ==================================================================

// 1. Hubungkan koneksi database dan helper fungsi
require_once __DIR__ . '/../koneksi.php';
require_once __DIR__ . '/../fungsi.php';

cors();

// 2. Ambil parameter ID pelapor dari URL
$idPelapor = (int)($_GET['id_pelapor'] ?? $_GET['id'] ?? 0);

if ($idPelapor <= 0) {
    json_response(null, 'Parameter ID pelapor (id_pelapor) tidak valid.', 400);
}

// 3. Query daftar pengaduan dengan relasi ke tabel ruangan dan kategori fasilitas
try {
    $sql = "SELECT p.*,
                   p.id_fasilitas AS id_kategori,
                   p.judul_laporan AS judul_keluhan,
                   r.nama_ruangan,
                   r.lantai,
                   k.nama_kategori
            FROM pengaduan p
            JOIN ruangan r ON p.id_ruangan = r.id_ruangan
            JOIN kategori_fasilitas k ON p.id_fasilitas = k.id_fasilitas
            WHERE p.id_pelapor = :id_pelapor
            ORDER BY p.tanggal_lapor DESC";

    $stmt = $pdo->prepare($sql);
    $stmt->execute([':id_pelapor' => $idPelapor]);
    $data = $stmt->fetchAll();

    json_response($data, 'Data riwayat pengaduan berhasil dimuat.');

} catch (PDOException $e) {
    json_response(null, 'Gagal memuat riwayat pengaduan: ' . $e->getMessage(), 500);
}
