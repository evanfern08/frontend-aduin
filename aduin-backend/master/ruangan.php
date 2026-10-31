<?php
// ==================================================================
// MODUL: MASTER - DATA RUANGAN
// Mata Kuliah: Pemrograman Web
// Deskripsi: Menampilkan seluruh data ruangan dan lantai kampus
// ==================================================================

require_once __DIR__ . '/../koneksi.php';
require_once __DIR__ . '/../fungsi.php';

cors();

try {
    $stmt = $pdo->query("SELECT id_ruangan, nama_ruangan, lantai FROM ruangan ORDER BY lantai ASC, nama_ruangan ASC");
    $data = $stmt->fetchAll();

    json_response($data, 'Data ruangan berhasil diambil.');

} catch (PDOException $e) {
    json_response(null, 'Gagal mengambil data ruangan: ' . $e->getMessage(), 500);
}
