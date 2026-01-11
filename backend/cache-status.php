<?php
// Laravel Cache Status Checker
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');

$status = [];

try {
    // Check config cache
    $config_cache_path = __DIR__ . '/bootstrap/cache/config.php';
    $status['config_cache'] = [
        'exists' => file_exists($config_cache_path),
        'size' => file_exists($config_cache_path) ? filesize($config_cache_path) : 0,
        'modified' => file_exists($config_cache_path) ? date('Y-m-d H:i:s', filemtime($config_cache_path)) : null
    ];

    // Check route cache
    $route_cache_path = __DIR__ . '/bootstrap/cache/routes-v7.php';
    $status['route_cache'] = [
        'exists' => file_exists($route_cache_path),
        'size' => file_exists($route_cache_path) ? filesize($route_cache_path) : 0,
        'modified' => file_exists($route_cache_path) ? date('Y-m-d H:i:s', filemtime($route_cache_path)) : null
    ];

    // Check view cache
    $view_cache_dir = __DIR__ . '/storage/framework/views';
    if (is_dir($view_cache_dir)) {
        $files = glob($view_cache_dir . '/*.php');
        $total_size = 0;
        foreach ($files as $file) {
            $total_size += filesize($file);
        }
        $status['view_cache'] = [
            'files_count' => count($files),
            'total_size' => $total_size,
            'directory_exists' => true
        ];
    } else {
        $status['view_cache'] = ['directory_exists' => false];
    }

    // Check application cache
    $app_cache_dir = __DIR__ . '/storage/framework/cache/data';
    if (is_dir($app_cache_dir)) {
        $files = new RecursiveIteratorIterator(
            new RecursiveDirectoryIterator($app_cache_dir, RecursiveDirectoryIterator::SKIP_DOTS)
        );
        $file_count = 0;
        $total_size = 0;
        foreach ($files as $file) {
            if ($file->isFile()) {
                $file_count++;
                $total_size += $file->getSize();
            }
        }
        $status['app_cache'] = [
            'files_count' => $file_count,
            'total_size' => $total_size,
            'directory_exists' => true
        ];
    } else {
        $status['app_cache'] = ['directory_exists' => false];
    }

    // Check sessions
    $session_dir = __DIR__ . '/storage/framework/sessions';
    if (is_dir($session_dir)) {
        $files = glob($session_dir . '/*');
        $total_size = 0;
        foreach ($files as $file) {
            if (is_file($file)) {
                $total_size += filesize($file);
            }
        }
        $status['sessions'] = [
            'files_count' => count($files),
            'total_size' => $total_size,
            'directory_exists' => true
        ];
    } else {
        $status['sessions'] = ['directory_exists' => false];
    }

    // Check logs
    $log_dir = __DIR__ . '/storage/logs';
    if (is_dir($log_dir)) {
        $files = glob($log_dir . '/*.log');
        $total_size = 0;
        $latest_log = null;
        $latest_time = 0;
        
        foreach ($files as $file) {
            if (is_file($file)) {
                $size = filesize($file);
                $total_size += $size;
                $mtime = filemtime($file);
                if ($mtime > $latest_time) {
                    $latest_time = $mtime;
                    $latest_log = basename($file);
                }
            }
        }
        
        $status['logs'] = [
            'files_count' => count($files),
            'total_size' => $total_size,
            'latest_log' => $latest_log,
            'latest_modified' => $latest_time ? date('Y-m-d H:i:s', $latest_time) : null,
            'directory_exists' => true
        ];
    } else {
        $status['logs'] = ['directory_exists' => false];
    }

    // Calculate total cache size
    $total_cache_size = 0;
    foreach ($status as $cache_type => $info) {
        if (isset($info['size'])) {
            $total_cache_size += $info['size'];
        }
        if (isset($info['total_size'])) {
            $total_cache_size += $info['total_size'];
        }
    }

    echo json_encode([
        'status' => 'success',
        'timestamp' => date('Y-m-d H:i:s'),
        'total_cache_size' => $total_cache_size,
        'total_cache_size_formatted' => formatBytes($total_cache_size),
        'cache_details' => $status,
        'recommendations' => getCacheRecommendations($status)
    ], JSON_PRETTY_PRINT);

} catch (Exception $e) {
    echo json_encode([
        'status' => 'error',
        'message' => 'Error checking cache status: ' . $e->getMessage()
    ], JSON_PRETTY_PRINT);
}

function formatBytes($size, $precision = 2) {
    $units = array('B', 'KB', 'MB', 'GB', 'TB');
    for ($i = 0; $size > 1024 && $i < count($units) - 1; $i++) {
        $size /= 1024;
    }
    return round($size, $precision) . ' ' . $units[$i];
}

function getCacheRecommendations($status) {
    $recommendations = [];
    
    if ($status['config_cache']['exists']) {
        $recommendations[] = "Config cache is active - good for production";
    } else {
        $recommendations[] = "Consider caching config for better performance";
    }
    
    if ($status['view_cache']['directory_exists'] && $status['view_cache']['files_count'] > 100) {
        $recommendations[] = "Many view cache files - consider clearing if experiencing issues";
    }
    
    if (isset($status['logs']['total_size']) && $status['logs']['total_size'] > 10 * 1024 * 1024) { // 10MB
        $recommendations[] = "Log files are large - consider clearing to save space";
    }
    
    return $recommendations;
}
?>