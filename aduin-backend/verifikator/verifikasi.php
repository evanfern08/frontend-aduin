<?php
// ==================================================================
// MODUL: VERIFIKATOR - PROSES VERIFIKASI PENGADUAN
// Mata Kuliah: Pemrograman Web
// Deskripsi: Memperbarui status pengaduan (Diproses, Ditolak, Diteruskan, Selesai)
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

$idPengaduan = (int)($_GET['id'] ?? $input['id_pengaduan'] ?? $input['id'] ?? 0);
if ($idPengaduan <= 0) {
    json_response(null, 'ID pengaduan tidak valid.', 400);
}

$statusBaru      = trim($input['status'] ?? '');
$idVerifikator   = (int)($input['id_verifikator'] ?? $input['id_sekjur'] ?? 1);
$keterangan      = trim($input['keterangan'] ?? 'Verifikasi status oleh Sekretaris Jurusan');
$alasanPenolakan = !empty($input['alasan_penolakan']) ? trim($input['alasan_penolakan']) : null;

// 4. Validasi pilihan status sesuai batas constraint database
$validStatuses = ['Disetujui', 'Diproses', 'Ditolak', 'Diteruskan ke Pusat', 'Selesai'];
if (!in_array($statusBaru, $validStatuses, true)) {
    json_response(null, 'Status tidak valid. Pilihan: Diproses, Ditolak, Diteruskan ke Pusat, Selesai.', 400);
}

// Normalisasi jika memilih 'Disetujui' agar sesuai nilai kolom status 'Diproses'
if ($statusBaru === 'Disetujui') {
    $statusBaru = 'Diproses';
}

// 5. Eksekusi pembaruan status dengan transaksi
try {
    $pdo->beginTransaction();

    $sqlUpdate = "UPDATE pengaduan
                  SET status = :status,
                      id_verifikator = :id_verifikator,
                      alasan_penolakan = :alasan_penolakan
                  WHERE id_pengaduan = :id_pengaduan";

    $stmtUpdate = $pdo->prepare($sqlUpdate);
    $stmtUpdate->execute([
        ':status'           => $statusBaru,
        ':id_verifikator'   => $idVerifikator,
        ':alasan_penolakan' => $alasanPenolakan,
        ':id_pengaduan'     => $idPengaduan
    ]);

    // 6. Catat perubahan ke riwayat_status
    $sqlRiwayat = "INSERT INTO riwayat_status (id_pengaduan, changed_by, status_baru, keterangan, timestamp)
                   VALUES (:id_pengaduan, :changed_by, :status_baru, :keterangan, NOW())";
    $stmtRiwayat = $pdo->prepare($sqlRiwayat);
    $stmtRiwayat->execute([
        ':id_pengaduan' => $idPengaduan,
        ':changed_by'   => $idVerifikator,
        ':status_baru'  => $statusBaru,
        ':keterangan'   => $keterangan
    ]);

    $pdo->commit();

    json_response(null, 'Status pengaduan berhasil diubah menjadi: ' . $statusBaru);

} catch (Exception $e) {
    if ($pdo->inTransaction()) {
        $pdo->rollBack();
    }
    json_response(null, 'Gagal memperbarui status verifikasi: ' . $e->getMessage(), 500);
}
