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
            'stockEntryLogs' => StockEntryLogs::with(['stockEntry' => function ($query) {
                $query->withTrashed();
            }, 'user'])->orderBy('created_at', 'desc')->get(),
            'stockActivityLogs' => StockActivityLogs::with(['stock' => function ($query) {
                $query->withTrashed()->with(['stockEntry' => function ($q) {
                    $q->withTrashed();
                }]);
            }, 'user'])->orderBy('created_at', 'desc')->get(),
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
            'orders' => Order::orderBy('created_at', 'desc')
                ->with(['user', 'items.serving'])
                ->get()
        ]);
    }

    public function orderReceipt(Order $order)
    {
        return Inertia::render('Reports/Orders/ReceiptPage', [
            'order' => $order->load(['items.serving.recipe', 'user', 'items.addons.stockEntry']),
        ]);
    }
}
