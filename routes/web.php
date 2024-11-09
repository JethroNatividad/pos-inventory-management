<?php

use App\Http\Controllers\ProfileController;
use App\Http\Controllers\UsersController;
use App\Mail\MyTestEmail;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;


Route::get('/', function () {
    return Inertia::render('Home');
})->middleware(['auth'])->name('home');

Route::resource('users', UsersController::class)->only(['index'])->middleware(['auth']);

Route::get('/pos', function () {
    return Inertia::render('POS/Index');
})->name('pos')->middleware(['auth']);

Route::get('/inventory', function () {
    return Inertia::render('Inventory/Index');
})->name('inventory')->middleware(['inventory']);

Route::get('/recipes', function () {
    return Inertia::render('Recipes/Index');
})->name('recipes')->middleware(['recipes']);


// Route::get('/testroute', function () {
//     $name = "Funny Coder";

//     // The email sending is done using the to method on the Mail facade
//     Mail::to('natividad.jet@gmail.com')->send(new MyTestEmail());
// });

require __DIR__ . '/auth.php';
