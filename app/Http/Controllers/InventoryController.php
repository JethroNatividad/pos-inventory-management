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
     * Store a newly created stock entry in storage.
     */
    public function createStockEntry(): Response
    {
        return inertia('Inventory/CreateStockEntry');
    }

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
}
