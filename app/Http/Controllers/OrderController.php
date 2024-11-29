<?php

namespace App\Http\Controllers;

use App\Models\Order;
use Illuminate\Http\Request;

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
