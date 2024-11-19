<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class RecipeIngredient extends Model
{
    use HasFactory;

    protected $fillable = ['quantity', 'stock_entry_id'];

    public function stockEntry()
    {
        return $this->belongsTo(StockEntry::class);
    }

    public function serving()
    {
        return $this->belongsTo(Serving::class);
    }
}
