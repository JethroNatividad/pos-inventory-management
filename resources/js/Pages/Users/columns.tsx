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
import type { User } from "@/types";
import { Link, usePage } from "@inertiajs/react";
import { ColumnDef, Row } from "@tanstack/react-table";
import { LucideMoreHorizontal } from "lucide-react";

const ActionsCell = ({ row }: { row: Row<User> }) => {
    const currentUser = usePage().props.auth.user;

    if (currentUser.id === row.original.id) {
        return null;
    }

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
                        <Link href={route("users.edit", row.original.id)}>
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
                        delete the user '{row.getValue("first_name")}' from the
                        database.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <Button onClick={() => false} variant="destructive" asChild>
                        <AlertDialogAction asChild>
                            <Link
                                method="delete"
                                href={route("users.destroy", row.original.id)}
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

export const columns: ColumnDef<User>[] = [
    {
        accessorKey: "first_name",
        header: "First Name",
    },
    {
        accessorKey: "middle_name",
        header: "Middle Name",

        cell: ({ row }) => {
            return row.original.middle_name || "N/A";
        },
    },
    {
        accessorKey: "last_name",
        header: "Last Name",
    },
    {
        accessorKey: "email",
        header: "Email",
    },
    {
        accessorKey: "role",
        header: "Role",
    },
    {
        accessorKey: "password_set",
        header: "Status",

        cell: ({ row }) => {
            return row.original.password_set ? "Active" : "Inactive";
        },
    },

    {
        id: "actions",
        cell: ActionsCell,
        header: "Actions",
    },
];
