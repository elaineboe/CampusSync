<?php
require_once __DIR__ . '/../utils/Response.php';
require_once __DIR__ . '/../models/Event.php';
require_once __DIR__ . '/../models/Notification.php';
require_once __DIR__ . '/../models/AuditLog.php';
require_once __DIR__ . '/../middleware/AuthMiddleware.php';

class EventController {
    public function getEvents() {
        ob_start();
        $user = AuthMiddleware::authenticate();
        $userId = isset($user['id']) ? $user['id'] : 1;

        // NEW: Check if student_id is requested (for Lecturer/Admin view)
        $targetUserId = $userId;
        if (isset($_GET['student_id'])) {
            if ($user['role'] === 'lecturer' || $user['role'] === 'admin') {
                $targetUserId = intval($_GET['student_id']);
            } else {
                if (ob_get_length()) ob_end_clean();
                Response::error('Unauthorized: Students can only view their own events', 403);
                return;
            }
        }

        try {
            $eventModel = new Event();
            $events = $eventModel->getUserEvents($targetUserId);
            if (ob_get_length()) ob_end_clean();
            Response::json($events);
        } catch (Throwable $e) {
            if (ob_get_length()) ob_end_clean();
            Response::error('Failed to load events: ' . $e->getMessage(), 500);
        }
    }

    public function createEvent() {
        $user = AuthMiddleware::authenticate();
        
        // Only lecturers and admins can create events
        if (!isset($user['role']) || ($user['role'] !== 'lecturer' && $user['role'] !== 'admin')) {
            Response::error('Unauthorized: Only lecturers and admins can create events', 403);
        }

        $data = json_decode(file_get_contents("php://input"));
        
        if (empty($data->title) || empty($data->start_time) || empty($data->end_time)) {
            Response::error('Title, start_time, and end_time are required', 400);
        }

        ob_start();
        try {
            $eventModel = new Event();
            $conn = $eventModel->getConn();
            if (!$conn) throw new Exception("Database connection failed");

            // Shared connection models
            $notificationModel = new Notification($conn);
            $auditLog = new AuditLog($conn);
            
            // Start Transaction for reliability (NFR2)
            $conn->beginTransaction();
            
            $eventId = $eventModel->createEvent(
                $data->title,
                $data->description ?? null,
                $data->event_type ?? 'lecture',
                $data->location ?? null,
                $data->start_time,
                $data->end_time,
                $data->module_id ?? null,
                $user['id']
            );

            if ($eventId) {
                // Trigger notifications (Shielded)
                try {
                    $notificationModel->notifyUsersForEvent(
                        $eventId, 
                        $data->module_id ?? null, 
                        'created', 
                        $data->title, 
                        $user['id'], 
                        $data->event_type ?? 'event', 
                        $data->start_time
                    );
                } catch (Throwable $t) { error_log("Notif Error: " . $t->getMessage()); }

                // Record Audit Log (Shielded)
                try {
                    $auditLog->log($user['id'], 'create_event', "Created event '{$data->title}' (ID: $eventId)");
                } catch (Throwable $t) { error_log("Log Error: " . $t->getMessage()); }
                
                $conn->commit();
                if (ob_get_length()) ob_end_clean();
                Response::json(['message' => 'Event created successfully', 'event_id' => $eventId], 201);
            } else {
                $conn->rollBack();
                if (ob_get_length()) ob_end_clean();
                Response::error('Failed to create event (Database error)', 500);
            }
        } catch (Throwable $e) {
            // Handle fatal errors or DB errors
            if (isset($conn) && $conn->inTransaction()) @$conn->rollBack();
            if (ob_get_length()) ob_end_clean();
            Response::error('Critical error: ' . $e->getMessage(), 500);
        }
    }

    public function updateEvent($id) {
        $user = AuthMiddleware::authenticate();
        
        if (!isset($user['role']) || ($user['role'] !== 'lecturer' && $user['role'] !== 'admin')) {
            Response::error('Unauthorized', 403);
        }

        $data = json_decode(file_get_contents("php://input"));
        
        if (empty($data->title) || empty($data->start_time) || empty($data->end_time)) {
            Response::error('Title, start_time, and end_time are required', 400);
        }

        ob_start();
        try {
            $eventModel = new Event();
            $conn = $eventModel->getConn();
            if (!$conn) throw new Exception("Database connection failed");

            // Shared connection models
            $notificationModel = new Notification($conn);
            $auditLog = new AuditLog($conn);
            
            // Check ownership/permissions
            $existingEvent = $eventModel->getEventById($id);
            if (!$existingEvent) {
                if (ob_get_length()) ob_end_clean();
                Response::error('Event not found', 404);
            }
            if ($user['role'] !== 'admin' && $existingEvent['created_by'] != $user['id']) {
                if (ob_get_length()) ob_end_clean();
                Response::error('Unauthorized: You can only edit your own events', 403);
            }

            $conn->beginTransaction();

            $success = $eventModel->updateEvent(
                $id,
                $data->title,
                $data->description ?? null,
                $data->event_type ?? 'lecture',
                $data->location ?? null,
                $data->start_time,
                $data->end_time,
                $data->module_id ?? null
            );

            if ($success) {
                // Secondary actions
                try {
                    $notificationModel->notifyUsersForEvent(
                        $id, 
                        $data->module_id ?? null, 
                        'updated/changed', 
                        $data->title, 
                        $user['id'], 
                        $data->event_type ?? 'event', 
                        $data->start_time
                    );
                } catch (Throwable $t) { }

                try {
                    $auditLog->log($user['id'], 'update_event', "Updated event '{$data->title}' (ID: $id)");
                } catch (Throwable $t) { }

                $conn->commit();
                if (ob_get_length()) ob_end_clean();
                Response::json(['message' => 'Event updated successfully']);
            } else {
                $conn->rollBack();
                if (ob_get_length()) ob_end_clean();
                Response::error('Failed to update event', 500);
            }
        } catch (Throwable $e) {
            if (isset($conn) && $conn->inTransaction()) @$conn->rollBack();
            if (ob_get_length()) ob_end_clean();
            Response::error('Critical update error: ' . $e->getMessage(), 500);
        }
    }

    public function deleteEvent($id) {
        $user = AuthMiddleware::authenticate();
        
        if (!isset($user['role']) || ($user['role'] !== 'lecturer' && $user['role'] !== 'admin')) {
            Response::error('Unauthorized', 403);
        }

        ob_start();
        try {
            $eventModel = new Event();
            $conn = $eventModel->getConn();
            if (!$conn) throw new Exception("Database connection failed");

            // Shared connection models
            $notificationModel = new Notification($conn);
            $auditLog = new AuditLog($conn);
            
            // Check ownership/permissions
            $existingEvent = $eventModel->getEventById($id);
            if (!$existingEvent) {
                if (ob_get_length()) ob_end_clean();
                Response::error('Event not found', 404);
            }
            if ($user['role'] !== 'admin' && $existingEvent['created_by'] != $user['id']) {
                if (ob_get_length()) ob_end_clean();
                Response::error('Unauthorized: You can only delete your own events', 403);
            }

            $conn->beginTransaction();
            $success = $eventModel->deleteEvent($id);

            if ($success) {
                // Secondary actions
                try {
                    $notificationModel->notifyUsersForEvent(
                        null, 
                        $existingEvent['module_id'] ?? null, 
                        'deleted/cancelled', 
                        $existingEvent['title'], 
                        $user['id'], 
                        $existingEvent['event_type'] ?? 'event', 
                        $existingEvent['start_time'] ?? null
                    );
                } catch (Throwable $t) { }

                try {
                    $auditLog->log($user['id'], 'delete_event', "Deleted event '{$existingEvent['title']}' (ID: $id)");
                } catch (Throwable $t) { }

                $conn->commit();
                if (ob_get_length()) ob_end_clean();
                Response::json(['message' => 'Event deleted successfully']);
            } else {
                $conn->rollBack();
                if (ob_get_length()) ob_end_clean();
                Response::error('Failed to delete event', 500);
            }
        } catch (Throwable $e) {
            if (isset($conn) && $conn->inTransaction()) @$conn->rollBack();
            if (ob_get_length()) ob_end_clean();
            Response::error('Critical deletion error: ' . $e->getMessage(), 500);
        }
    }

    public function getEventHistory() {
        $user = AuthMiddleware::authenticate();
        
        // Admins see all, lecturers see theirs
        if ($user['role'] !== 'admin' && $user['role'] !== 'lecturer') {
            Response::error('Unauthorized', 403);
        }

        $eventModel = new Event();
        $userId = ($user['role'] === 'admin') ? null : $user['id'];
        $history = $eventModel->getEventHistory($userId);
        
        Response::json($history);
    }
}
