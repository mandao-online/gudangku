<?php
// Simple server info script
header('Content-Type: text/html');

echo "<h1>Server Information</h1>";
echo "<h2>PHP Version: " . phpversion() . "</h2>";
echo "<h2>Server: " . ($_SERVER['SERVER_SOFTWARE'] ?? 'Unknown') . "</h2>";
echo "<h2>Document Root: " . ($_SERVER['DOCUMENT_ROOT'] ?? 'Unknown') . "</h2>";
echo "<h2>Current Directory: " . __DIR__ . "</h2>";

echo "<h2>File Checks:</h2>";
echo "<ul>";
echo "<li>.env file: " . (file_exists(__DIR__ . '/.env') ? '✅ EXISTS' : '❌ MISSING') . "</li>";
echo "<li>artisan: " . (file_exists(__DIR__ . '/artisan') ? '✅ EXISTS' : '❌ MISSING') . "</li>";
echo "<li>vendor/autoload.php: " . (file_exists(__DIR__ . '/vendor/autoload.php') ? '✅ EXISTS' : '❌ MISSING') . "</li>";
echo "<li>public/index.php: " . (file_exists(__DIR__ . '/public/index.php') ? '✅ EXISTS' : '❌ MISSING') . "</li>";
echo "</ul>";

echo "<h2>Directory Permissions:</h2>";
echo "<ul>";
echo "<li>storage/: " . (is_writable(__DIR__ . '/storage') ? '✅ WRITABLE' : '❌ NOT WRITABLE') . "</li>";
echo "<li>bootstrap/cache/: " . (is_writable(__DIR__ . '/bootstrap/cache') ? '✅ WRITABLE' : '❌ NOT WRITABLE') . "</li>";
echo "</ul>";

if (file_exists(__DIR__ . '/.env')) {
    echo "<h2>Environment Variables (from .env):</h2>";
    $env = file_get_contents(__DIR__ . '/.env');
    $lines = explode("\n", $env);
    echo "<ul>";
    foreach ($lines as $line) {
        $line = trim($line);
        if ($line && !str_starts_with($line, '#')) {
            // Hide sensitive data
            if (str_contains($line, 'PASSWORD') || str_contains($line, 'KEY')) {
                $parts = explode('=', $line, 2);
                echo "<li>" . $parts[0] . "=***HIDDEN***</li>";
            } else {
                echo "<li>" . htmlspecialchars($line) . "</li>";
            }
        }
    }
    echo "</ul>";
}

// Test database connection
if (file_exists(__DIR__ . '/.env')) {
    echo "<h2>Database Connection Test:</h2>";
    $env_content = file_get_contents(__DIR__ . '/.env');
    preg_match('/DB_HOST=(.*)/', $env_content, $host_match);
    preg_match('/DB_DATABASE=(.*)/', $env_content, $db_match);
    preg_match('/DB_USERNAME=(.*)/', $env_content, $user_match);
    preg_match('/DB_PASSWORD=(.*)/', $env_content, $pass_match);

    if ($host_match && $db_match && $user_match && $pass_match) {
        $host = trim($host_match[1]);
        $dbname = trim($db_match[1]);
        $username = trim($user_match[1]);
        $password = trim($pass_match[1]);

        try {
            $pdo = new PDO("mysql:host=$host;dbname=$dbname", $username, $password);
            echo "<p>✅ Database connection successful!</p>";
            echo "<p>Host: $host</p>";
            echo "<p>Database: $dbname</p>";
        } catch (Exception $e) {
            echo "<p>❌ Database connection failed: " . $e->getMessage() . "</p>";
        }
    }
}
?>