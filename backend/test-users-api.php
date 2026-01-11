<?php

require_once 'vendor/autoload.php';

use App\Models\User;

// Load Laravel
$app = require_once 'bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

echo "=== Testing Users API ===\n";

// Test 1: Check if users exist
echo "\n1. Checking users in database:\n";
$users = User::all();
echo "Found " . $users->count() . " users\n";

foreach ($users as $user) {
    echo "- ID: {$user->id}, Name: {$user->name}, Email: {$user->email}, Phone: {$user->phone}, Role: {$user->role}\n";
}

// Test 2: Test UserController directly
echo "\n2. Testing UserController index method:\n";
try {
    $controller = new App\Http\Controllers\Api\UserController();
    
    // Create a mock request
    $request = new Illuminate\Http\Request();
    $request->merge([
        'per_page' => 15,
        'page' => 1,
        'sort_by' => 'name',
        'sort_order' => 'asc'
    ]);
    
    $response = $controller->index($request);
    $responseData = json_decode($response->getContent(), true);
    
    echo "Response status: " . $response->getStatusCode() . "\n";
    echo "Response success: " . ($responseData['success'] ? 'true' : 'false') . "\n";
    echo "Users count: " . count($responseData['data'] ?? []) . "\n";
    
    if (isset($responseData['pagination'])) {
        echo "Pagination: " . json_encode($responseData['pagination']) . "\n";
    }
    
} catch (Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
    echo "Trace: " . $e->getTraceAsString() . "\n";
}

echo "\n=== Test Complete ===\n";