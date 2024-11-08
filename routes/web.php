<?php

use App\Http\Controllers\ProfileController;
use App\Http\Controllers\UsersController;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;


Route::get('/', function () {
    return Inertia::render('Home');
})->middleware(['auth'])->name('home');

Route::resource('users', UsersController::class)->only(['index'])->middleware('auth');

require __DIR__ . '/auth.php';
