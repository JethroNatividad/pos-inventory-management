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
    cost: number;
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

export type StockEntryLog = {
    id: number;
    stock_entry: StockEntry;
    user: User;
    action: string;
    created_at: string;
};

export type Stock = {
    id: number;
    stock_entry: StockEntry;
    quantity: number;
    price: number;
    batch_label: string;
    expiry_date?: string;
    unit_price: number;
};

export type StockActivityLog = {
    stock: Stock;
    user: User;
    action: string;
    quantity: number;
    price?: number;
    batch_label?: string;
    expiry_date?: string;
    is_perishable?: boolean;
    reason?: string;
    created_at: string;
};

export type RecipeLog = {
    recipe: Recipe;
    user: User;
    action: string;
    created_at: string;
};

export type Order = {
    id: number;
    subtotal: number;
    discountPercentage: number;
    total: number;
    type: string;
    user: User;
    total_cost: number;
    total_income: number;
    created_at: string;
};

export type OrderItem = {
    id: number;
    order: Order;
    serving: Serving;
    quantity: number;
    price: number;
    created_at: string;
    cost: number;
    income: number;
};

export type PageProps<
    T extends Record<string, unknown> = Record<string, unknown>
> = T & {
    auth: {
        user: User;
    };
};
