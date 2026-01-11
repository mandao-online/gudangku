<?php
/**
 * Test Storage Access
 * This script tests if storage files are accessible via web URLs
 */

echo "<h2>Storage Access Test</h2>";

// Test paths
$storagePath = __DIR__ . '/storage/app/public';
$publicStoragePath = __DIR__ . '/public/storage';
$webUrl = 'https://gudangku.dashdearchitect.com/storage';

echo "<h3>Path Information</h3>";
echo "<p><strong>Storage Path:</strong> $storagePath</p>";
echo "<p><strong>Public Storage Path:</strong> $publicStoragePath</p>";
echo "<p><strong>Web URL Base:</strong> $webUrl</p>";

echo "<h3>Directory Status</h3>";
echo "<p>Storage directory exists: " . (is_dir($storagePath) ? '✅ Yes' : '❌ No') . "</p>";
echo "<p>Public storage link exists: " . (file_exists($publicStoragePath) ? '✅ Yes' : '❌ No') . "</p>";

if (file_exists($publicStoragePath)) {
    if (is_link($publicStoragePath)) {
        echo "<p>Public storage is a symbolic link: ✅ Yes</p>";
        echo "<p>Link target: " . readlink($publicStoragePath) . "</p>";
    } else {
        echo "<p>Public storage is a directory (not symlink): ⚠️ Warning</p>";
    }
}

echo "<h3>Avatar Directory Test</h3>";
$avatarsPath = $storagePath . '/avatars';
$publicAvatarsPath = $publicStoragePath . '/avatars';

echo "<p>Avatars directory exists: " . (is_dir($avatarsPath) ? '✅ Yes' : '❌ No') . "</p>";
echo "<p>Public avatars accessible: " . (is_dir($publicAvatarsPath) ? '✅ Yes' : '❌ No') . "</p>";

if (is_dir($avatarsPath)) {
    $avatarFiles = glob($avatarsPath . '/*');
    echo "<p>Avatar files found: " . count($avatarFiles) . "</p>";
    
    if (!empty($avatarFiles)) {
        echo "<h4>Avatar Files Test</h4>";
        echo "<table border='1' cellpadding='5'>";
        echo "<tr><th>File</th><th>Storage Path</th><th>Web URL</th><th>Accessible</th></tr>";
        
        foreach (array_slice($avatarFiles, 0, 5) as $file) {
            $filename = basename($file);
            $webPath = "/storage/avatars/$filename";
            $fullWebUrl = $webUrl . "/avatars/$filename";
            $publicFilePath = $publicStoragePath . "/avatars/$filename";
            
            $accessible = file_exists($publicFilePath) ? '✅ Yes' : '❌ No';
            
            echo "<tr>";
            echo "<td>$filename</td>";
            echo "<td>" . (file_exists($file) ? '✅' : '❌') . "</td>";
            echo "<td><a href='$fullWebUrl' target='_blank'>$webPath</a></td>";
            echo "<td>$accessible</td>";
            echo "</tr>";
        }
        echo "</table>";
    }
}

echo "<h3>Test Specific File</h3>";
$testFile = '1768132313_2.png';
$testStoragePath = $avatarsPath . '/' . $testFile;
$testPublicPath = $publicAvatarsPath . '/' . $testFile;
$testWebUrl = $webUrl . '/avatars/' . $testFile;

echo "<p><strong>Testing file:</strong> $testFile</p>";
echo "<p>File exists in storage: " . (file_exists($testStoragePath) ? '✅ Yes' : '❌ No') . "</p>";
echo "<p>File accessible via public: " . (file_exists($testPublicPath) ? '✅ Yes' : '❌ No') . "</p>";
echo "<p>Web URL: <a href='$testWebUrl' target='_blank'>$testWebUrl</a></p>";

if (file_exists($testStoragePath)) {
    echo "<p>File size: " . filesize($testStoragePath) . " bytes</p>";
    echo "<p>File permissions: " . substr(sprintf('%o', fileperms($testStoragePath)), -4) . "</p>";
}

echo "<h3>Solutions</h3>";
if (!file_exists($publicStoragePath)) {
    echo "<p style='color: red;'>❌ Storage link missing</p>";
    echo "<p><a href='create-storage-link.php'>🔧 Create Storage Link</a></p>";
} elseif (!file_exists($testPublicPath) && file_exists($testStoragePath)) {
    echo "<p style='color: orange;'>⚠️ Storage link exists but file not accessible</p>";
    echo "<p><a href='create-storage-link.php'>🔧 Recreate Storage Link</a></p>";
} else {
    echo "<p style='color: green;'>✅ Storage appears to be configured correctly</p>";
}

echo "<hr>";
echo "<p><strong>Quick Actions:</strong></p>";
echo "<ul>";
echo "<li><a href='create-storage-link.php'>Create/Recreate Storage Link</a></li>";
echo "<li><a href='clear-cache.php'>Clear Laravel Cache</a></li>";
echo "<li><a href='cache-manager.php'>Cache Manager</a></li>";
echo "</ul>";

echo "<p><a href='javascript:history.back()'>← Back</a></p>";
?>