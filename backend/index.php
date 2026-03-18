<?php

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");
header("Content-Type: application/json; charset=UTF-8");

// Handle preflight requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

$request_method = $_SERVER['REQUEST_METHOD'];
$request_uri = $_SERVER['REQUEST_URI'];
$parsed_uri = parse_url($request_uri, PHP_URL_PATH);

// Basic routing using parsed URI to avoid trailing slash and subdirectory mismatch
if (strpos($parsed_uri, '/login') !== false && $request_method === 'POST') {
    require_once __DIR__ . '/controllers/AuthController.php';
    $authController = new AuthController();
    $authController->login();
} elseif (strpos($parsed_uri, '/register') !== false && $request_method === 'POST') {
    require_once __DIR__ . '/controllers/AuthController.php';
    $authController = new AuthController();
    $authController->register();
} elseif (strpos($parsed_uri, '/api') !== false || strpos($parsed_uri, '/modules') !== false || strpos($parsed_uri, '/users') !== false) {
    // If it hits /api or specifically known endpoints, route to api.php
    require_once __DIR__ . '/routes/api.php';
} else {
    // 404 Not Found
    http_response_code(404);
    echo json_encode(['error' => 'Endpoint not found or method not allowed']);
}
