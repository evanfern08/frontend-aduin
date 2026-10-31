<?php
/**
 * Konfigurasi Koneksi Database Native PDO
 * Mata Kuliah: Pemrograman Web
 * Database: PostgreSQL (aduin_db)
 */

$host     = 'localhost';
$port     = '5432';
$dbname   = 'aduin_db';
$user     = 'postgres';
$password = 'y4sUd4hl4h';

try {
    $pdo = new PDO("pgsql:host={$host};port={$port};dbname={$dbname}", $user, $password, [
        PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
    ]);
} catch (PDOException $e) {
    header('Content-Type: application/json; charset=utf-8');
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Koneksi database gagal: ' . $e->getMessage()
    ]);
    exit;
}
