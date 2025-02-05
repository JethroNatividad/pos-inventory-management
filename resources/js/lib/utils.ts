import { Serving, StockEntry } from "@/types";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export function convertToBaseUnit(
    type: "liquid" | "powder" | "item",
    unit: string,
    quantity: number
) {
    const units: {
        liquid: { [key: string]: number };
        powder: { [key: string]: number };
        item: { [key: string]: number };
    } = {
        liquid: {
            ml: 1,
            l: 1000,
            "fl oz": 29.5735,
        },
        powder: {
            g: 1,
            kg: 1000,
            lb: 453.592,
        },
        item: {
            pcs: 1,
            dozen: 12,
        },
    };

    return quantity * units[type][unit];
}

export function convertFromBaseUnit(
    type: "liquid" | "powder" | "item",
    unit: string,
    quantity: number
) {
    const units: {
        liquid: { [key: string]: number };
        powder: { [key: string]: number };
        item: { [key: string]: number };
    } = {
        liquid: {
            ml: 1,
            l: 1000,
            "fl oz": 29.5735,
        },
        powder: {
            g: 1,
            kg: 1000,
            lb: 453.592,
        },
        item: {
            pcs: 1,
            dozen: 12,
        },
    };

    return quantity / units[type][unit];
}

export function convert(
    type: "liquid" | "powder" | "item",
    fromUnit: string,
    toUnit: string,
    quantity: number
) {
    const baseQuantity = convertToBaseUnit(type, fromUnit, quantity);
    return convertFromBaseUnit(type, toUnit, baseQuantity);
}

export function getServingQuantityAvailable(
    serving: Serving,
    stockEntries: StockEntry[]
): number {
    // public function getQuantityAvailableAttribute()
    // {
    //     // Get the minimum quantity available
    //     $recipeIngredients = $this->recipeIngredients;
    //     $quantityAvailable = null;
    //     foreach ($recipeIngredients as $recipeIngredient) {
    //         $quantity = $recipeIngredient->stockEntry->quantity / $recipeIngredient->quantity;
    //         if ($quantityAvailable === null || $quantity < $quantityAvailable) {
    //             $quantityAvailable = $quantity;
    //         }
    //     }
    //     // Round down to the nearest integer
    //     return floor($quantityAvailable);
    // }

    const recipeIngredients = serving.recipe_ingredients;
    let quantityAvailable = 0;

    for (const recipeIngredient of recipeIngredients) {
        const quantity =
            stockEntries.find(
                (entry) => entry.id === recipeIngredient.stock_entry_id
            )?.quantity || 0;
        const available = quantity / recipeIngredient.quantity;
        if (quantityAvailable === 0 || available < quantityAvailable) {
            quantityAvailable = available;
        }
    }

    return Math.floor(quantityAvailable);
}
