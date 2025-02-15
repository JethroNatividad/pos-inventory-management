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
    Recipe,
    RecipeLog,
    StockActivityLog,
    StockEntryLog,
} from "@/types";
import { Link, usePage } from "@inertiajs/react";
import { ColumnDef, Row } from "@tanstack/react-table";
import { LucideMoreHorizontal } from "lucide-react";

export const columns: ColumnDef<RecipeLog>[] = [
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
        accessorKey: "recipe.name",
        header: "Recipe",
    },
];
