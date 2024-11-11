<?php

namespace App\Models;

use Carbon\Carbon;
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

    protected $appends = ['quantity', 'quantity_status', 'upcoming_expiry', 'average_price', 'unit'];

    public function getQuantityAttribute()
    {
        // if perishable, get sum of quantity of stocks that are not expired
        if ($this->perishable) {
            return $this->stocks->where('expiry_date', '>=', now())->sum('quantity') . $this->unit;
        }

        return $this->stocks->sum('quantity') . $this->unit;
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

        // Collect and filter non-null expiry dates
        $expiryDates = $this->stocks->pluck('expiry_date')->filter();

        if ($expiryDates->isEmpty()) {
            return null;
        }

        // Convert expiry dates to Carbon instances and sort them
        $expiryDates = $expiryDates->map(fn($date) => Carbon::parse($date))->sort();

        // Get the earliest expiry date
        $expiryDate = $expiryDates->first();

        // Calculate the days remaining until the expiry date
        $daysRemaining = round(abs($expiryDate->diffInDays(now())));;

        $quantity = $this->stocks
            ->filter(fn($stock) => Carbon::parse($stock->expiry_date)->toDateString() === $expiryDate->toDateString())
            ->sum('quantity');


        return $quantity . $this->unit . ' (' . $daysRemaining . ' days left)';
    }

    public function getAveragePriceAttribute()
    {
        return $this->stocks->avg('price') ?? 0;
    }

    public function getUnitAttribute()
    {
        $unit = match ($this->type) {
            'liquid' => 'ml',
            'powder' => 'g',
            'item' => 'pcs',
        };

        return $unit;
    }
}
