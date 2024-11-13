<?php

namespace App\Http\Controllers;

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
            'batch_label' => 'required|string|unique:stocks,batch_label',
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

        $stockEntry->stocks()->create($validated);

        return redirect()->route('inventory.index');
    }
}
