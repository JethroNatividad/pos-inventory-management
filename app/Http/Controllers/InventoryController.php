<?php

namespace App\Http\Controllers;

use App\Models\StockEntry;
use App\Models\StockEntryLogs;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Inertia\Inertia;
use Inertia\Response;

class InventoryController extends Controller
{

    /**
     * Display a listing of the resource.
     */

    public function index(): Response
    {
        Gate::authorize('viewAny', StockEntry::class);

        return Inertia::render('Inventory/Index', [
            'stockEntries' => StockEntry::all()
        ]);
    }

    /**
     * Display the form for creating a new stock entry.
     */
    public function create(): Response
    {
        Gate::authorize('create', StockEntry::class);

        return Inertia::render('Inventory/Create');
    }

    /**
     * Store a newly created stock entry in storage.
     */

    public function store(Request $request)
    {
        Gate::authorize('create', StockEntry::class);

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

        $stockEntry = StockEntry::create($validated);

        StockEntryLogs::create([
            'stock_entry_id' => $stockEntry->id,
            'user_id' => $request->user()->id,
            'action' => 'create'
        ]);

        return redirect()->route('inventory.index')->with([
            'toast' => [
                'message' => 'Stock Entry Created',
                'description' => "Added {$stockEntry->name} to the inventory.",
                'action' => [
                    'label' => 'Add Stock',
                    'url' => route('stock.create', $stockEntry->id)
                ]
            ]
        ]);
    }

    /**
     * Display the form for editing the specified resource.
     */

    public function edit(StockEntry $stockEntry): Response
    {
        Gate::authorize('update', $stockEntry);

        return Inertia::render('Inventory/Edit', [
            'stockEntry' => $stockEntry
        ]);
    }

    /**
     * Update the specified resource in storage.
     */

    public function update(Request $request, StockEntry $stockEntry)
    {
        Gate::authorize('update', $stockEntry);

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

        $original = $stockEntry->getOriginal();

        $stockEntry->update($validated);

        $changes = $stockEntry->getChanges();
        unset($changes['updated_at']);

        $fieldsEdited = array_map(function ($field) use ($original, $changes) {
            return ['field' => $field, 'old' => $original[$field], 'new' => $changes[$field]];
        }, array_keys($changes));


        StockEntryLogs::create([
            'stock_entry_id' => $stockEntry->id,
            'user_id' => $request->user()->id,
            'action' => 'update',
            'fields_edited' => json_encode($fieldsEdited)
        ]);

        return redirect()->route('inventory.index')->with(
            'toast',
            [
                'message' => 'Stock Entry Updated',
                'description' => "Updated {$stockEntry->name} in the inventory.",
                'action' => [
                    'label' => 'Undo',
                    'url' => route('inventory.restoreUpdate', $stockEntry->id),
                    'method' => 'patch',
                    'data' => array_intersect_key($original, $changes) // Only send changed fields' original values
                ]
            ]
        );
    }

    public function restoreUpdate(Request $request, StockEntry $stockEntry)
    {
        Gate::authorize('update', $stockEntry);

        $stockEntry->update($request->all());

        StockEntryLogs::create([
            'stock_entry_id' => $stockEntry->id,
            'user_id' => $request->user()->id,
            'action' => 'restore_update'
        ]);

        return redirect()->route('inventory.index')->with([
            'toast' => [
                'message' => 'Stock Entry Update Revoked',
                'description' => "Reverted changes to {$stockEntry->name}.",
            ]
        ]);
    }

    /**
     * Remove the specified resource from storage.
     */

    public function destroy(Request $request, StockEntry $stockEntry)
    {
        Gate::authorize('delete', $stockEntry);

        $stockEntry->stocks()->delete();
        $stockEntry->delete();

        StockEntryLogs::create([
            'stock_entry_id' => $stockEntry->id,
            'user_id' => $request->user()->id,
            'action' => 'delete'
        ]);

        return redirect()->route('inventory.index')->with([
            'toast' => [
                'message' => 'Stock Entry Deleted',
                'description' => "Removed {$stockEntry->name} from the inventory.",
                'action' => [
                    'label' => 'Undo',
                    'url' => route('inventory.restore', $stockEntry->id),
                    'method' => 'patch'
                ]
            ]
        ]);
    }

    /**
     * Restore the specified resource from storage.
     */

    public function restore(Request $request, $stockEntry)
    {
        // Gate::authorize('restore', $stockEntry);
        $stockEntry = StockEntry::withTrashed()->findOrFail($stockEntry);

        $stockEntry->stocks()->restore();
        $stockEntry->restore();

        StockEntryLogs::create([
            'stock_entry_id' => $stockEntry->id,
            'user_id' => $request->user()->id,
            'action' => 'restore'
        ]);

        return redirect()->route('inventory.index')->with([
            'toast' => [
                'message' => 'Stock Entry Restored',
                'description' => "Restored {$stockEntry->name} to the inventory.",
            ]
        ]);
    }
}
