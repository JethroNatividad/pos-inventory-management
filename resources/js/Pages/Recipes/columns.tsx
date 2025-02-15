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
import { getServingQuantityAvailable } from "@/lib/utils";
import type { Recipe, RecipeAvailability, StockEntry } from "@/types";
import { Link, usePage } from "@inertiajs/react";
import { ColumnDef, Row } from "@tanstack/react-table";
import { LucideMoreHorizontal } from "lucide-react";

const ActionsCell = ({ row }: { row: Row<Recipe> }) => {
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
                        <Link href={route("recipes.edit", row.original.id)}>
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
                    <AlertDialogDescription>
                        This action cannot be undone. This will permanently
                        delete the recipe '{row.getValue("name")}' from the
                        database.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <Button onClick={() => false} variant="destructive" asChild>
                        <AlertDialogAction asChild>
                            <Link
                                method="delete"
                                href={route("recipes.destroy", row.original.id)}
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

export const columns = (stockEntries: StockEntry[]): ColumnDef<Recipe>[] => {
    return [
        {
            accessorKey: "name",
            header: "Name",
        },
        {
            accessorKey: "description",
            header: "Description",
        },
        {
            accessorKey: "servings",
            header: "Servings",
            cell: ({ row }) => {
                return (
                    <div>
                        {row.original.servings.map((serving, index) => (
                            <span key={serving.id}>
                                {serving.name}(
                                {getServingQuantityAvailable(
                                    serving,
                                    stockEntries
                                )}{" "}
                                pcs)
                                {index < row.original.servings.length - 1
                                    ? ", "
                                    : ""}
                            </span>
                        ))}
                    </div>
                );
            },
        },

        {
            id: "actions",
            cell: ActionsCell,
            header: "Actions",
        },
    ];
};
