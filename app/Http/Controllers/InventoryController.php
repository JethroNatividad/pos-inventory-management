<?php

namespace App\Http\Controllers;

use App\Models\StockEntry;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class InventoryController extends Controller
{

    /**
     * Display a listing of the resource.
     */
    public function index(): Response
    {
        return Inertia::render('Inventory/Index', [
            'stockEntries' => StockEntry::all()
        ]);
    }

    /**
     * Display the form for creating a new stock entry.
     */
    public function create(): Response
    {
        return Inertia::render('Inventory/Create');
    }

    /**
     * Store a newly created stock entry in storage.
     */

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string',
            'description' => 'nullable|string',
            'type' => 'required|in:liquid,powder,item',
            'perishable' => 'required|boolean',
            'warn_stock_level' => 'required|integer',
            'warn_days_remaining' => 'required_if:perishable,true|nullable|integer',
            'unit' => [
                'required',
                function ($attribute, $value, $fail) use ($request) {
                    $validUnits = match ($request->type) {
                        'liquid' => ['ml', 'l', 'fl oz'],
                        'powder' => ['g', 'kg', 'lb'],
                        'item' => ['pcs', 'dozen'],
                        default => [],
                    };

                    if (!in_array($value, $validUnits)) {
                        $fail("The $attribute is invalid for type {$request->type}.");
                    }
                }
            ],
        ]);

        switch ($validated['type']) {
            case 'liquid':
                $validated['warn_stock_level'] = match ($validated['unit']) {
                    'l' => $validated['warn_stock_level'] * 1000,   // Convert liters to ml
                    'fl oz' => $validated['warn_stock_level'] * 29.5735, // Convert fluid ounces to ml
                    default => $validated['warn_stock_level'], // If ml, no conversion needed
                };
                break;
            case 'powder':
                $validated['warn_stock_level'] = match ($validated['unit']) {
                    'kg' => $validated['warn_stock_level'] * 1000,  // Convert kilograms to grams
                    'lb' => $validated['warn_stock_level'] * 453.592, // Convert pounds to grams
                    default => $validated['warn_stock_level'], // If grams, no conversion needed
                };
                break;
            case 'item':
                $validated['warn_stock_level'] = match ($validated['unit']) {
                    'dozen' => $validated['warn_stock_level'] * 12, // Convert dozens to pieces
                    default => $validated['warn_stock_level'], // If pieces, no conversion needed
                };
                break;
        }

        StockEntry::create($validated);

        return redirect()->route('inventory.index');
    }

    /**
     * Display the form for editing the specified resource.
     */

    public function edit(StockEntry $stockEntry): Response
    {
        return Inertia::render('Inventory/Edit', [
            'stockEntry' => $stockEntry
        ]);
    }

    /**
     * Update the specified resource in storage.
     */

    public function update(Request $request, StockEntry $stockEntry)
    {
        $validated = $request->validate([
            'name' => 'required|string',
            'description' => 'nullable|string',
            'type' => 'required|in:liquid,powder,item',
            'perishable' => 'required|boolean',
            'warn_stock_level' => 'required|integer',
            'warn_days_remaining' => 'required_if:perishable,true|nullable|integer',
            'unit' => [
                'required',
                function ($attribute, $value, $fail) use ($request) {
                    $validUnits = match ($request->type) {
                        'liquid' => ['ml', 'l', 'fl oz'],
                        'powder' => ['g', 'kg', 'lb'],
                        'item' => ['pcs', 'dozen'],
                        default => [],
                    };

                    if (!in_array($value, $validUnits)) {
                        $fail("The $attribute is invalid for type {$request->type}.");
                    }
                }
            ],
        ]);

        switch ($validated['type']) {
            case 'liquid':
                $validated['warn_stock_level'] = match ($validated['unit']) {
                    'l' => $validated['warn_stock_level'] * 1000,   // Convert liters to ml
                    'fl oz' => $validated['warn_stock_level'] * 29.5735, // Convert fluid ounces to ml
                    default => $validated['warn_stock_level'], // If ml, no conversion needed
                };
                break;
            case 'powder':
                $validated['warn_stock_level'] = match ($validated['unit']) {
                    'kg' => $validated['warn_stock_level'] * 1000,  // Convert kilograms to grams
                    'lb' => $validated['warn_stock_level'] * 453.592, // Convert pounds to grams
                    default => $validated['warn_stock_level'], // If grams, no conversion needed
                };
                break;
            case 'item':
                $validated['warn_stock_level'] = match ($validated['unit']) {
                    'dozen' => $validated['warn_stock_level'] * 12, // Convert dozens to pieces
                    default => $validated['warn_stock_level'], // If pieces, no conversion needed
                };
                break;
        }

        $stockEntry->update($validated);

        return redirect()->route('inventory.index');
    }

    /**
     * Remove the specified resource from storage.
     */

    public function destroy(StockEntry $stockEntry)
    {
        $stockEntry->deleteStockEntry();

        return redirect()->route('inventory.index');
    }
}
