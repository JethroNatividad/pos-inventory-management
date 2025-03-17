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
    checkAvailability: (
        serving: Serving,
        addons?: OrderItem["addons"]
    ) => number;
    checkAddonAvailability: (addonId: string, quantity: number) => number;
    canIncrement: (id: string) => boolean;
    stockEntries: StockEntry[];
    // New price calculation functions
    calculateItemBasePrice: (order: OrderItem) => number;
    calculateItemAddonsPrice: (order: OrderItem) => number;
    calculateItemTotalPrice: (order: OrderItem) => number;
    getTotalOrderQuantityForServing: (
        recipeId: number,
        servingId: number
    ) => number;
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

    const getCurrentAvailableStocks = () => {
        const CurrentAvailableStocks = structuredClone(stockEntries);
        orders.forEach((order) => {
            const servingIngredients = order.serving.recipe_ingredients;

            servingIngredients.forEach((ingredient) => {
                const stockEntry = CurrentAvailableStocks.find(
                    (entry) => entry.id === ingredient.stock_entry_id
                );

                if (stockEntry) {
                    stockEntry.quantity -= ingredient.quantity * order.quantity;
                }
            });
        });

        return CurrentAvailableStocks;
    };

    useEffect(() => {
        localStorage.setItem("orders", JSON.stringify(orders));
        console.log("OLD:", stockEntries);
        console.log("NEW:", getCurrentAvailableStocks());
    }, [orders]);

    const getTotalOrderQuantityForServing = (
        recipeId: number,
        servingId: number
    ): number => {
        return orders
            .filter(
                (order) =>
                    order.recipe.id === recipeId &&
                    order.serving.id === servingId
            )
            .reduce((total, order) => total + order.quantity, 0);
    };

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

    // Check how many of a specific addon are available
    const checkAddonAvailability = (
        stockEntryId: string,
        requiredQuantity: number
    ): number => {
        const stockEntry = stockEntries.find(
            (entry) => entry.id.toString() === stockEntryId
        );
        if (!stockEntry) return 0;

        // Calculate how much of this addon is already used in other orders
        const usedQuantity = orders.reduce((total, order) => {
            const addonUsage = order.addons
                .filter((addon) => addon.stock_entry_id === stockEntryId)
                .reduce(
                    (sum, addon) => sum + addon.quantity * order.quantity,
                    0
                );
            return total + addonUsage;
        }, 0);

        // Available quantity is what's in stock minus what's already used
        const availableQuantity = Math.max(
            0,
            stockEntry.quantity - usedQuantity
        );

        // Return how many items we can make with this addon
        return Math.floor(availableQuantity / requiredQuantity);
    };

    const checkAvailability = (
        serving: Serving,
        addons: OrderItem["addons"] = []
    ): number => {
        // Check serving availability based on ingredients
        const maxServingAvailable = getServingQuantityAvailable(
            serving,
            stockEntries,
            orders.filter((order) => order.serving.id !== serving.id)
        );

        if (addons.length === 0) return maxServingAvailable;

        // Also check addon availability
        const addonAvailability = addons.map((addon) =>
            checkAddonAvailability(addon.stock_entry_id, addon.quantity)
        );

        // We can only make as many items as the most limiting factor allows
        return Math.min(maxServingAvailable, ...addonAvailability);
    };

    const addOrder = (item: OrderItem) => {
        const availableQuantity = checkAvailability(item.serving, item.addons);
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
        const order = getOrder(id);
        if (!order) return;

        // Check if we can increment considering both serving and addons
        if (checkAvailability(order.serving, order.addons) <= 0) return;

        setOrders(
            orders.map((o) =>
                o.id === id ? { ...o, quantity: o.quantity + 1 } : o
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
            checkAvailability(order.serving, order.addons) + currentQuantity;

        if (quantity > availableQuantity) return;

        setOrders(orders.map((o) => (o.id === id ? { ...o, quantity } : o)));
    };

    const clearOrders = () => setOrders([]);

    const canIncrement = (id: string): boolean => {
        const order = getOrder(id);
        if (!order) return false;
        return checkAvailability(order.serving, order.addons) > 0;
    };

    // const isServingAvailable = (serving: Serving): boolean => {};

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
                checkAddonAvailability,
                canIncrement,
                stockEntries,
                // New price calculation functions
                calculateItemBasePrice,
                calculateItemAddonsPrice,
                calculateItemTotalPrice,
                getTotalOrderQuantityForServing,
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
