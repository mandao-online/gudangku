<?php
// Deployment verification script
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');

$checks = [];
$overall_status = 'success';

// 1. Check PHP version
$php_version = phpversion();
$checks['php_version'] = [
    'status' => version_compare($php_version, '8.0.0', '>=') ? 'pass' : 'fail',
    'value' => $php_version,
    'required' => '8.0.0+'
];

// 2. Check Laravel files
$laravel_files = [
    'artisan' => __DIR__ . '/artisan',
    'composer.json' => __DIR__ . '/composer.json',
    'vendor/autoload.php' => __DIR__ . '/vendor/autoload.php',
    'bootstrap/app.php' => __DIR__ . '/bootstrap/app.php',
    'public/index.php' => __DIR__ . '/public/index.php',
    '.env' => __DIR__ . '/.env'
];

foreach ($laravel_files as $name => $path) {
    $checks['files'][$name] = [
        'status' => file_exists($path) ? 'pass' : 'fail',
        'path' => $path
    ];
    if (!file_exists($path)) {
        $overall_status = 'fail';
    }
}

// 3. Check permissions
$writable_dirs = [
    'storage' => __DIR__ . '/storage',
    'bootstrap/cache' => __DIR__ . '/bootstrap/cache'
];

foreach ($writable_dirs as $name => $path) {
    $checks['permissions'][$name] = [
        'status' => is_writable($path) ? 'pass' : 'fail',
        'path' => $path
    ];
    if (!is_writable($path)) {
        $overall_status = 'fail';
    }
}

// 4. Test database connection
if (file_exists(__DIR__ . '/.env')) {
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
            $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
            
            $stmt = $pdo->query("SELECT COUNT(*) as count FROM information_schema.tables WHERE table_schema = '$dbname'");
            $result = $stmt->fetch(PDO::FETCH_ASSOC);
            
            $checks['database'] = [
                'status' => 'pass',
                'host' => $host,
                'database' => $dbname,
                'tables_count' => $result['count']
            ];
        } catch (Exception $e) {
            $checks['database'] = [
                'status' => 'fail',
                'error' => $e->getMessage(),
                'host' => $host,
                'database' => $dbname
            ];
            $overall_status = 'fail';
        }
    } else {
        $checks['database'] = [
            'status' => 'fail',
            'error' => 'Database credentials not found in .env'
        ];
        $overall_status = 'fail';
    }
} else {
    $checks['database'] = [
        'status' => 'fail',
        'error' => '.env file not found'
    ];
    $overall_status = 'fail';
}

// 5. Test Laravel bootstrap
if (file_exists(__DIR__ . '/vendor/autoload.php')) {
    try {
        require_once __DIR__ . '/vendor/autoload.php';
        
        if (file_exists(__DIR__ . '/bootstrap/app.php')) {
            $app = require_once __DIR__ . '/bootstrap/app.php';
            $checks['laravel'] = [
                'status' => 'pass',
                'version' => $app->version()
            ];
        } else {
            $checks['laravel'] = [
                'status' => 'fail',
                'error' => 'bootstrap/app.php not found'
            ];
            $overall_status = 'fail';
        }
    } catch (Exception $e) {
        $checks['laravel'] = [
            'status' => 'fail',
            'error' => $e->getMessage()
        ];
        $overall_status = 'fail';
    }
} else {
    $checks['laravel'] = [
        'status' => 'fail',
        'error' => 'vendor/autoload.php not found'
    ];
    $overall_status = 'fail';
}

// Return results
echo json_encode([
    'overall_status' => $overall_status,
    'message' => $overall_status === 'success' ? 'All checks passed! Laravel is ready.' : 'Some checks failed. See details below.',
    'timestamp' => date('Y-m-d H:i:s'),
    'checks' => $checks
], JSON_PRETTY_PRINT);
?>