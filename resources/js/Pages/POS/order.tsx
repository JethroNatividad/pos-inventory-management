import { Button } from "@/Components/ui/button";
import { Input } from "@/Components/ui/input";
import { type OrderItem, useOrder } from "@/contexts/orderContext";
import { Minus, Plus } from "lucide-react";
import React from "react";

const Order = ({ id, quantity, recipeName, serving }: OrderItem) => {
    const { incrementOrder, decrementOrder, updateOrder } = useOrder();
    return (
        <div className="flex justify-between items-center">
            <div>
                <p className="text-xl">{recipeName}</p>
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
                    onChange={(e) => updateOrder(id, parseInt(e.target.value))}
                />
                <Button size="icon" onClick={() => incrementOrder(id)}>
                    <Plus />
                </Button>
            </div>
        </div>
    );
};

export default Order;
