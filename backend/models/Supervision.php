<?php

class Supervision {
    private $conn;

    public function __construct() {
        $config = require __DIR__ . '/../config/database.php';
        $host = $config['db_host'];
        $db_name = $config['db_name'];
        $username = $config['db_user'];
        $password = $config['db_pass'];

        try {
            $this->conn = new PDO("mysql:host={$host};dbname={$db_name};charset=utf8", $username, $password);
            $this->conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
        } catch(PDOException $exception) {
            error_log("Connection error: " . $exception->getMessage());
        }
    }

    // ---------------------------------------------------
    // Lecturer Methods (Slot Management)
    // ---------------------------------------------------

    public function createSlot($lecturerId, $startTime, $endTime, $location, $maxStudents) {
        if (!$this->conn) return false;
        
        $query = "INSERT INTO cs_supervision_slots (lecturer_id, start_time, end_time, location, max_students) 
                  VALUES (:lecturer_id, :start_time, :end_time, :location, :max_students)";
        
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(':lecturer_id', $lecturerId);
        $stmt->bindParam(':start_time', $startTime);
        $stmt->bindParam(':end_time', $endTime);
        $stmt->bindParam(':location', $location);
        $stmt->bindParam(':max_students', $maxStudents);
        
        if ($stmt->execute()) {
            return $this->conn->lastInsertId();
        }
        return false;
    }

    public function getLecturerSlots($lecturerId) {
        if (!$this->conn) return [];
        
        // Fetch slots and also get a count of how many students have booked them
        $query = "
            SELECT 
                s.id, s.start_time, s.end_time, s.location, s.max_students,
                (SELECT COUNT(*) FROM cs_bookings b WHERE b.slot_id = s.id AND b.status != 'cancelled') as booked_count
            FROM cs_supervision_slots s
            WHERE s.lecturer_id = :lecturer_id
            ORDER BY s.start_time ASC
        ";
        
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(':lecturer_id', $lecturerId);
        $stmt->execute();
        
        $slots = $stmt->fetchAll(PDO::FETCH_ASSOC);

        // Populate the bookings for each slot
        foreach ($slots as &$slot) {
            $slot['bookings'] = $this->getBookingsForSlot($slot['id']);
        }

        return $slots;
    }

    private function getBookingsForSlot($slotId) {
        if (!$this->conn) return [];

        $query = "
            SELECT b.id as booking_id, b.status, b.notes, u.first_name, u.last_name, u.email
            FROM cs_bookings b
            JOIN cs_users u ON b.student_id = u.id
            WHERE b.slot_id = :slot_id AND b.status != 'cancelled'
        ";
        
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(':slot_id', $slotId);
        $stmt->execute();
        
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    // ---------------------------------------------------
    // Student Methods (Slot Browsing and Booking)
    // ---------------------------------------------------

    public function getAvailableSlots() {
        if (!$this->conn) return [];
        
        // Get slots where the number of active bookings is less than max_students
        $query = "
            SELECT 
                s.id, s.start_time, s.end_time, s.location, s.max_students,
                u.first_name as lecturer_first_name, u.last_name as lecturer_last_name,
                (SELECT COUNT(*) FROM cs_bookings b WHERE b.slot_id = s.id AND b.status != 'cancelled') as booked_count
            FROM cs_supervision_slots s
            JOIN cs_users u ON s.lecturer_id = u.id
            WHERE s.start_time > NOW()
            HAVING booked_count < s.max_students
            ORDER BY s.start_time ASC
        ";
        
        $stmt = $this->conn->prepare($query);
        $stmt->execute();
        
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public function bookSlot($studentId, $slotId, $notes) {
        if (!$this->conn) return false;

        // Verify slot exists and has capacity
        $slotQuery = "
            SELECT max_students, 
                   (SELECT COUNT(*) FROM cs_bookings WHERE slot_id = :slot_id AND status != 'cancelled') as current_bookings 
            FROM cs_supervision_slots 
            WHERE id = :check_slot_id
        ";
        $checkStmt = $this->conn->prepare($slotQuery);
        $checkStmt->bindValue(':slot_id', $slotId);
        $checkStmt->bindValue(':check_slot_id', $slotId);
        $checkStmt->execute();
        $slotInfo = $checkStmt->fetch(PDO::FETCH_ASSOC);

        if (!$slotInfo || $slotInfo['current_bookings'] >= $slotInfo['max_students']) {
            return false; // Slot full or doesn't exist
        }

        // Try to book by first checking if a row for this student-slot pair exists
        try {
            $checkStudentQuery = "SELECT id, status FROM cs_bookings WHERE slot_id = :slot_id AND student_id = :student_id";
            $checkStudentStmt = $this->conn->prepare($checkStudentQuery);
            $checkStudentStmt->bindValue(':slot_id', $slotId);
            $checkStudentStmt->bindValue(':student_id', $studentId);
            $checkStudentStmt->execute();
            $existingBooking = $checkStudentStmt->fetch(PDO::FETCH_ASSOC);

            if ($existingBooking) {
                if ($existingBooking['status'] !== 'cancelled') {
                    return false; // Already actively booked by this student
                }
                // Update the existing cancelled row to confirmed
                $updateQuery = "UPDATE cs_bookings SET status = 'confirmed', notes = :notes WHERE id = :id";
                $updateStmt = $this->conn->prepare($updateQuery);
                $updateStmt->bindValue(':notes', $notes);
                $updateStmt->bindValue(':id', $existingBooking['id']);
                return $updateStmt->execute();
            } else {
                // Insert a brand new row
                $query = "INSERT INTO cs_bookings (slot_id, student_id, status, notes) 
                          VALUES (:slot_id, :student_id, 'confirmed', :notes)";
                
                $stmt = $this->conn->prepare($query);
                $stmt->bindValue(':slot_id', $slotId);
                $stmt->bindValue(':student_id', $studentId);
                $stmt->bindValue(':notes', $notes);
                
                return $stmt->execute();
            }
        } catch(PDOException $e) {
            error_log("Booking error: " . $e->getMessage());
            return false;
        }
    }

    public function getSlotById($slotId) {
        if (!$this->conn) return null;
        $query = "SELECT lecturer_id, start_time FROM cs_supervision_slots WHERE id = :id";
        $stmt = $this->conn->prepare($query);
        $stmt->bindValue(':id', $slotId);
        $stmt->execute();
        return $stmt->fetch(PDO::FETCH_ASSOC);
    }

    public function getBookingById($bookingId) {
        if (!$this->conn) return null;
        $query = "SELECT slot_id, student_id, status FROM cs_bookings WHERE id = :id";
        $stmt = $this->conn->prepare($query);
        $stmt->bindValue(':id', $bookingId);
        $stmt->execute();
        return $stmt->fetch(PDO::FETCH_ASSOC);
    }

    public function getStudentBookings($studentId) {
        if (!$this->conn) return [];
        
        $query = "
            SELECT 
                b.id as booking_id, b.status, b.notes,
                s.start_time, s.end_time, s.location,
                u.first_name as lecturer_first_name, u.last_name as lecturer_last_name
            FROM cs_bookings b
            JOIN cs_supervision_slots s ON b.slot_id = s.id
            JOIN cs_users u ON s.lecturer_id = u.id
            WHERE b.student_id = :student_id AND b.status != 'cancelled'
            ORDER BY s.start_time ASC
        ";
        
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(':student_id', $studentId);
        $stmt->execute();
        
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public function cancelBooking($studentId, $bookingId) {
        if (!$this->conn) return false;

        $query = "UPDATE cs_bookings SET status = 'cancelled' WHERE id = :booking_id AND student_id = :student_id";
        $stmt = $this->conn->prepare($query);
        $stmt->bindValue(':booking_id', $bookingId);
        $stmt->bindValue(':student_id', $studentId);
        return $stmt->execute() && $stmt->rowCount() > 0;
    }
}
