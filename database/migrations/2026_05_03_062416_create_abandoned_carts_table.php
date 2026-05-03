<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('abandoned_carts', function (Blueprint $table) {
            $table->id();
            $table->string('customer_name')->nullable();
            $table->string('customer_email');
            $table->string('customer_city')->nullable();
            $table->string('customer_country')->nullable();
            $table->json('items');
            $table->decimal('total', 10, 2);
            $table->string('source')->default('checkout');
            $table->string('status')->default('abandoned');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('abandoned_carts');
    }
};
