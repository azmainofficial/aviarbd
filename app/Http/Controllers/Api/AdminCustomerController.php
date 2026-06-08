<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Customer;
use App\Models\Order;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class AdminCustomerController extends Controller
{
    public function index()
    {
        // --- 1. Registered customers (from customers table) ---
        $registered = Customer::with('orders')->get()->keyBy('email');

        $result = $registered->map(function ($customer) {
            $orders = $customer->orders;
            $location = collect([$customer->city, $customer->country])->filter()->join(', ');

            return [
                'id'         => $customer->id,
                'name'       => $customer->name,
                'email'      => $customer->email,
                'phone'      => $customer->phone ?? '—',
                'location'   => $location ?: '—',
                'type'       => 'registered',
                'orderCount' => $orders->count(),
                'totalSpent' => (float) $orders->sum('total'),
                'lastOrder'  => $orders->max('created_at')
                                    ? \Carbon\Carbon::parse($orders->max('created_at'))->toIso8601String()
                                    : null,
            ];
        });

        // --- 2. Guest customers (from orders table by email, not already registered) ---
        $guestOrders = Order::select(
                'customer_email',
                DB::raw('MAX(CONCAT(IFNULL(customer_first_name,""), " ", IFNULL(customer_last_name,""))) as full_name'),
                DB::raw('COUNT(*) as order_count'),
                DB::raw('SUM(total) as total_spent'),
                DB::raw('MAX(created_at) as last_order'),
                DB::raw('MAX(CONCAT(IFNULL(customer_city,""), ", ", IFNULL(customer_country,""))) as location')
            )
            ->whereNotNull('customer_email')
            ->whereNull('customer_id')              // only guest orders (no linked account)
            ->groupBy('customer_email')
            ->get();

        foreach ($guestOrders as $guest) {
            $email = $guest->customer_email;

            // Skip if already in registered list
            if ($registered->has($email)) continue;

            $name = trim($guest->full_name) ?: $email;
            $location = trim($guest->location, ' ,') ?: '—';

            $result->put($email, [
                'id'         => null,
                'name'       => $name,
                'email'      => $email,
                'phone'      => '—',
                'location'   => $location,
                'type'       => 'guest',
                'orderCount' => (int) $guest->order_count,
                'totalSpent' => (float) $guest->total_spent,
                'lastOrder'  => $guest->last_order
                                    ? \Carbon\Carbon::parse($guest->last_order)->toIso8601String()
                                    : null,
            ]);
        }

        // Sort by total spent descending
        $sorted = $result->values()->sortByDesc('totalSpent')->values();

        return response()->json($sorted);
    }
}
