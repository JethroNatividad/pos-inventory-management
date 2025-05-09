<?php

namespace App\Policies;

use App\Models\User;

class RecipePolicy
{
    public function viewAny(User $user): bool
    {
        return $user->can('view recipes');;
    }

    /**
     * Determine whether the user can view the model.
     */

    public function view(User $user): bool
    {
        return $user->can('view recipes');
    }

    /**
     * Determine whether the user can create models.
     */
    public function create(User $user): bool
    {
        return $user->can('create recipes');
    }

    /**
     * Determine whether the user can update the model.
     */

    public function update(User $user): bool
    {
        return $user->can('edit recipes');
    }

    /**
     * Determine whether the user can delete the model.
     */

    public function delete(User $user): bool
    {
        return $user->can('delete recipes');
    }
}
