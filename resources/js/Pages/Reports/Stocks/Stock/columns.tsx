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
import type { Recipe, StockActivityLog, StockEntryLog } from "@/types";
import { Link, usePage } from "@inertiajs/react";
import { ColumnDef, Row } from "@tanstack/react-table";
import { LucideMoreHorizontal } from "lucide-react";

export const columns: ColumnDef<StockActivityLog>[] = [
    {
        accessorKey: "created_at",
        header: "Date Time",
        cell: ({ row }) => new Date(row.original.created_at).toLocaleString(),
    },
    {
        accessorKey: "action",
        header: "Action",
    },
    {
        accessorKey: "user.first_name",
        header: "User",
    },
    {
        accessorKey: "reason",
        header: "Reason",
        cell: ({ row }) => {
            return row.original.reason || "N/A";
        },
    },
    {
        accessorKey: "stock.stock_entry.name",
        header: "Stock Entry",
        // cell: ({ row }) => row.original.stockEntry.name,
    },
    {
        accessorKey: "quantity",
        header: "Quantity",
        cell: ({ row }) => {
            return `${row.original.quantity}${row.original.stock.stock_entry.unit}`;
        },
    },
    {
        accessorKey: "price",
        header: "Price",
        cell: ({ row }) => {
            return row.original.price ? `₱${row.original.price}` : "N/A";
        },
    },
    {
        accessorKey: "batch_label",
        header: "Batch Label",
    },
    {
        accessorKey: "expiry_date",
        header: "Expiry Date",
        cell: ({ row }) => {
            return row.original.expiry_date || "N/A";
        },
    },
    {
        accessorKey: "stock_entry.perishable",
        header: "Is Perishable",
        cell: ({ row }) => {
            return row.original.stock.stock_entry.perishable ? "Yes" : "No";
        },
    },
];
