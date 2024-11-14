<?php

namespace App\Http\Controllers;

use App\Mail\UserInvite;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\Mail;
use Inertia\Inertia;
use Inertia\Response;
use Spatie\Permission\Models\Role;

class UsersController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(): Response
    {
        Gate::authorize('viewAny', User::class);

        return Inertia::render('Users/Index', [
            'users' => User::all(),
            'roles' => Role::all()
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        Gate::authorize('create', User::class);
        return Inertia::render('Users/Create', [
            'roles' => Role::all()
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request): RedirectResponse
    {

        Gate::authorize('create', User::class);

        $request->validate([
            'first_name' => 'required|string|max:255',
            'middle_name' => 'max:255',
            'last_name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'password' => 'required|string|min:6',
            'role' => 'required|string|exists:roles,name',
        ]);

        $user = User::create([
            'first_name' => $request->first_name,
            'middle_name' => $request->middle_name,
            'last_name' => $request->last_name,
            'email' => $request->email,
            'password' => bcrypt($request->password),
        ]);

        $user->assignRole($request->role);

        // Send email to the user
        Mail::to($user->email)->send(new UserInvite($user->first_name, $user->email, $request->password, $request->role, route('login')));

        return redirect()->route('users.index');
    }

    /**
     * Display the specified resource.
     */
    public function show(User $user)
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(User $user)
    {
        Gate::authorize('update', User::class);

        return Inertia::render('Users/Edit', [
            'user' => $user,
            'roles' => Role::all()
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, User $user)
    {

        Gate::authorize('update', User::class);

        $request->validate([
            'first_name' => 'required|string|max:255',
            'middle_name' => 'max:255',
            'last_name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users,email,' . $user->id,
            'role' => 'required|string|exists:roles,name',
        ]);

        $user->update([
            'first_name' => $request->first_name,
            'middle_name' => $request->middle_name,
            'last_name' => $request->last_name,
            'email' => $request->email,
        ]);

        $user->syncRoles([$request->role]);

        return redirect()->route('users.index');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(User $user)
    {
        Gate::authorize('delete', User::class);

        $user->deleteUser();
    }
}
