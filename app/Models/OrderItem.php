<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class OrderItem extends Model
{
    protected $fillable = [
        'order_id',
        'serving_id',
        'quantity',
        'price',
    ];

    protected $appends = ['cost', 'income'];

    public function order()
    {
        return $this->belongsTo(Order::class);
    }

    public function serving()
    {
        return $this->belongsTo(Serving::class);
    }

    public function getCostAttribute()
    {
        $serving = $this->serving;
        $cost = $serving->cost * $this->quantity;
        return $cost;
    }

    public function getIncomeAttribute()
    {
        $income = $this->price - $this->cost;
        return $income;
    }
}
