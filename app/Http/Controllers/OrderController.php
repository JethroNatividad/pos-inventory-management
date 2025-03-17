<?php

namespace App\Http\Controllers;

use App\Http\DTOs\OrderStatsDTO;
use App\Models\Order;
use App\Models\Recipe;
use App\Models\Serving;
use App\Models\StockActivityLogs;
use App\Models\StockEntry;
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
        $recipe_id = $request->input('recipe_id');

        // Modified query to include soft deleted recipes
        $orders = Order::with(['user', 'items.addons.stockEntry', 'items.serving', 'items.serving.recipe' => function ($query) {
            $query->withTrashed(); // This includes soft deleted recipes
        }])->get();

        $data = OrderStatsDTO::fromOrders($orders, $from, $to, $recipe_id)->toArray();

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
            'customer_name' => 'string',
            'payment_method' => 'required|string',
            'orders.*.serving.id' => 'required|exists:servings,id',
            'orders.*.quantity' => 'required|numeric',
            'orders.*.addons.*.stock_entry_id' => 'exists:stock_entries,id',
            'orders.*.addons.*.quantity' => 'numeric',
            'orders.*.addons.*.price' => 'numeric',
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
                'customer_name' => $request->customer_name,
                'payment_method' => $request->payment_method,
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

                // Handle addons
                foreach ($orderItem['addons'] as $addon) {
                    $order->items->last()->addons()->create([
                        'stock_entry_id' => $addon['stock_entry_id'],
                        'quantity' => $addon['quantity'],
                        'price' => $addon['price'],
                    ]);
                }

                // Handle stock deduction for addons
                foreach ($orderItem['addons'] as $addon) {
                    $addonStockEntry = StockEntry::find($addon['stock_entry_id']);

                    // Fetch available stocks for the addon
                    $addonStocks = $addonStockEntry->stocks()
                        ->where('quantity', '>', 0)
                        ->orderBy('expiry_date')
                        ->orderBy('created_at')
                        ->get();

                    $totalAvailable = $addonStocks->sum('quantity');
                    $requiredAddonQuantity = $addon['quantity'];

                    if ($totalAvailable < $requiredAddonQuantity) {
                        throw new \Exception("Insufficient stock for {$addonStockEntry->name}.");
                    }

                    // Deduct stock quantities
                    foreach ($addonStocks as $addonStock) {
                        if ($requiredAddonQuantity <= 0) break;

                        $deductQuantity = min($addonStock->quantity, $requiredAddonQuantity);

                        $addonStock->decrement('quantity', $deductQuantity);

                        StockActivityLogs::create([
                            'stock_id' => $addonStock->id,
                            'user_id' => $request->user()->id,
                            'action' => 'stock_out',
                            'quantity' => $deductQuantity,
                            'reason' => 'Add-on Deducted from Order #' . $order->id,
                            'batch_label' => $addonStock->batch_label,
                            'price' => $addonStock->unit_price * $deductQuantity,
                        ]);

                        $requiredAddonQuantity -= $deductQuantity;
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
