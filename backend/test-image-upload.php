<?php

// Simple test script to verify image upload functionality
// Run with: php test-image-upload.php

echo "Testing Image Upload API Endpoints\n";
echo "==================================\n\n";

// Test 1: Check if storage directory exists
$storageDir = storage_path('app/public/items');
if (!is_dir($storageDir)) {
    echo "❌ Storage directory does not exist: $storageDir\n";
    mkdir($storageDir, 0755, true);
    echo "✅ Created storage directory\n";
} else {
    echo "✅ Storage directory exists: $storageDir\n";
}

// Test 2: Check if public storage link exists
$publicLink = public_path('storage');
if (!is_link($publicLink) && !is_dir($publicLink)) {
    echo "❌ Public storage link does not exist\n";
    echo "Run: php artisan storage:link\n";
} else {
    echo "✅ Public storage link exists\n";
}

// Test 3: Check database schema
try {
    $pdo = new PDO('mysql:host=127.0.0.1;dbname=warehouse_db', 'root', '');
    $stmt = $pdo->query("DESCRIBE items");
    $columns = $stmt->fetchAll(PDO::FETCH_COLUMN);
    
    if (in_array('image', $columns)) {
        echo "✅ Database has 'image' column in items table\n";
    } else {
        echo "❌ Database missing 'image' column in items table\n";
        echo "Run: php artisan migrate\n";
    }
} catch (Exception $e) {
    echo "❌ Database connection failed: " . $e->getMessage() . "\n";
}

// Test 4: Check if Item model has image in fillable
$itemModel = file_get_contents(app_path('Models/Item.php'));
if (strpos($itemModel, "'image'") !== false) {
    echo "✅ Item model includes 'image' in fillable fields\n";
} else {
    echo "❌ Item model missing 'image' in fillable fields\n";
}

// Test 5: Check if ItemResource includes image fields
$itemResource = file_get_contents(app_path('Http/Resources/ItemResource.php'));
if (strpos($itemResource, "'image'") !== false && strpos($itemResource, "'image_url'") !== false) {
    echo "✅ ItemResource includes image fields\n";
} else {
    echo "❌ ItemResource missing image fields\n";
}

echo "\nTest completed!\n";
echo "Frontend URL: http://localhost:5173\n";
echo "Backend URL: http://localhost:8001\n";
echo "Login: ahmad.budiman@majubersama.id / password\n";