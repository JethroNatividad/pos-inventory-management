<?php

namespace App\Http\Controllers;

use App\Models\Order;
use App\Models\Stock;
use App\Models\StockEntry;
use Inertia\Inertia;

class HomeController extends Controller
{
    public function index()
    {
        return Inertia::render('Home', [
            'lowStocks' => $this->getLowStocks(),
            'expiringStocks' => $this->getExpiringStocks(),
            'orders' => Order::all()->load('items.serving.recipe'),

        ]);
    }

    private function getLowStocks()
    {
        return StockEntry::all()
            ->filter(function ($stockEntry) {
                return $stockEntry->quantity < $stockEntry->warn_stock_level;
            })->values()->toArray();
    }

    private function getExpiringStocks()
    {
        return Stock::where('expiry_date', '>=', now())->get()
            ->filter(function ($stock) {
                return $stock->expiry_date->diffInDays(now()) <= $stock->stockEntry->warn_days_remaining && $stock->quantity > 0;
            })->values()->toArray();
    }
}
