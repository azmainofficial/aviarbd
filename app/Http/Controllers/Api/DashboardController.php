<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\Product;

class DashboardController extends Controller
{
    public function index()
    {
        $totalRevenue  = Order::where('status', '!=', 'Cancelled')->sum('total');
        $totalOrders   = Order::count();
        $totalProducts = Product::where('is_active', true)->count();
        $recentOrders  = Order::with('items')->latest()->limit(10)->get();

        $ordersByStatus = Order::selectRaw('status, count(*) as count')
            ->groupBy('status')
            ->pluck('count', 'status');

        return response()->json([
            'totalRevenue'   => (float) $totalRevenue,
            'totalOrders'    => $totalOrders,
            'totalProducts'  => $totalProducts,
            'recentOrders'   => $recentOrders,
            'ordersByStatus' => $ordersByStatus,
        ]);
    }
}
