<?php
declare(strict_types=1);

require __DIR__ . '/form-lib.php';

header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: no-store, max-age=0');
header('X-Content-Type-Options: nosniff');
header('X-Frame-Options: DENY');
header('Referrer-Policy: same-origin');
header("Content-Security-Policy: default-src 'none'; frame-ancestors 'none'; base-uri 'none'");

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    header('Allow: POST');
    json_response(['ok' => false, 'error' => 'Method Not Allowed'], 405);
}

$config = is_file(__DIR__ . '/config.php') ? require __DIR__ . '/config.php' : [];
$allowedOrigins = $config['CONTACT_ALLOWED_ORIGINS'] ?? [
    'https://abc-materia.sakura.ne.jp',
    'https://zenkai-os.jp',
    'https://www.zenkai-os.jp',
];
$origin = rtrim((string)($_SERVER['HTTP_ORIGIN'] ?? ''), '/');
$referer = (string)($_SERVER['HTTP_REFERER'] ?? '');
if (($origin !== '' && !in_array($origin, $allowedOrigins, true))
    || ($origin === '' && $referer !== '' && !referer_is_allowed($referer, $allowedOrigins))) {
    json_response(['ok' => false, 'error' => 'リクエストを確認できませんでした。'], 403);
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

$postedToken = (string)($_POST['csrf_token'] ?? '');
$postedStartedAt = (int)($_POST['form_started_at'] ?? 0);
if (!consume_form_token($_SESSION, $postedToken, $postedStartedAt, time())) {
    json_response(['ok' => false, 'error' => '画面を再読み込みして、もう一度お試しください。'], 403);
}

if (trim((string)($_POST['website'] ?? '')) !== '') {
    json_response(['ok' => true], 200);
}

$ip = (string)($_SERVER['REMOTE_ADDR'] ?? 'unknown');
if (!rate_limit($ip, 5, 1800)) {
    json_response(['ok' => false, 'error' => '送信回数が多すぎます。時間をおいてお試しください。'], 429);
}

$validation = validate_fields($_POST);
if (!$validation['ok']) {
    json_response(['ok' => false, 'error' => '入力内容をご確認ください。', 'fields' => $validation['errors']], 422);
}
$data = $validation['data'];

$attachment = null;
if (isset($_FILES['attachment']) && (int)$_FILES['attachment']['error'] !== UPLOAD_ERR_NO_FILE) {
    $file = $_FILES['attachment'];
    if ((int)$file['error'] !== UPLOAD_ERR_OK || !is_uploaded_file((string)$file['tmp_name'])) {
        json_response(['ok' => false, 'error' => upload_error_message((int)$file['error'])], 422);
    }
    $attachment = inspect_attachment_file((string)$file['tmp_name'], (string)$file['name'], (int)$file['size']);
    if (!$attachment['ok']) {
        json_response(['ok' => false, 'error' => (string)$attachment['error']], 422);
    }
}

$labels = [
    'ai-diagnosis' => 'AI無料診断',
    'document-request' => '資料請求',
    'general' => '一般お問い合わせ',
];
$typeLabel = $labels[$data['inquiry_type']] ?? $labels['general'];
$companyLabel = $data['company_name'] !== '' ? $data['company_name'] : '会社名未記入';
$subject = '【ZENKAI AIパートナーズ／' . $typeLabel . '】' . $companyLabel . '・' . $data['contact_name'] . ' 様';
$rows = [
    ['お問い合わせ種別', $typeLabel],
    ['会社名', $companyLabel],
    ['ご担当者名', $data['contact_name']],
    ['メールアドレス', $data['email']],
    ['電話番号', $data['phone']],
];
$tableRows = '';
foreach ($rows as [$label, $value]) {
    $tableRows .= '<tr><th style="text-align:left;padding:7px 12px;color:#5b6472;border-bottom:1px solid #e5e7eb;">'
        . escape_html($label) . '</th><td style="padding:7px 12px;border-bottom:1px solid #e5e7eb;">'
        . escape_html($value) . '</td></tr>';
}
$html = '<div style="font-family:-apple-system,BlinkMacSystemFont,Segoe UI,sans-serif;color:#111827;line-height:1.7">'
    . '<h2>ZENKAI AIパートナーズ ウェブサイトからのお問い合わせ</h2><table style="border-collapse:collapse;max-width:680px;width:100%">'
    . $tableRows . '</table><h3 style="margin-top:24px">ご相談内容</h3><div style="white-space:pre-wrap;border-left:4px solid #d94255;padding:12px 16px;background:#f8fafc">'
    . escape_html($data['message']) . '</div></div>';

$payload = [
    'from' => (string)($config['CONTACT_FROM_EMAIL'] ?? 'ZENKAI AIパートナーズ <onboarding@resend.dev>'),
    'to' => [(string)($config['CONTACT_TO_EMAIL'] ?? 'info@zenkai-fudosan.com')],
    'reply_to' => $data['email'],
    'subject' => $subject,
    'html' => $html,
];
if ($attachment !== null) {
    $bytes = file_get_contents((string)$_FILES['attachment']['tmp_name']);
    if ($bytes === false) {
        json_response(['ok' => false, 'error' => '添付ファイルを読み取れませんでした。'], 422);
    }
    $payload['attachments'] = [[
        'filename' => $attachment['filename'],
        'content' => base64_encode($bytes),
    ]];
    unset($bytes);
}

$transport = (string)($config['CONTACT_TRANSPORT'] ?? 'resend');
if ($transport === 'mail') {
    $mailFrom = (string)($config['CONTACT_MAIL_FROM']
        ?? 'ZENKAI AIパートナーズ <abc-materia@abc-materia.sakura.ne.jp>');
    $nativeAttachment = isset($payload['attachments'][0]) ? [
        'filename' => (string)$payload['attachments'][0]['filename'],
        'mime' => (string)($attachment['mime'] ?? 'application/octet-stream'),
        'bytes' => (string)base64_decode((string)$payload['attachments'][0]['content'], true),
    ] : null;
    $mailMessage = build_native_mail_message($html, $mailFrom, $data['email'], $nativeAttachment);
    $encodedSubject = '=?UTF-8?B?' . base64_encode($subject) . '?=';
    if (!mail((string)$payload['to'][0], $encodedSubject, $mailMessage['body'], $mailMessage['headers'])) {
        error_log('[ZENKAI AI Partners form] PHP mail failed for recipient: ' . (string)$payload['to'][0]);
        json_response(['ok' => false, 'error' => '送信できませんでした。時間をおいて再度お試しください。'], 502);
    }
    json_response(['ok' => true], 200);
}

$apiKey = trim((string)($config['RESEND_API_KEY'] ?? ''));
if ($apiKey === '') {
    error_log('[ZENKAI AI Partners form] RESEND_API_KEY is not configured.');
    json_response(['ok' => false, 'error' => '現在送信機能を利用できません。メールでお問い合わせください。'], 503);
}

$ch = curl_init('https://api.resend.com/emails');
if ($ch === false) {
    json_response(['ok' => false, 'error' => '送信中にエラーが発生しました。'], 500);
}
curl_setopt_array($ch, [
    CURLOPT_POST => true,
    CURLOPT_HTTPHEADER => ['Content-Type: application/json', 'Authorization: Bearer ' . $apiKey],
    CURLOPT_POSTFIELDS => json_encode($payload, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES),
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_CONNECTTIMEOUT => 8,
    CURLOPT_TIMEOUT => 35,
]);
$response = curl_exec($ch);
$status = (int)curl_getinfo($ch, CURLINFO_HTTP_CODE);
$error = curl_error($ch);
curl_close($ch);
if ($response === false || $status < 200 || $status >= 300) {
    error_log('[ZENKAI AI Partners form] mail delivery failed status=' . $status . ' error=' . $error);
    json_response(['ok' => false, 'error' => '送信できませんでした。時間をおいて再度お試しください。'], 502);
}

json_response(['ok' => true], 200);

function referer_is_allowed(string $referer, array $allowedOrigins): bool
{
    $parts = parse_url($referer);
    if (!is_array($parts) || empty($parts['scheme']) || empty($parts['host'])) {
        return false;
    }
    $origin = strtolower($parts['scheme'] . '://' . $parts['host'] . (isset($parts['port']) ? ':' . $parts['port'] : ''));
    return in_array($origin, $allowedOrigins, true);
}

function rate_limit(string $ip, int $limit, int $windowSeconds): bool
{
    $dir = sys_get_temp_dir() . DIRECTORY_SEPARATOR . 'zenkai-os-form-rate';
    if (!is_dir($dir) && !@mkdir($dir, 0700, true) && !is_dir($dir)) {
        return false;
    }
    $path = $dir . DIRECTORY_SEPARATOR . hash('sha256', $ip . '|zenkai-os04') . '.json';
    $handle = @fopen($path, 'c+');
    if ($handle === false || !flock($handle, LOCK_EX)) {
        if (is_resource($handle)) fclose($handle);
        return false;
    }
    $raw = stream_get_contents($handle);
    $timestamps = json_decode($raw ?: '[]', true);
    $timestamps = is_array($timestamps) ? array_values(array_filter($timestamps, static fn($t): bool => is_int($t) && $t > time() - $windowSeconds)) : [];
    $allowed = count($timestamps) < $limit;
    if ($allowed) $timestamps[] = time();
    ftruncate($handle, 0);
    rewind($handle);
    fwrite($handle, json_encode($timestamps));
    fflush($handle);
    flock($handle, LOCK_UN);
    fclose($handle);
    @chmod($path, 0600);
    return $allowed;
}

function upload_error_message(int $code): string
{
    return in_array($code, [UPLOAD_ERR_INI_SIZE, UPLOAD_ERR_FORM_SIZE], true)
        ? '添付ファイルは15MB以内にしてください。'
        : '添付ファイルを受け取れませんでした。';
}

function json_response(array $data, int $status): never
{
    http_response_code($status);
    echo json_encode($data, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    exit;
}
