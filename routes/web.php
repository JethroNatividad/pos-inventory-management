<?php

use App\Http\Controllers\InventoryController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\RecipeController;
use App\Http\Controllers\StockController;
use App\Http\Controllers\UsersController;
use App\Http\Middleware\FirstLoginRedirect;
use App\Mail\MyTestEmail;
use App\Models\Recipe;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::middleware(['auth', FirstLoginRedirect::class])->group(function () {
    Route::get('/', function () {
        return Inertia::render('Home');
    })->name('home');

    Route::resource('users', UsersController::class)->only(['index', 'create', 'store', 'edit', 'update', 'destroy']);

    Route::get('inventory', [InventoryController::class, 'index'])->name('inventory.index');

    Route::get('inventory/create', [InventoryController::class, 'create'])->name('inventory.create');

    Route::post('inventory/store', [InventoryController::class, 'store'])->name('inventory.store');

    Route::get('inventory/{stockEntry}/edit', [InventoryController::class, 'edit'])->name('inventory.edit');

    Route::put('inventory/{stockEntry}', [InventoryController::class, 'update'])->name('inventory.update');

    Route::delete('inventory/{stockEntry}', [InventoryController::class, 'destroy'])->name('inventory.destroy');

    Route::get('inventory/{stockEntry}/stocks/create', [StockController::class, 'create'])->name('stock.create');

    Route::post('inventory/{stockEntry}/stocks/store', [StockController::class, 'store'])->name('stock.store');

    Route::get('inventory/{stockEntry}/stocks/remove', [StockController::class, 'removeForm'])->name('stock.removeForm');

    Route::post('inventory/{stockEntry}/stocks/remove', [StockController::class, 'remove'])->name('stock.remove');

    Route::get('recipes', [RecipeController::class, 'index'])->name('recipes.index');

    Route::get('recipes/create', [RecipeController::class, 'create'])->name('recipes.create');
    Route::post('recipes/store', [RecipeController::class, 'store'])->name('recipes.store');

    Route::get('recipes/{recipe}/edit', [RecipeController::class, 'edit'])->name('recipes.edit');
    Route::put('recipes/{recipe}', [RecipeController::class, 'update'])->name('recipes.update');

    Route::delete('recipes/{recipe}', [RecipeController::class, 'destroy'])->name('recipes.destroy');

    Route::get('/pos', function () {
        return Inertia::render('POS/Index', [
            'recipes' => Recipe::all()
        ]);
    })->name('pos');



    Route::get('/reports', function () {
        return Inertia::render('Reports/Index');
    })->name('reports');
});




// Route::get('/testroute', function () {
//     $name = "Funny Coder";

//     // The email sending is done using the to method on the Mail facade
//     Mail::to('natividad.jet@gmail.com')->send(new MyTestEmail());
// });

require __DIR__ . '/auth.php';
