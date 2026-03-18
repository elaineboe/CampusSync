<?php

class User {
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
            error_log("User Connection error: " . $exception->getMessage());
        }
    }

    public function getConn() {
        return $this->conn;
    }

    public function getAllUsers() {
        if (!$this->conn) return [];
        // Fallback gracefully if the `is_active` migration hasn't been run yet
        try {
            // First check if the column exists
            $this->conn->query("SELECT is_active FROM cs_users LIMIT 1");
            $query = "SELECT id, username, first_name, last_name, email, role, is_active FROM cs_users ORDER BY last_name ASC, first_name ASC";
            $stmt = $this->conn->prepare($query);
        } catch (PDOException $e) {
            // Column doesn't exist, fallback to old query and spoof is_active = 1
            $query = "SELECT id, username, first_name, last_name, email, role, 1 AS is_active FROM cs_users ORDER BY last_name ASC, first_name ASC";
            $stmt = $this->conn->prepare($query);
        }
        
        $stmt->execute();
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public function updateUserRole($userId, $newRole) {
        if (!$this->conn) return false;
        
        $allowedRoles = ['student', 'lecturer', 'admin'];
        if (!in_array($newRole, $allowedRoles)) return false;

        $query = "UPDATE cs_users SET role = :role WHERE id = :id";
        $stmt = $this->conn->prepare($query);
        $stmt->bindValue(':role', $newRole);
        $stmt->bindValue(':id', $userId, PDO::PARAM_INT);
        return $stmt->execute();
    }

    public function updateUserStatus($userId, $isActive) {
        if (!$this->conn) return false;
        
        $query = "UPDATE cs_users SET is_active = :is_active WHERE id = :id";
        $stmt = $this->conn->prepare($query);
        $stmt->bindValue(':is_active', $isActive ? 1 : 0, PDO::PARAM_INT);
        $stmt->bindValue(':id', $userId, PDO::PARAM_INT);
        return $stmt->execute();
    }
}
