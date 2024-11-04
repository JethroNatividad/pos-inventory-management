<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;
use Spatie\Permission\PermissionRegistrar;

class PermissionsSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        //
        app()[PermissionRegistrar::class]->forgetCachedPermissions();

        $permissionsArray = [
            'view users',
            'create users',
            'edit users',
            'delete users'
        ];

        $permissions = collect($permissionsArray)->map(function ($permission) {
            return ['name' => $permission, 'guard_name' => 'web'];
        });

        Permission::insert($permissions->toArray());

        Role::create(['name' => 'store_manager'])->givePermissionTo($permissionsArray);
        Role::create(['name' => 'administrator'])->givePermissionTo($permissionsArray);
        Role::create(['name' => 'cashier']);
        Role::create(['name' => 'inventory_manager']);

        $newOwner = User::create([
            'first_name' => 'owner',
            'last_name' => 'owner',
            'email' => 'owner@email.com',
            'password' => bcrypt('password123'),
        ]);

        $newOwner->assignRole('store_manager');

        $newAdmin = User::create([
            'first_name' => 'admin',
            'last_name' => 'admin',
            'email' => 'admin@email.com',
            'password' => bcrypt('password123'),

        ]);

        $newAdmin->assignRole('administrator');

        $newCashier = User::create([
            'first_name' => 'cashier',
            'last_name' => 'cashier',
            'email' => 'cashier@email.com',
            'password' => bcrypt('password123'),
        ]);

        $newCashier->assignRole('cashier');

        $newInventoryManager = User::create([
            'first_name' => 'inventory',
            'last_name' => 'manager',
            'email' => 'inventorymanager@email.com',
            'password' => bcrypt('password123'),
        ]);

        $newInventoryManager->assignRole('inventory_manager');
    }
}
