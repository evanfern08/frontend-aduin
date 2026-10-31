<?php
// ==================================================================
// MODUL: PELAPOR - BUAT PENGADUAN BARU
// Mata Kuliah: Pemrograman Web
// Deskripsi: Menerima laporan kerusakan fasilitas dari mahasiswa/dosen
// ==================================================================

// 1. Hubungkan koneksi database dan helper fungsi
require_once __DIR__ . '/../koneksi.php';
require_once __DIR__ . '/../fungsi.php';

cors();

// 2. Batasi metode akses (hanya POST yang diizinkan)
if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST') {
    json_response(null, 'Metode tidak diizinkan. Gunakan POST.', 405);
}

// 3. Tangkap data input dari form atau body JSON
$input        = get_input();
$idPelapor    = (int)($input['id_pelapor'] ?? 0);
$idRuangan    = (int)($input['id_ruangan'] ?? 0);
$idFasilitas  = (int)($input['id_fasilitas'] ?? $input['id_kategori'] ?? 0);
$judulLaporan = trim($input['judul_laporan'] ?? $input['judul_keluhan'] ?? '');
$deskripsi    = trim($input['deskripsi'] ?? '');

// 4. Validasi input wajib
if ($idPelapor <= 0 || $idRuangan <= 0 || $idFasilitas <= 0 || empty($judulLaporan)) {
    json_response(null, 'Data belum lengkap. Harap isi pelapor, ruangan, fasilitas, dan judul pengaduan.', 400);
}

// 5. Kelola file unggahan (foto bukti) jika ada
$fotoBukti = null;
if (isset($_FILES['foto_bukti']) && !empty($_FILES['foto_bukti']['tmp_name'])) {
    $fotoBukti = upload_foto($_FILES['foto_bukti'], 'bukti');
}

// 6. Simpan ke database menggunakan transaksi
try {
    $pdo->beginTransaction();

    $sqlPengaduan = "INSERT INTO pengaduan (id_pelapor, id_ruangan, id_fasilitas, judul_laporan, deskripsi, foto_bukti, status, tanggal_lapor)
                     VALUES (:id_pelapor, :id_ruangan, :id_fasilitas, :judul_laporan, :deskripsi, :foto_bukti, 'Menunggu Verifikasi', NOW())
                     RETURNING id_pengaduan";

    $stmtPengaduan = $pdo->prepare($sqlPengaduan);
    $stmtPengaduan->execute([
        ':id_pelapor'    => $idPelapor,
        ':id_ruangan'    => $idRuangan,
        ':id_fasilitas'  => $idFasilitas,
        ':judul_laporan' => $judulLaporan,
        ':deskripsi'     => $deskripsi,
        ':foto_bukti'    => $fotoBukti
    ]);

    $idPengaduan = (int)$stmtPengaduan->fetchColumn();

    // 7. Catat log riwayat status awal
    $sqlRiwayat = "INSERT INTO riwayat_status (id_pengaduan, changed_by, status_baru, keterangan, timestamp)
                   VALUES (:id_pengaduan, :changed_by, 'Menunggu Verifikasi', 'Pengaduan baru diajukan oleh pelapor.', NOW())";
    $stmtRiwayat = $pdo->prepare($sqlRiwayat);
    $stmtRiwayat->execute([
        ':id_pengaduan' => $idPengaduan,
        ':changed_by'   => $idPelapor
    ]);

    $pdo->commit();

    json_response([
        'id_pengaduan' => $idPengaduan,
        'foto_bukti'   => $fotoBukti
    ], 'Pengaduan berhasil diajukan.', 201);

} catch (Exception $e) {
    if ($pdo->inTransaction()) {
        $pdo->rollBack();
    }
    json_response(null, 'Gagal menyimpan pengaduan: ' . $e->getMessage(), 500);
}
