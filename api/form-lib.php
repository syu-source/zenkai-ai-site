<?php
declare(strict_types=1);

const FORM_MAX_FILE_BYTES = 15728640;
const FORM_MAX_IMAGE_PIXELS = 40000000;
const FORM_TOKEN_MAX_AGE = 7200;
const FORM_TOKEN_MAX_ACTIVE = 10;

/** @return array{csrf_token:string,form_started_at:int} */
function issue_form_token(array &$session, int $now): array
{
    $tokens = isset($session['form_tokens']) && is_array($session['form_tokens'])
        ? $session['form_tokens']
        : [];
    $tokens = array_filter(
        $tokens,
        static fn(mixed $startedAt): bool => is_int($startedAt) && $startedAt >= $now - FORM_TOKEN_MAX_AGE
    );
    if (count($tokens) >= FORM_TOKEN_MAX_ACTIVE) {
        asort($tokens, SORT_NUMERIC);
        $tokens = array_slice($tokens, -(FORM_TOKEN_MAX_ACTIVE - 1), null, true);
    }

    $token = bin2hex(random_bytes(32));
    $tokens[$token] = $now;
    $session['form_tokens'] = $tokens;

    return ['csrf_token' => $token, 'form_started_at' => $now];
}

function consume_form_token(array &$session, string $postedToken, int $postedStartedAt, int $now): bool
{
    if ($postedToken === '' || !isset($session['form_tokens']) || !is_array($session['form_tokens'])) {
        return false;
    }

    $matchedToken = null;
    $startedAt = 0;
    foreach ($session['form_tokens'] as $storedToken => $storedStartedAt) {
        if (is_string($storedToken) && hash_equals($storedToken, $postedToken)) {
            $matchedToken = $storedToken;
            $startedAt = is_int($storedStartedAt) ? $storedStartedAt : 0;
            break;
        }
    }
    if ($matchedToken === null) {
        return false;
    }

    unset($session['form_tokens'][$matchedToken]);
    $elapsed = $now - $startedAt;
    return $startedAt > 0
        && $postedStartedAt === $startedAt
        && $elapsed >= 2
        && $elapsed <= FORM_TOKEN_MAX_AGE;
}

/** @return array{ok:bool,data:array<string,string>,errors:array<string,string>} */
function validate_fields(array $input): array
{
    $data = [
        'company_name' => clean_text($input['company_name'] ?? ''),
        'contact_name' => clean_text($input['contact_name'] ?? ''),
        'email' => trim((string)($input['email'] ?? '')),
        'phone' => clean_text($input['phone'] ?? ''),
        'message' => trim((string)($input['message'] ?? '')),
        'inquiry_type' => clean_text($input['inquiry_type'] ?? 'ai-diagnosis'),
        'privacy_consent' => (string)($input['privacy_consent'] ?? ''),
    ];
    $errors = [];

    if (mb_strlen($data['company_name']) > 200) {
        $errors['company_name'] = '会社名は200文字以内で入力してください。';
    }
    if ($data['contact_name'] === '' || mb_strlen($data['contact_name']) > 100) {
        $errors['contact_name'] = 'ご担当者名を100文字以内で入力してください。';
    }
    if ($data['email'] === '' || strlen($data['email']) > 254
        || preg_match('/[\r\n]/', $data['email'])
        || !filter_var($data['email'], FILTER_VALIDATE_EMAIL)) {
        $errors['email'] = '正しいメールアドレスを入力してください。';
    }
    if ($data['phone'] !== '' && (mb_strlen($data['phone']) > 30
        || !preg_match('/^[0-9０-９+＋()（）\-ー―−\s]+$/u', $data['phone']))) {
        $errors['phone'] = '正しい電話番号を入力してください。';
    }
    $messageLength = mb_strlen($data['message']);
    if ($messageLength < 1 || $messageLength > 4000) {
        $errors['message'] = 'ご相談内容は4000文字以内で入力してください。';
    }
    if (!in_array($data['inquiry_type'], ['ai-diagnosis', 'document-request', 'general'], true)) {
        $data['inquiry_type'] = 'general';
    }
    if ($data['privacy_consent'] !== '1') {
        $errors['privacy_consent'] = 'プライバシーポリシーへの同意が必要です。';
    }

    return ['ok' => $errors === [], 'data' => $data, 'errors' => $errors];
}

function clean_text(mixed $value): string
{
    return trim(preg_replace('/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/u', '', (string)$value) ?? '');
}

/** @return array{ok:bool,error?:string,mime?:string,extension?:string,filename?:string} */
function inspect_attachment_file(string $path, string $originalName, int $declaredSize): array
{
    if ($declaredSize <= 0 || $declaredSize > FORM_MAX_FILE_BYTES) {
        return ['ok' => false, 'error' => '添付ファイルは15MB以内にしてください。'];
    }
    if (!is_file($path) || !is_readable($path)) {
        return ['ok' => false, 'error' => '添付ファイルを確認できませんでした。'];
    }

    $actualSize = filesize($path);
    if ($actualSize === false || $actualSize <= 0 || $actualSize > FORM_MAX_FILE_BYTES || $actualSize !== $declaredSize) {
        return ['ok' => false, 'error' => '添付ファイルのサイズを確認できませんでした。'];
    }

    $extension = strtolower(pathinfo($originalName, PATHINFO_EXTENSION));
    $extension = $extension === 'jpeg' ? 'jpg' : $extension;
    $mimeByExtension = [
        'pdf' => 'application/pdf',
        'jpg' => 'image/jpeg',
        'png' => 'image/png',
        'webp' => 'image/webp',
    ];
    if (!isset($mimeByExtension[$extension])) {
        return ['ok' => false, 'error' => 'PDF、JPG、PNG、WebPのみ添付できます。'];
    }

    $finfo = new finfo(FILEINFO_MIME_TYPE);
    $mime = (string)$finfo->file($path);
    if ($mime !== $mimeByExtension[$extension]) {
        return ['ok' => false, 'error' => 'ファイルの内容と拡張子が一致しません。'];
    }

    if ($mime === 'application/pdf') {
        $handle = fopen($path, 'rb');
        $signature = $handle ? fread($handle, 5) : false;
        if (is_resource($handle)) {
            fclose($handle);
        }
        if ($signature !== '%PDF-') {
            return ['ok' => false, 'error' => '正しいPDFファイルではありません。'];
        }
        $content = file_get_contents($path);
        if ($content === false) {
            return ['ok' => false, 'error' => 'PDFファイルを確認できませんでした。'];
        }
        foreach (['/JavaScript', '/JS', '/Launch', '/EmbeddedFile', '/RichMedia'] as $marker) {
            if (stripos($content, $marker) !== false) {
                return ['ok' => false, 'error' => '安全上、このPDFは添付できません。'];
            }
        }
    } else {
        $image = @getimagesize($path);
        if ($image === false || ($image['mime'] ?? '') !== $mime) {
            return ['ok' => false, 'error' => '画像ファイルを読み取れません。'];
        }
        $width = (int)$image[0];
        $height = (int)$image[1];
        if ($width < 1 || $height < 1 || $width > 20000 || $height > 20000 || ($width * $height) > FORM_MAX_IMAGE_PIXELS) {
            return ['ok' => false, 'error' => '画像サイズが大きすぎます。'];
        }
    }

    $baseName = pathinfo($originalName, PATHINFO_FILENAME);
    $baseName = preg_replace('/[^\p{L}\p{N}._-]+/u', '-', $baseName) ?: 'attachment';
    $baseName = mb_substr(trim($baseName, '.-_'), 0, 80) ?: 'attachment';
    return [
        'ok' => true,
        'mime' => $mime,
        'extension' => $extension,
        'filename' => $baseName . '.' . $extension,
    ];
}

function escape_html(string $value): string
{
    return htmlspecialchars($value, ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8');
}

/**
 * @param null|array{filename:string,mime:string,bytes:string} $attachment
 * @return array{headers:string,body:string}
 */
function build_native_mail_message(
    string $html,
    string $from,
    string $replyTo,
    ?array $attachment
): array {
    $baseHeaders = [
        'MIME-Version: 1.0',
        'From: ' . str_replace(["\r", "\n"], '', $from),
        'Reply-To: ' . str_replace(["\r", "\n"], '', $replyTo),
    ];

    if ($attachment === null) {
        $baseHeaders[] = 'Content-Type: text/html; charset=UTF-8';
        $baseHeaders[] = 'Content-Transfer-Encoding: 8bit';
        return ['headers' => implode("\r\n", $baseHeaders), 'body' => $html];
    }

    $boundary = '=_ZENKAI_' . bin2hex(random_bytes(16));
    $baseHeaders[] = 'Content-Type: multipart/mixed; boundary="' . $boundary . '"';
    $encodedFilename = rawurlencode($attachment['filename']);
    $body = '--' . $boundary . "\r\n"
        . "Content-Type: text/html; charset=UTF-8\r\n"
        . "Content-Transfer-Encoding: 8bit\r\n\r\n"
        . $html . "\r\n"
        . '--' . $boundary . "\r\n"
        . 'Content-Type: ' . $attachment['mime'] . "\r\n"
        . "Content-Transfer-Encoding: base64\r\n"
        . "Content-Disposition: attachment; filename*=UTF-8''" . $encodedFilename . "\r\n\r\n"
        . chunk_split(base64_encode($attachment['bytes']))
        . '--' . $boundary . "--\r\n";

    return ['headers' => implode("\r\n", $baseHeaders), 'body' => $body];
}
