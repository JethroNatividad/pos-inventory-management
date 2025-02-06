<?php

namespace App\Http\Controllers;

use App\Models\Recipe;
use App\Models\StockEntry;
use Illuminate\Support\Facades\Gate;
use Inertia\Inertia;

class POSController extends Controller
{
    public function index()
    {
        Gate::authorize('view pos');

        return Inertia::render('POS/Index', [
            'recipes' => Recipe::all()->load('servings.recipeIngredients'),
            'stockEntries' => StockEntry::all()
        ]);
    }
}
