<?php

namespace App\Http\Controllers;

use App\Models\Order;
use App\Models\Serving;
use App\Models\StockActivityLogs;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class OrderController extends Controller
{

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $request->validate([
            'subtotal' => 'required|numeric',
            'discountPercentage' => 'required|numeric|between:0,100',
            'total' => 'required|numeric',
            'type' => [
                'required',
                function ($attribute, $value, $fail) {
                    if (!in_array($value, ['dine-in', 'take-out', 'delivery'])) {
                        $fail("The $attribute must be dine-in, take-out, or delivery.");
                    }
                }
            ],
            'orders.*.serving.id' => 'required|exists:servings,id',
            'orders.*.quantity' => 'required|numeric',
        ]);

        $order = Order::create([
            'subtotal' => $request->subtotal,
            'discountPercentage' => $request->discountPercentage,
            'total' => $request->total,
            'type' => $request->type,
            'user_id' => $request->user()->id,
        ]);

        foreach ($request->orders as $orderItem) {
            $order->items()->create([
                'serving_id' => $orderItem['serving']['id'],
                'quantity' => $orderItem['quantity'],
                'price' => $orderItem['serving']['price'],
            ]);

            $ingredients = Serving::find($orderItem['serving']['id'])->recipeIngredients;

            foreach ($ingredients as $ingredient) {
                $requiredQuantity = $ingredient->quantity * $orderItem['quantity'];

                $stocks = $ingredient->stockEntry->stocks()
                    ->where('quantity', '>', 0)
                    ->orderBy('expiry_date')
                    ->orderBy('created_at')
                    ->get();

                $totalAvailable = $stocks->sum('quantity');
                if ($totalAvailable < $requiredQuantity) {
                    throw new \Exception("Insufficient stock for {$ingredient->stockEntry->name}.");
                }

                foreach ($stocks as $stock) {
                    if ($requiredQuantity <= 0) break;

                    $deductQuantity = min($stock->quantity, $requiredQuantity);

                    $stock->decrement('quantity', $deductQuantity);

                    StockActivityLogs::create([
                        'stock_id' => $stock->id,
                        'user_id' => $request->user()->id,
                        'action' => 'stock_out',
                        'quantity' => $deductQuantity,
                        'reason' => 'Deducted from Order #' . $order->id,
                        'batch_label' => $stock->batch_label,
                        'price' => $stock->unit_price * $deductQuantity,
                    ]);

                    $requiredQuantity -= $deductQuantity;
                }
            }
        }

        // Redirect to reports.orders.receipt, orderid
        return redirect()->route('reports.orders.receipt', ['order' => $order->id]);
    }

    /**
     * Display the specified resource.
     */
    public function show(Order $order)
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Order $order)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Order $order)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Order $order)
    {
        //
    }
}
