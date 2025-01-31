<?php

namespace App\Models;

use Carbon\Carbon;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class StockEntry extends Model
{

    use HasFactory, SoftDeletes;
    protected $fillable = [
        'name',
        'description',
        'type',
        'perishable',
        'warn_stock_level',
        'warn_days_remaining',
    ];

    public function stocks()
    {
        return $this->hasMany(Stock::class);
    }

    protected $appends = ['quantity', 'upcoming_expiry', 'average_price', 'unit'];

    public function getQuantityAttribute()
    {
        // if perishable, get sum of quantity of stocks that are not expired
        if ($this->perishable) {
            return $this->stocks->where('expiry_date', '>=', now())->sum('quantity');
        }

        return $this->stocks->sum('quantity');
    }

    public function getUpcomingExpiryAttribute()
    {
        if (!$this->perishable) {
            return null;
        }

        // Collect and filter non-null expiry dates that are not yet expired
        $expiryDates = $this->stocks->pluck('expiry_date')->filter(fn($date) => $date >= now());

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

        // if days remaining is 0, return the hours remaining
        if ($daysRemaining <= 0) {
            $hoursRemaining = round(abs($expiryDate->diffInHours(now())));
            return $quantity . $this->unit . ' (' . $hoursRemaining . ' hours left)';
        }

        return $quantity . $this->unit . ' (' . $daysRemaining . ' days left)';
    }

    public function getAveragePriceAttribute()
    {
        return $this->stocks->avg('unit_price') ?? 0;
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
