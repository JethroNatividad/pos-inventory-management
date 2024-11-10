<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Stock extends Model
{
    use HasFactory;

    protected $fillable = [
        'stock_entry_id',
        'quantity',
        'price',
        'batch_label'
    ];

    public function stockEntry()
    {
        return $this->belongsTo(StockEntry::class);
    }
}
