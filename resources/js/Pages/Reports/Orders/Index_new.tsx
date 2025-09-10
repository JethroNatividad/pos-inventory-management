import Layout from "@/Layouts/Layout";
import { Head, usePage, router } from "@inertiajs/react";
import { ServerSideDataTable } from "./server-side-data-table";
import { columns, cashierColumns } from "./columns";
import type { Order, PaginatedData } from "@/types";
import { Button } from "@/Components/ui/button";
import { Download, CalendarIcon, X } from "lucide-react";
import { useEffect, useState } from "react";
import { DateRange } from "react-day-picker";
import { addDays, format } from "date-fns";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/Components/ui/popover";
import { Calendar } from "@/Components/ui/calendar";
import { cn } from "@/lib/utils";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/Components/ui/select";
import { Badge } from "@/Components/ui/badge";
import { useDebouncedCallback } from "use-debounce";

type Props = {
    orders: PaginatedData<Order>;
    filters: {
        search?: string;
        date_from?: string;
        date_to?: string;
        cashier_id?: string;
        order_type?: string;
        per_page: number;
    };
    cashiers: Array<{ id: number; name: string }>;
    orderTypes: string[];
};

type Period = "24h" | "7d" | "1m" | "1y" | "all";

const getDateRangeForPeriod = (period: Period): DateRange => {
    const now = new Date();
    now.setHours(23, 59, 59, 999); // Set to end of day

    const getStartDate = (daysAgo: number) => {
        const date = addDays(now, -daysAgo);
        date.setHours(0, 0, 0, 0); // Set to start of day
        return date;
    };

    switch (period) {
        case "24h":
            return {
                from: getStartDate(1),
                to: now,
            };
        case "7d":
            return {
                from: getStartDate(7),
                to: now,
            };
        case "1m":
            return {
                from: getStartDate(30),
                to: now,
            };
        case "1y":
            return {
                from: getStartDate(365),
                to: now,
            };
        case "all":
            return {
                from: undefined,
                to: undefined,
            };
    }
};

const Index = ({ orders, filters, cashiers, orderTypes }: Props) => {
    const user = usePage().props.auth.user;

    const isAdmin =
        user?.role === "administrator" || user?.role === "store_manager";

    const [date, setDate] = useState<DateRange | undefined>(() => {
        if (filters.date_from || filters.date_to) {
            return {
                from: filters.date_from
                    ? new Date(filters.date_from)
                    : undefined,
                to: filters.date_to ? new Date(filters.date_to) : undefined,
            };
        }
        return undefined;
    });

    const [activePeriod, setActivePeriod] = useState<Period>("all");
    const [numberOfMonths, setNumberMonths] = useState(
        window.innerWidth >= 640 ? 2 : 1
    );
    const [selectedCashier, setSelectedCashier] = useState<string>(
        filters.cashier_id || "all"
    );
    const [selectedType, setSelectedType] = useState<string>(
        filters.order_type || "all"
    );

    // Handle window resize for calendar display
    useEffect(() => {
        const handleResize = () => {
            setNumberMonths(window.innerWidth >= 640 ? 2 : 1);
        };

        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    const updateFilters = useDebouncedCallback(
        (newFilters: Record<string, any>) => {
            const currentUrl = new URL(window.location.href);

            Object.entries(newFilters).forEach(([key, value]) => {
                if (value && value !== "all") {
                    currentUrl.searchParams.set(key, value.toString());
                } else {
                    currentUrl.searchParams.delete(key);
                }
            });

            // Reset to first page when filters change
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
        },
        300
    );

    const handleDateChange = (newDate: DateRange | undefined) => {
        setDate(newDate);
        setActivePeriod("all");

        updateFilters({
            date_from: newDate?.from ? format(newDate.from, "yyyy-MM-dd") : "",
            date_to: newDate?.to ? format(newDate.to, "yyyy-MM-dd") : "",
        });
    };

    const handlePeriodChange = (period: Period) => {
        setActivePeriod(period);
        const newDateRange = getDateRangeForPeriod(period);
        setDate(newDateRange);

        updateFilters({
            date_from: newDateRange?.from
                ? format(newDateRange.from, "yyyy-MM-dd")
                : "",
            date_to: newDateRange?.to
                ? format(newDateRange.to, "yyyy-MM-dd")
                : "",
        });
    };

    const handleCashierChange = (cashierId: string) => {
        setSelectedCashier(cashierId);
        updateFilters({ cashier_id: cashierId });
    };

    const handleTypeChange = (type: string) => {
        setSelectedType(type);
        updateFilters({ order_type: type });
    };

    // Clear all active filters
    const clearFilters = () => {
        setDate(undefined);
        setActivePeriod("all");
        setSelectedCashier("all");
        setSelectedType("all");

        const currentUrl = new URL(window.location.href);
        currentUrl.searchParams.delete("date_from");
        currentUrl.searchParams.delete("date_to");
        currentUrl.searchParams.delete("cashier_id");
        currentUrl.searchParams.delete("order_type");
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
    };

    const exportOrdersToCSV = () => {
        // Define headers for CSV file
        const headers = [
            "Order Number",
            "Date",
            "Time",
            "Cashier",
            "Subtotal (PHP)",
            "Discount",
            "Total (PHP)",
            "Total Cost (PHP)",
            "Total Income (PHP)",
            "Type",
        ];

        // Convert data to CSV rows - use current page data
        const rows = orders.data.map((order: Order) => [
            order.id,
            new Date(order.created_at).toLocaleString(),
            `${order.user.first_name}${
                order.user.middle_name ? " " + order.user.middle_name : ""
            } ${order.user.last_name}` || "N/A",
            `${order.subtotal}`,
            order.discountPercentage ? `${order.discountPercentage}%` : "N/A",
            `${order.total}`,
            `${order.total_cost.toFixed(2)}`,
            `${order.total_income.toFixed(2)}`,
            order.type,
        ]);

        // Combine headers and rows into CSV content
        const csvContent = [
            headers.join(","),
            ...rows.map((row: any[]) => row.join(",")),
        ].join("\n");

        // Create download link for the CSV file
        const blob = new Blob([csvContent], {
            type: "text/csv;charset=utf-8;",
        });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.setAttribute("href", url);
        link.setAttribute(
            "download",
            `orders-page-${orders.current_page}-${
                new Date().toISOString().split("T")[0]
            }.csv`
        );
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    // Count active filters
    const activeFilterCount = [
        date?.from || date?.to ? 1 : 0,
        selectedCashier !== "all" ? 1 : 0,
        selectedType !== "all" ? 1 : 0,
    ].reduce((a, b) => a + b, 0);

    return (
        <Layout>
            <Head title="Reports" />
            <div className="flex justify-between items-center mb-4">
                <h1 className="text-xl font-medium">Order Logs</h1>
                <Button
                    onClick={exportOrdersToCSV}
                    variant="outline"
                    className="flex items-center gap-2"
                    title="Export current page to CSV"
                >
                    <Download className="w-4 h-4" />
                    Export Page CSV
                </Button>
            </div>

            <div className="space-y-4 mb-6">
                {/* Filter section */}
                <div className="flex flex-wrap gap-4 items-end">
                    {/* Date filter */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium">
                            Date Range
                        </label>
                        <Popover>
                            <PopoverTrigger asChild>
                                <Button
                                    id="date"
                                    variant={"outline"}
                                    className={cn(
                                        "w-[300px] justify-start text-left font-normal",
                                        !date && "text-muted-foreground"
                                    )}
                                >
                                    <CalendarIcon className="mr-2 h-4 w-4" />
                                    {date?.from ? (
                                        date.to ? (
                                            <>
                                                {format(date.from, "LLL dd, y")}{" "}
                                                - {format(date.to, "LLL dd, y")}
                                            </>
                                        ) : (
                                            format(date.from, "LLL dd, y")
                                        )
                                    ) : (
                                        <span>Pick a date</span>
                                    )}
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent
                                className="w-auto p-0"
                                align="start"
                            >
                                <Calendar
                                    initialFocus
                                    mode="range"
                                    defaultMonth={date?.from}
                                    selected={date}
                                    onSelect={handleDateChange}
                                    numberOfMonths={numberOfMonths}
                                />
                            </PopoverContent>
                        </Popover>
                    </div>

                    {/* Quick date filters */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium">
                            Quick Filters
                        </label>
                        <div className="flex gap-2">
                            {(["24h", "7d", "1m", "1y", "all"] as Period[]).map(
                                (period) => (
                                    <Button
                                        key={period}
                                        variant={
                                            activePeriod === period
                                                ? "default"
                                                : "outline"
                                        }
                                        size="sm"
                                        onClick={() =>
                                            handlePeriodChange(period)
                                        }
                                    >
                                        {period === "all"
                                            ? "All"
                                            : period.toUpperCase()}
                                    </Button>
                                )
                            )}
                        </div>
                    </div>

                    {/* Cashier filter */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Cashier</label>
                        <Select
                            value={selectedCashier}
                            onValueChange={handleCashierChange}
                        >
                            <SelectTrigger className="w-[200px]">
                                <SelectValue placeholder="Select cashier" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">
                                    All Cashiers
                                </SelectItem>
                                {cashiers.map((cashier) => (
                                    <SelectItem
                                        key={cashier.id}
                                        value={cashier.id.toString()}
                                    >
                                        {cashier.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Order type filter */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium">
                            Order Type
                        </label>
                        <Select
                            value={selectedType}
                            onValueChange={handleTypeChange}
                        >
                            <SelectTrigger className="w-[150px]">
                                <SelectValue placeholder="Select type" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Types</SelectItem>
                                {orderTypes.map((type) => (
                                    <SelectItem key={type} value={type}>
                                        {type}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Clear filters button */}
                    {activeFilterCount > 0 && (
                        <Button
                            variant="ghost"
                            onClick={clearFilters}
                            className="flex items-center gap-2"
                        >
                            <X className="h-4 w-4" />
                            Clear Filters
                            <Badge variant="secondary">
                                {activeFilterCount}
                            </Badge>
                        </Button>
                    )}
                </div>
            </div>

            <ServerSideDataTable
                columns={isAdmin ? columns : cashierColumns}
                paginatedData={orders}
                searchValue={filters.search}
            />
        </Layout>
    );
};

export default Index;
