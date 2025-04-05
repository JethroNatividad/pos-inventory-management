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
import { Input } from "@/Components/ui/input";
import type { Recipe, StockEntry } from "@/types";
import { Link } from "@inertiajs/react";
import { ColumnDef, Row } from "@tanstack/react-table";
import { LucideMoreHorizontal } from "lucide-react";
import { useState } from "react";

const ActionsCell = ({ row }: { row: Row<Recipe> }) => {
    const [confirmDelete, setConfirmDelete] = useState("");
    const recipeName = row.getValue("name") as string;
    const isDeleteEnabled = confirmDelete === `I want to delete ${recipeName}`;

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
                    <AlertDialogDescription className="space-y-4">
                        <p>
                            This will permanently delete the recipe '
                            {recipeName}' from the database.
                        </p>
                        <div>
                            <p className="mb-2 text-sm text-muted-foreground">
                                Please type "I want to delete {recipeName}" to
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
                                {serving.name}({serving.quantity_available} pcs)
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
