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

export type PageProps<
    T extends Record<string, unknown> = Record<string, unknown>
> = T & {
    auth: {
        user: User;
    };
};
