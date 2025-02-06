import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/Components/ui/alert-dialog";
import { Button } from "@/Components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuTrigger,
} from "@/Components/ui/dropdown-menu";
import type {
    Order,
    Recipe,
    RecipeLog,
    StockActivityLog,
    StockEntryLog,
} from "@/types";
import { Link, usePage } from "@inertiajs/react";
import { ColumnDef, Row } from "@tanstack/react-table";
import { LucideMoreHorizontal } from "lucide-react";

// id: number;
//     subtotal: number;
//     discountPercentage: number;
//     total: number;
//     type: string;
//     user: User;
//     created_at: string;

const ActionsCell = ({ row }: { row: Row<Order> }) => {
    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-8 w-8 p-0">
                    <span className="sr-only">Open menu</span>
                    <LucideMoreHorizontal className="h-4 w-4" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                <DropdownMenuLabel>Actions</DropdownMenuLabel>

                <DropdownMenuItem asChild>
                    <Link
                        href={route("reports.orders.receipt", row.original.id)}
                    >
                        View Receipt
                    </Link>
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
};

export const columns: ColumnDef<Order>[] = [
    {
        accessorKey: "id",
        header: "Order number",
    },
    {
        accessorKey: "created_at",
        header: "Date Time",
        cell: ({ row }) => new Date(row.original.created_at).toLocaleString(),
    },
    {
        accessorKey: "user.first_name",
        header: "Cashier",
    },
    {
        accessorKey: "subtotal",
        header: "Subtotal",
        cell: ({ row }) => {
            return `₱${row.original.subtotal}`;
        },
    },
    {
        accessorKey: "discountPercentage",
        header: "Discount",
        cell: ({ row }) => {
            return row.original.discountPercentage
                ? `${row.original.discountPercentage}%`
                : "N/A";
        },
    },
    {
        accessorKey: "total",
        header: "Total",
        cell: ({ row }) => {
            return `₱${row.original.total}`;
        },
    },
    {
        accessorKey: "total_cost",
        header: "Total Cost",
        cell: ({ row }) => {
            return `₱${row.original.total_cost.toFixed(2)}`;
        },
    },
    {
        accessorKey: "total_income",
        header: "Total Income",
        cell: ({ row }) => {
            return `₱${row.original.total_income.toFixed(2)}`;
        },
    },
    {
        accessorKey: "type",
        header: "Type",
    },
    {
        id: "actions",
        cell: ActionsCell,
        header: "Actions",
    },
];
