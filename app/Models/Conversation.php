<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Conversation extends Model
{
    use HasFactory;

    protected $fillable = [
        'session_id', 'customer_name', 'customer_email', 'status',
        'unread_by_admin', 'unread_by_customer', 'last_message', 'last_message_at'
    ];

    public function messages()
    {
        return $this->hasMany(Message::class);
    }
}
