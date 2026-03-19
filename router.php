<?php
// router.php - (seu código atual, igual você já tem)
$request = $_SERVER['REQUEST_URI'];
$request = strtok($request, '?');

if ($request == '/') {
    include __DIR__ . '/frontend/index.html';
    exit;
}

if ($request == '/dashboard') {
    include __DIR__ . '/frontend/dashboard.html';
    exit;
}

if ($request == '/admin') {
    include __DIR__ . '/frontend/admin.html';
    exit;
}

$file = __DIR__ . '/frontend' . $request;
if (file_exists($file) && is_file($file)) {
    header('Content-Type: text/html');
    readfile($file);
    exit;
}

http_response_code(404);
echo "Página não encontrada";
exit;
?>