<?php
require_once __DIR__ . '/../utils/Response.php';
require_once __DIR__ . '/../models/Supervision.php';
require_once __DIR__ . '/../models/Notification.php';
require_once __DIR__ . '/../middleware/AuthMiddleware.php';

class SupervisionController {
    
    // ---------------------------------------------------
    // LECTURER CAPABILITIES
    // ---------------------------------------------------

    // Get all slots published by this lecturer (with booking details)
    public function getLecturerSlots() {
        $user = AuthMiddleware::authenticate();
        
        if (!isset($user['role']) || ($user['role'] !== 'lecturer' && $user['role'] !== 'admin')) {
            Response::error('Unauthorized: Only lecturers can manage hosted slots', 403);
        }

        $supervisionModel = new Supervision();
        $slots = $supervisionModel->getLecturerSlots($user['id']);
        
        Response::json($slots);
    }

    // Publish a new slot for students to book
    public function createSlot() {
        $user = AuthMiddleware::authenticate();
        
        if (!isset($user['role']) || ($user['role'] !== 'lecturer' && $user['role'] !== 'admin')) {
            Response::error('Unauthorized: Only lecturers manage hosted slots', 403);
        }

        $data = json_decode(file_get_contents("php://input"));
        
        if (empty($data->start_time) || empty($data->end_time)) {
            Response::error('start_time and end_time are required', 400);
        }

        $supervisionModel = new Supervision();
        $slotId = $supervisionModel->createSlot(
            $user['id'],
            $data->start_time,
            $data->end_time,
            $data->location ?? null,
            $data->max_students ?? 1
        );

        if ($slotId) {
            Response::json(['message' => 'Supervision slot published successfully', 'slot_id' => $slotId], 201);
        } else {
            Response::error('Failed to publish slot', 500);
        }
    }

    // ---------------------------------------------------
    // STUDENT CAPABILITIES
    // ---------------------------------------------------

    // Get all available global slots (that aren't fully booked)
    public function getAvailableSlots() {
        // Authenticate the user token
        AuthMiddleware::authenticate();

        $supervisionModel = new Supervision();
        $slots = $supervisionModel->getAvailableSlots();
        
        Response::json($slots);
    }

    // Get all confirmed bookings specific to the logged in student
    public function getMyBookings() {
        $user = AuthMiddleware::authenticate();

        if (!isset($user['role']) || $user['role'] !== 'student') {
            Response::error('Unauthorized: Only students can have personal bookings', 403);
        }

        $supervisionModel = new Supervision();
        $bookings = $supervisionModel->getStudentBookings($user['id']);
        
        Response::json($bookings);
    }

    // Action to book a slot
    public function bookSlot() {
        $user = AuthMiddleware::authenticate();

        if (!isset($user['role']) || $user['role'] !== 'student') {
            Response::error('Unauthorized: Only students can book slots', 403);
        }

        $data = json_decode(file_get_contents("php://input"));
        
        if (empty($data->slot_id)) {
            Response::error('slot_id is required', 400);
        }

        ob_start(); // Trap any warnings
        $supervisionModel = new Supervision();
        $success = $supervisionModel->bookSlot(
            $user['id'],
            $data->slot_id,
            $data->notes ?? ''
        );

        if ($success) {
            // Need to get slot data for Notification context
            try {
                $slotData = $supervisionModel->getSlotById($data->slot_id);

                if ($slotData) {
                    $notifModel = new Notification();
                    $notifModel->notifySupervisionAction(
                        $slotData['lecturer_id'], 
                        $user['id'], 
                        'booked', 
                        $slotData['start_time'], 
                        $user['first_name'] . ' ' . $user['last_name']
                    );
                }
            } catch (Exception $e) {
                error_log("Notification Error: " . $e->getMessage());
            }

            if (ob_get_length()) ob_end_clean(); // Correctly end and clean
            Response::json(['message' => 'Slot successfully booked']);
        } else {
            if (ob_get_length()) ob_end_clean();
            Response::error('Slot is full or already booked by you', 400);
        }
    }

    // Action to cancel a slot booking
    public function cancelBooking($bookingId) {
        $user = AuthMiddleware::authenticate();

        if (!isset($user['role']) || $user['role'] !== 'student') {
            Response::error('Unauthorized: Only students can cancel their bookings', 403);
        }

        ob_start();
        $supervisionModel = new Supervision();

        // Before canceling, grab the context data for the notification
        $slotData = null;
        try {
            $bookingRow = $supervisionModel->getBookingById($bookingId);
            if ($bookingRow) {
                $slotData = $supervisionModel->getSlotById($bookingRow['slot_id']);
            }
        } catch (Exception $e) { /* Fallback handled */ }
        
        $success = $supervisionModel->cancelBooking($user['id'], $bookingId);

        if ($success) {
            if ($slotData) {
                try {
                    $notifModel = new Notification();
                    $notifModel->notifySupervisionAction(
                        $slotData['lecturer_id'], 
                        $user['id'], 
                        'cancelled', 
                        $slotData['start_time'], 
                        $user['first_name'] . ' ' . $user['last_name']
                    );
                } catch (Exception $e) { } // Silent fall
            }
            ob_clean();
            Response::json(['message' => 'Booking successfully cancelled']);
        } else {
            ob_clean();
            Response::error('Failed to cancel booking, or not found', 400);
        }
    }
}
