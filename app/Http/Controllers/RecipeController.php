<?php

namespace App\Http\Controllers;

use App\Models\Recipe;
use App\Models\RecipeLogs;
use App\Models\StockEntry;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;
use Inertia\Response;


class RecipeController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(): Response
    {
        Gate::authorize('viewAny', Recipe::class);
        return Inertia::render('Recipes/Index', [
            'recipes' => Recipe::all()->load('servings.recipeIngredients.stockEntry'),
            'stockEntries' => StockEntry::all()
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create(): Response
    {
        Gate::authorize('create', Recipe::class);
        return Inertia::render('Recipes/Create', [
            'stockEntries' => StockEntry::all()
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        Gate::authorize('create', Recipe::class);

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
            'image' => ['nullable', 'image', 'mimes:jpg,jpeg,png,gif', 'max:2048'],
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

        $imagePath = null;
        if ($request->hasFile('image')) {
            $imagePath = $request->file('image')->store('recipes', 'public'); // Store image in the 'recipes' directory
        }

        // Create recipe, recipe->servings and recipe-servings-recipeIngredients
        $recipe = Recipe::create([
            'name' => $request->input('name'),
            'description' => $request->input('description'),
            'image' => $imagePath,
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

        RecipeLogs::Create([
            'recipe_id' => $recipe->id,
            'user_id' => $request->user()->id,
            'action' => 'create',
        ]);


        return redirect()->route('recipes.index')->with([
            'toast' => [
                'message' => "Recipe Created",
                'description' => "Recipe {$recipe->name} has been created with {$recipe->servings->count()} servings sizes.",
            ]
        ]);
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
        Gate::authorize('update', $recipe);
        $recipe->load('servings.recipeIngredients.stockEntry');
        $stockEntries = StockEntry::all();

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
        Gate::authorize('update', $recipe);

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
            'image' => ['nullable', 'image', 'mimes:jpg,jpeg,png,gif', 'max:2048'],
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

        $imagePath = $recipe->image;

        if ($request->hasFile('image')) {
            $imagePath = $request->file('image')->store('recipes', 'public');
        }

        $original = $recipe->getOriginal();


        $recipe->update([
            'name' => $request->input('name'),
            'description' => $request->input('description'),
            'image' => $imagePath,
        ]);

        $changes = $recipe->getChanges();

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

        RecipeLogs::Create([
            'recipe_id' => $recipe->id,
            'user_id' => $request->user()->id,
            'action' => 'update',
        ]);

        return redirect()->route('recipes.index')->with(
            'toast',
            [
                'message' => 'Recipe Updated',
                'description' => "Updated {$recipe->name} in the inventory.",
                'action' => [
                    'label' => 'Undo',
                    'url' => route('recipes.restoreUpdate', $recipe->id),
                    'method' => 'patch',
                    'data' => array_intersect_key($original, $changes) // Only send changed fields' original values
                ]
            ]
        );
    }

    /**
     * Restore the specified resource in storage.
     */

    public function restoreUpdate(Request $request, Recipe $recipe)
    {
        // Gate::authorize('update', $recipe);

        $recipe->update($request->all());

        RecipeLogs::Create([
            'recipe_id' => $recipe->id,
            'user_id' => $request->user()->id,
            'action' => 'restore_update',
        ]);

        return redirect()->route('recipes.index')->with([
            'toast' => [
                'message' => 'Recipe Update Revoked',
                'description' => "Reverted changes to {$recipe->name}.",
            ]
        ]);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Request $request, Recipe $recipe)
    {
        Gate::authorize('delete', $recipe);
        $recipe->delete();

        RecipeLogs::Create([
            'recipe_id' => $recipe->id,
            'user_id' => $request->user()->id,
            'action' => 'delete',
        ]);

        return redirect()->route('recipes.index');
    }
}
