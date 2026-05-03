<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Product;
use Illuminate\Http\Request;

class ProductController extends Controller
{
    public function index()
    {
        $products = Product::with(['category', 'images'])
            ->where('is_active', true)
            ->get()
            ->map(function ($p) {
                return [
                    'id' => (string)$p->id,
                    'name' => $p->name,
                    'price' => (float)$p->price,
                    'originalPrice' => $p->original_price ? (float)$p->original_price : null,
                    'category' => $p->category?->name ?? 'Uncategorized',
                    'image' => $p->images->where('is_primary', true)->first()?->path ?? $p->images->first()?->path,
                    'icon' => $p->icon ?? '🛍️',
                    'badge' => $p->badge,
                    'slug' => $p->slug,
                ];
            });

        return response()->json($products);
    }

    public function show($slug)
    {
        $p = Product::with(['category', 'images', 'attributes'])
            ->where('slug', $slug)
            ->where('is_active', true)
            ->firstOrFail();

        return response()->json([
            'id' => (string)$p->id,
            'name' => $p->name,
            'description' => $p->description,
            'price' => (float)$p->price,
            'originalPrice' => $p->original_price ? (float)$p->original_price : null,
            'category' => $p->category?->name ?? 'Uncategorized',
            'images' => $p->images->map(fn($img) => $img->path),
            'sizes' => $p->attributes->where('type', 'size')->pluck('value'),
            'colors' => $p->attributes->where('type', 'color')->pluck('value'),
            'icon' => $p->icon ?? '🛍️',
            'badge' => $p->badge,
            'slug' => $p->slug,
            'stockCount' => $p->stock_count,
            'inStock' => $p->in_stock,
        ]);
    }
}
