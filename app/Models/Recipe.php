<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Recipe extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = ['name', 'description'];

    protected $appends = ['serving_names', 'is_available'];

    public function servings()
    {
        return $this->hasMany(Serving::class);
    }

    public function getServingNamesAttribute()
    {
        $serving_names = $this->servings->pluck('name');
        return $serving_names->implode(', ');
    }

    public function getIsAvailableAttribute()
    {
        // Check if all servings are available
        $servings = $this->servings;
        foreach ($servings as $serving) {
            if (!$serving->is_available) {
                return false;
            }
        }
        return true;
    }
}
