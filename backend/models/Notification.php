<?php

class Notification {
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
            error_log("Notification Connection error: " . $exception->getMessage());
        }
    }

    public function getUserNotifications($userId) {
        if (!$this->conn) return [];
        
        $query = "
            SELECT id, event_id, message, is_read, created_at 
            FROM cs_notifications 
            WHERE user_id = :user_id 
            ORDER BY created_at DESC 
            LIMIT 50
        ";
        
        $stmt = $this->conn->prepare($query);
        $stmt->bindValue(':user_id', $userId);
        $stmt->execute();
        
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public function markAsRead($notificationId, $userId) {
        if (!$this->conn) return false;
        
        $query = "UPDATE cs_notifications SET is_read = 1 WHERE id = :id AND user_id = :user_id";
        
        $stmt = $this->conn->prepare($query);
        $stmt->bindValue(':id', $notificationId);
        $stmt->bindValue(':user_id', $userId);
        
        return $stmt->execute();
    }

    public function notifyUsersForEvent($eventId, $moduleId, $actionType, $eventTitle, $creatorId = null, $eventType = 'event', $startTime = null) {
        if (!$this->conn) return false;
        
        $formattedTime = "";
        if ($startTime) {
            try {
                $date = new DateTime($startTime);
                $formattedTime = $date->format('d M Y, H:i');
            } catch (Exception $e) {
                $formattedTime = $startTime;
            }
        }

        $message = "";
        switch ($actionType) {
            case 'created':
                $message = "'{$eventTitle}' {$eventType} session on {$formattedTime} has been scheduled.";
                break;
            case 'updated/changed':
                $message = "Schedule is changed for '{$eventTitle}' {$eventType} session to {$formattedTime}.";
                break;
            case 'deleted/cancelled':
                $message = "The '{$eventTitle}' {$eventType} session on {$formattedTime} has been cancelled.";
                break;
            default:
                $message = "There has been an update regarding the '{$eventTitle}' {$eventType}.";
        }
        
        
        // Notify the creator directly if provided
        if ($creatorId !== null) {
            $creatorMessage = "You have successfully {$actionType} the event '{$eventTitle}'.";
            $queryCreator = "INSERT INTO cs_notifications (user_id, event_id, message) VALUES (:user_id, :event_id, :message)";
            $stmtCreator = $this->conn->prepare($queryCreator);
            $stmtCreator->bindValue(':user_id', $creatorId);
            $stmtCreator->bindValue(':event_id', $eventId);
            $stmtCreator->bindValue(':message', $creatorMessage);
            $stmtCreator->execute();
        }

        if ($moduleId === null) {
            // Global event: Notify active students (or everyone, depending on requirements. Assuming all students for global)
            $query = "
                INSERT INTO cs_notifications (user_id, event_id, message)
                SELECT id, :event_id, :message FROM cs_users WHERE role = 'student'
            ";
            $stmt = $this->conn->prepare($query);
            $stmt->bindValue(':event_id', $eventId);
            $stmt->bindValue(':message', $message);
            return $stmt->execute();
        } else {
            // Module specific event: Notify enrolled students
            $query = "
                INSERT INTO cs_notifications (user_id, event_id, message)
                SELECT user_id, :event_id, :message FROM cs_user_module WHERE module_id = :module_id AND role_in_module = 'student'
            ";
            $stmt = $this->conn->prepare($query);
            $stmt->bindValue(':event_id', $eventId);
            $stmt->bindValue(':message', $message);
            $stmt->bindValue(':module_id', $moduleId);
            return $stmt->execute();
        }
    }

    // ---------------------------------------------------
    // Supervision Notifications
    // ---------------------------------------------------
    public function notifySupervisionAction($lecturerId, $studentId, $action, $startTime, $studentName) {
        if (!$this->conn) return false;

        $formattedTime = "";
        if ($startTime) {
            try {
                $date = new DateTime($startTime);
                $formattedTime = $date->format('d M Y, H:i');
            } catch (Exception $e) {
                $formattedTime = $startTime;
            }
        }

        $lecturerMessage = "";
        $studentMessage = "";

        if ($action === 'booked') {
            $lecturerMessage = "Student {$studentName} has booked your supervision slot on {$formattedTime}.";
            $studentMessage = "You have successfully booked a supervision slot on {$formattedTime}.";
        } else if ($action === 'cancelled') {
            $lecturerMessage = "Student {$studentName} has cancelled their supervision booking on {$formattedTime}.";
            $studentMessage = "You have cancelled your supervision slot on {$formattedTime}.";
        }

        // We leave event_id as NULL because this is tied to supervision slots, not global events
        $query = "INSERT INTO cs_notifications (user_id, message) VALUES (:user_id, :message)";
        
        $stmt = $this->conn->prepare($query);
        
        // Notify Lecturer
        if (!empty($lecturerMessage)) {
            $stmt->bindValue(':user_id', $lecturerId);
            $stmt->bindValue(':message', $lecturerMessage);
            $stmt->execute();
        }

        // Notify Student
        if (!empty($studentMessage)) {
            $stmt->bindValue(':user_id', $studentId);
            $stmt->bindValue(':message', $studentMessage);
            $stmt->execute();
        }

        return true;
    }
}
