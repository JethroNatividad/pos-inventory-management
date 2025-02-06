import { Button } from "@/Components/ui/button";
import { Input } from "@/Components/ui/input";
import { type OrderItem, useOrder } from "@/contexts/OrderContext";
import { Minus, Plus } from "lucide-react";
import React from "react";

const Order = ({ id, quantity, recipe, serving }: OrderItem) => {
    const { incrementOrder, decrementOrder, updateOrder, checkAvailability } =
        useOrder();
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
                <p>₱{(serving.price * quantity).toFixed(2)}</p>
            </div>
        </div>
    );
};

export default Order;
