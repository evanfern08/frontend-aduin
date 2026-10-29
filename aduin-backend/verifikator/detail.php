<?php
// ==================================================================
// MODUL: VERIFIKATOR - DETAIL PENGADUAN
// Mata Kuliah: Pemrograman Web
// Deskripsi: Menampilkan detail pengaduan untuk ditinjau oleh verifikator
// Parameter: ?id=1
// ==================================================================

// 1. Hubungkan koneksi database dan helper fungsi
require_once __DIR__ . '/../koneksi.php';
require_once __DIR__ . '/../fungsi.php';

cors();

// 2. Ambil parameter ID pengaduan
$idPengaduan = (int)($_GET['id'] ?? $_GET['id_pengaduan'] ?? 0);

if ($idPengaduan <= 0) {
    json_response(null, 'Parameter ID pengaduan tidak valid.', 400);
}

// 3. Query informasi pengaduan lengkap beserta relasi ruang, fasilitas, pelapor, dan penanganan tugas
try {
    $sql = "SELECT p.*,
                   p.id_fasilitas AS id_kategori,
                   p.judul_laporan AS judul_keluhan,
                   r.nama_ruangan,
                   r.lantai,
                   k.nama_kategori,
                   u.nama AS nama_pelapor,
                   u.email AS email_pelapor,
                   uv.nama AS nama_verifikator,
                   pt.waktu_mulai,
                   pt.waktu_selesai,
                   pt.catatan_teknisi,
                   pt.foto_hasil,
                   ut.nama AS nama_teknisi
            FROM pengaduan p
            JOIN ruangan r ON p.id_ruangan = r.id_ruangan
            JOIN kategori_fasilitas k ON p.id_fasilitas = k.id_fasilitas
            JOIN users u ON p.id_pelapor = u.id_user
            LEFT JOIN users uv ON p.id_verifikator = uv.id_user
            LEFT JOIN penanganan_tugas pt ON p.id_pengaduan = pt.id_pengaduan
            LEFT JOIN users ut ON pt.id_teknisi = ut.id_user
            WHERE p.id_pengaduan = :id";

    $stmt = $pdo->prepare($sql);
    $stmt->execute([':id' => $idPengaduan]);
    $data = $stmt->fetch();

    if (!$data) {
        json_response(null, 'Pengaduan tidak ditemukan.', 404);
    }

    json_response($data, 'Detail pengaduan berhasil dimuat.');

} catch (PDOException $e) {
    json_response(null, 'Gagal memuat detail pengaduan: ' . $e->getMessage(), 500);
}
