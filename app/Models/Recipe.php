<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Recipe extends Model
{
    use HasFactory;

    protected $fillable = ['name', 'description'];

    protected $appends = ['serving_names'];

    public function servings()
    {
        return $this->hasMany(Serving::class);
    }

    public function getServingNamesAttribute()
    {
        $serving_names = $this->servings->pluck('name');
        return $serving_names->implode(', ');
    }
}
