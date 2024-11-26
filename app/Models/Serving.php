<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Serving extends Model
{
    use HasFactory;

    protected $fillable = ['name', 'price'];

    protected $appends = ['is_available'];

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
}
