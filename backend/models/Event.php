<?php

class Event {
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
            // Suppress printing the error strictly to output so it doesn't break JSON response
            error_log("Event Connection error: " . $exception->getMessage());
        }
    }

    public function getConn() {
        return $this->conn;
    }

    public function getUserEvents($userId) {
        if (!$this->conn) return [];
        
        // Dynamic Check: See if Timebox 7 migration (is_deleted column) exists
        $hasDeletedCol = false;
        try {
            $check = $this->conn->query("SHOW COLUMNS FROM cs_events LIKE 'is_deleted'");
            $hasDeletedCol = $check->rowCount() > 0;
        } catch (Exception $e) { }

        // Fetch global events (module_id IS NULL), events for enrolled modules, and events created by this user.
        $deletedFilter = $hasDeletedCol ? "AND (e.is_deleted != 1 OR e.is_deleted IS NULL)" : "";
        
        $query = "
            SELECT e.id, e.title, e.description, e.event_type, e.location, e.start_time, e.end_time, e.module_id, e.created_by
            FROM cs_events e
            LEFT JOIN cs_user_module um ON e.module_id = um.module_id AND um.user_id = :user_id
            WHERE (e.module_id IS NULL OR um.user_id IS NOT NULL OR e.created_by = :user_id) 
            $deletedFilter
            ORDER BY e.start_time ASC
        ";
        
        $stmt = $this->conn->prepare($query);
        $stmt->bindValue(':user_id', $userId);
        $stmt->execute();
        
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public function getEventById($id) {
        if (!$this->conn) return null;

        // Dynamic Check
        $hasDeletedCol = false;
        try {
            $check = $this->conn->query("SHOW COLUMNS FROM cs_events LIKE 'is_deleted'");
            $hasDeletedCol = $check->rowCount() > 0;
        } catch (Exception $e) { }

        $deletedFilter = $hasDeletedCol ? "AND (is_deleted != 1 OR is_deleted IS NULL)" : "";
        $query = "SELECT * FROM cs_events WHERE id = :id $deletedFilter";
        
        $stmt = $this->conn->prepare($query);
        $stmt->bindValue(':id', $id);
        $stmt->execute();
        return $stmt->fetch(PDO::FETCH_ASSOC);
    }

    public function createEvent($title, $description, $eventType, $location, $startTime, $endTime, $moduleId, $createdBy) {
        if (!$this->conn) return false;
        
        $query = "INSERT INTO cs_events (title, description, event_type, location, start_time, end_time, module_id, created_by) 
                  VALUES (:title, :description, :event_type, :location, :start_time, :end_time, :module_id, :created_by)";
        
        $stmt = $this->conn->prepare($query);
        $stmt->bindValue(':title', $title);
        $stmt->bindValue(':description', $description);
        $stmt->bindValue(':event_type', $eventType);
        $stmt->bindValue(':location', $location);
        $stmt->bindValue(':start_time', $startTime);
        $stmt->bindValue(':end_time', $endTime);
        $stmt->bindValue(':module_id', $moduleId, is_null($moduleId) ? PDO::PARAM_NULL : PDO::PARAM_INT);
        $stmt->bindValue(':created_by', $createdBy);
        
        if ($stmt->execute()) {
            return $this->conn->lastInsertId();
        }
        return false;
    }

    public function updateEvent($id, $title, $description, $eventType, $location, $startTime, $endTime, $moduleId) {
        if (!$this->conn) return false;
        
        $query = "UPDATE cs_events 
                  SET title = :title, description = :description, event_type = :event_type, location = :location, start_time = :start_time, end_time = :end_time, module_id = :module_id 
                  WHERE id = :id";
        
        $stmt = $this->conn->prepare($query);
        $stmt->bindValue(':title', $title);
        $stmt->bindValue(':description', $description);
        $stmt->bindValue(':event_type', $eventType);
        $stmt->bindValue(':location', $location);
        $stmt->bindValue(':start_time', $startTime);
        $stmt->bindValue(':end_time', $endTime);
        $stmt->bindValue(':module_id', $moduleId, is_null($moduleId) ? PDO::PARAM_NULL : PDO::PARAM_INT);
        $stmt->bindValue(':id', $id);
        
        return $stmt->execute();
    }

    public function deleteEvent($id) {
        if (!$this->conn) return false;
        
        // Dynamic Check
        $hasDeletedCol = false;
        try {
            $check = $this->conn->query("SHOW COLUMNS FROM cs_events LIKE 'is_deleted'");
            $hasDeletedCol = $check->rowCount() > 0;
        } catch (Exception $e) { }

        if ($hasDeletedCol) {
            // Multi-stage history requirement: Soft delete
            $query = "UPDATE cs_events SET is_deleted = 1 WHERE id = :id";
        } else {
            // Fallback: Hard delete if Timebox 7 migration not run
            $query = "DELETE FROM cs_events WHERE id = :id";
        }

        $stmt = $this->conn->prepare($query);
        $stmt->bindValue(':id', $id);
        
        return $stmt->execute();
    }

    public function getEventHistory($userId = null) {
        if (!$this->conn) return [];
        
        $query = "
            SELECT e.*, u.username as creator_name
            FROM cs_events e
            JOIN cs_users u ON e.created_by = u.id
        ";
        
        if ($userId) {
            $query .= " WHERE e.created_by = :user_id ";
        }
        
        $query .= " ORDER BY e.created_at DESC";
        
        $stmt = $this->conn->prepare($query);
        if ($userId) {
            $stmt->bindValue(':user_id', $userId);
        }
        $stmt->execute();
        
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    // Helper for transactions in controller
    public function beginTransaction() {
        return $this->conn->beginTransaction();
    }

    public function commit() {
        return $this->conn->commit();
    }

    public function rollBack() {
        return $this->conn->rollBack();
    }
}
