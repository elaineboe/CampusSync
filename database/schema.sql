-- CampusSync Database Schema
-- Compatible with MySQL (via phpMyAdmin)

CREATE TABLE IF NOT EXISTS cs_users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    role ENUM('student', 'lecturer', 'admin') NOT NULL DEFAULT 'student',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS cs_modules (
    id INT AUTO_INCREMENT PRIMARY KEY,
    module_code VARCHAR(20) NOT NULL UNIQUE,
    module_name VARCHAR(100) NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS cs_user_module (
    user_id INT NOT NULL,
    module_id INT NOT NULL,
    role_in_module ENUM('student', 'lecturer') NOT NULL DEFAULT 'student',
    PRIMARY KEY (user_id, module_id),
    FOREIGN KEY (user_id) REFERENCES cs_users(id) ON DELETE CASCADE,
    FOREIGN KEY (module_id) REFERENCES cs_modules(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS cs_events (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    event_type ENUM('lecture', 'seminar', 'workshop', 'exam', 'other') NOT NULL DEFAULT 'lecture',
    location VARCHAR(255),
    start_time DATETIME NOT NULL,
    end_time DATETIME NOT NULL,
    module_id INT,
    created_by INT NOT NULL,
    is_deleted BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (module_id) REFERENCES cs_modules(id) ON DELETE SET NULL,
    FOREIGN KEY (created_by) REFERENCES cs_users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS cs_notifications (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    event_id INT,
    message TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES cs_users(id) ON DELETE CASCADE,
    FOREIGN KEY (event_id) REFERENCES cs_events(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS cs_supervision_slots (
    id INT AUTO_INCREMENT PRIMARY KEY,
    lecturer_id INT NOT NULL,
    start_time DATETIME NOT NULL,
    end_time DATETIME NOT NULL,
    location VARCHAR(255),
    max_students INT DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (lecturer_id) REFERENCES cs_users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS cs_bookings (
    id INT AUTO_INCREMENT PRIMARY KEY,
    slot_id INT NOT NULL,
    student_id INT NOT NULL,
    status ENUM('pending', 'confirmed', 'cancelled') DEFAULT 'pending',
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (slot_id) REFERENCES cs_supervision_slots(id) ON DELETE CASCADE,
    FOREIGN KEY (student_id) REFERENCES cs_users(id) ON DELETE CASCADE,
    UNIQUE (slot_id, student_id)
);

CREATE TABLE IF NOT EXISTS cs_activity_logs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    action VARCHAR(255) NOT NULL,
    details TEXT,
    ip_address VARCHAR(45),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES cs_users(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS cs_external_calendar_logs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    action VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES cs_users(id) ON DELETE CASCADE
);
