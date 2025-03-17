<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('addons', function (Blueprint $table) {
            $table->decimal('quantity', 10, 6)->change();
            $table->decimal('price', 10, 6)->change();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {

        Schema::table('addons', function (Blueprint $table) {
            $table->decimal('quantity', 10, 2)->change();
            $table->decimal('price', 10, 2)->change();
        });
    }
};
