<?php
// Laravel Cache Clearing Script for Hostinger
// Use this when you can't access command line

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');

// Security check - remove this line in production or add proper authentication
$allowed_ips = ['127.0.0.1', '::1']; // Add your IP here for security
// if (!in_array($_SERVER['REMOTE_ADDR'], $allowed_ips)) {
//     die(json_encode(['error' => 'Access denied']));
// }

$results = [];
$overall_success = true;

try {
    // 1. Clear config cache (MOST IMPORTANT for database config)
    $config_cache_path = __DIR__ . '/bootstrap/cache/config.php';
    if (file_exists($config_cache_path)) {
        $deleted = unlink($config_cache_path);
        $results['config_cache'] = $deleted ? 'cleared' : 'failed';
        if (!$deleted) $overall_success = false;
    } else {
        $results['config_cache'] = 'not_found';
    }

    // FORCE clear any cached database connections
    if (function_exists('opcache_reset')) {
        opcache_reset();
        $results['opcache'] = 'reset';
    }

    // 2. Clear route cache
    $route_cache_path = __DIR__ . '/bootstrap/cache/routes-v7.php';
    if (file_exists($route_cache_path)) {
        $deleted = unlink($route_cache_path);
        $results['route_cache'] = $deleted ? 'cleared' : 'failed';
        if (!$deleted) $overall_success = false;
    } else {
        $results['route_cache'] = 'not_found';
    }

    // 3. Clear view cache
    $view_cache_dir = __DIR__ . '/storage/framework/views';
    if (is_dir($view_cache_dir)) {
        $files = glob($view_cache_dir . '/*');
        $cleared_count = 0;
        foreach ($files as $file) {
            if (is_file($file) && pathinfo($file, PATHINFO_EXTENSION) === 'php') {
                if (unlink($file)) {
                    $cleared_count++;
                }
            }
        }
        $results['view_cache'] = "cleared_{$cleared_count}_files";
    } else {
        $results['view_cache'] = 'directory_not_found';
    }

    // 4. Clear application cache
    $app_cache_dir = __DIR__ . '/storage/framework/cache/data';
    if (is_dir($app_cache_dir)) {
        $cleared_count = 0;
        $iterator = new RecursiveIteratorIterator(
            new RecursiveDirectoryIterator($app_cache_dir, RecursiveDirectoryIterator::SKIP_DOTS),
            RecursiveIteratorIterator::CHILD_FIRST
        );

        foreach ($iterator as $path) {
            if ($path->isFile()) {
                if (unlink($path->getRealPath())) {
                    $cleared_count++;
                }
            }
        }
        $results['app_cache'] = "cleared_{$cleared_count}_files";
    } else {
        $results['app_cache'] = 'directory_not_found';
    }

    // 5. Clear session files
    $session_dir = __DIR__ . '/storage/framework/sessions';
    if (is_dir($session_dir)) {
        $files = glob($session_dir . '/*');
        $cleared_count = 0;
        foreach ($files as $file) {
            if (is_file($file)) {
                if (unlink($file)) {
                    $cleared_count++;
                }
            }
        }
        $results['sessions'] = "cleared_{$cleared_count}_files";
    } else {
        $results['sessions'] = 'directory_not_found';
    }

    // 6. Clear compiled services
    $services_cache_path = __DIR__ . '/bootstrap/cache/services.php';
    if (file_exists($services_cache_path)) {
        $deleted = unlink($services_cache_path);
        $results['services_cache'] = $deleted ? 'cleared' : 'failed';
        if (!$deleted) $overall_success = false;
    } else {
        $results['services_cache'] = 'not_found';
    }

    // 7. Clear packages cache
    $packages_cache_path = __DIR__ . '/bootstrap/cache/packages.php';
    if (file_exists($packages_cache_path)) {
        $deleted = unlink($packages_cache_path);
        $results['packages_cache'] = $deleted ? 'cleared' : 'failed';
        if (!$deleted) $overall_success = false;
    } else {
        $results['packages_cache'] = 'not_found';
    }

    // 8. Clear log files (optional)
    $log_dir = __DIR__ . '/storage/logs';
    if (is_dir($log_dir)) {
        $files = glob($log_dir . '/*.log');
        $cleared_count = 0;
        foreach ($files as $file) {
            if (is_file($file)) {
                // Don't delete, just truncate to keep the file
                if (file_put_contents($file, '') !== false) {
                    $cleared_count++;
                }
            }
        }
        $results['logs'] = "truncated_{$cleared_count}_files";
    } else {
        $results['logs'] = 'directory_not_found';
    }

    echo json_encode([
        'status' => $overall_success ? 'success' : 'partial_success',
        'message' => $overall_success ? 'All caches cleared successfully!' : 'Some caches cleared, check details',
        'timestamp' => date('Y-m-d H:i:s'),
        'results' => $results,
        'instructions' => [
            'config_cache' => 'Laravel configuration cache',
            'route_cache' => 'Laravel route cache',
            'view_cache' => 'Blade template cache',
            'app_cache' => 'Application data cache',
            'sessions' => 'User session files',
            'services_cache' => 'Service provider cache',
            'packages_cache' => 'Package discovery cache',
            'logs' => 'Log files (truncated, not deleted)'
        ]
    ], JSON_PRETTY_PRINT);

} catch (Exception $e) {
    echo json_encode([
        'status' => 'error',
        'message' => 'Error clearing cache: ' . $e->getMessage(),
        'results' => $results
    ], JSON_PRETTY_PRINT);
}
?>