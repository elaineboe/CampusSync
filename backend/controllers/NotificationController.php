<?php
require_once __DIR__ . '/../models/Notification.php';
require_once __DIR__ . '/../middleware/AuthMiddleware.php';
require_once __DIR__ . '/../utils/Response.php';

class NotificationController {
    
    public function getNotifications() {
        $user = AuthMiddleware::authenticate();
        $userId = $user['id'];
        
        $notificationModel = new Notification();
        $notifications = $notificationModel->getUserNotifications($userId);
        
        Response::json($notifications);
    }

    public function markAsRead($id) {
        $user = AuthMiddleware::authenticate();
        $userId = $user['id'];
        
        $notificationModel = new Notification();
        $success = $notificationModel->markAsRead($id, $userId);
        
        if ($success) {
            Response::json(['message' => 'Notification marked as read']);
        } else {
            Response::error('Failed to update notification', 500);
        }
    }
}
