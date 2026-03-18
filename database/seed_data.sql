-- Seed data for CampusSync

-- Passwords are set to 'password123' for all test users (hashed using bcrypt)
-- The hash for 'password123' is $2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi

INSERT INTO cs_users (username, password_hash, first_name, last_name, email, role) VALUES 
('student1', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'John', 'Doe', 'johndoe@student.uni.ac.uk', 'student'),
('student2', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Jane', 'Smith', 'janesmith@student.uni.ac.uk', 'student'),
('lecturer1', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Dr. Alan', 'Turing', 'alan.turing@uni.ac.uk', 'lecturer'),
('admin1', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'System', 'Admin', 'admin@uni.ac.uk', 'admin');

-- Modules
INSERT INTO cs_modules (module_code, module_name, description) VALUES
('CS101', 'Introduction to Computer Science', 'Basic concepts of computing.'),
('CS202', 'Data Structures and Algorithms', 'Advanced problem solving techniques.'),
('SE301', 'Software Engineering Practice', 'Real-world software development project.');

-- User Module Assignments
INSERT INTO cs_user_module (user_id, module_id, role_in_module) VALUES
(1, 1, 'student'),
(1, 2, 'student'),
(2, 1, 'student'),
(2, 3, 'student'),
(3, 1, 'lecturer'),
(3, 2, 'lecturer'),
(3, 3, 'lecturer');
