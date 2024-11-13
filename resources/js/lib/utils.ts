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
