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
import { Badge } from "@/Components/ui/badge";
import { Button } from "@/Components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuTrigger,
} from "@/Components/ui/dropdown-menu";
import { Input } from "@/Components/ui/input";
import type { StockEntry } from "@/types";
import { Link } from "@inertiajs/react";
import { ColumnDef, Row } from "@tanstack/react-table";
import { LucideMoreHorizontal } from "lucide-react";
import { useState } from "react";

const ActionsCell = ({ row }: { row: Row<StockEntry> }) => {
    const [confirmDelete, setConfirmDelete] = useState("");
    const stockName = row.getValue("name") as string;
    const isDeleteEnabled = confirmDelete === `I want to delete ${stockName}`;

    return (
        <AlertDialog>
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
                        <Link href={route("stock.create", row.original.id)}>
                            Add Stock
                        </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem
                        asChild
                        disabled={row.original.quantity <= 0}
                    >
                        <Link href={route("stock.removeForm", row.original.id)}>
                            Remove Stock
                        </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                        <Link href={route("inventory.edit", row.original.id)}>
                            Edit
                        </Link>
                    </DropdownMenuItem>
                    <AlertDialogTrigger asChild>
                        <DropdownMenuItem>Delete</DropdownMenuItem>
                    </AlertDialogTrigger>
                </DropdownMenuContent>
            </DropdownMenu>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>
                        Are you absolutely sure?
                    </AlertDialogTitle>
                    <AlertDialogDescription className="space-y-4">
                        <p>
                            This will delete the stock entry '{stockName}' and
                            all of its stocks.
                        </p>
                        <div>
                            <p className="mb-2 text-sm text-muted-foreground">
                                Please type "I want to delete {stockName}" to
                                confirm deletion
                            </p>
                            <Input
                                value={confirmDelete}
                                onChange={(e) =>
                                    setConfirmDelete(e.target.value)
                                }
                                placeholder="Type here"
                            />
                        </div>
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel onClick={() => setConfirmDelete("")}>
                        Cancel
                    </AlertDialogCancel>
                    <Button
                        onClick={() => false}
                        variant="destructive"
                        disabled={!isDeleteEnabled}
                        asChild
                    >
                        <AlertDialogAction asChild>
                            <Link
                                method="delete"
                                href={route(
                                    "inventory.destroy",
                                    row.original.id
                                )}
                            >
                                Delete
                            </Link>
                        </AlertDialogAction>
                    </Button>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
};

export const columns: ColumnDef<StockEntry>[] = [
    {
        accessorKey: "name",
        header: "Name",
    },
    {
        accessorKey: "description",
        header: "Description",

        cell: ({ row }) => {
            return row.original.description || "N/A";
        },
    },
    {
        accessorKey: "type",
        header: "Unit Type",
    },
    {
        accessorKey: "quantity",
        header: "Quantity",
        cell: ({ row }) => {
            const color =
                row.original.quantity <= 0
                    ? "text-red-500"
                    : row.original.quantity < row.original.warn_stock_level
                    ? "text-yellow-500"
                    : "text-green-500";

            return (
                <span
                    className={`${color}`}
                >{`${row.original.quantity}${row.original.unit}`}</span>
            );
        },
    },
    {
        accessorKey: "perishable",
        header: "Is Perishable",
        cell: ({ row }) => {
            return row.original.perishable ? "Yes" : "No";
        },
    },
    {
        accessorKey: "upcoming_expiry",
        header: "Upcoming Expiry",
        cell: ({ row }) => {
            return row.original.upcoming_expiry || "N/A";
        },
    },
    {
        accessorKey: "average_price",
        header: "Average Price",
        cell: ({ row }) => {
            // round to 2 decimal places
            return `₱${(
                row.original.average_price * row.original.quantity
            ).toFixed(2)}`;
        },
    },

    {
        id: "actions",
        header: "Actions",
        cell: ActionsCell,
    },
];
