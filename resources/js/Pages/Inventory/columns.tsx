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
import type { StockEntry, User } from "@/types";
import { Link, usePage } from "@inertiajs/react";
import { ColumnDef, Row } from "@tanstack/react-table";
import { LucideMoreHorizontal } from "lucide-react";

// const ActionsCell = ({ row }: { row: Row<User> }) => {
//     const currentUser = usePage().props.auth.user;

//     if (currentUser.id === row.original.id) {
//         return null;
//     }

//     return (
//         <AlertDialog>
//             <DropdownMenu>
//                 <DropdownMenuTrigger asChild>
//                     <Button variant="ghost" className="h-8 w-8 p-0">
//                         <span className="sr-only">Open menu</span>
//                         <LucideMoreHorizontal className="h-4 w-4" />
//                     </Button>
//                 </DropdownMenuTrigger>
//                 <DropdownMenuContent align="end">
//                     <DropdownMenuLabel>Actions</DropdownMenuLabel>
//                     <DropdownMenuItem asChild>
//                         <Link href={route("users.edit", row.original.id)}>
//                             Edit
//                         </Link>
//                     </DropdownMenuItem>
//                     <AlertDialogTrigger asChild>
//                         <DropdownMenuItem>Delete</DropdownMenuItem>
//                     </AlertDialogTrigger>
//                 </DropdownMenuContent>
//             </DropdownMenu>
//             <AlertDialogContent>
//                 <AlertDialogHeader>
//                     <AlertDialogTitle>
//                         Are you absolutely sure?
//                     </AlertDialogTitle>
//                     <AlertDialogDescription>
//                         This action cannot be undone. This will permanently
//                         delete the user '{row.getValue("first_name")}' from the
//                         database.
//                     </AlertDialogDescription>
//                 </AlertDialogHeader>
//                 <AlertDialogFooter>
//                     <AlertDialogCancel>Cancel</AlertDialogCancel>
//                     <Button onClick={() => false} variant="destructive" asChild>
//                         <AlertDialogAction asChild>
//                             <Link
//                                 method="delete"
//                                 href={route("users.destroy", row.original.id)}
//                             >
//                                 Delete
//                             </Link>
//                         </AlertDialogAction>
//                     </Button>
//                 </AlertDialogFooter>
//             </AlertDialogContent>
//         </AlertDialog>
//     );
// };

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
    },
    {
        accessorKey: "quantity_status",
        header: "Stock Level",
    },
    {
        accessorKey: "perishable",
        header: "Is Perishable",
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
    },

    // {
    //     id: "actions",
    //     cell: ActionsCell,
    // },
];
