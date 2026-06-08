<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider and all of them will
| be assigned to the "api" middleware group. Make something great!
|
*/

Route::middleware('auth:sanctum')->get('/user', function (Request $request) {
    return $request->user();
});

Route::get('/test', function () {
    return response()->json([
        'message' => 'Hello from Laravel API!',
        'status' => 'connected'
    ]);
});

// Customer Auth
Route::post('/customers/register', [App\Http\Controllers\Api\CustomerAuthController::class, 'register']);
Route::post('/customers/login', [App\Http\Controllers\Api\CustomerAuthController::class, 'login']);
Route::middleware('auth:sanctum')->group(function () {
    Route::get('/customers/me', [App\Http\Controllers\Api\CustomerAuthController::class, 'me']);
    Route::get('/customers/me/orders', [App\Http\Controllers\Api\CustomerAuthController::class, 'orders']);
    Route::post('/customers/logout', [App\Http\Controllers\Api\CustomerAuthController::class, 'logout']);
});

Route::get('/products', [App\Http\Controllers\Api\ProductController::class, 'index']);
Route::get('/products/{slug}', [App\Http\Controllers\Api\ProductController::class, 'show']);
Route::get('/categories', [App\Http\Controllers\Api\CategoryController::class, 'index']);

// File upload — saves directly to public/uploads/products/ (no storage:link needed)
Route::post('/upload', [App\Http\Controllers\Api\UploadController::class, 'store']);
Route::delete('/upload', [App\Http\Controllers\Api\UploadController::class, 'destroy']);

// Admin auth (public — no session needed)
Route::post('/admin/login',  [App\Http\Controllers\Api\AdminAuthController::class, 'login']);
Route::post('/admin/logout', [App\Http\Controllers\Api\AdminAuthController::class, 'logout']);
Route::get('/admin/me',      [App\Http\Controllers\Api\AdminAuthController::class, 'me']);

// Admin routes (product CRUD)
Route::prefix('admin')->group(function () {
    Route::apiResource('products', App\Http\Controllers\Api\AdminProductController::class);
    Route::get('orders', [App\Http\Controllers\Api\OrderController::class, 'index']);
    Route::patch('orders/{id}', [App\Http\Controllers\Api\OrderController::class, 'updateStatus']);
    Route::get('dashboard', [App\Http\Controllers\Api\DashboardController::class, 'index']);
    Route::get('customers', [App\Http\Controllers\Api\AdminCustomerController::class, 'index']);
    Route::get('abandoned', [App\Http\Controllers\AbandonedCartController::class, 'index']);
    Route::patch('abandoned/{id}', [App\Http\Controllers\AbandonedCartController::class, 'updateStatus']);
    Route::delete('abandoned/{id}', [App\Http\Controllers\AbandonedCartController::class, 'destroy']);
    
    // Admin Chat
    Route::get('chat', [App\Http\Controllers\ChatController::class, 'adminIndex']);
    Route::get('chat/{id}', [App\Http\Controllers\ChatController::class, 'adminShow']);
    Route::post('chat/{id}', [App\Http\Controllers\ChatController::class, 'adminSendMessage']);
    Route::patch('chat/{id}', [App\Http\Controllers\ChatController::class, 'adminUpdateStatus']);

    // Admin Hero Slides
    Route::get('hero-slides', [App\Http\Controllers\HeroSlideController::class, 'adminIndex']);
    Route::post('hero-slides', [App\Http\Controllers\HeroSlideController::class, 'store']);
    Route::patch('hero-slides/{id}', [App\Http\Controllers\HeroSlideController::class, 'update']);
    Route::delete('hero-slides/{id}', [App\Http\Controllers\HeroSlideController::class, 'destroy']);
});

// Customer Chat
Route::get('/chat', [App\Http\Controllers\ChatController::class, 'customerCheckSession']);
Route::post('/chat', [App\Http\Controllers\ChatController::class, 'customerStartChat']);
Route::get('/chat/{id}/messages', [App\Http\Controllers\ChatController::class, 'customerGetMessages']);
Route::post('/chat/{id}/messages', [App\Http\Controllers\ChatController::class, 'customerSendMessage']);

// Public Hero Slides
Route::get('/hero-slides', [App\Http\Controllers\HeroSlideController::class, 'index']);

// Public order creation and tracking
Route::post('/abandoned', [App\Http\Controllers\AbandonedCartController::class, 'store']);

// Public order creation and tracking
Route::post('/orders', [App\Http\Controllers\Api\OrderController::class, 'store']);
Route::get('/orders/track', [App\Http\Controllers\Api\OrderController::class, 'track']);
