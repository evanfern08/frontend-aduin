<?php
// ==================================================================
// MODUL: TEKNISI - SELESAIKAN TUGAS PERBAIKAN
// Mata Kuliah: Pemrograman Web
// Deskripsi: Mengunggah foto hasil perbaikan dan mengubah status menjadi 'Selesai'
// ==================================================================

// 1. Hubungkan koneksi database dan helper fungsi
require_once __DIR__ . '/../koneksi.php';
require_once __DIR__ . '/../fungsi.php';

cors();

// 2. Batasi metode akses
if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST') {
    json_response(null, 'Metode tidak diizinkan. Gunakan POST.', 405);
}

// 3. Tangkap data input dari form atau body
$input = get_input();

$idPengaduan   = (int)($_GET['id'] ?? $input['id_pengaduan'] ?? $input['id'] ?? 0);
$idTeknisi     = (int)($input['id_teknisi'] ?? 0);
$catatanTeknis = trim($input['catatan_teknis'] ?? $input['catatan'] ?? 'Perbaikan telah selesai dilaksanakan.');

// 4. Validasi input
if ($idPengaduan <= 0) {
    json_response(null, 'ID pengaduan tidak valid.', 400);
}

if ($idTeknisi <= 0) {
    json_response(null, 'ID teknisi wajib diisi.', 400);
}

// 5. Kelola file foto hasil pengerjaan jika ada
$fotoHasil = null;
if (isset($_FILES['foto_hasil']) && !empty($_FILES['foto_hasil']['tmp_name'])) {
    $fotoHasil = upload_foto($_FILES['foto_hasil'], 'hasil');
}

// 6. Simpan penanganan tugas dan perbarui status pengaduan dengan transaksi
try {
    $pdo->beginTransaction();

    // Catat ke tabel penanganan_tugas (insert atau update jika sudah ada)
    $sqlTugas = "INSERT INTO penanganan_tugas (id_pengaduan, id_teknisi, waktu_mulai, waktu_selesai, foto_hasil, catatan_teknisi)
                 VALUES (:id_pengaduan, :id_teknisi, NOW(), NOW(), :foto_hasil, :catatan_teknisi)
                 ON CONFLICT (id_pengaduan) DO UPDATE
                 SET id_teknisi = EXCLUDED.id_teknisi,
                     waktu_selesai = NOW(),
                     foto_hasil = COALESCE(EXCLUDED.foto_hasil, penanganan_tugas.foto_hasil),
                     catatan_teknisi = EXCLUDED.catatan_teknisi";

    $stmtTugas = $pdo->prepare($sqlTugas);
    $stmtTugas->execute([
        ':id_pengaduan'    => $idPengaduan,
        ':id_teknisi'      => $idTeknisi,
        ':foto_hasil'      => $fotoHasil,
        ':catatan_teknisi' => $catatanTeknis
    ]);

    // Perbarui status laporan di tabel pengaduan menjadi 'Selesai'
    $sqlPengaduan = "UPDATE pengaduan SET status = 'Selesai' WHERE id_pengaduan = :id_pengaduan";
    $stmtPengaduan = $pdo->prepare($sqlPengaduan);
    $stmtPengaduan->execute([':id_pengaduan' => $idPengaduan]);

    // Catat log ke riwayat_status
    $sqlRiwayat = "INSERT INTO riwayat_status (id_pengaduan, changed_by, status_baru, keterangan, timestamp)
                   VALUES (:id_pengaduan, :changed_by, 'Selesai', :keterangan, NOW())";
    $stmtRiwayat = $pdo->prepare($sqlRiwayat);
    $stmtRiwayat->execute([
        ':id_pengaduan' => $idPengaduan,
        ':changed_by'   => $idTeknisi,
        ':keterangan'   => !empty($catatanTeknis) ? $catatanTeknis : 'Tugas perbaikan telah diselesaikan oleh teknisi.'
    ]);

    $pdo->commit();

    json_response([
        'id_pengaduan' => $idPengaduan,
        'foto_hasil'   => $fotoHasil
    ], 'Tugas perbaikan berhasil diselesaikan.');

} catch (Exception $e) {
    if ($pdo->inTransaction()) {
        $pdo->rollBack();
    }
    json_response(null, 'Gagal memperbarui status tugas: ' . $e->getMessage(), 500);
}
