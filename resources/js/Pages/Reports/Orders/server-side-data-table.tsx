import {
    ColumnDef,
    flexRender,
    getCoreRowModel,
    useReactTable,
} from "@tanstack/react-table";

import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/Components/ui/table";
import { ServerSideDataTablePagination } from "@/Components/server-side-data-table-pagination";
import { Label } from "@/Components/ui/label";
import { Input } from "@/Components/ui/input";
import { useState, useEffect } from "react";
import { PaginatedData, Order } from "@/types";
import { router } from "@inertiajs/react";
import { useDebouncedCallback } from "use-debounce";

interface ServerSideDataTableProps {
    columns: ColumnDef<Order, any>[];
    paginatedData: PaginatedData<Order>;
    searchValue?: string;
}

export function ServerSideDataTable({
    columns,
    paginatedData,
    searchValue = "",
}: ServerSideDataTableProps) {
    const [searchInput, setSearchInput] = useState(searchValue);
    const [isInitialized, setIsInitialized] = useState(false);

    const debouncedSearch = useDebouncedCallback((value: string) => {
        const currentUrl = new URL(window.location.href);

        if (value) {
            currentUrl.searchParams.set("search", value);
        } else {
            currentUrl.searchParams.delete("search");
        }

        // Reset to first page when searching
        currentUrl.searchParams.delete("page");

        router.get(
            currentUrl.pathname + currentUrl.search,
            {},
            {
                preserveState: true,
                preserveScroll: true,
                replace: true,
            }
        );
    }, 500);

    useEffect(() => {
        // Only trigger search after initial mount and when input actually changes
        if (isInitialized && searchInput !== searchValue) {
            debouncedSearch(searchInput);
        }
    }, [searchInput, debouncedSearch, isInitialized, searchValue]);

    useEffect(() => {
        // Mark as initialized after first render
        setIsInitialized(true);
        // Sync search input with prop value on mount/prop change
        setSearchInput(searchValue);
    }, [searchValue]);

    const table = useReactTable({
        data: paginatedData.data,
        columns,
        getCoreRowModel: getCoreRowModel(),
        manualPagination: true,
        pageCount: paginatedData.last_page,
    });

    return (
        <div className="grid auto-rows-max space-y-4">
            <div className="flex justify-between items-end">
                <div className="flex space-x-2 w-full">
                    <div className="max-w-xs w-full space-y-2">
                        <Label>Search</Label>
                        <Input
                            type="text"
                            placeholder="Search orders..."
                            value={searchInput}
                            onChange={(e) => setSearchInput(e.target.value)}
                        />
                    </div>
                </div>
            </div>

            <div className="overflow-x-auto rounded-md border">
                <Table>
                    <TableHeader>
                        {table.getHeaderGroups().map((headerGroup) => (
                            <TableRow key={headerGroup.id}>
                                {headerGroup.headers.map((header) => {
                                    return (
                                        <TableHead key={header.id}>
                                            {header.isPlaceholder
                                                ? null
                                                : flexRender(
                                                      header.column.columnDef
                                                          .header,
                                                      header.getContext()
                                                  )}
                                        </TableHead>
                                    );
                                })}
                            </TableRow>
                        ))}
                    </TableHeader>
                    <TableBody>
                        {table.getRowModel().rows?.length ? (
                            table.getRowModel().rows.map((row) => (
                                <TableRow
                                    key={row.id}
                                    data-state={
                                        row.getIsSelected() && "selected"
                                    }
                                >
                                    {row.getVisibleCells().map((cell) => (
                                        <TableCell key={cell.id}>
                                            {flexRender(
                                                cell.column.columnDef.cell,
                                                cell.getContext()
                                            )}
                                        </TableCell>
                                    ))}
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell
                                    colSpan={columns.length}
                                    className="h-24 text-center"
                                >
                                    No results.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>
            <div>
                <ServerSideDataTablePagination 
                    paginatedData={paginatedData}
                    pageParamName="page"
                    perPageParamName="per_page"
                />
            </div>
        </div>
    );
}
