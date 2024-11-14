<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Spatie\Permission\Traits\HasRoles;

class User extends Authenticatable
{
    /** @use HasFactory<\Database\Factories\UserFactory> */
    use HasFactory, Notifiable, HasRoles;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'first_name',
        'middle_name',
        'last_name',
        'email',
        'password',
        'password_set',
        'status'
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var array<int, string>
     */
    protected $hidden = [
        'password',
        'remember_token',
        'roles'
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
        ];
    }

    /**
     * Add computed role names to serialized model output.
     *
     * @var array<int, string>
     */
    protected $appends = ['role'];

    /**
     * Get the user's role names.
     *
     * @return \Illuminate\Support\Collection
     */
    public function getRoleAttribute()
    {
        return $this->getRoleNames()->first();
    }

    public function deleteUser()
    {
        $this->update([
            'first_name' => 'Deleted',
            'middle_name' => null,
            'last_name' => 'User',
            'email' => 'deleted_user_' . $this->id . '@example.com',
            'password' => 'deleted_user',
            'password_set' => false,
            'status' => 'deleted'
        ]);

        $this->syncRoles([]);
    }
}
