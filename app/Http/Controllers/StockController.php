<?php

namespace App\Http\Controllers;

use App\Models\Stock;
use App\Models\StockActivityLogs;
use App\Models\StockEntry;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class StockController extends Controller
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
     * Display the form for creating a new stock.
     */

    public function create(StockEntry $stockEntry): Response
    {
        return Inertia::render('Inventory/Stocks/Create', [
            'stockEntry' => $stockEntry,
            'batchLabels' => $stockEntry->stocks
                ->filter(fn($stock) => $stock->quantity > 0)
                ->pluck('batch_label')
                ->map(fn($label) => [
                    'label' => $label,
                    'amount' => $stockEntry->stocks->where('batch_label', $label)->sum('quantity')
                ]),
        ]);
    }

    /**
     * Store a newly created stock in storage.
     */

    public function store(Request $request, StockEntry $stockEntry)
    {
        $validated = $request->validate([
            'quantity' => 'required|numeric|min:1',
            'price' => 'required|numeric|min:1',
            'batch_label' => [
                'required',
                'string',
            ],
            'expiry_date' => 'required_if:is_perishable,true|nullable|date',
            'unit' => [
                'required',
                function ($attribute, $value, $fail) use ($request, $stockEntry) {
                    $validUnits = match ($stockEntry->type) {
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

        // Convert the quantity, the base unit are ml for liquid, grams for powder, pcs for item
        // Convert quantity to base units

        // Check if stock label already exists

        $existingBatchLabel = $stockEntry->stocks()->where('batch_label', $validated['batch_label'])->first();

        $originalQuantity = $validated['quantity'];
        switch ($stockEntry->type) {
            case 'liquid':
                $validated['quantity'] = match ($validated['unit']) {
                    'l' => $validated['quantity'] * 1000,   // Convert liters to ml
                    'fl oz' => $validated['quantity'] * 29.5735, // Convert fluid ounces to ml
                    default => $validated['quantity'], // If ml, no conversion needed
                };
                break;
            case 'powder':
                $validated['quantity'] = match ($validated['unit']) {
                    'kg' => $validated['quantity'] * 1000,  // Convert kilograms to grams
                    'lb' => $validated['quantity'] * 453.592, // Convert pounds to grams
                    default => $validated['quantity'], // If grams, no conversion needed
                };
                break;
            case 'item':
                $validated['quantity'] = match ($validated['unit']) {
                    'dozen' => $validated['quantity'] * 12, // Convert dozens to pieces
                    default => $validated['quantity'], // If pieces, no conversion needed
                };
                break;
        }

        $validated['is_perishable'] = $stockEntry->perishable;

        $validated['unit_price'] = $validated['price'] / $validated['quantity'];

        if ($existingBatchLabel) {
            $existingBatchLabel->increment('quantity', $validated['quantity']);

            StockActivityLogs::create([
                'stock_id' => $existingBatchLabel->id,
                'user_id' => $request->user()->id,
                'action' => 'stock_in',
                'quantity' => $validated['quantity'],
                'price' => $validated['price'],
                'batch_label' => $existingBatchLabel->batch_label,
                'expiry_date' => $existingBatchLabel->expiry_date,
                'is_perishable' => $existingBatchLabel->is_perishable,
            ]);

            return redirect()->route('inventory.index')->with([
                'toast' => [
                    'message' => 'Stock Added',
                    'description' => "Added {$originalQuantity}{$validated['unit']} of {$stockEntry->name}.",
                    'action' => [
                        'label' => 'Undo',
                        'url' => route('stock.remove', $stockEntry->id),
                        'method' => 'post',
                        'data' => [
                            'batch_label' => $validated['batch_label'],
                            'quantity' => $originalQuantity,
                            'reason' => 'Undo stock addition',
                            'unit' => $validated['unit']
                        ]
                    ]
                ]
            ]);
        }

        $stock = $stockEntry->stocks()->create($validated);

        StockActivityLogs::create([
            'stock_id' => $stock->id,
            'user_id' => $request->user()->id,
            'action' => 'stock_in',
            'quantity' => $stock->quantity,
            'price' => $stock->price,
            'batch_label' => $stock->batch_label,
            'expiry_date' => $stock->expiry_date,
            'is_perishable' => $stock->is_perishable,
        ]);

        return redirect()->route('inventory.index')->with([
            'toast' => [
                'message' => 'Stock Added',
                'description' => "Added {$originalQuantity}{$validated['unit']} of {$stockEntry->name}.",
                'action' => [
                    'label' => 'Undo',
                    'url' => route('stock.remove', $stockEntry->id),
                    'method' => 'post',
                    'data' => [
                        'batch_label' => $stock->batch_label,
                        'quantity' => $originalQuantity,
                        'reason' => 'Undo stock addition',
                        'unit' => $validated['unit']

                    ]
                ]
            ]
        ]);
    }

    /**
     * Display the form for removing a stock.
     */

    public function removeForm(StockEntry $stockEntry): Response
    {
        return Inertia::render('Inventory/Stocks/Remove', [
            'stockEntry' => $stockEntry,
            // {label: 'Batch 1', amount: 'number of stocks'}
            'batchLabels' => $stockEntry->stocks
                ->filter(fn($stock) => $stock->quantity > 0)
                ->pluck('batch_label')
                ->map(fn($label) => [
                    'label' => $label,
                    'amount' => $stockEntry->stocks->where('batch_label', $label)->sum('quantity')
                ]),
        ]);
    }

    public function remove(Request $request, StockEntry $stockEntry)
    {
        $validated = $request->validate([
            'batch_label' => 'required|exists:stocks,batch_label',
            'quantity' => 'required|numeric|min:1',
            'reason' => 'required|string',
            'unit' => [
                'required',
                function ($attribute, $value, $fail) use ($request, $stockEntry) {
                    $validUnits = match ($stockEntry->type) {
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

        $stock = $stockEntry->stocks()->where('batch_label', $validated['batch_label'])->first();
        $originalQuantity = $validated['quantity'];

        switch ($stockEntry->type) {
            case 'liquid':
                $validated['quantity'] = match ($validated['unit']) {
                    'l' => $validated['quantity'] * 1000,   // Convert liters to ml
                    'fl oz' => $validated['quantity'] * 29.5735, // Convert fluid ounces to ml
                    default => $validated['quantity'], // If ml, no conversion needed
                };
                break;
            case 'powder':
                $validated['quantity'] = match ($validated['unit']) {
                    'kg' => $validated['quantity'] * 1000,  // Convert kilograms to grams
                    'lb' => $validated['quantity'] * 453.592, // Convert pounds to grams
                    default => $validated['quantity'], // If grams, no conversion needed
                };
                break;
            case 'item':
                $validated['quantity'] = match ($validated['unit']) {
                    'dozen' => $validated['quantity'] * 12, // Convert dozens to pieces
                    default => $validated['quantity'], // If pieces, no conversion needed
                };
                break;
        }

        // Check if the quantity to remove is greater than the quantity in stock
        if ($validated['quantity'] > $stock->quantity) {
            // Show validation error
            return redirect()->back()->withErrors([
                'quantity' => 'The quantity to remove is greater than the quantity in stock.'
            ]);
        }

        $stock->decrement('quantity', $validated['quantity']);


        StockActivityLogs::create([
            'stock_id' => $stock->id,
            'user_id' => $request->user()->id,
            'action' => 'stock_out',
            'quantity' => $validated['quantity'],
            'batch_label' => $stock->batch_label,
            'reason' => $validated['reason'],
            'price' => $stock->unit_price * $validated['quantity'],
            'expiry_date' => $stock->expiry_date,
            'is_perishable' => $stock->is_perishable,
        ]);

        return redirect()->route('inventory.index')->with([
            'toast' => [
                'message' => 'Stock Removed',
                'description' => "Removed {$originalQuantity}{$validated['unit']} of {$stockEntry->name}.",
                'action' => [
                    'label' => 'Undo',
                    'url' => route('stock.restore', $stockEntry->id),
                    'method' => 'patch',
                    'data' => [
                        'batch_label' => $stock->batch_label,
                        'quantity' => $originalQuantity,
                        'unit' => $validated['unit'],
                    ]
                ]
            ]
        ]);
    }

    public function restore(Request $request, StockEntry $stockEntry)
    {
        $validated = $request->validate([
            'batch_label' => 'required|exists:stocks,batch_label',
            'quantity' => 'required|numeric',
            'unit' => [
                'required',
                function ($attribute, $value, $fail) use ($request, $stockEntry) {
                    $validUnits = match ($stockEntry->type) {
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

        $stock = $stockEntry->stocks()->where('batch_label', $validated['batch_label'])->first();
        $originalQuantity = $validated['quantity'];
        switch ($stockEntry->type) {
            case 'liquid':
                $validated['quantity'] = match ($validated['unit']) {
                    'l' => $validated['quantity'] * 1000,   // Convert liters to ml
                    'fl oz' => $validated['quantity'] * 29.5735, // Convert fluid ounces to ml
                    default => $validated['quantity'], // If ml, no conversion needed
                };
                break;
            case 'powder':
                $validated['quantity'] = match ($validated['unit']) {
                    'kg' => $validated['quantity'] * 1000,  // Convert kilograms to grams
                    'lb' => $validated['quantity'] * 453.592, // Convert pounds to grams
                    default => $validated['quantity'], // If grams, no conversion needed
                };
                break;
            case 'item':
                $validated['quantity'] = match ($validated['unit']) {
                    'dozen' => $validated['quantity'] * 12, // Convert dozens to pieces
                    default => $validated['quantity'], // If pieces, no conversion needed
                };
                break;
        }

        $stock->increment('quantity', $validated['quantity']);

        StockActivityLogs::create([
            'stock_id' => $stock->id,
            'user_id' => $request->user()->id,
            'action' => 'stock_in',
            'quantity' => $validated['quantity'],
            'batch_label' => $stock->batch_label,
            'price' => $stock->unit_price * $validated['quantity'],
            'expiry_date' => $stock->expiry_date,
            'is_perishable' => $stock->is_perishable,
        ]);

        return redirect()->route('inventory.index')->with([
            'toast' => [
                'message' => 'Stock Restored',
                'description' => "Restored {$originalQuantity}{$validated['unit']} of {$stockEntry->name}.",
            ]
        ]);
    }
}
