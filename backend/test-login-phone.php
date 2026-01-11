<?php

require_once 'vendor/autoload.php';

use App\Http\Controllers\Api\AuthController;
use Illuminate\Http\Request;

// Load Laravel
$app = require_once 'bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

echo "=== Testing Phone Login ===\n";

try {
    $controller = new AuthController();
    
    // Create a mock request for phone login
    $request = new Request();
    $request->merge([
        'phone' => '081154105490',
        'password' => 'password'
    ]);
    
    echo "Testing login with phone: 081154105490\n";
    
    $response = $controller->login($request);
    $responseData = json_decode($response->getContent(), true);
    
    echo "Response status: " . $response->getStatusCode() . "\n";
    echo "Response success: " . ($responseData['success'] ? 'true' : 'false') . "\n";
    
    if ($responseData['success']) {
        echo "User: " . $responseData['data']['user']['name'] . "\n";
        echo "Role: " . $responseData['data']['user']['role'] . "\n";
        echo "Token: " . substr($responseData['data']['token'], 0, 20) . "...\n";
    } else {
        echo "Error: " . ($responseData['message'] ?? 'Unknown error') . "\n";
    }
    
} catch (Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
    echo "Trace: " . $e->getTraceAsString() . "\n";
}

echo "\n=== Test Complete ===\n";