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
        ]);

        $validated['is_perishable'] = $stockEntry->perishable;

        $stockEntry->stocks()->create($validated);

        return redirect()->route('inventory.index');
    }
}
