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

    public static function fromOrders($orders, ?DateTime $from = null, ?DateTime $to = null, $recipe_id = null): self
    {
        if ($recipe_id) {
            $orders = $orders->map(function ($order) use ($recipe_id) {
                // Clone the order to avoid modifying the original
                $filteredOrder = clone $order;
                // Filter the items to only include those matching the recipe_id
                $filteredOrder->items = $order->items->filter(function ($item) use ($recipe_id) {
                    return $item->serving->recipe->id == $recipe_id;
                });
                return $filteredOrder;
            })->filter(function ($order) {
                // Remove orders that have no matching items after filtering
                return $order->items->isNotEmpty();
            });
        }

        if ($from && $to) {
            $orders = $orders->whereBetween('created_at', [$from, $to]);
        }

        $daily_stats = $orders
            ->groupBy(fn($order) => $order->created_at->format('Y-m-d-h-s'))
            ->map(fn($dayOrders) => [
                'date' => $dayOrders->first()->created_at->toISOString(),
                'total_orders' => $dayOrders->sum(
                    fn($order) =>
                    $order->items->sum('quantity')
                )
            ])
            ->values()
            ->toArray();

        // Calculate totals including VAT
        $totalGrossRevenue = $orders->sum(
            fn($order) =>
            $order->items->sum(fn($item) => $item->quantity * $item->price)
        );

        // Calculate VAT (assuming 12% VAT)
        $totalVAT = $orders->sum(
            fn($order) =>
            $order->items->sum(
                fn($item) =>
                $item->quantity * ($item->price * 0.12)
            )
        );

        // Net revenue is gross revenue minus VAT
        $netRevenue = $totalGrossRevenue - $totalVAT;

        $totalCost = $orders->sum(
            fn($order) =>
            $order->items->sum(fn($item) => $item->quantity * $item->cost)
        );

        // Net income is net revenue minus total cost
        $netIncome = $netRevenue - $totalCost;

        $financial_summary = [
            'totalGrossRevenue' => $totalGrossRevenue, // Revenue including VAT
            'totalVAT' => $totalVAT, // VAT amount
            'totalRevenue' => $netRevenue, // Revenue excluding VAT
            'totalCost' => $totalCost,
            'totalIncome' => $netIncome, // Income after VAT and costs
            'totalOrders' => $orders->sum(
                fn($order) =>
                $order->items->sum('quantity')
            ),
        ];

        $top_selling_items = $orders
            ->flatMap->items
            ->groupBy($recipe_id ? 'serving' : 'serving.recipe.name')
            ->map(fn($items) => [
                'name' => $recipe_id ? "{$items->first()->serving->recipe->name} ({$items->first()->serving->name})"
                    : $items->first()->serving->recipe->name,
                'quantitySold' => $items->sum('quantity'),
                'totalRevenue' => $items->sum(
                    fn($item) =>
                    $item->quantity * $item->price
                ),
                // Optionally include VAT for each item
                'vatAmount' => $items->sum(
                    fn($item) =>
                    $item->quantity * ($item->price * 0.12)
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
