<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class StockEntryLogs extends Model
{
    use HasFactory;

    protected $fillable = [
        'stock_entry_id',
        'user_id',
        'action',
        'fields_edited'
    ];

    public function stockEntry()
    {
        return $this->belongsTo(StockEntry::class);
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
