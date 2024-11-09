<?php

use App\Http\Controllers\ProfileController;
use App\Http\Controllers\UsersController;
use App\Http\Middleware\FirstLoginRedirect;
use App\Mail\MyTestEmail;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;


Route::get('/', function () {
    return Inertia::render('Home');
})->middleware(['auth', FirstLoginRedirect::class])->name('home');

Route::resource('users', UsersController::class)->only(['index', 'create', 'store', 'edit', 'update', 'destroy'])->middleware(['auth', FirstLoginRedirect::class]);

Route::get('/pos', function () {
    return Inertia::render('POS/Index');
})->name('pos')->middleware(['auth', FirstLoginRedirect::class]);

Route::get('/inventory', function () {
    return Inertia::render('Inventory/Index');
})->name('inventory')->middleware(['auth', FirstLoginRedirect::class]);

Route::get('/recipes', function () {
    return Inertia::render('Recipes/Index');
})->name('recipes')->middleware(['auth', FirstLoginRedirect::class]);

Route::get('/reports', function () {
    return Inertia::render('Reports/Index');
})->name('reports')->middleware(['auth', FirstLoginRedirect::class]);


// Route::get('/testroute', function () {
//     $name = "Funny Coder";

//     // The email sending is done using the to method on the Mail facade
//     Mail::to('natividad.jet@gmail.com')->send(new MyTestEmail());
// });

require __DIR__ . '/auth.php';
