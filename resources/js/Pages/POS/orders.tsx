import { useOrder } from "@/contexts/orderContext";
import React from "react";
import Order from "./order";
import { ScrollArea } from "@/Components/ui/scroll-area";
import { Button } from "@/Components/ui/button";
import { Trash } from "lucide-react";

const Orders = () => {
    const { orders, clearOrders } = useOrder();
    return (
        <div className="border rounded-lg w-full h-screen max-h-[90vh] overflow-y-scroll relative flex flex-col">
            <div className="sticky top-0 left-0 bg-background w-full p-4 border-b flex justify-between items-center">
                <h2 className="text-2xl">Orders</h2>
                <Button variant="destructive" onClick={clearOrders}>
                    <Trash />
                </Button>
            </div>
            <div className="flex flex-col space-y-4 p-4 flex-1">
                {orders.map((order) => (
                    <Order key={order.id} {...order} />
                ))}
            </div>
            <div className="sticky bg-background bottom-0 left-0 w-full p-4 border-t">
                <Button className="w-full">Checkout</Button>
            </div>
        </div>
    );
};

export default Orders;
