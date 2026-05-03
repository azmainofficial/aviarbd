<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\OrderItem;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class OrderController extends Controller
{
    public function index()
    {
        $orders = Order::with('items')->latest()->get();
        return response()->json($orders);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'customer'              => 'required|array',
            'customer.firstName'    => 'nullable|string',
            'customer.lastName'     => 'nullable|string',
            'customer.email'        => 'required|email',
            'customer.address'      => 'required|string',
            'customer.city'         => 'required|string',
            'customer.country'      => 'required|string',
            'customer.zip'          => 'required|string',
            'items'                 => 'required|array|min:1',
            'total'                 => 'required|numeric|min:0',
            'paymentMethod'         => 'nullable|string',
            'paymentIntentId'       => 'nullable|string',
            'status'                => 'nullable|string',
        ]);

        return \Illuminate\Support\Facades\DB::transaction(function () use ($data) {
            $order = Order::create([
                'order_number'        => 'ORD-' . strtoupper(Str::random(8)),
                'customer_first_name' => $data['customer']['firstName'] ?? null,
                'customer_last_name'  => $data['customer']['lastName'] ?? null,
                'customer_email'      => $data['customer']['email'],
                'customer_address'    => $data['customer']['address'],
                'customer_city'       => $data['customer']['city'],
                'customer_country'    => $data['customer']['country'],
                'customer_zip'        => $data['customer']['zip'],
                'total'               => $data['total'],
                'status'              => $data['status'] ?? 'Processing',
                'payment_method'      => $data['paymentMethod'] ?? null,
                'payment_intent_id'   => $data['paymentIntentId'] ?? null,
            ]);

            foreach ($data['items'] as $item) {
                $productId = explode('-', $item['id'] ?? '')[0];
                if (!is_numeric($productId) || !\App\Models\Product::where('id', $productId)->exists()) {
                    $productId = null;
                }

                OrderItem::create([
                    'order_id'   => $order->id,
                    'product_id' => $productId,
                    'name'       => $item['name'],
                    'price'      => $item['price'],
                    'qty'        => $item['qty'],
                    'size'       => $item['size'] ?? null,
                    'color'      => $item['color'] ?? null,
                    'image'      => $item['image'] ?? null,
                ]);
            }

            return response()->json([
                'orderNumber' => $order->order_number,
                'orderId'     => $order->id,
            ], 201);
        });
    }

    public function updateStatus(Request $request, $id)
    {
        $order = Order::findOrFail($id);
        $order->update(['status' => $request->input('status')]);
        return response()->json(['message' => 'Status updated']);
    }

    public function track(Request $request)
    {
        $orderNumber = $request->query('orderNumber');
        $email = $request->query('email');

        if (!$orderNumber || !$email) {
            return response()->json(['error' => 'Order number and email are required'], 400);
        }

        $order = Order::with('items')->where('order_number', $orderNumber)->where('customer_email', $email)->first();

        if (!$order) {
            return response()->json(['error' => 'Could not find your order. Please check the details and try again.'], 404);
        }

        return response()->json([
            'order' => [
                'orderNumber' => $order->order_number,
                'status' => $order->status,
                'total' => (float) $order->total,
                'paymentMethod' => $order->payment_method,
                'customer' => [
                    'name' => trim($order->customer_first_name . ' ' . $order->customer_last_name),
                    'email' => $order->customer_email,
                    'city' => $order->customer_city,
                    'country' => $order->customer_country,
                ],
                'createdAt' => $order->created_at->toIso8601String(),
                'updatedAt' => $order->updated_at->toIso8601String(),
                'items' => $order->items->map(function ($item) {
                    return [
                        'productId' => $item->product_id,
                        'name' => $item->name,
                        'price' => (float) $item->price,
                        'qty' => $item->qty,
                        'size' => $item->size,
                        'color' => $item->color,
                        'image' => $item->image,
                    ];
                }),
            ]
        ]);
    }
}
