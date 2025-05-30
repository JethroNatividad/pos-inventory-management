<?php

namespace App\Http\Middleware;

use Illuminate\Http\Request;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    /**
     * The root template that is loaded on the first page visit.
     *
     * @var string
     */
    protected $rootView = 'app';

    /**
     * Determine the current asset version.
     */
    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    /**
     * Define the props that are shared by default.
     *
     * @return array<string, mixed>
     */
    public function share(Request $request): array
    {
        return [
            ...parent::share($request),
            'auth' => [
                'user' => $request->user(),
            ],
            'toast' => [
                'message' => fn() => $request->session()->get('toast.message'),
                'description' => fn() => $request->session()->get('toast.description'),
                'action' => fn() => $request->session()->get('toast.action'),
            ],
            'previousUrl' => fn() => (url()->previous() !== route('login') && url()->previous() !== '' && url()->previous() !== url()->current() ? url()->previous() : null)
        ];
    }
}
