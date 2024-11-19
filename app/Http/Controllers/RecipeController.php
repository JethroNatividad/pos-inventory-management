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

        $messages = [
            'servings.required' => 'Please provide at least one serving.',
            'servings.array' => 'Servings should be an array.',
            'servings.*.name.required' => 'The name field is required.',
            'servings.*.name.string' => 'The name must be a string.',
            'servings.*.name.max' => 'The name must not exceed 255 characters.',
            'servings.*.price.required' => 'The price field is required.',
            'servings.*.price.numeric' => 'The price must be a number.',
            'servings.*.ingredients.required' => 'The ingredients field is required.',
            'servings.*.ingredients.array' => 'Ingredients should be an array.',
            'servings.*.ingredients.*.stock_entry_id.required' => 'Please select an ingredient.',
            'servings.*.ingredients.*.stock_entry_id.integer' => 'The ingredient ID must be an integer.',
            'servings.*.ingredients.*.stock_entry_id.exists' => 'The selected ingredient does not exist.',
            'servings.*.ingredients.*.quantity.required' => 'The quantity field is required.',
            'servings.*.ingredients.*.quantity.numeric' => 'The quantity must be a number.',
            'servings.*.ingredients.*.quantity.min' => 'The quantity must be at least 0.',
            'servings.*.ingredients.*.unit.required' => 'The unit field is required.',
            'servings.*.ingredients.*.unit.string' => 'The unit must be a string.',
            'servings.*.ingredients.*.unit.max' => 'The unit must not exceed 255 characters.',
        ];

        $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'servings' => ['required', 'array'],
            'servings.*.name' => ['required', 'string', 'max:255'],
            'servings.*.price' => ['required', 'numeric'],
            'servings.*.ingredients' => ['required', 'array'],
            'servings.*.ingredients.*.stock_entry_id' => ['required', 'integer', 'exists:stock_entries,id'],
            'servings.*.ingredients.*.quantity' => ['required', 'numeric', 'min:0'],
            'servings.*.ingredients.*.unit' => ['required', 'string', 'max:255'],
        ], $messages);

        foreach ($request->input('servings') as $serving) {
            foreach ($serving['ingredients'] as $ingredient) {
                $stockEntry = StockEntry::find($ingredient['stock_entry_id']);
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
                    'stock_entry_id' => $ingredient['stock_entry_id'],
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
        $recipe->load('servings.recipeIngredients.stockEntry');
        $stockEntries = StockEntry::where('is_deleted', false)->get();

        return Inertia::render('Recipes/Edit', [
            'recipe' => $recipe,
            'stockEntries' => $stockEntries,
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Recipe $recipe)
    {
        $messages = [
            'servings.required' => 'Please provide at least one serving.',
            'servings.array' => 'Servings should be an array.',
            'servings.*.name.required' => 'The name field is required.',
            'servings.*.name.string' => 'The name must be a string.',
            'servings.*.name.max' => 'The name must not exceed 255 characters.',
            'servings.*.price.required' => 'The price field is required.',
            'servings.*.price.numeric' => 'The price must be a number.',
            'servings.*.ingredients.required' => 'The ingredients field is required.',
            'servings.*.ingredients.array' => 'Ingredients should be an array.',
            'servings.*.ingredients.*.stock_entry_id.required' => 'Please select an ingredient.',
            'servings.*.ingredients.*.stock_entry_id.integer' => 'The ingredient ID must be an integer.',
            'servings.*.ingredients.*.stock_entry_id.exists' => 'The selected ingredient does not exist.',
            'servings.*.ingredients.*.quantity.required' => 'The quantity field is required.',
            'servings.*.ingredients.*.quantity.numeric' => 'The quantity must be a number.',
            'servings.*.ingredients.*.quantity.min' => 'The quantity must be at least 0.',
            'servings.*.ingredients.*.unit.required' => 'The unit field is required.',
            'servings.*.ingredients.*.unit.string' => 'The unit must be a string.',
            'servings.*.ingredients.*.unit.max' => 'The unit must not exceed 255 characters.',
        ];

        $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'servings' => ['required', 'array'],
            'servings.*.id' => ['nullable', 'integer', 'exists:servings,id'],
            'servings.*.name' => ['required', 'string', 'max:255'],
            'servings.*.price' => ['required', 'numeric'],
            'servings.*.ingredients' => ['required', 'array'],
            'servings.*.ingredients.*.id' => ['nullable', 'integer', 'exists:recipe_ingredients,id'],
            'servings.*.ingredients.*.stock_entry_id' => ['required', 'integer', 'exists:stock_entries,id'],
            'servings.*.ingredients.*.quantity' => ['required', 'numeric', 'min:0'],
            'servings.*.ingredients.*.unit' => ['required', 'string', 'max:255'],
        ], $messages);

        $recipe->update([
            'name' => $request->input('name'),
            'description' => $request->input('description'),
        ]);

        $updatedServingIds = [];

        foreach ($request->input('servings') as $servingData) {

            $serving = $recipe->servings()->updateOrCreate(
                ['id' => $servingData['id'] ?? null],
                ['name' => $servingData['name'], 'price' => $servingData['price']]
            );

            $updatedServingIds[] = $serving->id;

            $updatedIngredientIds = [];

            foreach ($servingData['ingredients'] as $ingredientData) {
                $ingredient = $serving->recipeIngredients()->updateOrCreate(
                    ['id' => $ingredientData['id'] ?? null],
                    [
                        'stock_entry_id' => $ingredientData['stock_entry_id'],
                        'quantity' => $ingredientData['quantity'],
                        'unit' => $ingredientData['unit'],
                    ]
                );

                $updatedIngredientIds[] = $ingredient->id;
            }

            // Remove ingredients that are not in the update request
            $serving->recipeIngredients()->whereNotIn('id', $updatedIngredientIds)->delete();
        }

        $recipe->servings()->whereNotIn('id', $updatedServingIds)->delete();

        return redirect()->route('recipes.index');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Recipe $recipe)
    {
        $recipe->delete();
        return redirect()->route('recipes.index');
    }
}
