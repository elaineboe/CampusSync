-- Migration script for Timebox 7
ALTER TABLE cs_events ADD COLUMN is_deleted BOOLEAN DEFAULT FALSE;

CREATE TABLE IF NOT EXISTS cs_activity_logs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    action VARCHAR(255) NOT NULL,
    details TEXT,
    ip_address VARCHAR(45),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES cs_users(id) ON DELETE SET NULL
);
