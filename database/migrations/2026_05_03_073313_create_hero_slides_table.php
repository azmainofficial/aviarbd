<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void {
        Schema::create('hero_slides', function (Blueprint $table) {
            $table->id();
            $table->string('image');
            $table->string('label')->nullable();
            $table->string('headline');
            $table->text('sub')->nullable();
            $table->string('cta')->default('Shop Now');
            $table->string('href')->default('/shop');
            $table->string('accent')->default('#c9a96e');
            $table->boolean('is_active')->default(true);
            $table->integer('order_index')->default(0);
            $table->timestamps();
        });
    }
    public function down(): void { Schema::dropIfExists('hero_slides'); }
};
