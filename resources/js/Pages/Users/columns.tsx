"use client";

import type { User } from "@/types";
import { ColumnDef } from "@tanstack/react-table";

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
];
