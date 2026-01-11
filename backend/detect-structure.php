<?php
/**
 * Detect Directory Structure
 * This script helps identify the correct Laravel directory structure
 */

echo "<h2>Directory Structure Detector</h2>";

$currentDir = __DIR__;
echo "<p><strong>Current script location:</strong> $currentDir</p>";

echo "<h3>Directory Analysis</h3>";

// Check current directory
echo "<h4>Current Directory Contents:</h4>";
$files = scandir($currentDir);
echo "<ul>";
foreach ($files as $file) {
    if ($file != '.' && $file != '..') {
        $path = $currentDir . '/' . $file;
        $type = is_dir($path) ? '[DIR]' : '[FILE]';
        echo "<li>$type $file</li>";
    }
}
echo "</ul>";

// Check parent directories
$checkDirs = [
    $currentDir,
    dirname($currentDir),
    dirname(dirname($currentDir)),
    dirname(dirname(dirname($currentDir)))
];

echo "<h3>Laravel Structure Search</h3>";
foreach ($checkDirs as $dir) {
    echo "<h4>Checking: $dir</h4>";
    
    $indicators = [
        'artisan' => file_exists($dir . '/artisan'),
        'composer.json' => file_exists($dir . '/composer.json'),
        'storage/' => is_dir($dir . '/storage'),
        'storage/app/' => is_dir($dir . '/storage/app'),
        'storage/app/public/' => is_dir($dir . '/storage/app/public'),
        'public/' => is_dir($dir . '/public'),
        'app/' => is_dir($dir . '/app'),
        'config/' => is_dir($dir . '/config')
    ];
    
    $score = 0;
    echo "<ul>";
    foreach ($indicators as $item => $exists) {
        $status = $exists ? '✅' : '❌';
        echo "<li>$status $item</li>";
        if ($exists) $score++;
    }
    echo "</ul>";
    
    echo "<p><strong>Laravel Score: $score/8</strong></p>";
    
    if ($score >= 6) {
        echo "<p style='color: green;'>🎯 <strong>This looks like the Laravel root directory!</strong></p>";
        
        // Show storage structure
        $storageDir = $dir . '/storage/app/public';
        if (is_dir($storageDir)) {
            echo "<h5>Storage Contents:</h5>";
            $storageContents = scandir($storageDir);
            echo "<ul>";
            foreach ($storageContents as $item) {
                if ($item != '.' && $item != '..') {
                    $itemPath = $storageDir . '/' . $item;
                    $type = is_dir($itemPath) ? '[DIR]' : '[FILE]';
                    echo "<li>$type $item";
                    
                    // If it's avatars directory, show contents
                    if ($item === 'avatars' && is_dir($itemPath)) {
                        $avatars = scandir($itemPath);
                        $avatarCount = count($avatars) - 2; // Exclude . and ..
                        echo " ($avatarCount files)";
                        
                        if ($avatarCount > 0) {
                            echo "<ul>";
                            foreach (array_slice($avatars, 2, 3) as $avatar) {
                                echo "<li>$avatar</li>";
                            }
                            if ($avatarCount > 3) {
                                echo "<li>... and " . ($avatarCount - 3) . " more</li>";
                            }
                            echo "</ul>";
                        }
                    }
                    echo "</li>";
                }
            }
            echo "</ul>";
        }
        
        // Check public/storage link
        $publicStorage = $dir . '/public/storage';
        echo "<h5>Public Storage Link Status:</h5>";
        if (file_exists($publicStorage)) {
            if (is_link($publicStorage)) {
                $target = readlink($publicStorage);
                echo "<p>✅ Symbolic link exists: $publicStorage -> $target</p>";
            } else {
                echo "<p>⚠️ Directory exists but is not a symbolic link</p>";
            }
        } else {
            echo "<p>❌ Public storage link does not exist</p>";
        }
        
        echo "<hr>";
        echo "<p><strong>Recommended Actions:</strong></p>";
        echo "<ol>";
        echo "<li><a href='fix-storage-paths.php'>🔧 Fix Storage Paths</a></li>";
        echo "<li><a href='test-storage-access.php'>🧪 Test Storage Access</a></li>";
        echo "</ol>";
    }
    
    echo "<hr>";
}

// Show full server path information
echo "<h3>Server Path Information</h3>";
echo "<p><strong>Document Root:</strong> " . ($_SERVER['DOCUMENT_ROOT'] ?? 'Not available') . "</p>";
echo "<p><strong>Script Filename:</strong> " . ($_SERVER['SCRIPT_FILENAME'] ?? 'Not available') . "</p>";
echo "<p><strong>Server Name:</strong> " . ($_SERVER['SERVER_NAME'] ?? 'Not available') . "</p>";

// Show environment information
echo "<h3>Environment Information</h3>";
echo "<p><strong>PHP Version:</strong> " . PHP_VERSION . "</p>";
echo "<p><strong>Operating System:</strong> " . PHP_OS . "</p>";
echo "<p><strong>Current User:</strong> " . (function_exists('posix_getpwuid') ? posix_getpwuid(posix_geteuid())['name'] : 'Unknown') . "</p>";

echo "<p><a href='javascript:history.back()'>← Back</a></p>";
?>