<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Serving extends Model
{
    use HasFactory;

    protected $fillable = ['name', 'price'];

    protected $appends = ['is_available', 'quantity_available'];

    public function recipe()
    {
        return $this->belongsTo(Recipe::class);
    }

    public function recipeIngredients()
    {
        return $this->hasMany(RecipeIngredient::class);
    }

    public function getIsAvailableAttribute()
    {
        // Check if all recipe ingredients are available
        $recipeIngredients = $this->recipeIngredients;
        foreach ($recipeIngredients as $recipeIngredient) {
            if ($recipeIngredient->quantity > $recipeIngredient->stockEntry->quantity) {
                return false;
            }
        }
        return true;
    }

    public function getQuantityAvailableAttribute()
    {
        // Get the minimum quantity available
        $recipeIngredients = $this->recipeIngredients;
        $quantityAvailable = null;
        foreach ($recipeIngredients as $recipeIngredient) {
            $quantity = $recipeIngredient->stockEntry->quantity / $recipeIngredient->quantity;
            if ($quantityAvailable === null || $quantity < $quantityAvailable) {
                $quantityAvailable = $quantity;
            }
        }
        // Round down to the nearest integer
        return floor($quantityAvailable);
    }
}
