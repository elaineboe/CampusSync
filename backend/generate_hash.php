<?php
require_once __DIR__ . '/utils/Response.php';

// Quick hash generator to solve seed data hash format inconsistency
$password = 'password123';
$new_hash = password_hash($password, PASSWORD_BCRYPT);

echo "<html><body style='font-family: monospace; padding: 2rem;'>";
echo "<h2>CampusSync Hash Generator</h2>";
echo "<p>Please copy this hash and put it into your Nuwebspace phpMyAdmin for the <strong>password_hash</strong> column.</p>";
echo "<div style='background: #f1f5f9; padding: 1rem; border: 1px solid #cbd5e1; border-radius: 4px;word-break: break-all;'>";
echo "<strong>" . $new_hash . "</strong>";
echo "</div>";
echo "<p><em>After updating the database, delete this file!</em></p>";
echo "</body></html>";
?>
