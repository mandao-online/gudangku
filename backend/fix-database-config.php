<?php
// Fix Database Configuration for Hostinger
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');

try {
    $env_path = __DIR__ . '/.env';
    
    if (!file_exists($env_path)) {
        echo json_encode([
            'status' => 'error',
            'message' => '.env file not found'
        ]);
        exit;
    }

    // Read current .env
    $env_content = file_get_contents($env_path);
    
    // Check current database config
    preg_match('/DB_HOST=(.*)/', $env_content, $host_match);
    preg_match('/DB_DATABASE=(.*)/', $env_content, $db_match);
    preg_match('/DB_USERNAME=(.*)/', $env_content, $user_match);
    
    $current_config = [
        'host' => $host_match[1] ?? 'not found',
        'database' => $db_match[1] ?? 'not found',
        'username' => $user_match[1] ?? 'not found'
    ];
    
    // Correct Hostinger database configuration
    $correct_config = [
        'DB_HOST=194.59.164.10',
        'DB_DATABASE=u774809254_gudangku',
        'DB_USERNAME=u774809254_gudangku',
        'DB_PASSWORD=Gudangku1!'
    ];
    
    // Replace database configuration
    $new_env_content = $env_content;
    
    // Replace or add database config
    $new_env_content = preg_replace('/DB_HOST=.*/', 'DB_HOST=194.59.164.10', $new_env_content);
    $new_env_content = preg_replace('/DB_DATABASE=.*/', 'DB_DATABASE=u774809254_gudangku', $new_env_content);
    $new_env_content = preg_replace('/DB_USERNAME=.*/', 'DB_USERNAME=u774809254_gudangku', $new_env_content);
    $new_env_content = preg_replace('/DB_PASSWORD=.*/', 'DB_PASSWORD=Gudangku1!', $new_env_content);
    
    // Write updated .env
    if (file_put_contents($env_path, $new_env_content)) {
        // Test new database connection
        try {
            $pdo = new PDO(
                "mysql:host=194.59.164.10;dbname=u774809254_gudangku", 
                "u774809254_gudangku", 
                "Gudangku1!"
            );
            $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
            
            $stmt = $pdo->query("SELECT COUNT(*) as count FROM users");
            $result = $stmt->fetch(PDO::FETCH_ASSOC);
            
            echo json_encode([
                'status' => 'success',
                'message' => 'Database configuration fixed and tested successfully!',
                'before' => $current_config,
                'after' => [
                    'host' => '194.59.164.10',
                    'database' => 'u774809254_gudangku',
                    'username' => 'u774809254_gudangku'
                ],
                'test_result' => [
                    'connection' => 'success',
                    'users_count' => $result['count']
                ],
                'next_steps' => [
                    'Clear config cache',
                    'Test API endpoints',
                    'Try login again'
                ]
            ], JSON_PRETTY_PRINT);
            
        } catch (Exception $e) {
            echo json_encode([
                'status' => 'partial_success',
                'message' => '.env updated but database connection failed',
                'error' => $e->getMessage(),
                'suggestion' => 'Check database credentials with Hostinger support'
            ], JSON_PRETTY_PRINT);
        }
        
    } else {
        echo json_encode([
            'status' => 'error',
            'message' => 'Failed to write .env file',
            'suggestion' => 'Check file permissions'
        ]);
    }
    
} catch (Exception $e) {
    echo json_encode([
        'status' => 'error',
        'message' => 'Error fixing database config: ' . $e->getMessage()
    ], JSON_PRETTY_PRINT);
}
?>