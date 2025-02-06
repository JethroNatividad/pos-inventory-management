<?php

namespace Database\Seeders;

use App\Models\Order;
use App\Models\Serving;
use Carbon\Carbon;
use Illuminate\Database\Seeder;

class OrderSeeder extends Seeder
{
    public function run()
    {
        $servingIds = [17, 18, 19, 20];
        $orderTypes = ['dine-in', 'take-out', 'delivery'];

        // Generate orders for the past year until today
        $startDate = Carbon::now()->subYear();
        $endDate = Carbon::now();

        while ($startDate <= $endDate) {
            // Generate 1-5 orders per day
            $ordersPerDay = rand(1, 5);

            for ($i = 0; $i < $ordersPerDay; $i++) {
                $orderItems = [];
                $subtotal = 0;

                // Generate 1-3 items per order
                $itemCount = rand(1, 3);

                // Get random servings
                $selectedServings = Serving::whereIn('id', $servingIds)->get();

                for ($j = 0; $j < $itemCount; $j++) {
                    $serving = $selectedServings->random();
                    $quantity = rand(1, 5);
                    $subtotal += $serving->price * $quantity;

                    $orderItems[] = [
                        'serving_id' => $serving->id,
                        'quantity' => $quantity,
                        'price' => $serving->price,
                    ];
                }

                // Create order with random discount
                $discountPercentage = rand(0, 20);
                $total = $subtotal * (1 - $discountPercentage / 100);

                $order = Order::create([
                    'subtotal' => $subtotal,
                    'discountPercentage' => $discountPercentage,
                    'total' => $total,
                    'type' => $orderTypes[array_rand($orderTypes)],
                    'user_id' => 1, // Assuming admin user with ID 1
                    'created_at' => $startDate->copy()->addHours(rand(8, 22)), // Between 8 AM and 10 PM
                    'updated_at' => $startDate->copy()->addHours(rand(8, 22)),
                ]);

                // Create order items
                foreach ($orderItems as $item) {
                    $order->items()->create($item);
                }
            }

            $startDate->addDay();
        }
    }
}
