<?php
declare(strict_types=1);
ini_set('display_errors', '0');

header('Content-Type: application/json; charset=UTF-8');
header('Cache-Control: no-store');
header('X-Content-Type-Options: nosniff');

function respond(int $status, array $body): void
{
    http_response_code($status);
    echo json_encode($body, JSON_UNESCAPED_UNICODE);
    exit;
}

$config = require __DIR__ . '/contact-config.php';
if (!$config['enabled'] || !function_exists('mail')) {
    respond(503, ['success' => false, 'message' => 'Das Formular wird gerade eingerichtet. Bitte schreib uns direkt per E-Mail.']);
}

$method = $_SERVER['REQUEST_METHOD'] ?? '';
if (!in_array($method, ['GET', 'POST'], true)) {
    header('Allow: GET, POST');
    respond(405, ['success' => false]);
}

// Nur die eigenen konfigurierten Website-Adressen dürfen den Endpunkt nutzen.
$host = strtolower(explode(':', $_SERVER['HTTP_HOST'] ?? '')[0]);
if (!in_array($host, $config['allowed_hosts'], true)) respond(403, ['success' => false]);
if (isset($_SERVER['HTTP_ORIGIN'])) {
    $origin = parse_url($_SERVER['HTTP_ORIGIN']);
    if (!is_array($origin) || ($origin['scheme'] ?? '') !== 'https' || strtolower($origin['host'] ?? '') !== $host) {
        respond(403, ['success' => false]);
    }
}

ini_set('session.use_strict_mode', '1');
session_set_cookie_params(['httponly' => true, 'secure' => true, 'samesite' => 'Strict', 'path' => '/']);
if (!session_start()) respond(503, ['success' => false]);
if (empty($_SESSION['contact_token'])) $_SESSION['contact_token'] = bin2hex(random_bytes(32));
$token = $_SESSION['contact_token'];
session_write_close();

if ($method === 'GET') respond(200, ['success' => true, 'token' => $token]);
if ((int) ($_SERVER['CONTENT_LENGTH'] ?? 0) > 32768) respond(413, ['success' => false]);
if (!is_string($_POST['_token'] ?? null) || !hash_equals($token, $_POST['_token'])) {
    respond(403, ['success' => false]);
}
if (!is_string($_POST['website'] ?? '') || trim($_POST['website'] ?? '') !== '') {
    respond(422, ['success' => false]);
}

$limits = ['name' => 120, 'email' => 254, 'company' => 160, 'message' => 6000];
$fields = [];
foreach ($limits as $name => $limit) {
    $value = $_POST[$name] ?? '';
    if (!is_string($value) || preg_match('//u', $value) !== 1 || strlen($value) > $limit * 4) {
        respond(422, ['success' => false]);
    }
    $value = trim($value);
    if (preg_match_all('/./us', $value) > $limit || preg_match('/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/', $value)) {
        respond(422, ['success' => false]);
    }
    if ($name !== 'company' && $value === '') respond(422, ['success' => false]);
    if ($name !== 'message' && preg_match('/[\r\n\x00]/', $value)) respond(422, ['success' => false]);
    $fields[$name] = $value;
}
if (!filter_var($fields['email'], FILTER_VALIDATE_EMAIL)) respond(422, ['success' => false]);
$services = $_POST['services'] ?? [];
$allowedServices = ['Interaktive Karte', 'Fotografie', 'Video', 'Webdesign', 'Gemeinsam herausfinden'];
if (!is_array($services) || count($services) > count($allowedServices)) respond(422, ['success' => false]);
foreach ($services as $service) {
    if (!is_string($service) || !in_array($service, $allowedServices, true)) respond(422, ['success' => false]);
}
$serviceText = $services ? implode(', ', array_unique($services)) : 'Keine Auswahl';
foreach (['sender', 'recipient'] as $key) {
    if (!filter_var($config[$key], FILTER_VALIDATE_EMAIL) || preg_match('/[\r\n]/', $config[$key])) {
        respond(503, ['success' => false]);
    }
}

// Mengenbegrenzung ausserhalb des Webverzeichnisses. Keine Nachrichten oder Roh-IP speichern.
$ratePath = sys_get_temp_dir() . '/1kreativbuero-contact-' . hash('sha256', __DIR__) . '.json';
$handle = fopen($ratePath, 'c+');
if (!$handle || !flock($handle, LOCK_EX)) respond(503, ['success' => false]);
chmod($ratePath, 0600);
$state = json_decode(stream_get_contents($handle), true) ?: ['global' => [], 'clients' => []];
$now = time();
$state['global'] = array_values(array_filter($state['global'], static fn($time) => $time > $now - 3600));
foreach ($state['clients'] as $key => $times) {
    $state['clients'][$key] = array_values(array_filter($times, static fn($time) => $time > $now - 900));
    if (!$state['clients'][$key]) unset($state['clients'][$key]);
}
$client = hash('sha256', __DIR__ . '|' . ($_SERVER['REMOTE_ADDR'] ?? 'unknown'));
if (count($state['global']) >= 30 || count($state['clients'][$client] ?? []) >= 5) {
    flock($handle, LOCK_UN);
    fclose($handle);
    header('Retry-After: 900');
    respond(429, ['success' => false, 'message' => 'Bitte warte etwas, bevor du erneut eine Nachricht sendest.']);
}
$state['global'][] = $now;
$state['clients'][$client][] = $now;
$encoded = json_encode($state);
rewind($handle);
$saved = ftruncate($handle, 0) && fwrite($handle, $encoded) === strlen($encoded) && fflush($handle);
flock($handle, LOCK_UN);
fclose($handle);
if (!$saved) respond(503, ['success' => false]);

$subject = '=?UTF-8?B?' . base64_encode('Kontakt 1Kreativbüro: ' . ($services ? $serviceText : 'Neue Anfrage')) . '?=';
$body = "Neue Kontaktanfrage\n\nName: {$fields['name']}\nE-Mail: {$fields['email']}\nFirma: {$fields['company']}\nInteresse: {$serviceText}\n\n{$fields['message']}\n";
$headers = [
    'From' => '1Kreativbuero <' . $config['sender'] . '>',
    'Reply-To' => $fields['email'],
    'MIME-Version' => '1.0',
    'Content-Type' => 'text/plain; charset=UTF-8',
    'Content-Transfer-Encoding' => '8bit',
];
// Der Absender ist fest konfiguriert; Besucherdaten werden nie als Absender eingesetzt.
if (!mail($config['recipient'], $subject, $body, $headers)) {
    respond(502, ['success' => false]);
}
respond(200, ['success' => true]);
