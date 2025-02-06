<?php

namespace App\Http\Controllers;

use App\Http\DTOs\OrderStatsDTO;
use App\Models\Order;
use App\Models\Serving;
use App\Models\StockActivityLogs;
use DateTime;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class OrderController extends Controller
{
    public function orderStats(Request $request)
    {
        $from = $request->input('from') ? new DateTime($request->input('from')) : null;
        $to = $request->input('to') ? new DateTime($request->input('to')) : null;

        $orders = Order::with(['items.serving.recipe'])->get();
        $data = OrderStatsDTO::fromOrders($orders, $from, $to)->toArray();

        return response()->json($data);
    }


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

        // Start a database transaction
        DB::beginTransaction();

        try {
            // Create the order
            $order = Order::create([
                'subtotal' => $request->subtotal,
                'discountPercentage' => $request->discountPercentage,
                'total' => $request->total,
                'type' => $request->type,
                'user_id' => $request->user()->id,
            ]);

            // Process each order item
            foreach ($request->orders as $orderItem) {
                $order->items()->create([
                    'serving_id' => $orderItem['serving']['id'],
                    'quantity' => $orderItem['quantity'],
                    'price' => $orderItem['serving']['price'],
                ]);

                // Get the ingredients for the serving
                $ingredients = Serving::find($orderItem['serving']['id'])->recipeIngredients;

                foreach ($ingredients as $ingredient) {
                    $requiredQuantity = $ingredient->quantity * $orderItem['quantity'];

                    // Fetch available stocks
                    $stocks = $ingredient->stockEntry->stocks()
                        ->where('quantity', '>', 0)
                        ->orderBy('expiry_date')
                        ->orderBy('created_at')
                        ->get();

                    $totalAvailable = $stocks->sum('quantity');
                    if ($totalAvailable < $requiredQuantity) {
                        throw new \Exception("Insufficient stock for {$ingredient->stockEntry->name}.");
                    }

                    // Deduct stock quantities
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

            // Commit the transaction if everything is successful
            DB::commit();

            // Redirect to the receipt page
            return redirect()->route('reports.orders.receipt', ['order' => $order->id]);
        } catch (\Exception $e) {
            // Rollback the transaction if any exception occurs
            DB::rollBack();

            // Log the error for debugging
            Log::error('Order creation failed: ' . $e->getMessage());

            // Return an error response
            return back()->with([
                'toast' => [
                    'type' => 'error',
                    'message' => "Failed to create order. Please try again. {$e->getMessage()}",
                ]
            ]);
        }
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
