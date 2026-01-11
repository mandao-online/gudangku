<?php
// Override database configuration directly in config file
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');

try {
    $config_path = __DIR__ . '/config/database.php';
    
    if (!file_exists($config_path)) {
        echo json_encode([
            'status' => 'error',
            'message' => 'config/database.php not found'
        ]);
        exit;
    }

    // Read current config
    $config_content = file_get_contents($config_path);
    
    // Create new MySQL configuration with hardcoded Hostinger values
    $new_mysql_config = "'mysql' => [
        'driver' => 'mysql',
        'url' => env('DATABASE_URL'),
        'host' => '194.59.164.10',  // Hardcoded Hostinger host
        'port' => '3306',
        'database' => 'u774809254_gudangku',  // Hardcoded Hostinger database
        'username' => 'u774809254_gudangku',  // Hardcoded Hostinger username
        'password' => 'Gudangku1!',  // Hardcoded Hostinger password
        'unix_socket' => env('DB_SOCKET', ''),
        'charset' => 'utf8mb4',
        'collation' => 'utf8mb4_unicode_ci',
        'prefix' => '',
        'prefix_indexes' => true,
        'strict' => true,
        'engine' => null,
        'options' => extension_loaded('pdo_mysql') ? array_filter([
            PDO::MYSQL_ATTR_SSL_CA => env('MYSQL_ATTR_SSL_CA'),
        ]) : [],
    ],";

    // Replace the MySQL configuration
    $pattern = "/'mysql'\s*=>\s*\[.*?\],/s";
    $new_config_content = preg_replace($pattern, $new_mysql_config, $config_content);
    
    if ($new_config_content === null) {
        echo json_encode([
            'status' => 'error',
            'message' => 'Failed to replace MySQL configuration'
        ]);
        exit;
    }

    // Backup original config
    $backup_path = __DIR__ . '/config/database.php.backup';
    if (!file_exists($backup_path)) {
        copy($config_path, $backup_path);
    }

    // Write new config
    if (file_put_contents($config_path, $new_config_content)) {
        
        // Clear config cache
        $cache_files = [
            __DIR__ . '/bootstrap/cache/config.php',
            __DIR__ . '/bootstrap/cache/routes-v7.php'
        ];
        
        $cleared = [];
        foreach ($cache_files as $cache_file) {
            if (file_exists($cache_file) && unlink($cache_file)) {
                $cleared[] = basename($cache_file);
            }
        }

        // Test database connection
        try {
            $pdo = new PDO(
                "mysql:host=194.59.164.10;dbname=u774809254_gudangku", 
                "u774809254_gudangku", 
                "Gudangku1!"
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

        echo json_encode([
            'status' => 'success',
            'message' => 'Database configuration overridden with hardcoded Hostinger values',
            'timestamp' => date('Y-m-d H:i:s'),
            'changes' => [
                'host' => '194.59.164.10 (hardcoded)',
                'database' => 'u774809254_gudangku (hardcoded)',
                'username' => 'u774809254_gudangku (hardcoded)',
                'password' => 'Set (hardcoded)'
            ],
            'backup_created' => file_exists($backup_path),
            'caches_cleared' => $cleared,
            'database_test' => $db_test,
            'note' => 'Configuration is now hardcoded and will not use .env values',
            'restore_command' => 'To restore: copy database.php.backup to database.php'
        ], JSON_PRETTY_PRINT);

    } else {
        echo json_encode([
            'status' => 'error',
            'message' => 'Failed to write new configuration file'
        ]);
    }

} catch (Exception $e) {
    echo json_encode([
        'status' => 'error',
        'message' => 'Error overriding database config: ' . $e->getMessage()
    ], JSON_PRETTY_PRINT);
}
?>