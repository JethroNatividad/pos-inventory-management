import { useOrder } from "@/contexts/orderContext";
import React from "react";
import Order from "./order";
import { ScrollArea } from "@/Components/ui/scroll-area";
import { Button } from "@/Components/ui/button";
import { Trash } from "lucide-react";

const Orders = () => {
    const { orders, clearOrders } = useOrder();
    return (
        <div className="border rounded-lg w-full h-screen max-h-[90vh] overflow-y-scroll relative">
            <div className="">
                <div className="sticky top-0 left-0 bg-background w-full p-4 shadow-sm flex justify-between">
                    <h2 className="text-2xl">Orders</h2>
                    <Button variant="destructive" onClick={clearOrders}>
                        <Trash />
                    </Button>
                </div>
                <div className="flex flex-col space-y-4 p-4">
                    {orders.map((order) => (
                        <Order key={order.id} {...order} />
                    ))}
                </div>
            </div>
        </div>
    );
};

export default Orders;
