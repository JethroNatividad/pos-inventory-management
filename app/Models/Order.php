<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Cache;

class Order extends Model
{
    protected static function booted()
    {
        static::created(function () {
            Cache::tags(['order_stats'])->flush();
        });

        static::updated(function () {
            Cache::tags(['order_stats'])->flush();
        });
    }

    protected $fillable = [
        'subtotal',
        'discountPercentage',
        'total',
        'type',
        'user_id',
    ];

    protected $appends = ['total_cost', 'total_income'];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function items()
    {
        return $this->hasMany(OrderItem::class);
    }

    public function getTotalCostAttribute()
    {
        $total_cost = 0;
        $items = $this->items;
        foreach ($items as $item) {
            $total_cost += $item->cost;
        }
        return $total_cost;
    }

    public function getTotalIncomeAttribute()
    {
        $total_income = $this->total - $this->total_cost;
        return $total_income;
    }
}
