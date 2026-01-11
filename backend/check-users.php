<?php

require_once 'vendor/autoload.php';

use App\Models\User;

// Load Laravel
$app = require_once 'bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

echo "=== Available Users ===\n";

$users = User::all();

foreach ($users as $user) {
    echo "ID: {$user->id}\n";
    echo "Name: {$user->name}\n";
    echo "Email: {$user->email}\n";
    echo "Phone: " . ($user->phone ?: 'N/A') . "\n";
    echo "Role: {$user->role}\n";
    echo "Position: " . ($user->position ?: 'N/A') . "\n";
    echo "Department: " . ($user->department ?: 'N/A') . "\n";
    echo "Active: " . ($user->is_active ? 'Yes' : 'No') . "\n";
    echo "Created: {$user->created_at}\n";
    echo "---\n";
}

echo "\n=== Login Credentials (Default Password: 'password') ===\n";
foreach ($users as $user) {
    echo "Phone: {$user->phone} | Email: {$user->email} | Password: password | Role: {$user->role}\n";
}

echo "\n=== Recommended Login ===\n";
$defaultUser = User::where('email', 'ahmad.budiman@majubersama.id')->first();
if ($defaultUser) {
    echo "Default User Found:\n";
    echo "Phone: {$defaultUser->phone}\n";
    echo "Email: {$defaultUser->email}\n";
    echo "Password: password\n";
    echo "Role: {$defaultUser->role}\n";
} else {
    echo "Default user not found. Available users:\n";
    foreach ($users as $user) {
        echo "- Phone: {$user->phone} | Email: {$user->email} (Role: {$user->role})\n";
    }
}