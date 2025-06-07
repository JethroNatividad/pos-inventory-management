<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class AddUserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $newOwner = User::create([
            'first_name' => 'store',
            'last_name' => 'owner',
            'email' => 'owner@email.com',
            'password' => bcrypt('password123'),
        ]);

        $newOwner->assignRole('store_manager');
    }
}
