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

    public function orders(Request $request)
    {
        $ordersQuery = Order::orderBy('created_at', 'desc')
            ->with(['user', 'items.serving']);

        // Apply search filter if provided
        if ($request->has('search') && $request->search) {
            $search = $request->search;
            $ordersQuery->where(function ($q) use ($search) {
                $q->where('id', 'like', "%{$search}%")
                    ->orWhere('customer_name', 'like', "%{$search}%")
                    ->orWhere('payment_method', 'like', "%{$search}%")
                    ->orWhere('type', 'like', "%{$search}%")
                    ->orWhereHas('user', function ($query) use ($search) {
                        $query->where('first_name', 'like', "%{$search}%")
                            ->orWhere('last_name', 'like', "%{$search}%")
                            ->orWhere('middle_name', 'like', "%{$search}%");
                    });
            });
        }

        // Apply date range filter
        if ($request->has('date_from') && $request->date_from) {
            $ordersQuery->whereDate('created_at', '>=', $request->date_from);
        }
        if ($request->has('date_to') && $request->date_to) {
            $ordersQuery->whereDate('created_at', '<=', $request->date_to);
        }

        // Apply cashier filter
        if ($request->has('cashier_id') && $request->cashier_id && $request->cashier_id !== 'all') {
            $ordersQuery->where('user_id', $request->cashier_id);
        }

        // Apply order type filter
        if ($request->has('order_type') && $request->order_type && $request->order_type !== 'all') {
            $ordersQuery->where('type', $request->order_type);
        }

        $perPage = $request->get('per_page', 10);
        $orders = $ordersQuery->paginate($perPage);

        // Get unique cashiers and order types for filters
        $allOrders = Order::with('user')->get();
        $cashiers = $allOrders->map(function ($order) {
            return [
                'id' => $order->user->id,
                'name' => trim("{$order->user->first_name} " .
                    ($order->user->middle_name ? $order->user->middle_name . " " : "") .
                    $order->user->last_name)
            ];
        })->unique('id')->values();

        $orderTypes = $allOrders->pluck('type')->unique()->values();

        return Inertia::render('Reports/Orders/Index', [
            'orders' => $orders,
            'filters' => [
                'search' => $request->search,
                'date_from' => $request->date_from,
                'date_to' => $request->date_to,
                'cashier_id' => $request->cashier_id,
                'order_type' => $request->order_type,
                'per_page' => $perPage,
            ],
            'cashiers' => $cashiers,
            'orderTypes' => $orderTypes,
        ]);
    }

    public function orderReceipt(Order $order)
    {
        return Inertia::render('Reports/Orders/ReceiptPage', [
            'order' => $order->load(['items.serving.recipe', 'user', 'items.addons.stockEntry']),
        ]);
    }
}
