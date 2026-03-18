<?php
require_once __DIR__ . '/../models/User.php';
require_once __DIR__ . '/../utils/Response.php';
require_once __DIR__ . '/../middleware/AuthMiddleware.php';
require_once __DIR__ . '/../middleware/RoleMiddleware.php';

class UserController {
    public function getAllUsers() {
        // Enforce Admin only
        $user = AuthMiddleware::authenticate();
        RoleMiddleware::authorize(['admin']);

        ob_start();
        try {
            $userModel = new User();
            $users = $userModel->getAllUsers();
            
            if (ob_get_length()) ob_end_clean();
            Response::json($users);
        } catch (Throwable $e) {
            if (ob_get_length()) ob_end_clean();
            Response::error('Failed to fetch users: ' . $e->getMessage(), 500);
        }
    }

    public function createUser() {
        // Enforce Admin only
        $adminMode = AuthMiddleware::authenticate();
        RoleMiddleware::authorize(['admin']);

        // Since we are leveraging AuthController's register logic for admins, 
        // we can just forward the request to AuthController->register()
        require_once __DIR__ . '/AuthController.php';
        $auth = new AuthController();
        $auth->register(true); // pass true or handle internally to auto-approve without open registration
    }

    public function updateRole($userId) {
        $admin = AuthMiddleware::authenticate();
        RoleMiddleware::authorize(['admin']);

        $data = json_decode(file_get_contents("php://input"));
        if (!isset($data->role)) {
            Response::error('Role is required', 400);
        }

        ob_start();
        try {
            $userModel = new User();
            $success = $userModel->updateUserRole($userId, $data->role);
            if ($success) {
                if (ob_get_length()) ob_end_clean();
                Response::json(['message' => 'User role updated successfully']);
            } else {
                if (ob_get_length()) ob_end_clean();
                Response::error('Failed to update role or invalid role', 400);
            }
        } catch (Throwable $e) {
            if (ob_get_length()) ob_end_clean();
            Response::error('Critical error updating role: ' . $e->getMessage(), 500);
        }
    }

    public function updateStatus($userId) {
        $admin = AuthMiddleware::authenticate();
        RoleMiddleware::authorize(['admin']);

        $data = json_decode(file_get_contents("php://input"));
        if (!isset($data->is_active)) {
            Response::error('Status is required', 400);
        }

        ob_start();
        try {
            $userModel = new User();
            $success = $userModel->updateUserStatus($userId, $data->is_active);
            if ($success) {
                if (ob_get_length()) ob_end_clean();
                Response::json(['message' => 'User status updated successfully']);
            } else {
                if (ob_get_length()) ob_end_clean();
                Response::error('Failed to update status', 400);
            }
        } catch (Throwable $e) {
            if (ob_get_length()) ob_end_clean();
            Response::error('Critical error updating status: ' . $e->getMessage(), 500);
        }
    }

    public function getUserModules($userId) {
        $user = AuthMiddleware::authenticate();
        // Lecturers and Admins can see a student's modules
        if ($user['role'] !== 'lecturer' && $user['role'] !== 'admin') {
            Response::error('Unauthorized', 403);
        }

        ob_start();
        try {
            $userModel = new User();
            $modules = $userModel->getUserModules($userId);
            if (ob_get_length()) ob_end_clean();
            Response::json($modules);
        } catch (Throwable $e) {
            if (ob_get_length()) ob_end_clean();
            Response::error('Failed to fetch user modules: ' . $e->getMessage(), 500);
        }
    }
}
