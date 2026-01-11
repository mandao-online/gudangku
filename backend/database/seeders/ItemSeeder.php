<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Item;

class ItemSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
        // Data items sesuai dengan yang ada di frontend
        $items = [
            [
                'name' => 'Semen Portland',
                'sku' => 'SEM-001',
                'stock' => 150,
                'unit' => 'sak',
                'category' => 'Material',
                'min_stock' => 50,
                'description' => 'Semen Portland untuk konstruksi',
                'price' => 65000,
                'supplier' => 'PT. Semen Indonesia',
                'is_active' => true,
            ],
            [
                'name' => 'Besi Beton 10mm',
                'sku' => 'BES-010',
                'stock' => 25,
                'unit' => 'batang',
                'category' => 'Material',
                'min_stock' => 30,
                'description' => 'Besi beton diameter 10mm panjang 12 meter',
                'price' => 85000,
                'supplier' => 'PT. Krakatau Steel',
                'is_active' => true,
            ],
            [
                'name' => 'Cat Tembok Putih',
                'sku' => 'CAT-001',
                'stock' => 80,
                'unit' => 'galon',
                'category' => 'Cat',
                'min_stock' => 20,
                'description' => 'Cat tembok warna putih untuk interior',
                'price' => 125000,
                'supplier' => 'PT. Propan Raya',
                'is_active' => true,
            ],
            [
                'name' => 'Pipa PVC 4"',
                'sku' => 'PIP-004',
                'stock' => 45,
                'unit' => 'batang',
                'category' => 'Pipa',
                'min_stock' => 15,
                'description' => 'Pipa PVC diameter 4 inch panjang 4 meter',
                'price' => 95000,
                'supplier' => 'PT. Rucika',
                'is_active' => true,
            ],
            [
                'name' => 'Keramik 40x40',
                'sku' => 'KER-040',
                'stock' => 200,
                'unit' => 'dus',
                'category' => 'Keramik',
                'min_stock' => 50,
                'description' => 'Keramik lantai ukuran 40x40 cm',
                'price' => 180000,
                'supplier' => 'PT. Mulia Industrindo',
                'is_active' => true,
            ],
            [
                'name' => 'Pasir Beton',
                'sku' => 'PAS-001',
                'stock' => 10,
                'unit' => 'kubik',
                'category' => 'Material',
                'min_stock' => 15,
                'description' => 'Pasir beton untuk campuran cor',
                'price' => 350000,
                'supplier' => 'CV. Sumber Alam',
                'is_active' => true,
            ],
        ];

        foreach ($items as $item) {
            Item::create($item);
        }
    }
}
