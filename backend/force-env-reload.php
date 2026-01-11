<?php
// Force Laravel to reload .env configuration
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');

try {
    // 1. Check if .env exists and is readable
    $env_path = __DIR__ . '/.env';
    if (!file_exists($env_path)) {
        echo json_encode([
            'status' => 'error',
            'message' => '.env file not found at: ' . $env_path
        ]);
        exit;
    }

    if (!is_readable($env_path)) {
        echo json_encode([
            'status' => 'error',
            'message' => '.env file is not readable. Check file permissions.'
        ]);
        exit;
    }

    // 2. Read and parse .env manually
    $env_content = file_get_contents($env_path);
    $env_lines = explode("\n", $env_content);
    $env_vars = [];
    
    foreach ($env_lines as $line) {
        $line = trim($line);
        if (empty($line) || strpos($line, '#') === 0) continue;
        
        if (strpos($line, '=') !== false) {
            list($key, $value) = explode('=', $line, 2);
            $key = trim($key);
            $value = trim($value, '"\'');
            $env_vars[$key] = $value;
        }
    }

    // 3. Force set environment variables
    foreach ($env_vars as $key => $value) {
        $_ENV[$key] = $value;
        putenv("$key=$value");
    }

    // 4. Clear all Laravel caches
    $cache_files = [
        __DIR__ . '/bootstrap/cache/config.php',
        __DIR__ . '/bootstrap/cache/routes-v7.php',
        __DIR__ . '/bootstrap/cache/services.php',
        __DIR__ . '/bootstrap/cache/packages.php'
    ];

    $cleared_caches = [];
    foreach ($cache_files as $cache_file) {
        if (file_exists($cache_file)) {
            if (unlink($cache_file)) {
                $cleared_caches[] = basename($cache_file);
            }
        }
    }

    // 5. Test database connection with forced env vars
    $db_host = $env_vars['DB_HOST'] ?? '127.0.0.1';
    $db_database = $env_vars['DB_DATABASE'] ?? 'forge';
    $db_username = $env_vars['DB_USERNAME'] ?? 'forge';
    $db_password = $env_vars['DB_PASSWORD'] ?? '';

    try {
        $pdo = new PDO(
            "mysql:host=$db_host;dbname=$db_database", 
            $db_username, 
            $db_password
        );
        $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
        
        $stmt = $pdo->query("SELECT COUNT(*) as count FROM users");
        $result = $stmt->fetch(PDO::FETCH_ASSOC);
        
        $db_test = [
            'status' => 'success',
            'users_count' => $result['count']
        ];
        
    } catch (Exception $e) {
        $db_test = [
            'status' => 'failed',
            'error' => $e->getMessage()
        ];
    }

    // 6. Try to load Laravel and test config
    $laravel_test = ['status' => 'not_loaded'];
    if (file_exists(__DIR__ . '/vendor/autoload.php')) {
        try {
            require_once __DIR__ . '/vendor/autoload.php';
            
            if (file_exists(__DIR__ . '/bootstrap/app.php')) {
                $app = require_once __DIR__ . '/bootstrap/app.php';
                
                // Force reload config
                $app['config']->set('database.connections.mysql.host', $db_host);
                $app['config']->set('database.connections.mysql.database', $db_database);
                $app['config']->set('database.connections.mysql.username', $db_username);
                $app['config']->set('database.connections.mysql.password', $db_password);
                
                $laravel_test = [
                    'status' => 'loaded',
                    'version' => $app->version(),
                    'db_config' => [
                        'host' => $app['config']->get('database.connections.mysql.host'),
                        'database' => $app['config']->get('database.connections.mysql.database'),
                        'username' => $app['config']->get('database.connections.mysql.username')
                    ]
                ];
            }
        } catch (Exception $e) {
            $laravel_test = [
                'status' => 'error',
                'error' => $e->getMessage()
            ];
        }
    }

    echo json_encode([
        'status' => 'success',
        'message' => 'Environment variables forced reload completed',
        'timestamp' => date('Y-m-d H:i:s'),
        'env_file' => [
            'path' => $env_path,
            'size' => filesize($env_path),
            'readable' => true,
            'variables_found' => count($env_vars)
        ],
        'database_config' => [
            'host' => $db_host,
            'database' => $db_database,
            'username' => $db_username,
            'password_set' => !empty($db_password)
        ],
        'caches_cleared' => $cleared_caches,
        'database_test' => $db_test,
        'laravel_test' => $laravel_test,
        'next_steps' => [
            'Test API endpoints',
            'Try login again',
            'Check if database queries work'
        ]
    ], JSON_PRETTY_PRINT);

} catch (Exception $e) {
    echo json_encode([
        'status' => 'error',
        'message' => 'Error forcing env reload: ' . $e->getMessage(),
        'trace' => $e->getTraceAsString()
    ], JSON_PRETTY_PRINT);
}
?>