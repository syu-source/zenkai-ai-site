<?php
declare(strict_types=1);

require __DIR__ . '/form-lib.php';

header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: no-store, max-age=0');
header('X-Content-Type-Options: nosniff');
header('Referrer-Policy: same-origin');

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    http_response_code(405);
    header('Allow: GET');
    echo json_encode(['ok' => false, 'error' => 'Method Not Allowed']);
    exit;
}

session_name('zenkai_form');
session_set_cookie_params([
    'lifetime' => 0,
    'path' => '/',
    'secure' => (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off'),
    'httponly' => true,
    'samesite' => 'Strict',
]);
session_start();
$issued = issue_form_token($_SESSION, time());

echo json_encode([
    'ok' => true,
    'csrf_token' => $issued['csrf_token'],
    'form_started_at' => $issued['form_started_at'],
], JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
