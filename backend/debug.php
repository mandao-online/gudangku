<?php
// Debug script untuk troubleshooting Hostinger deployment
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

// Handle preflight requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

$debug_info = [];

try {
    // 1. Basic PHP info
    $debug_info['php'] = [
        'version' => phpversion(),
        'server_software' => $_SERVER['SERVER_SOFTWARE'] ?? 'Unknown',
        'document_root' => $_SERVER['DOCUMENT_ROOT'] ?? 'Unknown',
        'script_filename' => $_SERVER['SCRIPT_FILENAME'] ?? 'Unknown',
        'request_uri' => $_SERVER['REQUEST_URI'] ?? 'Unknown'
    ];

    // 2. Check if .env file exists
    $env_path = __DIR__ . '/.env';
    $debug_info['env_file'] = [
        'exists' => file_exists($env_path),
        'readable' => file_exists($env_path) && is_readable($env_path),
        'path' => $env_path
    ];

    // 3. Check Laravel files
    $debug_info['laravel_files'] = [
        'artisan' => file_exists(__DIR__ . '/artisan'),
        'composer_json' => file_exists(__DIR__ . '/composer.json'),
        'vendor_autoload' => file_exists(__DIR__ . '/vendor/autoload.php'),
        'bootstrap_app' => file_exists(__DIR__ . '/bootstrap/app.php'),
        'public_index' => file_exists(__DIR__ . '/public/index.php')
    ];

    // 4. Test database connection
    if (file_exists($env_path)) {
        $env_content = file_get_contents($env_path);
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
                $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
                
                $stmt = $pdo->query("SELECT COUNT(*) as count FROM information_schema.tables WHERE table_schema = '$dbname'");
                $result = $stmt->fetch(PDO::FETCH_ASSOC);
                
                $debug_info['database'] = [
                    'connection' => 'success',
                    'host' => $host,
                    'database' => $dbname,
                    'tables_count' => $result['count']
                ];
            } catch (Exception $e) {
                $debug_info['database'] = [
                    'connection' => 'failed',
                    'error' => $e->getMessage(),
                    'host' => $host,
                    'database' => $dbname
                ];
            }
        }
    }

    // 5. Check Laravel bootstrap
    if (file_exists(__DIR__ . '/vendor/autoload.php')) {
        try {
            require_once __DIR__ . '/vendor/autoload.php';
            $debug_info['composer_autoload'] = 'success';
            
            if (file_exists(__DIR__ . '/bootstrap/app.php')) {
                $app = require_once __DIR__ . '/bootstrap/app.php';
                $debug_info['laravel_bootstrap'] = 'success';
                $debug_info['laravel_version'] = app()->version();
            }
        } catch (Exception $e) {
            $debug_info['laravel_bootstrap'] = [
                'status' => 'failed',
                'error' => $e->getMessage()
            ];
        }
    }

    // 6. Check permissions
    $debug_info['permissions'] = [
        'storage_writable' => is_writable(__DIR__ . '/storage'),
        'bootstrap_cache_writable' => is_writable(__DIR__ . '/bootstrap/cache'),
        'current_dir_writable' => is_writable(__DIR__)
    ];

    echo json_encode([
        'status' => 'success',
        'message' => 'Debug information collected',
        'debug' => $debug_info
    ], JSON_PRETTY_PRINT);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'status' => 'error',
        'message' => 'Debug script error: ' . $e->getMessage(),
        'debug' => $debug_info
    ], JSON_PRETTY_PRINT);
}
?>