<?php

require_once 'vendor/autoload.php';

// Load Laravel
$app = require_once 'bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

echo "=== Users in Database ===\n";

$users = \App\Models\User::all(['id', 'name', 'phone', 'role', 'is_active']);

foreach ($users as $user) {
    echo "ID: {$user->id}\n";
    echo "Name: {$user->name}\n";
    echo "Phone: {$user->phone}\n";
    echo "Role: {$user->role}\n";
    echo "Active: " . ($user->is_active ? 'Yes' : 'No') . "\n";
    echo "---\n";
}

echo "Total users: " . $users->count() . "\n";