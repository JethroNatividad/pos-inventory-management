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
    image?: string;
}

export interface Serving {
    id: number;
    name: string;
    price: number;
    recipe_ingredients: Ingredient[];
    is_available: boolean;
    quantity_available: number;
    cost: number;
    recipe: Recipe;
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
    updated_at: string;
    items: OrderItem[];
    customer_name: string;
    payment_method: string;
};

export type OrderItem = {
    id: number;
    order: Order;
    serving: Serving;
    addons: AddOn[];
    quantity: number;
    price: number;
    created_at: string;
    cost: number;
    income: number;
};

interface ToastData {
    message: string;
    description?: string;
    action?: {
        label: string;
        url: string;
        method?: "get" | "post" | "put" | "delete" | "patch";
        data?: any;
    };
}

export type PageProps<
    T extends Record<string, unknown> = Record<string, unknown>
> = T & {
    auth: {
        user: User;
    };
    toast?: ToastData;
};
export interface ServingAvailability {
    serving_id: number;
    max_quantity: number;
    ingredients_availability: IngredientAvailability[];
    is_available: boolean;
}

export interface RecipeAvailability {
    recipe_id: number;
    servings_availability: ServingAvailability[];
    is_available: boolean;
}

export type OrderStats = {
    daily_stats: {
        date: string;
        total_orders: number;
    }[];
    financial_summary: {
        totalGrossRevenue: number;
        totalVAT: number;
        totalRevenue: number;
        totalCost: number;
        totalIncome: number;
        totalOrders: number;
    };
    top_selling_items: {
        name: string;
        quantitySold: number;
        totalRevenue: number;
    }[];

    top_employee_sales: {
        user_id: number;
        name: string;
        order_items: number;
        total_income: number;
    }[];
};

export type AddOn = {
    quantity: number;
    price: number;
    stock_entry: StockEntry;
    orderItem: OrderItem;
};

export interface OrderAddon {
    id: string;
    stock_entry_id: string;
    quantity: number;
    unit: string;
    name: string;
    price: number;
    type: "liquid" | "powder" | "item";
}
