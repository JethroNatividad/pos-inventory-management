<?php

use App\Http\Controllers\HomeController;
use App\Http\Controllers\InventoryController;
use App\Http\Controllers\OrderController;
use App\Http\Controllers\POSController;
use App\Http\Controllers\RecipeController;
use App\Http\Controllers\ReportController;
use App\Http\Controllers\SalesController;
use App\Http\Controllers\StockController;
use App\Http\Controllers\UsersController;
use App\Http\Middleware\FirstLoginRedirect;
use Illuminate\Support\Facades\Route;

Route::middleware(['auth', FirstLoginRedirect::class])->group(function () {
    Route::get('/', [HomeController::class, 'index'])->name('home');

    // Users Management
    Route::resource('users', UsersController::class)->only(['index', 'create', 'store', 'edit', 'update', 'destroy']);

    // Inventory Management
    Route::controller(InventoryController::class)->prefix('inventory')->name('inventory.')->group(function () {
        Route::get('/', 'index')->name('index');
        Route::get('/create', 'create')->name('create');
        Route::post('/store', 'store')->name('store');
        Route::get('/{stockEntry}/edit', 'edit')->name('edit');
        Route::put('/{stockEntry}', 'update')->name('update');
        Route::patch('/{stockEntry}', 'restoreUpdate')->name('restoreUpdate');
        Route::delete('/{stockEntry}', 'destroy')->name('destroy');
        Route::patch('/{stockEntry}/restore', 'restore')->name('restore');
    });

    // Stock Management
    Route::controller(StockController::class)->prefix('inventory/{stockEntry}/stocks')->name('stock.')->group(function () {
        Route::get('/create', 'create')->name('create');
        Route::post('/store', 'store')->name('store');
        Route::get('/remove', 'removeForm')->name('removeForm');
        Route::post('/remove', 'remove')->name('remove');
        Route::patch('/restore', 'restore')->name('restore');
    });

    // Recipe Management
    Route::controller(RecipeController::class)->prefix('recipes')->name('recipes.')->group(function () {
        Route::get('/', 'index')->name('index');
        Route::get('/create', 'create')->name('create');
        Route::post('/store', 'store')->name('store');
        Route::get('/{recipe}/edit', 'edit')->name('edit');
        Route::post('/{recipe}', 'update')->name('update');
        Route::patch('/{recipe}', 'restoreUpdate')->name('restoreUpdate');
        Route::delete('/{recipe}', 'destroy')->name('destroy');
        Route::patch('/{recipe}/restore', 'restore')->name('restore');
    });

    // POS
    Route::get('/pos', [POSController::class, 'index'])->name('pos');
    Route::post('/orders', [OrderController::class, 'store'])->name('orders.store');

    // API
    Route::get('/api/order-stats', [OrderController::class, 'orderStats'])->name('orderStats');

    // Sales
    Route::get('/sales', [SalesController::class, 'index'])->name('sales.index');
    Route::get('/sales/recipes/{recipe}', [SalesController::class, 'recipeIndex'])->name('sales.recipes.index');


    // Reports
    Route::controller(ReportController::class)->prefix('reports')->name('reports.')->group(function () {
        Route::get('/stocks', 'stocks')->name('stocks');
        Route::get('/recipes', 'recipes')->name('recipes');
        Route::get('/orders', 'orders')->name('orders');
        Route::get('/orders/{order}/receipt', 'orderReceipt')->name('orders.receipt');
    });
});

// Route::get('/testroute', function () {
//     $name = "Funny Coder";

//     // The email sending is done using the to method on the Mail facade
//     Mail::to('natividad.jet@gmail.com')->send(new MyTestEmail());
// });

require __DIR__ . '/auth.php';
