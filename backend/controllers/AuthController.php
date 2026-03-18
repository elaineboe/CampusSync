<?php

require_once __DIR__ . '/../utils/Response.php';

class AuthController {
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

    public function login() {
        $data = json_decode(file_get_contents("php://input"));
        
        // The frontend currently sends 'username' which maps to the email input field
        $identifier = $data->username ?? null; 
        $passwordInput = $data->password ?? null;

        if (empty($identifier) || empty($passwordInput)) {
            Response::error('Email and password are required', 400);
        }

        if (!$this->conn) {
            Response::error('Database connection failed', 500);
        }

        // Check if user exists by email or username
        $query = "SELECT id, username, email, password_hash, role, first_name, last_name, is_active FROM cs_users WHERE email = :identifier OR username = :identifier LIMIT 1";
        $stmt = $this->conn->prepare($query);
        try {
            // Check if is_active column exists. If not, fallback to regular query
            $this->conn->query("SELECT is_active FROM cs_users LIMIT 1");
        } catch (PDOException $e) {
            $query = "SELECT id, username, email, password_hash, role, first_name, last_name FROM cs_users WHERE email = :identifier OR username = :identifier LIMIT 1";
            $stmt = $this->conn->prepare($query);
        }
        
        $stmt->bindValue(':identifier', $identifier);
        $stmt->execute();

        if ($stmt->rowCount() > 0) {
            $user = $stmt->fetch(PDO::FETCH_ASSOC);

            // Check if deactivated
            if (array_key_exists('is_active', $user) && $user['is_active'] == 0) {
                Response::error('Your account has been deactivated. Please contact support.', 403);
            }

            if (password_verify($passwordInput, $user['password_hash'])) {
                // Generate a simulated JWT token payload
                $tokenPayload = [
                    'id' => $user['id'],
                    'username' => $user['username'],
                    'role' => $user['role'],
                    'exp' => time() + 3600 // 1 hour expiration
                ];
                $token = base64_encode(json_encode($tokenPayload));

                // Don't send the hash back to the client
                unset($user['password_hash']);

                Response::json([
                    'message' => 'Login successful',
                    'token' => $token,
                    'user' => $user
                ]);
            } else {
                Response::error('Invalid credentials', 401);
            }
        } else {
            Response::error('User not found', 404);
        }
    }

    public function register($isAdminCall = false) {
        $data = json_decode(file_get_contents("php://input"));
        
        $username = $data->username ?? null;
        $firstName = $data->first_name ?? null;
        $lastName = $data->last_name ?? null;
        $email = $data->email ?? null;
        $passwordInput = $data->password ?? null;
        
        // If not called by admin, default to student. Admin can specify role.
        $role = ($isAdminCall && isset($data->role)) ? $data->role : 'student';

        if (empty($username) || empty($email) || empty($passwordInput)) {
            Response::error('Username, email, and password are required', 400);
        }

        if (!$this->conn) {
            Response::error('Database connection failed', 500);
        }

        // Check if email already exists
        $checkQuery = "SELECT id FROM cs_users WHERE email = :email OR username = :username LIMIT 1";
        $checkStmt = $this->conn->prepare($checkQuery);
        $checkStmt->bindValue(':email', $email);
        $checkStmt->bindValue(':username', $username);
        $checkStmt->execute();

        if ($checkStmt->rowCount() > 0) {
            Response::error('User with this email or username already exists', 409);
        }

        // Hash password and insert
        $hashedPassword = password_hash($passwordInput, PASSWORD_BCRYPT);

        $query = "INSERT INTO cs_users (username, first_name, last_name, email, password_hash, role) 
                  VALUES (:username, :first_name, :last_name, :email, :password_hash, :role)";
        
        $stmt = $this->conn->prepare($query);
        $stmt->bindValue(':username', $username);
        $stmt->bindValue(':first_name', $firstName);
        $stmt->bindValue(':last_name', $lastName);
        $stmt->bindValue(':email', $email);
        $stmt->bindValue(':password_hash', $hashedPassword);
        $stmt->bindValue(':role', $role);

        if ($stmt->execute()) {
            Response::json(['message' => 'User registered successfully', 'user_id' => $this->conn->lastInsertId()], 201);
        } else {
            Response::error('Failed to register user', 500);
        }
    }
}
