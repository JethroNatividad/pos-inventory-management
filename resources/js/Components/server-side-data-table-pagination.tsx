import { Button } from "@/Components/ui/button";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/Components/ui/select";
import {
    ChevronLeft,
    ChevronRight,
    ChevronsLeft,
    ChevronsRight,
} from "lucide-react";
import { router } from "@inertiajs/react";
import { PaginatedData } from "@/types";

interface ServerSideDataTablePaginationProps {
    paginatedData: PaginatedData<any>;
    pageParamName?: string;
    perPageParamName?: string;
    preserveState?: boolean;
}

export function ServerSideDataTablePagination({
    paginatedData,
    pageParamName = "page",
    perPageParamName = "per_page",
    preserveState = true,
}: ServerSideDataTablePaginationProps) {
    const { current_page, last_page, per_page, total, from, to } =
        paginatedData;

    const updatePagination = (updates: { [key: string]: any }) => {
        const currentUrl = new URL(window.location.href);

        Object.entries(updates).forEach(([key, value]) => {
            if (value) {
                currentUrl.searchParams.set(key, value.toString());
            } else {
                currentUrl.searchParams.delete(key);
            }
        });

        router.get(
            currentUrl.pathname + currentUrl.search,
            {},
            {
                preserveState,
                preserveScroll: true,
                replace: true,
            }
        );
    };

    const goToPage = (page: number) => {
        updatePagination({ [pageParamName]: page });
    };

    const changePerPage = (newPerPage: number) => {
        updatePagination({
            [perPageParamName]: newPerPage,
            [pageParamName]: 1, // Reset to first page when changing per page
        });
    };

    return (
        <div className="flex items-center md:justify-end">
            <div className="flex flex-col space-y-4 md:flex-row md:items-center md:space-x-6 md:space-y-0 lg:space-x-8">
                <div className="flex items-center space-x-2">
                    <p className="text-sm font-medium">Rows per page</p>
                    <Select
                        value={per_page.toString()}
                        onValueChange={(value) => changePerPage(Number(value))}
                    >
                        <SelectTrigger className="h-8 w-[70px]">
                            <SelectValue placeholder={per_page} />
                        </SelectTrigger>
                        <SelectContent side="top">
                            {[10, 20, 30, 40, 50].map((pageSize) => (
                                <SelectItem
                                    key={pageSize}
                                    value={pageSize.toString()}
                                >
                                    {pageSize}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
                <div className="flex w-[100px] items-center justify-center text-sm font-medium">
                    Page {current_page} of {last_page}
                </div>
                <div className="flex items-center text-sm text-muted-foreground">
                    Showing {from} to {to} of {total} results
                </div>
                <div className="flex items-center space-x-2">
                    <Button
                        variant="outline"
                        className="hidden h-8 w-8 p-0 lg:flex"
                        onClick={() => goToPage(1)}
                        disabled={current_page <= 1}
                    >
                        <span className="sr-only">Go to first page</span>
                        <ChevronsLeft className="h-4 w-4" />
                    </Button>
                    <Button
                        variant="outline"
                        className="h-8 w-8 p-0"
                        onClick={() => goToPage(current_page - 1)}
                        disabled={current_page <= 1}
                    >
                        <span className="sr-only">Go to previous page</span>
                        <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <Button
                        variant="outline"
                        className="h-8 w-8 p-0"
                        onClick={() => goToPage(current_page + 1)}
                        disabled={current_page >= last_page}
                    >
                        <span className="sr-only">Go to next page</span>
                        <ChevronRight className="h-4 w-4" />
                    </Button>
                    <Button
                        variant="outline"
                        className="hidden h-8 w-8 p-0 lg:flex"
                        onClick={() => goToPage(last_page)}
                        disabled={current_page >= last_page}
                    >
                        <span className="sr-only">Go to last page</span>
                        <ChevronsRight className="h-4 w-4" />
                    </Button>
                </div>
            </div>
        </div>
    );
}
