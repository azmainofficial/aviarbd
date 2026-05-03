<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class AbandonedCart extends Model
{
    use HasFactory;

    protected $fillable = [
        'customer_name',
        'customer_email',
        'customer_city',
        'customer_country',
        'items',
        'total',
        'source',
        'status',
    ];

    protected $casts = [
        'items' => 'array',
        'total' => 'float',
    ];
}
