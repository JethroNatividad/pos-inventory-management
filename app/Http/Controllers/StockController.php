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
            'stockEntry' => $stockEntry
        ]);
    }

    /**
     * Store a newly created stock in storage.
     */

    public function store(Request $request, StockEntry $stockEntry)
    {
        $validated = $request->validate([
            'quantity' => 'required|numeric',
            'price' => 'required|numeric',
            'batch_label' => [
                'required',
                'string',
                function ($attribute, $value, $fail) use ($stockEntry) {
                    $exists = $stockEntry->stocks()->where('batch_label', $value)->exists();
                    if ($exists) {
                        $fail("The batch label has already been taken for this stock entry.");
                    }
                },
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

        return redirect()->route('inventory.index')->with('message', 'Stock Added');;
    }

    /**
     * Display the form for removing a stock.
     */

    public function removeForm(StockEntry $stockEntry): Response
    {
        return Inertia::render('Inventory/Stocks/Remove', [
            'stockEntry' => $stockEntry,
            'batchLabels' => $stockEntry->stocks->pluck('batch_label')
        ]);
    }

    public function remove(Request $request, StockEntry $stockEntry)
    {
        $validated = $request->validate([
            'batch_label' => 'required|exists:stocks,batch_label',
            'quantity' => 'required|numeric',
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

        $stock->decrement('quantity', $validated['quantity']);


        StockActivityLogs::create([
            'stock_id' => $stock->id,
            'user_id' => $request->user()->id,
            'action' => 'stock_out',
            'quantity' => $validated['quantity'],
            'batch_label' => $stock->batch_label,
            'reason' => $validated['reason'],
            'price' => $stock->unit_price * $validated['quantity'],
        ]);

        return redirect()->route('inventory.index');
    }
}
