<?php

namespace App\Http\Controllers;

use App\Models\AbandonedCart;
use Illuminate\Http\Request;

class AbandonedCartController extends Controller
{
    public function index()
    {
        return response()->json(AbandonedCart::latest()->get());
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'customer' => 'required|array',
            'customer.email' => 'required|email',
            'items' => 'required|array',
            'total' => 'required|numeric',
            'source' => 'required|string',
        ]);

        $customerEmail = $data['customer']['email'];

        $cart = AbandonedCart::updateOrCreate(
            ['customer_email' => $customerEmail, 'status' => 'abandoned'],
            [
                'customer_name' => $data['customer']['name'] ?? null,
                'customer_city' => $data['customer']['city'] ?? null,
                'customer_country' => $data['customer']['country'] ?? null,
                'items' => $data['items'],
                'total' => $data['total'],
                'source' => $data['source'],
            ]
        );

        return response()->json($cart);
    }

    public function updateStatus(Request $request, $id)
    {
        $cart = AbandonedCart::findOrFail($id);
        $request->validate(['status' => 'required|string|in:abandoned,contacted,recovered']);
        $cart->update(['status' => $request->status]);
        
        return response()->json($cart);
    }

    public function destroy($id)
    {
        AbandonedCart::findOrFail($id)->delete();
        return response()->json(['message' => 'Deleted successfully']);
    }
}
