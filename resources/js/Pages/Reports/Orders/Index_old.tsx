import Layout from "@/Layouts/Layout";
import { Head, usePage, router } from "@inertiajs/react";
import { ServerSideDataTable } from "./server-side-data-table";
import { columns, cashierColumns } from "./columns";
import type { Order, PaginatedData } from "@/types";
import { Button } from "@/Components/ui/button";
import { Download, CalendarIcon, FilterIcon, X } from "lucide-react";
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
    SelectGroup,
    SelectItem,
    SelectLabel,
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
                from: filters.date_from ? new Date(filters.date_from) : undefined,
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

    const updateFilters = useDebouncedCallback((newFilters: Record<string, any>) => {
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

        router.get(currentUrl.pathname + currentUrl.search, {}, {
            preserveState: true,
            preserveScroll: true,
            replace: true,
        });
    }, 300);

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
            date_from: newDateRange?.from ? format(newDateRange.from, "yyyy-MM-dd") : "",
            date_to: newDateRange?.to ? format(newDateRange.to, "yyyy-MM-dd") : "",
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

        router.get(currentUrl.pathname + currentUrl.search, {}, {
            preserveState: true,
            preserveScroll: true,
            replace: true,
        });
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
            `orders-page-${orders.current_page}-${new Date().toISOString().split("T")[0]}.csv`
        );
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };
            ...rows.map((row) => row.join(",")),
        ].join("\n");

        // Create download link for the CSV file
        const blob = new Blob([csvContent], {
            type: "text/csv;charset=utf-8;",
        });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.setAttribute("href", url);

        // Include date range in filename if filtering
        const dateRangeStr =
            date?.from && date?.to
                ? `-${format(date.from, "yyyyMMdd")}-to-${format(
                      date.to,
                      "yyyyMMdd"
                  )}`
                : "";

        link.setAttribute(
            "download",
            `order-logs${dateRangeStr}-${
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
        selectedCashier ? 1 : 0,
        selectedType ? 1 : 0,
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
                >
                    <Download className="w-4 h-4" />
                    Export CSV
                </Button>
            </div>

            <div className="space-y-4 mb-6">
                {/* Filter section */}
                <div className="flex flex-col sm:flex-row gap-4">
                    {/* Date range picker */}
                    <div className="sm:w-1/3">
                        <Popover>
                            <PopoverTrigger asChild>
                                <Button
                                    variant="outline"
                                    className={cn(
                                        "w-full justify-start text-left font-normal",
                                        !date && "text-muted-foreground"
                                    )}
                                >
                                    <CalendarIcon className="mr-2 h-4 w-4 flex-shrink-0" />
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
                                        <span>All dates</span>
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
                                    onSelect={setDate}
                                    numberOfMonths={numberOfMonths}
                                    className="max-w-[calc(100vw-2rem)]"
                                />
                            </PopoverContent>
                        </Popover>
                    </div>

                    {/* Cashier filter */}
                    <div className="sm:w-1/3">
                        <Select
                            value={selectedCashier || "all"}
                            onValueChange={(value) =>
                                setSelectedCashier(value || "all")
                            }
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="All cashiers" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectGroup>
                                    <SelectLabel>Cashiers</SelectLabel>
                                    <SelectItem value="all">
                                        All cashiers
                                    </SelectItem>
                                    {cashiers.map((cashier) => (
                                        <SelectItem
                                            key={cashier}
                                            value={cashier}
                                        >
                                            {cashier}
                                        </SelectItem>
                                    ))}
                                </SelectGroup>
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Order type filter */}
                    <div className="sm:w-1/3">
                        <Select
                            value={selectedType || "all"}
                            onValueChange={(value) =>
                                setSelectedType(value || "all")
                            }
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="All types" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectGroup>
                                    <SelectLabel>Order Type</SelectLabel>
                                    <SelectItem value="all">
                                        All types
                                    </SelectItem>
                                    {orderTypes.map((type) => (
                                        <SelectItem key={type} value={type}>
                                            {type}
                                        </SelectItem>
                                    ))}
                                </SelectGroup>
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                {/* Period selection buttons */}
                <div className="flex border rounded-lg w-fit p-1 flex-wrap gap-2">
                    <Button
                        variant={activePeriod === "24h" ? "default" : "ghost"}
                        onClick={() => handlePeriodChange("24h")}
                        size="sm"
                    >
                        24h
                    </Button>
                    <Button
                        variant={activePeriod === "7d" ? "default" : "ghost"}
                        onClick={() => handlePeriodChange("7d")}
                        size="sm"
                    >
                        7d
                    </Button>
                    <Button
                        variant={activePeriod === "1m" ? "default" : "ghost"}
                        onClick={() => handlePeriodChange("1m")}
                        size="sm"
                    >
                        1m
                    </Button>
                    <Button
                        variant={activePeriod === "1y" ? "default" : "ghost"}
                        onClick={() => handlePeriodChange("1y")}
                        size="sm"
                    >
                        1y
                    </Button>
                    <Button
                        variant={activePeriod === "all" ? "default" : "ghost"}
                        onClick={() => handlePeriodChange("all")}
                        size="sm"
                    >
                        All
                    </Button>
                </div>

                {/* Active filters indicator */}
                {activeFilterCount > 0 && (
                    <div className="flex items-center gap-2">
                        <div className="flex items-center gap-1">
                            <FilterIcon className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm text-muted-foreground">
                                Filters:
                            </span>
                        </div>

                        {date?.from && date?.to && (
                            <Badge variant="secondary" className="gap-1">
                                Date: {format(date.from, "MMM d")} -{" "}
                                {format(date.to, "MMM d, yyyy")}
                            </Badge>
                        )}

                        {selectedCashier !== "all" && (
                            <Badge variant="secondary">
                                Cashier: {selectedCashier}
                            </Badge>
                        )}

                        {selectedType !== "all" && (
                            <Badge variant="secondary">
                                Type: {selectedType}
                            </Badge>
                        )}

                        {date?.from ||
                        date?.to ||
                        selectedCashier !== "all" ||
                        selectedType !== "all" ? (
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={clearFilters}
                            >
                                Clear all
                            </Button>
                        ) : (
                            <p className="text-sm">None</p>
                        )}
                    </div>
                )}

                {/* Order count indicator */}
                <div className="text-sm text-muted-foreground">
                    Showing {filteredOrders.length} of {orders.length} orders
                </div>
            </div>

            <DataTable
                columns={isAdmin ? columns : cashierColumns}
                data={filteredOrders}
            />
        </Layout>
    );
};

export default Index;
