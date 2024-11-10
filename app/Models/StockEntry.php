<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class StockEntry extends Model
{

    use HasFactory;
    protected $fillable = [
        'name',
        'description',
        'type',
        'perishable',
        'warn_stock_level',
        'warn_days_remaining'
    ];

    public function stocks()
    {
        return $this->hasMany(Stock::class);
    }

    protected $appends = ['quantity'];

    public function getQuantityAttribute()
    {
        return $this->stocks->sum('quantity');
    }
}
