<?php

namespace App\Http\DTOs;

use DateTime;

class OrderStatsDTO
{
    public function __construct(
        public array $daily_stats,
        public array $financial_summary,
        public array $top_selling_items,
        public array $top_employee_sales
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
                    $order->items->sum('quantity') +
                        $order->items->sum(fn($item) => $item->addons->sum('quantity'))
                )
            ])
            ->values()
            ->toArray();

        // Calculate totals including VAT
        $totalGrossRevenue = $orders->sum(
            fn($order) =>
            $order->items->sum(fn($item) => $item->quantity * $item->price) +
                $order->items->sum(fn($item) => $item->addons->sum(fn($addon) => $addon->quantity * $addon->price))
        );

        // Calculate VAT (assuming 12% VAT)
        $totalVAT = $orders->sum(
            fn($order) =>
            $order->items->sum(
                fn($item) =>
                $item->quantity * ($item->price * 0.12)
            ) +
                $order->items->sum(
                    fn($item) =>
                    $item->addons->sum(fn($addon) => $addon->quantity * ($addon->price * 0.12))
                )
        );

        // Net revenue is gross revenue minus VAT
        $netRevenue = $totalGrossRevenue - $totalVAT;

        $totalCost = $orders->sum(
            fn($order) =>
            $order->items->sum(fn($item) => $item->quantity * $item->cost) +
                $order->items->sum(fn($item) => $item->addons->sum(fn($addon) => $addon->quantity * ($addon->stockEntry->cost ?? 0)))
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
                $order->items->sum('quantity') +
                    $order->items->sum(fn($item) => $item->addons->sum('quantity'))
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
                ) + $items->sum(
                    fn($item) =>
                    $item->addons->sum(fn($addon) => $addon->quantity * $addon->price)
                ),
                // Optionally include VAT for each item
                'vatAmount' => $items->sum(
                    fn($item) =>
                    $item->quantity * ($item->price * 0.12)
                ) + $items->sum(
                    fn($item) =>
                    $item->addons->sum(fn($addon) => $addon->quantity * ($addon->price * 0.12))
                ),
            ])
            ->sortByDesc('quantitySold')
            ->take(5)
            ->values()
            ->toArray();

        $top_employee_sales = $orders
            ->groupBy('user_id')
            ->map(function ($userOrders) {
                $user = $userOrders->first()->user;

                // Calculate gross revenue including VAT
                $grossRevenue = $userOrders->sum(
                    fn($order) =>
                    $order->items->sum(fn($item) => $item->quantity * $item->price) +
                        $order->items->sum(fn($item) => $item->addons->sum(fn($addon) => $addon->quantity * $addon->price))
                );

                // Calculate VAT amount (assuming 12% VAT)
                $vatAmount = $userOrders->sum(
                    fn($order) =>
                    $order->items->sum(fn($item) => $item->quantity * ($item->price * 0.12)) +
                        $order->items->sum(fn($item) => $item->addons->sum(fn($addon) => $addon->quantity * ($addon->price * 0.12)))
                );

                // Calculate net revenue (excluding VAT)
                $netRevenue = $grossRevenue - $vatAmount;

                // Calculate total cost
                $totalCost = $userOrders->sum(
                    fn($order) =>
                    $order->items->sum(fn($item) => $item->quantity * $item->cost) +
                        $order->items->sum(fn($item) => $item->addons->sum(fn($addon) => $addon->quantity * ($addon->stockEntry->cost ?? 0)))
                );

                // Calculate net income (net revenue minus costs)
                $netIncome = $netRevenue - $totalCost;

                return [
                    'user_id' => $user->id,
                    'name' => $user->first_name . ' ' . $user->last_name,
                    'total_orders' => $userOrders->count(),
                    'order_items' => $userOrders->sum(
                        fn($order) =>
                        $order->items->sum('quantity')
                    ),
                    'total_revenue' => $grossRevenue,
                    'total_income' => $netIncome,
                ];
            })
            ->sortByDesc('total_revenue')
            ->take(5)
            ->values()
            ->toArray();

        return new self(
            $daily_stats,
            $financial_summary,
            $top_selling_items,
            $top_employee_sales
        );
    }

    public function toArray(): array
    {
        return [
            'daily_stats' => $this->daily_stats,
            'financial_summary' => $this->financial_summary,
            'top_selling_items' => $this->top_selling_items,
            'top_employee_sales' => $this->top_employee_sales,
        ];
    }
}
