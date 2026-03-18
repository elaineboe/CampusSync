<?php

require_once __DIR__ . '/../utils/Response.php';
require_once __DIR__ . '/AuthMiddleware.php';

class RoleMiddleware {
    public static function authorize($allowed_roles) {
        $user = AuthMiddleware::authenticate();
        
        if (!in_array($user['role'], $allowed_roles)) {
            Response::error('Forbidden: insufficient permissions', 403);
        }

        return true;
    }
}
