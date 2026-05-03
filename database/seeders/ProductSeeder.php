<?php

namespace Database\Seeders;

use App\Models\Category;
use App\Models\Product;
use App\Models\ProductAttribute;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class ProductSeeder extends Seeder
{
    public function run(): void
    {
        $categories = ['Clothing', 'Accessories', 'Home'];
        $categoryModels = [];

        foreach ($categories as $cat) {
            $categoryModels[$cat] = Category::create([
                'name' => $cat,
                'slug' => Str::slug($cat)
            ]);
        }

        $products = [
            [
                'name' => 'Silk Wrap Blouse',
                'price' => 295,
                'icon' => '👚',
                'category' => 'Clothing',
                'badge' => 'new',
                'slug' => 'silk-wrap-blouse',
                'description' => 'A beautiful silk wrap blouse for any occasion.',
                'sizes' => ['S', 'M', 'L'],
                'colors' => ['Cream', 'Black']
            ],
            [
                'name' => 'Cashmere Turtleneck',
                'price' => 450,
                'icon' => '🧥',
                'category' => 'Clothing',
                'slug' => 'cashmere-turtleneck',
                'description' => 'Pure cashmere comfort.',
                'sizes' => ['M', 'L', 'XL'],
                'colors' => ['Grey', 'Navy']
            ],
            [
                'name' => 'Leather Crossbody',
                'price' => 320,
                'originalPrice' => 400,
                'icon' => '👜',
                'category' => 'Accessories',
                'badge' => 'sale',
                'slug' => 'leather-crossbody',
                'description' => 'Genuine leather crossbody bag.',
                'sizes' => ['One Size'],
                'colors' => ['Tan', 'Black']
            ],
            [
                'name' => 'Gold Plated Cuff',
                'price' => 180,
                'icon' => '✨',
                'category' => 'Accessories',
                'slug' => 'gold-plated-cuff',
                'description' => '18k gold plated cuff bracelet.',
                'sizes' => ['Adjustable'],
                'colors' => ['Gold']
            ],
        ];

        foreach ($products as $pData) {
            $product = Product::create([
                'name' => $pData['name'],
                'slug' => $pData['slug'],
                'price' => $pData['price'],
                'original_price' => $pData['originalPrice'] ?? null,
                'description' => $pData['description'],
                'icon' => $pData['icon'],
                'badge' => $pData['badge'] ?? null,
                'category_id' => $categoryModels[$pData['category']]->id,
                'stock_count' => 10,
                'in_stock' => true,
                'is_active' => true,
            ]);

            foreach ($pData['sizes'] as $size) {
                ProductAttribute::create([
                    'product_id' => $product->id,
                    'type' => 'size',
                    'value' => $size
                ]);
            }

            foreach ($pData['colors'] as $color) {
                ProductAttribute::create([
                    'product_id' => $product->id,
                    'type' => 'color',
                    'value' => $color
                ]);
            }
        }
    }
}
