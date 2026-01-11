<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\StockMovement;
use App\Models\Item;
use App\Models\User;
use Carbon\Carbon;

class StockMovementSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
        // Get some items and users for the movements
        $items = Item::all();
        $users = User::all();
        
        if ($items->isEmpty() || $users->isEmpty()) {
            $this->command->warn('No items or users found. Please run ItemSeeder and UserSeeder first.');
            return;
        }

        // Create stock movements for today and yesterday
        $movements = [
            // Today's movements
            [
                'item_id' => $items->first()->id,
                'user_id' => $users->first()->id,
                'type' => 'in',
                'quantity' => 50,
                'stock_before' => 100,
                'stock_after' => 150,
                'note' => 'Pembelian dari supplier',
                'reference_number' => 'PO-' . date('Ymd') . '-001',
                'created_at' => Carbon::today()->addHours(8),
            ],
            [
                'item_id' => $items->skip(1)->first()->id,
                'user_id' => $users->first()->id,
                'type' => 'out',
                'quantity' => 10,
                'stock_before' => 35,
                'stock_after' => 25,
                'note' => 'Penggunaan untuk proyek A',
                'reference_number' => 'OUT-' . date('Ymd') . '-001',
                'created_at' => Carbon::today()->addHours(10),
            ],
            [
                'item_id' => $items->skip(2)->first()->id,
                'user_id' => $users->skip(1)->first()->id ?? $users->first()->id,
                'type' => 'in',
                'quantity' => 20,
                'stock_before' => 60,
                'stock_after' => 80,
                'note' => 'Retur dari proyek B',
                'reference_number' => 'RTN-' . date('Ymd') . '-001',
                'created_at' => Carbon::today()->addHours(14),
            ],
            [
                'item_id' => $items->skip(3)->first()->id,
                'user_id' => $users->first()->id,
                'type' => 'out',
                'quantity' => 5,
                'stock_before' => 50,
                'stock_after' => 45,
                'note' => 'Penggunaan untuk maintenance',
                'reference_number' => 'OUT-' . date('Ymd') . '-002',
                'created_at' => Carbon::today()->addHours(16),
            ],
            
            // Yesterday's movements
            [
                'item_id' => $items->skip(4)->first()->id,
                'user_id' => $users->first()->id,
                'type' => 'in',
                'quantity' => 100,
                'stock_before' => 100,
                'stock_after' => 200,
                'note' => 'Stock opname bulanan',
                'reference_number' => 'SO-' . date('Ymd', strtotime('-1 day')) . '-001',
                'created_at' => Carbon::yesterday()->addHours(9),
            ],
            [
                'item_id' => $items->skip(5)->first()->id,
                'user_id' => $users->skip(1)->first()->id ?? $users->first()->id,
                'type' => 'out',
                'quantity' => 5,
                'stock_before' => 15,
                'stock_after' => 10,
                'note' => 'Penggunaan untuk proyek C',
                'reference_number' => 'OUT-' . date('Ymd', strtotime('-1 day')) . '-001',
                'created_at' => Carbon::yesterday()->addHours(13),
            ],
        ];

        foreach ($movements as $movement) {
            StockMovement::create($movement);
        }

        $this->command->info('Stock movements seeded successfully!');
    }
}