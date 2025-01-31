<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Stock extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'stock_entry_id',
        'quantity',
        'price',
        'batch_label',
        'expiry_date',
        'unit_price',
    ];

    protected $casts = [
        'expiry_date' => 'date',
    ];

    public function stockEntry()
    {
        return $this->belongsTo(StockEntry::class);
    }
}
