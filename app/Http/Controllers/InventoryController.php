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
    public function createStockEntry(): Response
    {
        return Inertia::render('Inventory/Create');
    }

    /**
     * Store a newly created stock entry in storage.
     */

    public function storeStockEntry(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string',
            'description' => 'nullable|string',
            'type' => 'required|in:liquid,powder,item',
            'perishable' => 'required|boolean',
            'warn_stock_level' => 'required|integer',
            'warn_days_remaining' => 'required_if:perishable,true|nullable|integer',
        ]);

        StockEntry::create($validated);

        return redirect()->route('inventory.index');
    }

    /**
     * Display the form for editing the specified resource.
     */

    public function editStockEntry(StockEntry $stockEntry): Response
    {
        return Inertia::render('Inventory/Edit', [
            'stockEntry' => $stockEntry
        ]);
    }

    /**
     * Update the specified resource in storage.
     */

    public function updateStockEntry(Request $request, StockEntry $stockEntry)
    {
        $validated = $request->validate([
            'name' => 'required|string',
            'description' => 'nullable|string',
            'type' => 'required|in:liquid,powder,item',
            'perishable' => 'required|boolean',
            'warn_stock_level' => 'required|integer',
            'warn_days_remaining' => 'required_if:perishable,true|nullable|integer',
        ]);

        $stockEntry->update($validated);

        return redirect()->route('inventory.index');
    }

    /**
     * Remove the specified resource from storage.
     */

    public function destroyStockEntry(StockEntry $stockEntry)
    {
        $stockEntry->delete();

        return redirect()->route('inventory.index');
    }
}
