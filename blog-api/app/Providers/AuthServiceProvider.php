<?php

namespace App\Providers;

use App\Models\Post; // Import your Post model
use App\Policies\PostPolicy; // Import your PostPolicy

use Illuminate\Foundation\Support\Providers\AuthServiceProvider as ServiceProvider;

class AuthServiceProvider extends ServiceProvider
{
    /**
     * The model to policy mappings for the application.
     *
     * @var array<class-string, class-string>
     */
    protected $policies = [
        Post::class => PostPolicy::class, // <-- Add this line for your PostPolicy
    ];

    /**
     * Register any authentication / authorization services.
     */
    public function boot(): void
    {
        //
    }
}