import { Button } from "@/Components/ui/button";
import { Input } from "@/Components/ui/input";
import { type OrderItem, useOrder } from "@/contexts/OrderContext";
import { Minus, Plus } from "lucide-react";
import React from "react";
import { toast } from "sonner";

const Order = ({ id, quantity, recipe, serving, addons }: OrderItem) => {
    const {
        incrementOrder,
        decrementOrder,
        updateOrder,
        checkAvailability,
        calculateItemBasePrice,
        calculateItemAddonsPrice,
        calculateItemTotalPrice,
    } = useOrder();

    const orderItem = { id, quantity, serving, recipe, addons };
    const availableQuantity = checkAvailability(serving);

    return (
        <div>
            <div className="flex justify-between items-center">
                <div>
                    <p className="text-xl">{recipe.name}</p>
                    <p className="text-amber-800">{serving.name}</p>
                </div>
                <div className="flex space-x-2 items-center">
                    <Button size="icon" onClick={() => decrementOrder(id)}>
                        <Minus />
                    </Button>
                    <Input
                        className="w-12 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                        type="number"
                        value={quantity}
                        onChange={(e) => {
                            if (parseInt(e.target.value) < 0) {
                                return;
                            }

                            if (parseInt(e.target.value) > availableQuantity) {
                                toast.error("Not enough stocks", {
                                    position: "top-right",
                                });
                                return updateOrder(id, availableQuantity);
                            }
                            updateOrder(id, parseInt(e.target.value) || 0);
                        }}
                    />
                    <Button
                        disabled={quantity >= availableQuantity}
                        size="icon"
                        onClick={() => incrementOrder(id)}
                    >
                        <Plus />
                    </Button>
                </div>
            </div>

            <div className="flex justify-between">
                <p>₱{serving.price}</p>
                <p>₱{calculateItemBasePrice(orderItem).toFixed(2)}</p>
            </div>

            {/* Display addons if any */}
            {addons && addons.length > 0 && (
                <>
                    <div className="w-full">
                        {addons.map((addon, index) => (
                            <div
                                key={index}
                                className="flex justify-between text-sm w-full text-gray-600"
                            >
                                <div>
                                    + {addon.quantity}
                                    {addon.unit} {addon.name}
                                </div>
                                <div>
                                    ₱{(addon.quantity * addon.price).toFixed(2)}
                                </div>
                            </div>
                        ))}
                    </div>
                    <div>
                        <p className="flex justify-between font-bold">
                            <span>Total</span>
                            <span>
                                ₱{calculateItemTotalPrice(orderItem).toFixed(2)}
                            </span>
                        </p>
                    </div>
                </>
            )}
        </div>
    );
};

export default Order;
