<?php

namespace App\Http\Controllers;

use App\Models\Recipe;
use App\Models\StockEntry;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;


class RecipeController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(): Response
    {
        return Inertia::render('Recipes/Index', [
            'recipes' => Recipe::all()
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create(): Response
    {
        return Inertia::render('Recipes/Create', [
            'stockEntries' => StockEntry::where('is_deleted', false)->get()
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $request->validate([
            'servings' => ['required', 'array'],
            'servings.*.name' => ['required', 'string', 'max:255'],
            'servings.*.price' => ['required', 'numeric'],
            'servings.*.ingredients' => ['required', 'array'],
            'servings.*.ingredients.*.id' => ['required', 'integer', 'exists:stock_entries,id'],
            'servings.*.ingredients.*.quantity' => ['required', 'numeric', 'min:0'],
            'servings.*.ingredients.*.unit' => ['required', 'string', 'max:255'],
        ]);

        foreach ($request->input('servings') as $serving) {
            foreach ($serving['ingredients'] as $ingredient) {
                $stockEntry = StockEntry::find($ingredient['id']);
                $validUnits = match ($stockEntry->type) {
                    'liquid' => ['ml', 'l', 'fl oz'],
                    'powder' => ['g', 'kg', 'lb'],
                    'item' => ['pcs', 'dozen'],
                    default => [],
                };

                if (!in_array($ingredient['unit'], $validUnits)) {
                    return back()->withErrors(['servings.*.ingredients.*.unit' => 'Invalid unit for ingredient type.']);
                }

                // Convert quantity to base units
                $ingredient['quantity'] = match ($stockEntry->type) {
                    'liquid' => match ($ingredient['unit']) {
                        'l' => $ingredient['quantity'] * 1000,   // Convert liters to ml
                        'fl oz' => $ingredient['quantity'] * 29.5735, // Convert fluid ounces to ml
                        default => $ingredient['quantity'], // If ml, no conversion needed
                    },
                    'powder' => match ($ingredient['unit']) {
                        'kg' => $ingredient['quantity'] * 1000,  // Convert kilograms to grams
                        'lb' => $ingredient['quantity'] * 453.592, // Convert pounds to grams
                        default => $ingredient['quantity'], // If grams, no conversion needed
                    },
                    'item' => match ($ingredient['unit']) {
                        'dozen' => $ingredient['quantity'] * 12, // Convert dozens to pieces
                        default => $ingredient['quantity'], // If pieces, no conversion needed
                    },
                    default => $ingredient['quantity'],
                };
            }
        }

        // Create recipe, recipe->servings and recipe-servings-recipeIngredients
        $recipe = Recipe::create([
            'name' => $request->input('name'),
            'description' => $request->input('description'),
        ]);

        foreach ($request->input('servings') as $serving) {
            $newServing = $recipe->servings()->create([
                'name' => $serving['name'],
                'price' => $serving['price'],
            ]);

            foreach ($serving['ingredients'] as $ingredient) {
                $newServing->recipeIngredients()->create([
                    'stock_entry_id' => $ingredient['id'],
                    'quantity' => $ingredient['quantity'],
                ]);
            }
        }


        return redirect()->route('recipes.index');
    }



    /**
     * Display the specified resource.
     */
    public function show(Recipe $recipe)
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Recipe $recipe)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Recipe $recipe)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Recipe $recipe)
    {
        //
    }
}
