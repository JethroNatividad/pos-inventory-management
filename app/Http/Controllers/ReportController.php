<?php

namespace App\Http\Controllers;

use App\Models\Order;
use App\Models\RecipeLogs;
use App\Models\StockActivityLogs;
use App\Models\StockEntryLogs;
use Inertia\Inertia;

class ReportController extends Controller
{
    public function stocks()
    {
        return Inertia::render('Reports/Stocks/Index', [
            'stockEntryLogs' => StockEntryLogs::all()->load(['stockEntry', 'user']),
            'stockActivityLogs' => StockActivityLogs::all()->load(['stock.stockEntry', 'user']),
        ]);
    }

    public function recipes()
    {
        return Inertia::render('Reports/Recipes/Index', [
            'recipeLogs' => RecipeLogs::with(['recipe' => function ($query) {
                $query->withTrashed();
            }, 'user'])->get()
        ]);
    }

    public function orders()
    {
        return Inertia::render('Reports/Orders/Index', [
            'orders' => Order::all()->load(['user', 'items.serving'])
        ]);
    }

    public function orderReceipt(Order $order)
    {
        return Inertia::render('Reports/Orders/ReceiptPage', [
            'order' => $order->load(['items.serving.recipe', 'user']),
        ]);
    }
}
