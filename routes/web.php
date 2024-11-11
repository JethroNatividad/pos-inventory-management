<?php

use App\Http\Controllers\InventoryController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\UsersController;
use App\Http\Middleware\FirstLoginRedirect;
use App\Mail\MyTestEmail;
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

    Route::get('inventory/create', [InventoryController::class, 'createStockEntry'])->name('inventory.create');

    Route::post('inventory/store', [InventoryController::class, 'storeStockEntry'])->name('inventory.store');

    Route::get('inventory/{stockEntry}/edit', [InventoryController::class, 'editStockEntry'])->name('inventory.edit');

    Route::put('inventory/{stockEntry}', [InventoryController::class, 'updateStockEntry'])->name('inventory.update');

    Route::delete('inventory/{stockEntry}', [InventoryController::class, 'destroyStockEntry'])->name('inventory.destroy');

    Route::get('inventory/{stockEntry}/create-stock', [InventoryController::class, 'createStock'])->name('inventory.create-stock');

    Route::post('inventory/{stockEntry}/store-stock', [InventoryController::class, 'storeStock'])->name('inventory.store-stock');

    Route::get('/pos', function () {
        return Inertia::render('POS/Index');
    })->name('pos');


    Route::get('/recipes', function () {
        return Inertia::render('Recipes/Index');
    })->name('recipes');

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
