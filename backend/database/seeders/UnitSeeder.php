<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Unit;

class UnitSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
        $units = [
            ['name' => 'buah', 'symbol' => 'bh', 'description' => 'Satuan untuk barang yang dihitung per buah'],
            ['name' => 'pcs', 'symbol' => 'pcs', 'description' => 'Pieces - satuan untuk barang yang dihitung per pieces'],
            ['name' => 'kg', 'symbol' => 'kg', 'description' => 'Kilogram - satuan berat'],
            ['name' => 'gram', 'symbol' => 'g', 'description' => 'Gram - satuan berat'],
            ['name' => 'liter', 'symbol' => 'L', 'description' => 'Liter - satuan volume cairan'],
            ['name' => 'galon', 'symbol' => 'gal', 'description' => 'Galon - satuan volume cairan'],
            ['name' => 'meter', 'symbol' => 'm', 'description' => 'Meter - satuan panjang'],
            ['name' => 'cm', 'symbol' => 'cm', 'description' => 'Centimeter - satuan panjang'],
            ['name' => 'sak', 'symbol' => 'sak', 'description' => 'Sak - satuan untuk barang dalam karung'],
            ['name' => 'dus', 'symbol' => 'dus', 'description' => 'Dus - satuan untuk barang dalam kotak'],
            ['name' => 'lembar', 'symbol' => 'lbr', 'description' => 'Lembar - satuan untuk barang berbentuk lembaran'],
            ['name' => 'batang', 'symbol' => 'btg', 'description' => 'Batang - satuan untuk barang berbentuk batang'],
            ['name' => 'kaleng', 'symbol' => 'klg', 'description' => 'Kaleng - satuan untuk barang dalam kaleng'],
            ['name' => 'botol', 'symbol' => 'btl', 'description' => 'Botol - satuan untuk barang dalam botol'],
            ['name' => 'kubik', 'symbol' => 'm³', 'description' => 'Meter kubik - satuan volume'],
            ['name' => 'set', 'symbol' => 'set', 'description' => 'Set - satuan untuk barang yang dijual dalam set'],
        ];

        foreach ($units as $unit) {
            Unit::create($unit);
        }
    }
}
