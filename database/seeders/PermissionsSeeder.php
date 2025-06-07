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

        $usersPermissions = [
            'view users',
            'create users',
            'edit users',
            'delete users',
        ];

        $stockEntriesPermissions = [
            'view stock entries',
            'create stock entries',
            'edit stock entries',
            'delete stock entries',
        ];

        $stocksPermissions = [
            'view stocks',
            'create stocks',
            'edit stocks',
            'delete stocks',
        ];

        $recipesPermissions = [
            'view recipes',
            'create recipes',
            'edit recipes',
            'delete recipes',
        ];

        $posPermissions = [
            'view pos',
            'create orders',
        ];

        $permissionsArray = array_merge(
            $usersPermissions,
            $stockEntriesPermissions,
            $stocksPermissions,
            $recipesPermissions,
            $posPermissions
        );

        $permissions = collect($permissionsArray)->map(function ($permission) {
            return ['name' => $permission, 'guard_name' => 'web'];
        });

        Permission::insert($permissions->toArray());

        Role::create(['name' => 'store_manager'])->givePermissionTo($permissionsArray);
        Role::create(['name' => 'administrator'])->givePermissionTo($permissionsArray);
        Role::create(['name' => 'cashier'])->givePermissionTo($posPermissions);
        Role::create(['name' => 'inventory_manager'])->givePermissionTo(array_merge($stockEntriesPermissions, $stocksPermissions, $recipesPermissions));
    }
}
