<?php

class Module {
    private $conn;

    public function __construct($pdo = null) {
        if ($pdo) {
            $this->conn = $pdo;
            return;
        }
        $config = require __DIR__ . '/../config/database.php';
        $host = $config['db_host'];
        $db_name = $config['db_name'];
        $username = $config['db_user'];
        $password = $config['db_pass'];

        try {
            $this->conn = new PDO("mysql:host={$host};dbname={$db_name};charset=utf8", $username, $password);
            $this->conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
        } catch(PDOException $exception) {
            error_log("Module Connection error: " . $exception->getMessage());
        }
    }

    public function getConn() {
        return $this->conn;
    }

    public function beginTransaction() { return $this->conn->beginTransaction(); }
    public function commit() { return $this->conn->commit(); }
    public function rollBack() { return $this->conn->rollBack(); }

    public function createModule($code, $name, $description = null) {
        if (!$this->conn) return false;
        $query = "INSERT INTO cs_modules (module_code, module_name, description) VALUES (:code, :name, :description)";
        $stmt = $this->conn->prepare($query);
        $stmt->bindValue(':code', $code);
        $stmt->bindValue(':name', $name);
        $stmt->bindValue(':description', $description);
        
        if ($stmt->execute()) {
            return $this->conn->lastInsertId();
        }
        return false;
    }

    public function getAllModules() {
        if (!$this->conn) return [];
        $query = "SELECT * FROM cs_modules ORDER BY module_code ASC";
        $stmt = $this->conn->prepare($query);
        $stmt->execute();
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public function getAssignments() {
        if (!$this->conn) return [];
        $query = "
            SELECT um.user_id, um.module_id, um.role_in_module,
                   u.first_name, u.last_name, u.role as user_type,
                   m.module_code, m.module_name
            FROM cs_user_module um
            JOIN cs_users u ON um.user_id = u.id
            JOIN cs_modules m ON um.module_id = m.id
            ORDER BY u.last_name ASC, m.module_code ASC
        ";
        $stmt = $this->conn->prepare($query);
        $stmt->execute();
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public function assignModuleToUser($userId, $moduleId, $roleInModule) {
        if (!$this->conn) return false;
        // Use INSERT IGNORE to prevent duplicate entry errors
        $query = "INSERT IGNORE INTO cs_user_module (user_id, module_id, role_in_module) VALUES (:user_id, :module_id, :role)";
        $stmt = $this->conn->prepare($query);
        $stmt->bindValue(':user_id', $userId, PDO::PARAM_INT);
        $stmt->bindValue(':module_id', $moduleId, PDO::PARAM_INT);
        $stmt->bindValue(':role', $roleInModule);
        
        return $stmt->execute();
    }

    public function removeAssignment($userId, $moduleId) {
        if (!$this->conn) return false;
        $query = "DELETE FROM cs_user_module WHERE user_id = :user_id AND module_id = :module_id";
        $stmt = $this->conn->prepare($query);
        $stmt->bindValue(':user_id', $userId, PDO::PARAM_INT);
        $stmt->bindValue(':module_id', $moduleId, PDO::PARAM_INT);
        
        return $stmt->execute();
    }

    public function deleteModule($moduleId) {
        if (!$this->conn) return false;
        $query = "DELETE FROM cs_modules WHERE id = :module_id";
        $stmt = $this->conn->prepare($query);
        $stmt->bindValue(':module_id', $moduleId, PDO::PARAM_INT);
        
        return $stmt->execute();
    }

    public function getStudentsByModule($moduleId) {
        if (!$this->conn) return [];
        $query = "
            SELECT u.id, u.first_name, u.last_name, u.username, u.email
            FROM cs_user_module um
            JOIN cs_users u ON um.user_id = u.id
            WHERE um.module_id = :module_id AND u.role = 'student'
            ORDER BY u.last_name ASC, u.first_name ASC
        ";
        $stmt = $this->conn->prepare($query);
        $stmt->bindValue(':module_id', $moduleId, PDO::PARAM_INT);
        $stmt->execute();
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }
}
