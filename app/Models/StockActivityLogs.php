<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class StockActivityLogs extends Model
{
    use HasFactory;

    protected $fillable = [
        'stock_id',
        'user_id',
        'action',
        'quantity',
        'price',
        'batch_label',
        'expiry_date',
        'is_perishable',
        'reason'
    ];

    public function stock()
    {
        return $this->belongsTo(Stock::class);
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
