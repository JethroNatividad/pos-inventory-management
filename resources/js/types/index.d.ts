export interface User {
    id: number;
    first_name: string;
    middle_name: string;
    last_name: string;
    email: string;
    email_verified_at?: string;
    role: string;
    password_set: boolean;
}

export interface StockEntry {
    id: number;
    name: string;
    description: string;
    type: "liquid" | "powder" | "item";
    perishable: boolean;
    warn_stock_level: number;
    warn_days_remaining: number;
    quantity: number;
    quantity_status: string;
    upcoming_expiry: string;
    average_price: number;
    unit: string;
}

export interface Role {
    id: number;
    name: string;
}

export interface Recipe {
    id: number;
    name: string;
    description: string;
    serving_names: string;
    servings: Serving[];
    is_available: boolean;
}

export interface Serving {
    id: number;
    name: string;
    price: number;
    recipe_ingredients: Ingredient[];
    is_available: boolean;
    quantity_available: number;
}

export interface Ingredient {
    stock_entry_id: number;
    id: number;
    quantity: number;
    unit: string;
}

export type IngredientFormData = {
    stock_entry_id: string;
    id?: string;
    quantity: string;
    unit: string;
};

export type ServingFormData = {
    id?: string;
    name: string;
    price: string;
    ingredients: IngredientFormData[];
};

export type RecipeFormData = {
    name: string;
    description: string;
    servings: ServingFormData[];
};

export type PageProps<
    T extends Record<string, unknown> = Record<string, unknown>
> = T & {
    auth: {
        user: User;
    };
};
