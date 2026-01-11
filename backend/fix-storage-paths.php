<?php
/**
 * Fix Storage Paths - Auto-detect correct Laravel directory structure
 */

echo "<h2>Laravel Storage Path Fixer</h2>";

// Function to find Laravel root directory
function findLaravelRoot($startDir) {
    $currentDir = $startDir;
    $maxLevels = 5; // Prevent infinite loop
    
    for ($i = 0; $i < $maxLevels; $i++) {
        // Check for Laravel indicators
        if (file_exists($currentDir . '/artisan') || 
            file_exists($currentDir . '/composer.json') ||
            is_dir($currentDir . '/storage/app')) {
            return $currentDir;
        }
        
        $parentDir = dirname($currentDir);
        if ($parentDir === $currentDir) {
            break; // Reached root directory
        }
        $currentDir = $parentDir;
    }
    
    return false;
}

// Find Laravel root
$scriptDir = __DIR__;
$laravelRoot = findLaravelRoot($scriptDir);

echo "<h3>Directory Detection</h3>";
echo "<p>Script location: $scriptDir</p>";

if ($laravelRoot) {
    echo "<p style='color: green;'>✅ Laravel root found: $laravelRoot</p>";
    
    $target = $laravelRoot . '/storage/app/public';
    $link = $laravelRoot . '/public/storage';
    
    echo "<p>Target directory: $target</p>";
    echo "<p>Link location: $link</p>";
    
} else {
    echo "<p style='color: red;'>❌ Laravel root not found</p>";
    echo "<p>Trying manual paths...</p>";
    
    // Manual fallback paths
    $possibleRoots = [
        $scriptDir,
        dirname($scriptDir),
        dirname(dirname($scriptDir)),
        '/home/u774809254/domains/dashdearchitect.com/public_html',
        '/home/u774809254/domains/dashdearchitect.com/public_html/gudangku'
    ];
    
    foreach ($possibleRoots as $root) {
        $testTarget = $root . '/storage/app/public';
        $testLink = $root . '/public/storage';
        
        echo "<p>Testing root: $root</p>";
        echo "<p>- Storage exists: " . (is_dir($testTarget) ? '✅' : '❌') . "</p>";
        echo "<p>- Public dir exists: " . (is_dir(dirname($testLink)) ? '✅' : '❌') . "</p>";
        
        if (is_dir($testTarget) && is_dir(dirname($testLink))) {
            $laravelRoot = $root;
            $target = $testTarget;
            $link = $testLink;
            echo "<p style='color: green;'>✅ Found working paths!</p>";
            break;
        }
    }
}

if (!$laravelRoot) {
    echo "<p style='color: red;'>❌ Could not find Laravel directory structure</p>";
    echo "<p>Please check your file structure and ensure this script is in the Laravel project.</p>";
    exit;
}

echo "<h3>Final Paths</h3>";
echo "<p><strong>Laravel Root:</strong> $laravelRoot</p>";
echo "<p><strong>Storage Target:</strong> $target</p>";
echo "<p><strong>Public Link:</strong> $link</p>";

// Check if target directory exists
if (!is_dir($target)) {
    echo "<p style='color: red;'>❌ Target directory does not exist: $target</p>";
    
    // Try to create the directory structure
    echo "<p>Attempting to create storage directory structure...</p>";
    if (mkdir($target, 0755, true)) {
        echo "<p style='color: green;'>✅ Created storage directory structure</p>";
    } else {
        echo "<p style='color: red;'>❌ Failed to create storage directory</p>";
        exit;
    }
}

// Check if public directory exists
if (!is_dir(dirname($link))) {
    echo "<p style='color: red;'>❌ Public directory does not exist: " . dirname($link) . "</p>";
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
        echo "<p>Removing existing file/directory...</p>";
        if (is_dir($link)) {
            rmdir($link);
        } else {
            unlink($link);
        }
    }
}

// Create symbolic link
echo "<h3>Creating Storage Link</h3>";
if (symlink($target, $link)) {
    echo "<p style='color: green;'>✅ Symbolic link created successfully!</p>";
    echo "<p>✅ Storage link: $link -> $target</p>";
    
    // Test the link
    if (is_link($link) && readlink($link) === $target) {
        echo "<p style='color: green;'>✅ Link verification successful</p>";
        
        // Test avatars directory specifically
        $avatarsTarget = $target . '/avatars';
        $avatarsLink = $link . '/avatars';
        
        if (is_dir($avatarsTarget)) {
            echo "<p style='color: green;'>✅ Avatars directory found in storage</p>";
            
            if (is_dir($avatarsLink)) {
                echo "<p style='color: green;'>✅ Avatars accessible via public link</p>";
                
                // List avatar files
                $avatarFiles = glob($avatarsTarget . '/*');
                if (!empty($avatarFiles)) {
                    echo "<h4>Avatar Files Test</h4>";
                    echo "<table border='1' cellpadding='5'>";
                    echo "<tr><th>File</th><th>Web URL</th><th>Test Link</th></tr>";
                    
                    foreach (array_slice($avatarFiles, 0, 5) as $file) {
                        $filename = basename($file);
                        $webPath = "/storage/avatars/$filename";
                        $fullUrl = "https://gudangku.dashdearchitect.com/storage/avatars/$filename";
                        
                        echo "<tr>";
                        echo "<td>$filename</td>";
                        echo "<td>$webPath</td>";
                        echo "<td><a href='$fullUrl' target='_blank'>Test</a></td>";
                        echo "</tr>";
                    }
                    echo "</table>";
                }
            } else {
                echo "<p style='color: red;'>❌ Avatars not accessible via public link</p>";
            }
        } else {
            echo "<p style='color: orange;'>⚠️ No avatars directory found</p>";
            echo "<p>Creating avatars directory...</p>";
            mkdir($avatarsTarget, 0755, true);
        }
        
    } else {
        echo "<p style='color: red;'>❌ Link verification failed</p>";
    }
} else {
    echo "<p style='color: red;'>❌ Failed to create symbolic link</p>";
    echo "<p>Error: " . (error_get_last()['message'] ?? 'Unknown error') . "</p>";
    
    // Alternative: Copy files instead
    echo "<h3>Attempting File Copy Fallback</h3>";
    
    if (copyDirectory($target, $link)) {
        echo "<p style='color: green;'>✅ Files copied successfully as fallback</p>";
        echo "<p>⚠️ Note: Files are copied, not linked. Re-run this after uploading new files.</p>";
    } else {
        echo "<p style='color: red;'>❌ Failed to copy files</p>";
    }
}

function copyDirectory($src, $dst) {
    if (!is_dir($src)) return false;
    
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
echo "<h3>Summary</h3>";
echo "<p><strong>Laravel Root:</strong> $laravelRoot</p>";
echo "<p><strong>Storage Location:</strong> $target</p>";
echo "<p><strong>Public Access:</strong> $link</p>";
echo "<p><strong>Web URL Base:</strong> https://gudangku.dashdearchitect.com/storage/</p>";

echo "<h3>Test Your Images</h3>";
echo "<p>Your uploaded images should now be accessible at:</p>";
echo "<p><code>https://gudangku.dashdearchitect.com/storage/avatars/1768132313_2.png</code></p>";

echo "<p><a href='test-storage-access.php'>🧪 Test Storage Access</a></p>";
echo "<p><a href='javascript:history.back()'>← Back</a></p>";
?>