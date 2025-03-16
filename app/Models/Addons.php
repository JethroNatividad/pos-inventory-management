<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Addons extends Model
{
    protected $fillable = [
        'order_item_id',
        'stock_entry_id',
        'quantity',
        'price',
    ];

    public function orderItem()
    {
        return $this->belongsTo(OrderItem::class);
    }

    public function stockEntry()
    {
        return $this->belongsTo(StockEntry::class);
    }
}
