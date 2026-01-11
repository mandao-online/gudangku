<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
        // Create admin user
        User::create([
            'name' => 'Administrator',
            'email' => 'admin@fieldflow.local',
            'password' => Hash::make('password'),
            'position' => 'System Administrator',
            'department' => 'IT',
            'phone' => '+62 812 3456 7890',
            'role' => 'admin',
            'is_active' => true,
        ]);

        // Create staff user (sesuai dengan data di frontend)
        User::create([
            'name' => 'Ahmad Budiman',
            'email' => 'ahmad.budiman@majubersama.id',
            'password' => Hash::make('password'),
            'position' => 'Staff Gudang',
            'department' => 'Warehouse',
            'phone' => '+62 812 3456 7890',
            'role' => 'staff',
            'is_active' => true,
        ]);

        // Create manager user
        User::create([
            'name' => 'Siti Nurhaliza',
            'email' => 'siti.manager@majubersama.id',
            'password' => Hash::make('password'),
            'position' => 'Warehouse Manager',
            'department' => 'Warehouse',
            'phone' => '+62 813 4567 8901',
            'role' => 'manager',
            'is_active' => true,
        ]);
    }
}
