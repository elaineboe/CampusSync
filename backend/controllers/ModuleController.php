<?php
require_once __DIR__ . '/../models/Module.php';
require_once __DIR__ . '/../models/User.php';
require_once __DIR__ . '/../utils/Response.php';
require_once __DIR__ . '/../middleware/AuthMiddleware.php';
require_once __DIR__ . '/../middleware/RoleMiddleware.php';

class ModuleController {
    public function getModules() {
        // Any authenticated user can list modules generally
        $user = AuthMiddleware::authenticate();
        ob_start();
        try {
            $moduleModel = new Module();
            $modules = $moduleModel->getAllModules();
            if (ob_get_length()) ob_end_clean();
            Response::json($modules);
        } catch (Throwable $e) {
            if (ob_get_length()) ob_end_clean();
            Response::error('Failed to fetch modules: ' . $e->getMessage(), 500);
        }
    }

    public function createModule() {
        $user = AuthMiddleware::authenticate();
        RoleMiddleware::authorize(['admin']);

        $data = json_decode(file_get_contents("php://input"));
        if (!isset($data->module_code) || !isset($data->module_name)) {
            Response::error('Module code and name are required', 400);
        }

        ob_start();
        try {
            $moduleModel = new Module();
            $moduleId = $moduleModel->createModule($data->module_code, $data->module_name, $data->description ?? null);
            
            if ($moduleId) {
                if (ob_get_length()) ob_end_clean();
                Response::json(['message' => 'Module created successfully', 'module_id' => $moduleId], 201);
            } else {
                if (ob_get_length()) ob_end_clean();
                Response::error('Failed to create module. Code might already exist.', 500);
            }
        } catch (Throwable $e) {
            if (ob_get_length()) ob_end_clean();
            Response::error('Critical error creating module: ' . $e->getMessage(), 500);
        }
    }

    public function getAssignments() {
        $user = AuthMiddleware::authenticate();
        RoleMiddleware::authorize(['admin']);

        ob_start();
        try {
            $moduleModel = new Module();
            $assignments = $moduleModel->getAssignments();
            if (ob_get_length()) ob_end_clean();
            Response::json($assignments);
        } catch (Throwable $e) {
            if (ob_get_length()) ob_end_clean();
            Response::error('Failed to fetch assignments: ' . $e->getMessage(), 500);
        }
    }

    public function assignModules() {
        $admin = AuthMiddleware::authenticate();
        RoleMiddleware::authorize(['admin']);

        $data = json_decode(file_get_contents("php://input"));
        if (!isset($data->user_id) || !isset($data->module_ids) || !is_array($data->module_ids)) {
            Response::error('User ID and an array of Module IDs are required', 400);
        }

        ob_start();
        try {
            $moduleModel = new Module();
            // Fetch user to determine their role
            $stmt = $moduleModel->getConn()->prepare("SELECT role FROM cs_users WHERE id = :id");
            $stmt->bindValue(':id', $data->user_id, PDO::PARAM_INT);
            $stmt->execute();
            $targetUser = $stmt->fetch(PDO::FETCH_ASSOC);

            if (!$targetUser) {
                if (ob_get_length()) ob_end_clean();
                Response::error('Target user not found', 404);
            }

            // A student user is a 'student' in a module, otherwise 'lecturer'
            $roleInModule = ($targetUser['role'] === 'student') ? 'student' : 'lecturer';

            $moduleModel->beginTransaction();
            $successCount = 0;
            foreach ($data->module_ids as $moduleId) {
                if ($moduleModel->assignModuleToUser($data->user_id, $moduleId, $roleInModule)) {
                    $successCount++;
                }
            }
            $moduleModel->commit();

            if (ob_get_length()) ob_end_clean();
            Response::json(['message' => "$successCount module(s) assigned successfully"]);
        } catch (Throwable $e) {
            if (isset($moduleModel)) @$moduleModel->rollBack();
            if (ob_get_length()) ob_end_clean();
            Response::error('Critical error assigning modules: ' . $e->getMessage(), 500);
        }
    }

    public function removeAssignment($userId, $moduleId) {
        $admin = AuthMiddleware::authenticate();
        RoleMiddleware::authorize(['admin']);

        ob_start();
        try {
            $moduleModel = new Module();
            $success = $moduleModel->removeAssignment($userId, $moduleId);
            if ($success) {
                if (ob_get_length()) ob_end_clean();
                Response::json(['message' => 'Assignment removed successfully']);
            } else {
                if (ob_get_length()) ob_end_clean();
                Response::error('Failed to remove assignment', 500);
            }
        } catch (Throwable $e) {
            if (ob_get_length()) ob_end_clean();
            Response::error('Critical error removing assignment: ' . $e->getMessage(), 500);
        }
    }

    public function deleteModule($moduleId) {
        $admin = AuthMiddleware::authenticate();
        RoleMiddleware::authorize(['admin']);

        ob_start();
        try {
            $moduleModel = new Module();
            $success = $moduleModel->deleteModule($moduleId);
            if ($success) {
                if (ob_get_length()) ob_end_clean();
                Response::json(['message' => 'Module deleted successfully']);
            } else {
                if (ob_get_length()) ob_end_clean();
                Response::error('Failed to delete module or module not found', 404);
            }
        } catch (Throwable $e) {
            if (ob_get_length()) ob_end_clean();
            Response::error('Critical error deleting module: ' . $e->getMessage(), 500);
        }
    }

    public function getStudentsByModule($moduleId) {
        $user = AuthMiddleware::authenticate();
        // Lecturers and Admins can see students in a module
        if ($user['role'] !== 'lecturer' && $user['role'] !== 'admin') {
            Response::error('Unauthorized', 403);
        }

        ob_start();
        try {
            $moduleModel = new Module();
            $students = $moduleModel->getStudentsByModule($moduleId);
            if (ob_get_length()) ob_end_clean();
            Response::json($students);
        } catch (Throwable $e) {
            if (ob_get_length()) ob_end_clean();
            Response::error('Failed to fetch students for module: ' . $e->getMessage(), 500);
        }
    }
}
