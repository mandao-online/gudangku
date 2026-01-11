<?php
// Diagnose .env loading issues
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');

$diagnosis = [];

try {
    // 1. Check .env file
    $env_path = __DIR__ . '/.env';
    $diagnosis['env_file'] = [
        'exists' => file_exists($env_path),
        'readable' => file_exists($env_path) && is_readable($env_path),
        'size' => file_exists($env_path) ? filesize($env_path) : 0,
        'permissions' => file_exists($env_path) ? substr(sprintf('%o', fileperms($env_path)), -4) : null
    ];

    // 2. Read .env content if exists
    if (file_exists($env_path)) {
        $env_content = file_get_contents($env_path);
        $env_lines = explode("\n", $env_content);
        
        $db_vars = [];
        foreach ($env_lines as $line) {
            $line = trim($line);
            if (strpos($line, 'DB_') === 0) {
                $db_vars[] = $line;
            }
        }
        
        $diagnosis['env_content'] = [
            'total_lines' => count($env_lines),
            'db_variables' => $db_vars,
            'sample_content' => substr($env_content, 0, 200) . '...'
        ];
    }

    // 3. Check PHP environment variables
    $diagnosis['php_env'] = [
        'DB_HOST' => $_ENV['DB_HOST'] ?? getenv('DB_HOST') ?: 'not_set',
        'DB_DATABASE' => $_ENV['DB_DATABASE'] ?? getenv('DB_DATABASE') ?: 'not_set',
        'DB_USERNAME' => $_ENV['DB_USERNAME'] ?? getenv('DB_USERNAME') ?: 'not_set',
        'DB_PASSWORD' => !empty($_ENV['DB_PASSWORD'] ?? getenv('DB_PASSWORD')) ? 'set' : 'not_set'
    ];

    // 4. Check Laravel config (if available)
    if (file_exists(__DIR__ . '/vendor/autoload.php')) {
        try {
            require_once __DIR__ . '/vendor/autoload.php';
            
            if (file_exists(__DIR__ . '/bootstrap/app.php')) {
                $app = require_once __DIR__ . '/bootstrap/app.php';
                
                $diagnosis['laravel_config'] = [
                    'loaded' => true,
                    'version' => $app->version(),
                    'db_default' => $app['config']->get('database.default'),
                    'db_host' => $app['config']->get('database.connections.mysql.host'),
                    'db_database' => $app['config']->get('database.connections.mysql.database'),
                    'db_username' => $app['config']->get('database.connections.mysql.username'),
                    'db_password_set' => !empty($app['config']->get('database.connections.mysql.password'))
                ];
            }
        } catch (Exception $e) {
            $diagnosis['laravel_config'] = [
                'loaded' => false,
                'error' => $e->getMessage()
            ];
        }
    } else {
        $diagnosis['laravel_config'] = [
            'loaded' => false,
            'reason' => 'vendor/autoload.php not found'
        ];
    }

    // 5. Check config cache
    $config_cache_path = __DIR__ . '/bootstrap/cache/config.php';
    $diagnosis['config_cache'] = [
        'exists' => file_exists($config_cache_path),
        'size' => file_exists($config_cache_path) ? filesize($config_cache_path) : 0,
        'modified' => file_exists($config_cache_path) ? date('Y-m-d H:i:s', filemtime($config_cache_path)) : null
    ];

    // 6. Test direct database connection
    try {
        $pdo = new PDO(
            "mysql:host=194.59.164.10;dbname=u774809254_gudangku", 
            "u774809254_gudangku", 
            "dbuser"
        );
        $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
        
        $stmt = $pdo->query("SELECT COUNT(*) as count FROM users");
        $result = $stmt->fetch(PDO::FETCH_ASSOC);
        
        $diagnosis['direct_db_test'] = [
            'status' => 'success',
            'users_count' => $result['count']
        ];
        
    } catch (Exception $e) {
        $diagnosis['direct_db_test'] = [
            'status' => 'failed',
            'error' => $e->getMessage()
        ];
    }

    // 7. Recommendations
    $recommendations = [];
    
    if (!$diagnosis['env_file']['exists']) {
        $recommendations[] = 'Create .env file with proper database configuration';
    }
    
    if (!$diagnosis['env_file']['readable']) {
        $recommendations[] = 'Fix .env file permissions (should be 644)';
    }
    
    if ($diagnosis['php_env']['DB_HOST'] === 'not_set') {
        $recommendations[] = 'PHP is not reading .env variables - try force-env-reload.php';
    }
    
    if ($diagnosis['config_cache']['exists']) {
        $recommendations[] = 'Clear config cache - it may contain old database settings';
    }
    
    if (isset($diagnosis['laravel_config']['db_host']) && $diagnosis['laravel_config']['db_host'] === '127.0.0.1') {
        $recommendations[] = 'Laravel is using default config values - override with override-database-config.php';
    }

    echo json_encode([
        'status' => 'success',
        'message' => 'Environment diagnosis completed',
        'timestamp' => date('Y-m-d H:i:s'),
        'diagnosis' => $diagnosis,
        'recommendations' => $recommendations,
        'quick_fixes' => [
            'force_env_reload' => 'force-env-reload.php',
            'override_config' => 'override-database-config.php',
            'clear_cache' => 'clear-cache.php'
        ]
    ], JSON_PRETTY_PRINT);

} catch (Exception $e) {
    echo json_encode([
        'status' => 'error',
        'message' => 'Error during diagnosis: ' . $e->getMessage(),
        'partial_diagnosis' => $diagnosis
    ], JSON_PRETTY_PRINT);
}
?>