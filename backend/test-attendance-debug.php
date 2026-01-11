<?php

require_once 'vendor/autoload.php';

use App\Models\AttendanceRecord;
use App\Models\User;

// Load Laravel
$app = require_once 'bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

echo "=== Attendance Debug Test ===\n";

// Check total attendance records
$totalRecords = AttendanceRecord::count();
echo "Total attendance records: $totalRecords\n";

// Check users
$users = User::all();
echo "Total users: " . $users->count() . "\n";

foreach ($users as $user) {
    $userRecords = AttendanceRecord::where('user_id', $user->id)->count();
    echo "User: {$user->name} (ID: {$user->id}) - Records: $userRecords\n";
}

// Show recent records
echo "\n=== Recent Attendance Records ===\n";
$recentRecords = AttendanceRecord::with('user')
    ->orderBy('created_at', 'desc')
    ->limit(5)
    ->get();

foreach ($recentRecords as $record) {
    echo "Date: {$record->date} | User: {$record->user->name} | Status: {$record->status}\n";
}

echo "\n=== Test Export Query ===\n";
$exportQuery = AttendanceRecord::with('user');
$exportRecords = $exportQuery->orderBy('date', 'desc')->get();
echo "Export query would return: " . $exportRecords->count() . " records\n";

if ($exportRecords->count() > 0) {
    echo "Sample record:\n";
    $sample = $exportRecords->first();
    echo "- Date: {$sample->date}\n";
    echo "- User: {$sample->user->name}\n";
    echo "- Status: {$sample->status}\n";
    echo "- Check-in: " . ($sample->check_in ? $sample->check_in->format('H:i:s') : 'N/A') . "\n";
    echo "- Check-out: " . ($sample->check_out ? $sample->check_out->format('H:i:s') : 'N/A') . "\n";
}

echo "\nDebug completed!\n";