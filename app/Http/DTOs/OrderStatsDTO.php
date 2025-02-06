<?php

namespace App\Http\DTOs;

use DateTime;

class OrderStatsDTO
{
    public function __construct(
        public array $daily_stats,
        public array $financial_summary,
        public array $top_selling_items
    ) {}

    public static function fromOrders($orders, ?DateTime $from = null, ?DateTime $to = null): self
    {
        if ($from && $to) {
            $orders = $orders->whereBetween('created_at', [$from, $to]);
        }

        $daily_stats = $orders
            ->groupBy(fn($order) => $order->created_at->format('Y-m-d'))
            ->map(fn($dayOrders) => [
                'date' => $dayOrders->first()->created_at->toISOString(),
                'total_orders' => $dayOrders->sum(
                    fn($order) =>
                    $order->items->sum('quantity')
                )
            ])
            ->values()
            ->toArray();

        $financial_summary = [
            'totalRevenue' => $orders->sum(
                fn($order) =>
                $order->items->sum(fn($item) => $item->quantity * $item->price)
            ),
            'totalCost' => $orders->sum(
                fn($order) =>
                $order->items->sum(fn($item) => $item->quantity * $item->cost)
            ),
            'totalIncome' => $orders->sum(
                fn($order) =>
                $order->items->sum(
                    fn($item) =>
                    $item->quantity * ($item->price - $item->cost)
                )
            ),
            'totalOrders' => $orders->sum(
                fn($order) =>
                $order->items->sum('quantity')
            ),
        ];

        $top_selling_items = $orders
            ->flatMap->items
            ->groupBy('serving.recipe.name')
            ->map(fn($items) => [
                'name' => $items->first()->serving->recipe->name,
                'quantitySold' => $items->sum('quantity'),
                'totalRevenue' => $items->sum(
                    fn($item) =>
                    $item->quantity * $item->price
                ),
            ])
            ->sortByDesc('quantitySold')
            ->take(5)
            ->values()
            ->toArray();

        return new self(
            $daily_stats,
            $financial_summary,
            $top_selling_items
        );
    }

    public function toArray(): array
    {
        return [
            'daily_stats' => $this->daily_stats,
            'financial_summary' => $this->financial_summary,
            'top_selling_items' => $this->top_selling_items,
        ];
    }
}
