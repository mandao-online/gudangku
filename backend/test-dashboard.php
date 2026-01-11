<?php

require_once 'vendor/autoload.php';

use App\Http\Controllers\Api\DashboardController;
use App\Http\Controllers\Api\AuthController;
use Illuminate\Http\Request;

// Load Laravel
$app = require_once 'bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

echo "=== Testing Dashboard API ===\n";

try {
    // First login to get authenticated user
    $authController = new AuthController();
    $loginRequest = new Request();
    $loginRequest->merge([
        'phone' => '081154105490',
        'password' => 'password'
    ]);
    
    $loginResponse = $authController->login($loginRequest);
    $loginData = json_decode($loginResponse->getContent(), true);
    
    if (!$loginData['success']) {
        echo "Login failed: " . $loginData['message'] . "\n";
        exit;
    }
    
    echo "Login successful for: " . $loginData['data']['user']['name'] . "\n";
    
    // Set authenticated user
    auth()->login(\App\Models\User::find($loginData['data']['user']['id']));
    
    // Test dashboard stats
    $dashboardController = new DashboardController();
    $statsRequest = new Request();
    
    echo "\nTesting dashboard stats...\n";
    $statsResponse = $dashboardController->stats($statsRequest);
    $statsData = json_decode($statsResponse->getContent(), true);
    
    echo "Stats Response:\n";
    echo "- Total Items: " . $statsData['data']['total_items'] . "\n";
    echo "- Total Stock: " . $statsData['data']['total_stock'] . "\n";
    echo "- Low Stock Items: " . $statsData['data']['low_stock_items'] . "\n";
    echo "- Today Stock In: " . $statsData['data']['today_stock_in'] . "\n";
    echo "- Today Stock Out: " . $statsData['data']['today_stock_out'] . "\n";
    
    // Test dashboard activities
    echo "\nTesting dashboard activities...\n";
    $activitiesRequest = new Request();
    $activitiesRequest->merge(['limit' => 5]);
    
    $activitiesResponse = $dashboardController->activities($activitiesRequest);
    $activitiesData = json_decode($activitiesResponse->getContent(), true);
    
    echo "Activities Response:\n";
    echo "- Total Activities: " . count($activitiesData['data']) . "\n";
    
    foreach ($activitiesData['data'] as $activity) {
        echo "  * " . $activity['item_name'] . " - " . $activity['type'] . " (" . $activity['quantity'] . ")\n";
    }
    
} catch (Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
    echo "Trace: " . $e->getTraceAsString() . "\n";
}

echo "\n=== Test Complete ===\n";