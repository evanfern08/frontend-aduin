<?php
// ==================================================================
// MODUL: TEKNISI - DAFTAR TUGAS PERBAIKAN
// Mata Kuliah: Pemrograman Web
// Deskripsi: Menampilkan daftar pengaduan yang sudah disetujui/diproses
// ==================================================================

// 1. Hubungkan koneksi database dan helper fungsi
require_once __DIR__ . '/../koneksi.php';
require_once __DIR__ . '/../fungsi.php';

cors();

// 2. Query pengaduan dengan status 'Diproses' atau 'Disetujui'
try {
    $sql = "SELECT p.*,
                   p.id_fasilitas AS id_kategori,
                   p.judul_laporan AS judul_keluhan,
                   r.nama_ruangan,
                   r.lantai,
                   k.nama_kategori,
                   pt.waktu_mulai,
                   pt.waktu_selesai,
                   pt.catatan_teknisi,
                   pt.foto_hasil
            FROM pengaduan p
            JOIN ruangan r ON p.id_ruangan = r.id_ruangan
            JOIN kategori_fasilitas k ON p.id_fasilitas = k.id_fasilitas
            LEFT JOIN penanganan_tugas pt ON p.id_pengaduan = pt.id_pengaduan
            WHERE p.status IN ('Disetujui', 'Diproses')
            ORDER BY p.tanggal_lapor ASC";

    $stmt = $pdo->query($sql);
    $data = $stmt->fetchAll();

    json_response($data, 'Data tugas teknisi berhasil dimuat.');

} catch (PDOException $e) {
    json_response(null, 'Gagal memuat daftar tugas teknisi: ' . $e->getMessage(), 500);
}
