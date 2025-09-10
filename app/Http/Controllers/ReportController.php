<?php

namespace App\Http\Controllers;

use App\Models\Order;
use App\Models\RecipeLogs;
use App\Models\StockActivityLogs;
use App\Models\StockEntryLogs;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ReportController extends Controller
{
    public function stocks(Request $request)
    {
        $stockEntryLogsQuery = StockEntryLogs::with(['stockEntry' => function ($query) {
            $query->withTrashed();
        }, 'user'])->orderBy('created_at', 'desc');

        $stockActivityLogsQuery = StockActivityLogs::with(['stock' => function ($query) {
            $query->withTrashed()->with(['stockEntry' => function ($q) {
                $q->withTrashed();
            }]);
        }, 'user'])->orderBy('created_at', 'desc');

        // Apply search filters if provided
        if ($request->has('stock_entry_search') && $request->stock_entry_search) {
            $search = $request->stock_entry_search;
            $stockEntryLogsQuery->where(function ($q) use ($search) {
                $q->whereHas('stockEntry', function ($query) use ($search) {
                    $query->where('name', 'like', "%{$search}%");
                })
                    ->orWhereHas('user', function ($query) use ($search) {
                        $query->where('first_name', 'like', "%{$search}%")
                            ->orWhere('last_name', 'like', "%{$search}%")
                            ->orWhere('middle_name', 'like', "%{$search}%");
                    })
                    ->orWhere('action', 'like', "%{$search}%");
            });
        }

        if ($request->has('stock_activity_search') && $request->stock_activity_search) {
            $search = $request->stock_activity_search;
            $stockActivityLogsQuery->where(function ($q) use ($search) {
                $q->whereHas('stock.stockEntry', function ($query) use ($search) {
                    $query->where('name', 'like', "%{$search}%");
                })
                    ->orWhereHas('user', function ($query) use ($search) {
                        $query->where('first_name', 'like', "%{$search}%")
                            ->orWhere('last_name', 'like', "%{$search}%")
                            ->orWhere('middle_name', 'like', "%{$search}%");
                    })
                    ->orWhere('action', 'like', "%{$search}%")
                    ->orWhere('reason', 'like', "%{$search}%")
                    ->orWhere('batch_label', 'like', "%{$search}%");
            });
        }

        $stockEntryLogsPerPage = $request->get('stock_entry_per_page', 10);
        $stockActivityLogsPerPage = $request->get('stock_activity_per_page', 10);

        $stockEntryLogs = $stockEntryLogsQuery->paginate(
            $stockEntryLogsPerPage,
            ['*'],
            'stock_entry_page'
        );

        $stockActivityLogs = $stockActivityLogsQuery->paginate(
            $stockActivityLogsPerPage,
            ['*'],
            'stock_activity_page'
        );

        return Inertia::render('Reports/Stocks/Index', [
            'stockEntryLogs' => $stockEntryLogs,
            'stockActivityLogs' => $stockActivityLogs,
            'filters' => [
                'stock_entry_search' => $request->stock_entry_search,
                'stock_activity_search' => $request->stock_activity_search,
                'stock_entry_per_page' => $stockEntryLogsPerPage,
                'stock_activity_per_page' => $stockActivityLogsPerPage,
            ]
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
