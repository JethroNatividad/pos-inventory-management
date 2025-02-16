<?php

namespace App\Http\Controllers;

use App\Models\Recipe;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class SalesController extends Controller
{
    //
    public function index(): Response
    {
        return Inertia::render('Sales/Index', [
            'recipes' => Recipe::all()
        ]);
    }

    public function recipeIndex(Recipe $recipe): Response
    {
        return Inertia::render('Sales/Recipe', [
            'recipe' => $recipe
        ]);
    }
}
