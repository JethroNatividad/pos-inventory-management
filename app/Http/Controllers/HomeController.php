<?php

namespace App\Http\Controllers;

use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Stock;
use App\Models\StockEntry;
use Carbon\Carbon;
use Inertia\Inertia;

class HomeController extends Controller
{
    public function index()
    {
        return Inertia::render('Home', [
            'lowStocks' => $this->getLowStocks(),
            'expiringStocks' => $this->getExpiringStocks(),
            'hourlySales' => $this->getHourlySales(),
            'dailySales' => $this->getDailySales(),
            'weeklySales' => $this->getWeeklySales(),
            'monthlySales' => $this->getMonthlySales(),
            'allTimeSales' => $this->getAllTimeSales(),
            'topFiveSellingItems' => $this->topFiveSellingItems(),
            'revenue' => $this->getRevenue(),
            'expenses' => $this->getExpenses(),
            'income' => $this->getIncome(),
        ]);
    }

    private function getLowStocks()
    {
        return StockEntry::where('is_deleted', false)->get()
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

    private function getHourlySales()
    {
        $hours = collect(range(0, 23))->map(function ($hour) {
            return [
                'label' => Carbon::createFromTime($hour)->format('g A'),
                'count' => 0
            ];
        });

        $hourlySales = Order::selectRaw('EXTRACT(HOUR FROM created_at) as label, COUNT(*) as count')
            ->where('created_at', '>=', now()->subDay())
            ->groupBy('label')
            ->get()
            ->map(function ($item) {
                $item->label = Carbon::createFromTime($item->label)->format('g A');
                return $item;
            });

        return $hours->map(function ($hour) use ($hourlySales) {
            $sale = $hourlySales->firstWhere('label', $hour['label']);
            return $sale ?: $hour;
        });
    }

    private function getDailySales()
    {
        $days = collect(range(0, 6))->map(function ($day) {
            return [
                'label' => Carbon::now()->startOfWeek()->addDays($day)->format('l'),
                'count' => 0
            ];
        });

        $dailySales = Order::selectRaw('DATE(created_at) as label, COUNT(*) as count')
            ->where('created_at', '>=', now()->startOfWeek())
            ->groupBy('label')
            ->get()
            ->map(function ($item) {
                $item->label = Carbon::parse($item->label)->format('l');
                return $item;
            });

        return $days->map(function ($day) use ($dailySales) {
            $sale = $dailySales->firstWhere('label', $day['label']);
            return $sale ?: $day;
        })->values()->toArray();
    }

    private function getWeeklySales()
    {
        $startOfMonth = Carbon::now()->startOfMonth();
        $endOfMonth = Carbon::now()->endOfMonth();

        $weeks = collect(range(0, $endOfMonth->weekOfMonth - 1))->map(function ($week) {
            return [
                'label' => 'Week ' . ($week + 1),
                'count' => 0
            ];
        });

        $weeklySales = Order::selectRaw('DATE_TRUNC(\'week\', created_at) as week_start, COUNT(*) as count')
            ->whereBetween('created_at', [$startOfMonth, $endOfMonth])
            ->groupBy('week_start')
            ->orderBy('week_start')
            ->get()
            ->map(function ($item, $index) {
                $item->label = 'Week ' . ($index + 1);
                return $item;
            });

        return $weeks->map(function ($week) use ($weeklySales) {
            $sale = $weeklySales->firstWhere('label', $week['label']);
            return $sale ?: $week;
        })->values()->toArray();
    }

    private function getMonthlySales()
    {
        $months = collect(range(1, 12))->map(function ($month) {
            return [
                'label' => Carbon::createFromDate(null, $month, 1)->format('F'),
                'count' => 0
            ];
        });

        $monthlySales = Order::selectRaw('EXTRACT(MONTH FROM created_at) as month, COUNT(*) as count')
            ->whereYear('created_at', now()->year)
            ->groupBy('month')
            ->get()
            ->map(function ($item) {
                $item->label = Carbon::createFromDate(null, $item->month, 1)->format('F');
                return $item;
            });

        return $months->map(function ($month) use ($monthlySales) {
            $sale = $monthlySales->firstWhere('label', $month['label']);
            return $sale ?: $month;
        })->values()->toArray();
    }

    private function getAllTimeSales()
    {
        $years = Order::selectRaw('EXTRACT(YEAR FROM created_at) as year')
            ->distinct()
            ->orderBy('year')
            ->pluck('year');

        $allTimeSales = Order::selectRaw('EXTRACT(YEAR FROM created_at) as year, COUNT(*) as count')
            ->groupBy('year')
            ->orderBy('year')
            ->get()
            ->map(function ($item) {
                return [
                    'label' => $item->year,
                    'count' => $item->count
                ];
            });

        return $years->map(function ($year) use ($allTimeSales) {
            $sale = $allTimeSales->firstWhere('label', $year);
            return $sale ?: ['label' => $year, 'count' => 0];
        })->values()->toArray();
    }

    private function topFiveSellingItems()
    {
        //{ daily: top 5 selling items
        // weekly: top 5 selling items
        // monthly: top 5 selling items, yearly, all time}
        // label: item name, count: total quantity sold

        $dailyTopFive = OrderItem::selectRaw('serving_id, SUM(quantity) as count')
            ->whereHas('order', function ($query) {
                $query->where('created_at', '>=', now()->startOfDay());
            })
            ->groupBy('serving_id')
            ->orderByDesc('count')
            ->limit(5)
            ->get()
            ->map(function ($item) {
                return [
                    'label' => $item->serving->recipe->name  . ' (' . $item->serving->name . ')',
                    'count' => $item->count
                ];
            });

        $weeklyTopFive = OrderItem::selectRaw('serving_id, SUM(quantity) as count')
            ->whereHas('order', function ($query) {
                $query->where('created_at', '>=', now()->startOfWeek());
            })
            ->groupBy('serving_id')
            ->orderByDesc('count')
            ->limit(5)
            ->get()
            ->map(function ($item) {
                return [
                    'label' => $item->serving->recipe->name  . ' (' . $item->serving->name . ')',
                    'count' => $item->count
                ];
            });

        $monthlyTopFive = OrderItem::selectRaw('serving_id, SUM(quantity) as count')
            ->whereHas('order', function ($query) {
                $query->where('created_at', '>=', now()->startOfMonth());
            })
            ->groupBy('serving_id')
            ->orderByDesc('count')
            ->limit(5)
            ->get()
            ->map(function ($item) {
                return [
                    'label' => $item->serving->recipe->name  . ' (' . $item->serving->name . ')',
                    'count' => $item->count
                ];
            });

        $yearlyTopFive = OrderItem::selectRaw('serving_id, SUM(quantity) as count')
            ->whereHas('order', function ($query) {
                $query->whereYear('created_at', now()->year);
            })
            ->groupBy('serving_id')
            ->orderByDesc('count')
            ->limit(5)
            ->get()
            ->map(function ($item) {
                return [
                    'label' => $item->serving->recipe->name  . ' (' . $item->serving->name . ')',
                    'count' => $item->count
                ];
            });

        $allTimeTopFive = OrderItem::selectRaw('serving_id, SUM(quantity) as count')
            ->groupBy('serving_id')
            ->orderByDesc('count')
            ->limit(5)
            ->get()
            ->map(function ($item) {
                return [
                    'label' => $item->serving->recipe->name  . ' (' . $item->serving->name . ')',
                    'count' => $item->count
                ];
            });

        return [
            'daily' => $dailyTopFive,
            'weekly' => $weeklyTopFive,
            'monthly' => $monthlyTopFive,
            'yearly' => $yearlyTopFive,
            'allTime' => $allTimeTopFive,
        ];
    }

    // total revenue daily, weekly, monthly, yearly, all time
    // total expenses daily, weekly, monthly, yearly, all time
    // total income daily, weekly, monthly, yearly, all time

    private function getRevenue()
    {

        $dailyRevenue = Order::selectRaw('SUM(total) as total')
            ->where('created_at', '>=', now()->startOfDay())
            ->first()
            ->total;

        $weeklyRevenue = Order::selectRaw('SUM(total) as total')
            ->where('created_at', '>=', now()->startOfWeek())
            ->first()
            ->total;

        $monthlyRevenue = Order::selectRaw('SUM(total) as total')
            ->where('created_at', '>=', now()->startOfMonth())
            ->first()
            ->total;

        $yearlyRevenue = Order::selectRaw('SUM(total) as total')
            ->whereYear('created_at', now()->year)
            ->first()
            ->total;

        $allTimeRevenue = Order::selectRaw('SUM(total) as total')
            ->first()
            ->total;

        return [
            'daily' => $dailyRevenue,
            'weekly' => $weeklyRevenue,
            'monthly' => $monthlyRevenue,
            'yearly' => $yearlyRevenue,
            'allTime' => $allTimeRevenue,
        ];
    }

    private function getExpenses()
    {
        $dailyExpenses = Order::with('items')
            ->where('created_at', '>=', now()->startOfDay())
            ->get()
            ->sum('total_cost');

        $weeklyExpenses = Order::with('items')
            ->where('created_at', '>=', now()->startOfWeek())
            ->get()
            ->sum('total_cost');

        $monthlyExpenses = Order::with('items')
            ->where('created_at', '>=', now()->startOfMonth())
            ->get()
            ->sum('total_cost');

        $yearlyExpenses = Order::with('items')
            ->whereYear('created_at', now()->year)
            ->get()
            ->sum('total_cost');

        $allTimeExpenses = Order::with('items')
            ->get()
            ->sum('total_cost');

        return [
            'daily' => $dailyExpenses,
            'weekly' => $weeklyExpenses,
            'monthly' => $monthlyExpenses,
            'yearly' => $yearlyExpenses,
            'allTime' => $allTimeExpenses,
        ];
    }

    private function getIncome()
    {
        $dailyIncome = Order::with('items')
            ->where('created_at', '>=', now()->startOfDay())
            ->get()
            ->sum('total_income');

        $weeklyIncome = Order::with('items')
            ->where('created_at', '>=', now()->startOfWeek())
            ->get()
            ->sum('total_income');

        $monthlyIncome = Order::with('items')
            ->where('created_at', '>=', now()->startOfMonth())
            ->get()
            ->sum('total_income');

        $yearlyIncome = Order::with('items')
            ->whereYear('created_at', now()->year)
            ->get()
            ->sum('total_income');

        $allTimeIncome = Order::with('items')
            ->get()
            ->sum('total_income');

        return [
            'daily' => $dailyIncome,
            'weekly' => $weeklyIncome,
            'monthly' => $monthlyIncome,
            'yearly' => $yearlyIncome,
            'allTime' => $allTimeIncome,
        ];
    }
}
