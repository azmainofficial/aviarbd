<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cookie;

class AdminAuthController extends Controller
{
    /**
     * Admin credentials are stored in .env for simplicity.
     * For production, use a proper admins table with hashed passwords.
     */
    public function login(Request $request)
    {
        $request->validate([
            'email'    => 'required|email',
            'password' => 'required|string',
        ]);

        $adminEmail    = config('admin.email',    env('ADMIN_EMAIL',    'admin@aviar.com'));
        $adminPassword = config('admin.password', env('ADMIN_PASSWORD', 'admin123'));

        if ($request->email !== $adminEmail || $request->password !== $adminPassword) {
            return response()->json(['message' => 'Invalid credentials'], 401);
        }

        // Simple token: in production use Laravel Sanctum or JWT
        $token = base64_encode($adminEmail . ':' . now()->timestamp);

        return response()->json([
            'message' => 'Login successful',
            'token'   => $token,
            'admin'   => ['email' => $adminEmail, 'name' => 'Admin'],
        ])->cookie('admin_token', $token, 60 * 24, '/', null, false, true); // 24h httpOnly cookie
    }

    public function logout()
    {
        return response()->json(['message' => 'Logged out'])
            ->cookie(Cookie::forget('admin_token'));
    }

    public function me(Request $request)
    {
        $token = $request->cookie('admin_token') ?? $request->bearerToken();
        if (!$token) {
            return response()->json(['message' => 'Unauthenticated'], 401);
        }

        return response()->json([
            'admin' => ['email' => env('ADMIN_EMAIL', 'admin@aviar.com'), 'name' => 'Admin'],
        ]);
    }
}
