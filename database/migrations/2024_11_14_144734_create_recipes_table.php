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
        Schema::create('recipes', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->text('description')->nullable();
            $table->timestamps();
        });

        Schema::create('serving', function (Blueprint $table) {
            $table->id();
            $table->foreignId('recipe_id')->constrained()->onDelete('cascade');
            $table->string('name'); // e.g., "Small", "Medium", "Large"
            $table->decimal('price', 10, 2);
            $table->timestamps();
        });

        Schema::create('recipe_ingredients', function (Blueprint $table) {
            $table->id();
            $table->foreignId('stock_entry_id')->constrained()->onDelete('cascade');
            $table->foreignId('serving_id')->constrained()->onDelete('cascade');
            $table->decimal('quantity', 10, 2); // Quantity of the ingredient needed for the recipe
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('recipes');
        Schema::dropIfExists('serving_sizes');
        Schema::dropIfExists('recipe_ingredients');
    }
};
