<?php

namespace App\Http\Controllers;

use App\Http\DTOs\OrderStatsDTO;
use App\Models\Order;
use App\Models\Stock;
use App\Models\StockEntry;
use Illuminate\Support\Facades\Cache;
use Illuminate\Http\Request;
use Inertia\Inertia;

class HomeController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();
        if ($user->hasRole('cashier')) {
            return redirect()->route('pos');
        }

        return Inertia::render('Home', [
            'lowStocks' => $this->getLowStocks(),
            'expiringStocks' => $this->getExpiringStocks(),
        ]);
    }

    private function getOrderStats()
    {
        return Cache::remember('order_stats', 3600, function () {
            $orders = Order::with('items.serving.recipe')->get();
            return OrderStatsDTO::fromOrders($orders)->toArray();
        });
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
