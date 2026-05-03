<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Category;
use App\Models\Product;
use App\Models\ProductAttribute;
use App\Models\ProductImage;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class AdminProductController extends Controller
{
    public function index()
    {
        $products = Product::with(['category', 'images'])
            ->latest()
            ->get()
            ->map(fn($p) => [
                'id'            => $p->id,
                'name'          => $p->name,
                'slug'          => $p->slug,
                'price'         => (float) $p->price,
                'originalPrice' => $p->original_price ? (float) $p->original_price : null,
                'category'      => $p->category?->name ?? 'Uncategorized',
                'category_id'   => $p->category_id,
                'badge'         => $p->badge,
                'section'       => $p->section,
                'stockCount'    => $p->stock_count,
                'inStock'       => $p->in_stock,
                'is_active'     => $p->is_active,
                'images'        => $p->images->pluck('path'),
                'image'         => $p->images->first()?->path,
                'icon'          => $p->icon,
            ]);

        return response()->json($products);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'name'          => 'required|string|max:255',
            'description'   => 'nullable|string',
            'price'         => 'required|numeric|min:0',
            'originalPrice' => 'nullable|numeric|min:0',
            'category'      => 'nullable|string',
            'section'       => 'nullable|string',
            'badge'         => 'nullable|string',
            'stockCount'    => 'nullable|integer|min:0',
            'inStock'       => 'nullable|boolean',
            'sizes'         => 'nullable|array',
            'colors'        => 'nullable|array',
            'images'        => 'nullable|array',   // array of public URL paths
            'icon'          => 'nullable|string',
        ]);

        // Resolve or create category
        $categoryId = null;
        if (!empty($data['category'])) {
            $cat = Category::firstOrCreate(
                ['slug' => Str::slug($data['category'])],
                ['name' => $data['category']]
            );
            $categoryId = $cat->id;
        }

        $product = Product::create([
            'name'           => $data['name'],
            'slug'           => Str::slug($data['name']) . '-' . uniqid(),
            'description'    => $data['description'] ?? null,
            'price'          => $data['price'],
            'original_price' => $data['originalPrice'] ?? null,
            'category_id'    => $categoryId,
            'section'        => $data['section'] ?? null,
            'badge'          => $data['badge'] ?? null,
            'stock_count'    => $data['stockCount'] ?? 0,
            'in_stock'       => $data['inStock'] ?? true,
            'icon'           => $data['icon'] ?? '🛍️',
            'is_active'      => true,
        ]);

        // Save image paths (already public URLs from the upload endpoint)
        foreach (($data['images'] ?? []) as $i => $path) {
            ProductImage::create([
                'product_id' => $product->id,
                'path'       => $path,
                'is_primary' => $i === 0,
            ]);
        }

        // Save sizes and colors
        foreach (($data['sizes'] ?? []) as $size) {
            ProductAttribute::create(['product_id' => $product->id, 'type' => 'size', 'value' => $size]);
        }
        foreach (($data['colors'] ?? []) as $color) {
            ProductAttribute::create(['product_id' => $product->id, 'type' => 'color', 'value' => $color]);
        }

        return response()->json($product->load(['category', 'images', 'attributes']), 201);
    }

    public function show($id)
    {
        $p = Product::with(['category', 'images', 'attributes'])->findOrFail($id);

        return response()->json([
            'id'            => $p->id,
            'name'          => $p->name,
            'slug'          => $p->slug,
            'description'   => $p->description,
            'price'         => (float) $p->price,
            'originalPrice' => $p->original_price ? (float) $p->original_price : null,
            'category'      => $p->category?->name,
            'category_id'   => $p->category_id,
            'badge'         => $p->badge,
            'section'       => $p->section,
            'stockCount'    => $p->stock_count,
            'inStock'       => $p->in_stock,
            'is_active'     => $p->is_active,
            'images'        => $p->images->pluck('path'),
            'icon'          => $p->icon,
            'sizes'         => $p->attributes->where('type', 'size')->pluck('value'),
            'colors'        => $p->attributes->where('type', 'color')->pluck('value'),
        ]);
    }

    public function update(Request $request, $id)
    {
        $product = Product::findOrFail($id);

        $data = $request->validate([
            'name'          => 'sometimes|string|max:255',
            'description'   => 'nullable|string',
            'price'         => 'sometimes|numeric|min:0',
            'originalPrice' => 'nullable|numeric|min:0',
            'category'      => 'nullable|string',
            'section'       => 'nullable|string',
            'badge'         => 'nullable|string',
            'stockCount'    => 'nullable|integer|min:0',
            'inStock'       => 'nullable|boolean',
            'sizes'         => 'nullable|array',
            'colors'        => 'nullable|array',
            'images'        => 'nullable|array',
            'is_active'     => 'nullable|boolean',
            'icon'          => 'nullable|string',
        ]);

        if (!empty($data['category'])) {
            $cat = Category::firstOrCreate(
                ['slug' => Str::slug($data['category'])],
                ['name' => $data['category']]
            );
            $data['category_id'] = $cat->id;
        }

        $product->update([
            'name'           => $data['name'] ?? $product->name,
            'description'    => $data['description'] ?? $product->description,
            'price'          => $data['price'] ?? $product->price,
            'original_price' => array_key_exists('originalPrice', $data) ? $data['originalPrice'] : $product->original_price,
            'category_id'    => $data['category_id'] ?? $product->category_id,
            'section'        => $data['section'] ?? $product->section,
            'badge'          => $data['badge'] ?? $product->badge,
            'stock_count'    => $data['stockCount'] ?? $product->stock_count,
            'in_stock'       => $data['inStock'] ?? $product->in_stock,
            'is_active'      => $data['is_active'] ?? $product->is_active,
            'icon'           => $data['icon'] ?? $product->icon,
        ]);

        // Replace images if provided
        if (isset($data['images'])) {
            $product->images()->delete();
            foreach ($data['images'] as $i => $path) {
                ProductImage::create(['product_id' => $product->id, 'path' => $path, 'is_primary' => $i === 0]);
            }
        }

        // Replace attributes if provided
        if (isset($data['sizes']) || isset($data['colors'])) {
            $product->attributes()->delete();
            foreach (($data['sizes'] ?? []) as $size) {
                ProductAttribute::create(['product_id' => $product->id, 'type' => 'size', 'value' => $size]);
            }
            foreach (($data['colors'] ?? []) as $color) {
                ProductAttribute::create(['product_id' => $product->id, 'type' => 'color', 'value' => $color]);
            }
        }

        return response()->json($product->fresh(['category', 'images', 'attributes']));
    }

    public function destroy($id)
    {
        $product = Product::findOrFail($id);

        // Delete associated image files from public/uploads/products/
        foreach ($product->images as $img) {
            $parsedPath = parse_url($img->path, PHP_URL_PATH);
            if ($parsedPath) {
                $filePath = public_path(ltrim($parsedPath, '/'));
                if (file_exists($filePath) && is_file($filePath)) {
                    @unlink($filePath);
                }
            }
        }

        $product->delete();

        return response()->json(['message' => 'Product deleted successfully']);
    }
}
