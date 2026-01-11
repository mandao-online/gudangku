<?php
// Web-based Artisan Command Simulator for Hostinger
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');

$command = $_GET['command'] ?? '';
$results = [];

try {
    // Load Laravel if possible
    if (file_exists(__DIR__ . '/vendor/autoload.php')) {
        require_once __DIR__ . '/vendor/autoload.php';
        
        if (file_exists(__DIR__ . '/bootstrap/app.php')) {
            $app = require_once __DIR__ . '/bootstrap/app.php';
            $kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
        }
    }

    switch ($command) {
        case 'config:clear':
            $config_cache = __DIR__ . '/bootstrap/cache/config.php';
            if (file_exists($config_cache)) {
                unlink($config_cache);
                $results['message'] = 'Configuration cache cleared!';
            } else {
                $results['message'] = 'Configuration cache was not cached.';
            }
            break;

        case 'route:clear':
            $route_cache = __DIR__ . '/bootstrap/cache/routes-v7.php';
            if (file_exists($route_cache)) {
                unlink($route_cache);
                $results['message'] = 'Route cache cleared!';
            } else {
                $results['message'] = 'Route cache was not cached.';
            }
            break;

        case 'view:clear':
            $view_cache_dir = __DIR__ . '/storage/framework/views';
            if (is_dir($view_cache_dir)) {
                $files = glob($view_cache_dir . '/*.php');
                $count = 0;
                foreach ($files as $file) {
                    if (unlink($file)) $count++;
                }
                $results['message'] = "Compiled views cleared! ($count files removed)";
            } else {
                $results['message'] = 'View cache directory not found.';
            }
            break;

        case 'cache:clear':
            $cache_dir = __DIR__ . '/storage/framework/cache/data';
            if (is_dir($cache_dir)) {
                $count = 0;
                $iterator = new RecursiveIteratorIterator(
                    new RecursiveDirectoryIterator($cache_dir, RecursiveDirectoryIterator::SKIP_DOTS),
                    RecursiveIteratorIterator::CHILD_FIRST
                );
                foreach ($iterator as $path) {
                    if ($path->isFile() && unlink($path->getRealPath())) {
                        $count++;
                    }
                }
                $results['message'] = "Application cache cleared! ($count files removed)";
            } else {
                $results['message'] = 'Cache directory not found.';
            }
            break;

        case 'optimize:clear':
            $cleared = [];
            
            // Clear config cache
            $config_cache = __DIR__ . '/bootstrap/cache/config.php';
            if (file_exists($config_cache) && unlink($config_cache)) {
                $cleared[] = 'config';
            }
            
            // Clear route cache
            $route_cache = __DIR__ . '/bootstrap/cache/routes-v7.php';
            if (file_exists($route_cache) && unlink($route_cache)) {
                $cleared[] = 'routes';
            }
            
            // Clear view cache
            $view_cache_dir = __DIR__ . '/storage/framework/views';
            if (is_dir($view_cache_dir)) {
                $files = glob($view_cache_dir . '/*.php');
                $count = 0;
                foreach ($files as $file) {
                    if (unlink($file)) $count++;
                }
                if ($count > 0) $cleared[] = "views ($count files)";
            }
            
            // Clear application cache
            $cache_dir = __DIR__ . '/storage/framework/cache/data';
            if (is_dir($cache_dir)) {
                $count = 0;
                $iterator = new RecursiveIteratorIterator(
                    new RecursiveDirectoryIterator($cache_dir, RecursiveDirectoryIterator::SKIP_DOTS),
                    RecursiveIteratorIterator::CHILD_FIRST
                );
                foreach ($iterator as $path) {
                    if ($path->isFile() && unlink($path->getRealPath())) {
                        $count++;
                    }
                }
                if ($count > 0) $cleared[] = "cache ($count files)";
            }
            
            $results['message'] = 'Caches cleared: ' . implode(', ', $cleared);
            break;

        case 'migrate:status':
            if (isset($app)) {
                try {
                    // Try to get migration status
                    $results['message'] = 'Migration status check requires database connection';
                    $results['note'] = 'Use your database management tool to check migrations table';
                } catch (Exception $e) {
                    $results['message'] = 'Cannot check migration status: ' . $e->getMessage();
                }
            } else {
                $results['message'] = 'Laravel not loaded. Check migrations manually in database.';
            }
            break;

        case 'queue:work':
            $results['message'] = 'Queue worker cannot be started via web interface. Use cron jobs or background processes.';
            $results['suggestion'] = 'Set up a cron job: * * * * * php /path/to/artisan queue:work --stop-when-empty';
            break;

        default:
            $results['error'] = 'Unknown command: ' . $command;
            $results['available_commands'] = [
                'config:clear' => 'Clear configuration cache',
                'route:clear' => 'Clear route cache',
                'view:clear' => 'Clear compiled view files',
                'cache:clear' => 'Clear application cache',
                'optimize:clear' => 'Clear all optimization caches',
                'migrate:status' => 'Show migration status',
                'queue:work' => 'Information about queue workers'
            ];
            break;
    }

    echo json_encode([
        'status' => isset($results['error']) ? 'error' : 'success',
        'command' => $command,
        'timestamp' => date('Y-m-d H:i:s'),
        'results' => $results
    ], JSON_PRETTY_PRINT);

} catch (Exception $e) {
    echo json_encode([
        'status' => 'error',
        'command' => $command,
        'message' => 'Error executing command: ' . $e->getMessage()
    ], JSON_PRETTY_PRINT);
}
?>