<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Category;

class CategorySeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
        $categories = [
            [
                'name' => 'Material',
                'description' => 'Bahan bangunan dasar seperti semen, besi, pasir',
                'is_active' => true,
            ],
            [
                'name' => 'Cat',
                'description' => 'Cat tembok, cat besi, dan perlengkapan cat',
                'is_active' => true,
            ],
            [
                'name' => 'Pipa',
                'description' => 'Pipa PVC, galvanis, dan aksesoris pipa',
                'is_active' => true,
            ],
            [
                'name' => 'Hardware',
                'description' => 'Paku, sekrup, baut, dan hardware lainnya',
                'is_active' => true,
            ],
            [
                'name' => 'Kimia',
                'description' => 'Lem, thinner, waterproofing, dan bahan kimia',
                'is_active' => true,
            ],
            [
                'name' => 'Alat',
                'description' => 'Alat kerja dan perlengkapan konstruksi',
                'is_active' => true,
            ],
            [
                'name' => 'Keramik',
                'description' => 'Keramik lantai, dinding, dan aksesoris',
                'is_active' => true,
            ],
            [
                'name' => 'Kayu',
                'description' => 'Kayu olahan, triplek, dan produk kayu',
                'is_active' => true,
            ],
            [
                'name' => 'Kaca',
                'description' => 'Kaca bening, kaca es, dan produk kaca',
                'is_active' => true,
            ],
            [
                'name' => 'Sanitair',
                'description' => 'Kran, closet, wastafel, dan perlengkapan sanitair',
                'is_active' => true,
            ],
        ];

        foreach ($categories as $category) {
            Category::create($category);
        }
    }
}