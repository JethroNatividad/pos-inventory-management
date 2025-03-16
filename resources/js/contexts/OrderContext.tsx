import { getServingQuantityAvailable } from "@/lib/utils";
import type { Ingredient, Recipe, Serving, StockEntry } from "@/types";
import React, { createContext, useContext, useState, useEffect } from "react";

export type OrderItem = {
    id: string;
    quantity: number;
    serving: Serving;
    recipe: Recipe;
    addons: {
        id: string;
        stock_entry_id: string;
        quantity: number;
        unit: string;
        name: string;
        price: number;
        type: "liquid" | "powder" | "item";
    }[];
};

type OrderContextType = {
    orders: OrderItem[];
    addOrder: (item: OrderItem) => void;
    removeOrder: (id: string) => void;
    clearOrders: () => void;
    incrementOrder: (id: string) => void;
    decrementOrder: (id: string) => void;
    updateOrder: (id: string, quantity: number) => void;
    getOrder: (id: string) => OrderItem | undefined;
    calculateSubtotal: () => number;
    checkAvailability: (serving: Serving) => number;
    canIncrement: (id: string) => boolean;
    stockEntries: StockEntry[];
    // New price calculation functions
    calculateItemBasePrice: (order: OrderItem) => number;
    calculateItemAddonsPrice: (order: OrderItem) => number;
    calculateItemTotalPrice: (order: OrderItem) => number;
};

const OrderContext = createContext<OrderContextType | undefined>(undefined);

export const OrderProvider: React.FC<{
    children: React.ReactNode;
    stockEntries: StockEntry[];
}> = ({ children, stockEntries }) => {
    const [orders, setOrders] = useState<OrderItem[]>(() => {
        const savedOrders = localStorage.getItem("orders");
        return savedOrders ? JSON.parse(savedOrders) : [];
    });

    useEffect(() => {
        localStorage.setItem("orders", JSON.stringify(orders));
    }, [orders]);

    const calculateSubtotal = () =>
        orders.reduce(
            (total, order) => total + calculateItemTotalPrice(order),
            0
        );

    const getOrder = (id: string) => orders.find((order) => order.id === id);

    // New price calculation functions
    const calculateItemBasePrice = (order: OrderItem): number => {
        return order.quantity * order.serving.price;
    };

    const calculateItemAddonsPrice = (order: OrderItem): number => {
        if (!order.addons || order.addons.length === 0) return 0;

        return order.addons.reduce(
            (total, addon) =>
                total + addon.price * addon.quantity * order.quantity,
            0
        );
    };

    const calculateItemTotalPrice = (order: OrderItem): number => {
        return calculateItemBasePrice(order) + calculateItemAddonsPrice(order);
    };

    const addOrder = (item: OrderItem) => {
        const availableQuantity = checkAvailability(item.serving);
        if (availableQuantity <= 0) return;

        const orderIndex = orders.findIndex((order) => order.id === item.id);
        if (orderIndex !== -1) {
            const newOrders = [...orders];
            newOrders[orderIndex].quantity += 1;
            setOrders(newOrders);
        } else {
            setOrders([...orders, item]);
        }
    };

    const removeOrder = (id: string) =>
        setOrders(orders.filter((order) => order.id !== id));

    const incrementOrder = (id: string) => {
        setOrders(
            orders.map((order) =>
                order.id === id
                    ? { ...order, quantity: order.quantity + 1 }
                    : order
            )
        );
    };

    const decrementOrder = (id: string) => {
        if ((orders.find((order) => order.id === id)?.quantity ?? 0) <= 1) {
            return removeOrder(id);
        }

        setOrders(
            orders.map((order) =>
                order.id === id
                    ? { ...order, quantity: order.quantity - 1 }
                    : order
            )
        );
    };

    const updateOrder = (id: string, quantity: number) => {
        const order = getOrder(id);
        if (!order) return;

        const currentQuantity = order.quantity;
        const availableQuantity =
            checkAvailability(order.serving) + currentQuantity;

        if (quantity > availableQuantity) return;

        setOrders(
            orders.map((order) =>
                order.id === id ? { ...order, quantity } : order
            )
        );
    };

    const clearOrders = () => setOrders([]);

    const checkAvailability = (serving: Serving): number => {
        const maxAvailable = getServingQuantityAvailable(
            serving,
            stockEntries,
            orders.filter((order) => order.serving.id !== serving.id)
        );
        return maxAvailable;
    };

    const canIncrement = (id: string): boolean => {
        const order = getOrder(id);
        if (!order) return false;
        return checkAvailability(order.serving) > 0;
    };

    return (
        <OrderContext.Provider
            value={{
                orders,
                addOrder,
                removeOrder,
                clearOrders,
                incrementOrder,
                decrementOrder,
                updateOrder,
                calculateSubtotal,
                getOrder,
                checkAvailability,
                canIncrement,
                stockEntries,
                // New price calculation functions
                calculateItemBasePrice,
                calculateItemAddonsPrice,
                calculateItemTotalPrice,
            }}
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
