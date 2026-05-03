<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class HeroSlide extends Model {
    use HasFactory;
    protected $fillable = ['image', 'label', 'headline', 'sub', 'cta', 'href', 'accent', 'is_active', 'order_index'];
}
