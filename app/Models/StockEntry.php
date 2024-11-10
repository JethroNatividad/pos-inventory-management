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

    protected $appends = ['quantity', 'quantity_status', 'upcoming_expiry', 'average_price'];

    public function getQuantityAttribute()
    {
        return $this->stocks->sum('quantity');
    }

    public function getQuantityStatusAttribute()
    {
        if ($this->quantity <= 0) {
            return 'Out of stock';
        } elseif ($this->quantity < $this->warn_stock_level) {
            return 'Low stock';
        } else {
            return 'In stock';
        }
    }

    public function getUpcomingExpiryAttribute()
    {
        if (!$this->perishable) {
            return null;
        }

        $expiryDates = $this->stocks->pluck('expiry_date')->filter();

        if ($expiryDates->isEmpty()) {
            return null;
        }

        $expiryDates = $expiryDates->sort();

        $expiryDate = $expiryDates->first();

        $daysRemaining = $expiryDate->diffInDays(now());

        $unit = match ($this->type) {
            'liquid' => 'ml',
            'powder' => 'g',
            'item' => 'pcs',
        };

        return $this->quantity . $unit . ' (' . $daysRemaining . ' days left)';
    }

    public function getAveragePriceAttribute()
    {
        return $this->stocks->avg('price');
    }
}
