<?php

require_once __DIR__ . '/../utils/Response.php';

class AuthMiddleware {
    public static function authenticate() {
        $headers = apache_request_headers();
        
        if (!isset($headers['Authorization'])) {
            Response::error('Unauthorized', 401);
        }

        $token = str_replace('Bearer ', '', $headers['Authorization']);
        
        // Very basic mock decoding for Timebox 1
        $payload = json_decode(base64_decode($token), true);
        
        if (!$payload || !isset($payload['role'])) {
            Response::error('Invalid token', 401);
        }

        return $payload; // Return user info
    }
}
