<?php
/**
 * Helper Fungsi Native PHP
 * Mata Kuliah: Pemrograman Web
 */

// Tangani CORS (Cross-Origin Resource Sharing)
function cors(): void {
    if (!headers_sent()) {
        header("Access-Control-Allow-Origin: *");
        header("Access-Control-Allow-Methods: GET, POST, PUT, PATCH, DELETE, OPTIONS");
        header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");
    }

    if (($_SERVER['REQUEST_METHOD'] ?? '') === 'OPTIONS') {
        if (!headers_sent()) {
            http_response_code(200);
        }
        exit;
    }
}

// Kirim respons dalam format JSON standar
function json_response($data = null, string $message = '', int $statusCode = 200): void {
    if (!headers_sent()) {
        header('Content-Type: application/json; charset=utf-8');
        http_response_code($statusCode);
    }
    echo json_encode([
        'success' => ($statusCode >= 200 && $statusCode < 300),
        'message' => $message,
        'data'    => $data
    ], JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);
    exit;
}

// Ambil data input baik dari JSON body maupun form-data/x-www-form-urlencoded
function get_input(): array {
    $contentType = $_SERVER['CONTENT_TYPE'] ?? '';

    if (stripos($contentType, 'application/json') !== false) {
        $raw = file_get_contents('php://input');
        $decoded = json_decode($raw, true);
        return is_array($decoded) ? $decoded : [];
    }

    if (!empty($_POST)) {
        return $_POST;
    }

    // Tangani PUT / PATCH dari php://input jika dikirim sebagai query-string
    if (in_array($_SERVER['REQUEST_METHOD'], ['PUT', 'PATCH'])) {
        $raw = file_get_contents('php://input');
        if (!empty($raw)) {
            $json = json_decode($raw, true);
            if (is_array($json)) {
                return $json;
            }
            parse_str($raw, $parsed);
            return is_array($parsed) ? $parsed : [];
        }
    }

    return [];
}

// Helper untuk upload file gambar (bukti atau hasil pengerjaan)
function upload_foto(array $file, string $subfolder = 'bukti'): ?string {
    if (!isset($file['tmp_name']) || empty($file['tmp_name']) || $file['error'] !== UPLOAD_ERR_OK) {
        return null;
    }

    $baseUploadDir = __DIR__ . '/uploads/' . trim($subfolder, '/') . '/';
    if (!is_dir($baseUploadDir)) {
        mkdir($baseUploadDir, 0777, true);
    }

    $originalName = $file['name'];
    $extension    = strtolower(pathinfo($originalName, PATHINFO_EXTENSION));
    $allowedExt   = ['jpg', 'jpeg', 'png', 'webp', 'gif'];

    if (!in_array($extension, $allowedExt, true)) {
        return null;
    }

    $newFileName = time() . '_' . bin2hex(random_bytes(6)) . '.' . $extension;
    $destination = $baseUploadDir . $newFileName;

    if (move_uploaded_file($file['tmp_name'], $destination)) {
        return 'uploads/' . trim($subfolder, '/') . '/' . $newFileName;
    }

    return null;
}
