import type { Recipe, Serving, StockEntry } from "@/types";
import React, { createContext, useContext, useState, useEffect } from "react";
import { toast } from "sonner";

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
    canIncrement: (id: string) => boolean;
    stockEntries: StockEntry[];
    // New price calculation functions
    calculateItemBasePrice: (order: OrderItem) => number;
    calculateItemAddonsPrice: (order: OrderItem) => number;
    calculateItemTotalPrice: (order: OrderItem) => number;

    getMaximumOrderQuantity: (orderItem: OrderItem) => number;

    isServingAvailable: (serving: Serving) => boolean;
    isRecipeAvailable: (recipe: Recipe) => boolean;
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
        console.log("OLD:", stockEntries);
        console.log("NEW:", getCurrentAvailableStocks());
        console.log(
            "MAX:",
            orders.length > 0 && getMaximumOrderQuantity(orders[0])
        );
    }, [orders]);

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

            order.addons.forEach((addon) => {
                const stockEntry = CurrentAvailableStocks.find(
                    (entry) => entry.id.toString() === addon.stock_entry_id
                );

                if (stockEntry) {
                    stockEntry.quantity -= addon.quantity * order.quantity;
                }
            });
        });

        return CurrentAvailableStocks;
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

    const isServingAvailable = (serving: Serving): boolean => {
        const currentAvailableStocks = getCurrentAvailableStocks();

        const servingIngredients = serving.recipe_ingredients;

        for (const ingredient of servingIngredients) {
            const stockEntry = currentAvailableStocks.find(
                (entry) => entry.id === ingredient.stock_entry_id
            );

            if (!stockEntry || stockEntry.quantity < ingredient.quantity) {
                return false;
            }
        }

        return true;
    };

    const isRecipeAvailable = (recipe: Recipe): boolean => {
        return recipe.servings.some((serving) => isServingAvailable(serving));
    };

    const getMaximumOrderQuantity = (orderItem: OrderItem): number => {
        const currentAvailableStocks = getCurrentAvailableStocks();

        // Check serving availability based on ingredients plus addons
        const totalIngredientsUsed: {
            [key: string]: number;
        } = {};

        const servingIngredients = orderItem.serving.recipe_ingredients;

        servingIngredients.forEach((ingredient) => {
            if (!totalIngredientsUsed[ingredient.stock_entry_id]) {
                totalIngredientsUsed[ingredient.stock_entry_id] = 0;
            }
            totalIngredientsUsed[ingredient.stock_entry_id] += Number(
                ingredient.quantity
            );
        });

        orderItem.addons.forEach((addon) => {
            if (!totalIngredientsUsed[addon.stock_entry_id]) {
                totalIngredientsUsed[addon.stock_entry_id] = 0;
            }
            totalIngredientsUsed[addon.stock_entry_id] += addon.quantity;
        });

        console.log("TOTAL:", totalIngredientsUsed);

        let maxQuantity = Infinity;

        // Now calculate the maximum quantity we can make, Excluding the current order from the calculation

        for (const [stockId, quantity] of Object.entries(
            totalIngredientsUsed
        )) {
            const stockEntry = currentAvailableStocks.find(
                (entry) => entry.id === Number(stockId)
            );

            if (!stockEntry) {
                return 0;
            }

            const availableQuantity = stockEntry.quantity / quantity;
            maxQuantity = Math.min(maxQuantity, availableQuantity);
        }

        return Math.floor(maxQuantity);
    };

    const addOrder = (item: OrderItem) => {
        const availableQuantity = getMaximumOrderQuantity(item);
        if (availableQuantity <= 0)
            return toast.error("Out of stock", { position: "top-right" });

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
        if (getMaximumOrderQuantity(order) <= 0) return;

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

        const availableQuantity = getMaximumOrderQuantity(order);

        if (availableQuantity <= 0) return;

        setOrders(orders.map((o) => (o.id === id ? { ...o, quantity } : o)));
    };

    const clearOrders = () => setOrders([]);

    const canIncrement = (id: string): boolean => {
        const order = getOrder(id);
        if (!order) return false;
        return getMaximumOrderQuantity(order) > 0;
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
                canIncrement,
                stockEntries,
                // New price calculation functions
                calculateItemBasePrice,
                calculateItemAddonsPrice,
                calculateItemTotalPrice,
                // getTotalOrderQuantityForServing,

                getMaximumOrderQuantity,
                isServingAvailable,
                isRecipeAvailable,
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
