<?php

class AuditLog {
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
            error_log("AuditLog Connection error: " . $exception->getMessage());
        }
    }

    public function log($userId, $action, $details = null) {
        if (!$this->conn) return false;

        $ip = $_SERVER['REMOTE_ADDR'] ?? 'unknown';
        
        $query = "INSERT INTO cs_activity_logs (user_id, action, details, ip_address) 
                  VALUES (:user_id, :action, :details, :ip)";
        
        $stmt = $this->conn->prepare($query);
        $stmt->bindValue(':user_id', $userId, is_null($userId) ? PDO::PARAM_NULL : PDO::PARAM_INT);
        $stmt->bindValue(':action', $action);
        $stmt->bindValue(':details', $details);
        $stmt->bindValue(':ip', $ip);
        
        return $stmt->execute();
    }

    public function getLogs($limit = 100) {
        if (!$this->conn) return [];

        $query = "SELECT l.*, u.username FROM cs_activity_logs l 
                  LEFT JOIN cs_users u ON l.user_id = u.id 
                  ORDER BY l.created_at DESC LIMIT :limit";
        
        $stmt = $this->conn->prepare($query);
        $stmt->bindValue(':limit', (int)$limit, PDO::PARAM_INT);
        $stmt->execute();
        
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }
}
