<?php
/**
 * Create Storage Symbolic Link for Hostinger
 * This script creates the symbolic link that Laravel's storage:link command would create
 */

// Define paths
$target = __DIR__ . '/storage/app/public';
$link = __DIR__ . '/public/storage';

// Debug: Show current directory and paths
echo "<h3>Debug Information</h3>";
echo "<p>Current script directory: " . __DIR__ . "</p>";
echo "<p>Target path: " . $target . "</p>";
echo "<p>Link path: " . $link . "</p>";

// Check if we're in the right directory structure
if (!is_dir(__DIR__ . '/storage')) {
    echo "<p style='color: orange;'>⚠️ Storage directory not found in current location</p>";
    echo "<p>Checking parent directory...</p>";
    
    // Try parent directory (if script is in subdirectory)
    $parentDir = dirname(__DIR__);
    $target = $parentDir . '/storage/app/public';
    $link = $parentDir . '/public/storage';
    
    echo "<p>Trying parent directory: $parentDir</p>";
    echo "<p>New target path: " . $target . "</p>";
    echo "<p>New link path: " . $link . "</p>";
}

echo "<h2>Laravel Storage Link Creator</h2>";
echo "<p>Target: " . $target . "</p>";
echo "<p>Link: " . $link . "</p>";

// Check if target directory exists
if (!is_dir($target)) {
    echo "<p style='color: red;'>❌ Target directory does not exist: $target</p>";
    exit;
}

// Check if link already exists
if (file_exists($link)) {
    if (is_link($link)) {
        echo "<p style='color: orange;'>⚠️ Symbolic link already exists</p>";
        echo "<p>Current link target: " . readlink($link) . "</p>";
        
        // Remove existing link to recreate
        unlink($link);
        echo "<p>🗑️ Removed existing link</p>";
    } else {
        echo "<p style='color: red;'>❌ A file or directory already exists at the link location</p>";
        exit;
    }
}

// Create symbolic link
if (symlink($target, $link)) {
    echo "<p style='color: green;'>✅ Symbolic link created successfully!</p>";
    echo "<p>✅ Storage link: public/storage -> storage/app/public</p>";
    
    // Test the link
    if (is_link($link) && readlink($link) === $target) {
        echo "<p style='color: green;'>✅ Link verification successful</p>";
        
        // Test file access
        $testFiles = glob($target . '/*');
        if (!empty($testFiles)) {
            echo "<p>📁 Files found in storage:</p>";
            echo "<ul>";
            foreach (array_slice($testFiles, 0, 5) as $file) {
                $filename = basename($file);
                $webPath = '/storage/' . $filename;
                echo "<li>$filename -> <a href='$webPath' target='_blank'>$webPath</a></li>";
            }
            echo "</ul>";
        }
        
        // Check avatars directory specifically
        $avatarsDir = $target . '/avatars';
        if (is_dir($avatarsDir)) {
            echo "<p>👤 Avatar files:</p>";
            $avatarFiles = glob($avatarsDir . '/*');
            if (!empty($avatarFiles)) {
                echo "<ul>";
                foreach (array_slice($avatarFiles, 0, 5) as $file) {
                    $filename = basename($file);
                    $webPath = '/storage/avatars/' . $filename;
                    echo "<li>$filename -> <a href='$webPath' target='_blank'>$webPath</a></li>";
                }
                echo "</ul>";
            } else {
                echo "<p>No avatar files found</p>";
            }
        }
        
    } else {
        echo "<p style='color: red;'>❌ Link verification failed</p>";
    }
} else {
    echo "<p style='color: red;'>❌ Failed to create symbolic link</p>";
    echo "<p>Error: " . error_get_last()['message'] . "</p>";
    
    // Alternative: Try creating a directory structure instead
    echo "<h3>Attempting alternative solution...</h3>";
    
    if (!is_dir(dirname($link))) {
        mkdir(dirname($link), 0755, true);
    }
    
    // Copy files instead of symlink (fallback for shared hosting)
    if (copyDirectory($target, $link)) {
        echo "<p style='color: green;'>✅ Files copied successfully as fallback</p>";
        echo "<p>⚠️ Note: Files are copied, not linked. You'll need to re-run this after uploading new files.</p>";
    } else {
        echo "<p style='color: red;'>❌ Failed to copy files</p>";
    }
}

function copyDirectory($src, $dst) {
    $dir = opendir($src);
    if (!$dir) return false;
    
    if (!is_dir($dst)) {
        mkdir($dst, 0755, true);
    }
    
    while (($file = readdir($dir)) !== false) {
        if ($file != '.' && $file != '..') {
            $srcFile = $src . '/' . $file;
            $dstFile = $dst . '/' . $file;
            
            if (is_dir($srcFile)) {
                copyDirectory($srcFile, $dstFile);
            } else {
                copy($srcFile, $dstFile);
            }
        }
    }
    closedir($dir);
    return true;
}

echo "<hr>";
echo "<p><strong>Next Steps:</strong></p>";
echo "<ol>";
echo "<li>Test image URLs in your application</li>";
echo "<li>If using file uploads, ensure proper permissions (755 for directories, 644 for files)</li>";
echo "<li>For future uploads, files should be accessible via /storage/... URLs</li>";
echo "</ol>";

echo "<p><a href='javascript:history.back()'>← Back</a></p>";
?>