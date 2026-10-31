<?php
// ==================================================================
// MODUL: MASTER - DATA TEKNISI
// Mata Kuliah: Pemrograman Web
// Deskripsi: Menampilkan data teknisi beserta Spesialisasi
// ==================================================================

require_once __DIR__ . '/../koneksi.php';
require_once __DIR__ . '/../fungsi.php';

cors();

try {
    $sql = "SELECT u.id_user, u.nama, u.email, u.foto_user, t.id_teknisi, t.spesialisasi
            FROM users u
            JOIN teknisi t ON u.id_user = t.id_user
            WHERE u.role = 'teknisi'
            ORDER BY u.id_user ASC";

    $stmt = $pdo->query($sql);
    $data = $stmt->fetchAll();

    json_response($data, 'Data teknisi berhasil diambil.');

} catch (PDOException $e) {
    json_response(null, 'Gagal mengambil data teknisi: ' . $e->getMessage(), 500);
}
