import type { Serving } from "@/types";
import React, { createContext, useContext, useState, useEffect } from "react";

type OrderItem = {
    id: string;
    quantity: number;
    serving: Serving;
};

type OrderContextType = {
    orders: OrderItem[];
    addOrder: (item: OrderItem) => void;
    removeOrder: (id: string) => void;
    clearOrders: () => void;
};

const OrderContext = createContext<OrderContextType | undefined>(undefined);

export const OrderProvider: React.FC<{ children: React.ReactNode }> = ({
    children,
}) => {
    const [orders, setOrders] = useState<OrderItem[]>(() => {
        const savedOrders = localStorage.getItem("orders");
        return savedOrders ? JSON.parse(savedOrders) : [];
    });

    useEffect(() => {
        localStorage.setItem("orders", JSON.stringify(orders));
    }, [orders]);

    const addOrder = (item: OrderItem) => {
        const existingOrder = orders.find((order) => order.id === item.id);
        if (existingOrder) {
            setOrders(
                orders.map((order) =>
                    order.id === item.id
                        ? { ...order, quantity: order.quantity + 1 }
                        : order
                )
            );
        } else {
            setOrders([...orders, item]);
        }
    };

    const removeOrder = (id: string) =>
        setOrders(orders.filter((order) => order.id !== id));

    const clearOrders = () => setOrders([]);

    return (
        <OrderContext.Provider
            value={{ orders, addOrder, removeOrder, clearOrders }}
        >
            {children}
        </OrderContext.Provider>
    );
};

export const useOrder = () => {
    const context = useContext(OrderContext);
    if (!context) {
        throw new Error("useOrder must be used within an OrderProvider");
    }
    return context;
};
