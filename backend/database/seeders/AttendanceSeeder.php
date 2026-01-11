<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\AttendanceRecord;
use App\Models\User;
use Carbon\Carbon;

class AttendanceSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
        // Get the first user (should be Ahmad Budiman)
        $user = User::first();
        
        if (!$user) {
            $this->command->error('No users found. Please run UserSeeder first.');
            return;
        }

        $this->command->info('Creating attendance records for user: ' . $user->name);

        // Create attendance records for the last 30 days
        for ($i = 29; $i >= 0; $i--) {
            $date = Carbon::now('Asia/Singapore')->subDays($i);
            
            // Skip weekends (Saturday = 6, Sunday = 0)
            if ($date->dayOfWeek == 0 || $date->dayOfWeek == 6) {
                continue;
            }
            
            // 90% chance of attendance
            if (rand(1, 10) <= 9) {
                $checkIn = $date->copy()->setTime(8, rand(0, 30), rand(0, 59));
                $checkOut = $date->copy()->setTime(17, rand(0, 30), rand(0, 59));
                
                AttendanceRecord::create([
                    'user_id' => $user->id,
                    'date' => $date->toDateString(),
                    'check_in' => $checkIn,
                    'check_out' => $checkOut,
                    'status' => 'present',
                    'notes' => rand(1, 5) == 1 ? 'Catatan absensi hari ini' : null,
                    'latitude' => -6.2088 + (rand(-1000, 1000) / 100000), // Jakarta area
                    'longitude' => 106.8456 + (rand(-1000, 1000) / 100000),
                    'created_at' => $checkIn,
                    'updated_at' => $checkOut,
                ]);
                
                $this->command->info('Created attendance for: ' . $date->format('Y-m-d'));
            }
        }
        
        $this->command->info('Attendance seeding completed!');
    }
}