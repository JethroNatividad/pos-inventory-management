import Layout from "@/Layouts/Layout";
import { Head } from "@inertiajs/react";
import { DataTable } from "./data-table";
import { columns } from "./columns";
import type { Order } from "@/types";
import { Button } from "@/Components/ui/button";
import { Download, CalendarIcon } from "lucide-react";
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

type Props = {
    orders: Order[];
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

const Index = ({ orders }: Props) => {
    const [date, setDate] = useState<DateRange | undefined>({
        from: addDays(new Date(), -30),
        to: new Date(),
    });
    const [activePeriod, setActivePeriod] = useState<Period>("1m");
    const [filteredOrders, setFilteredOrders] = useState<Order[]>(orders);
    const [numberOfMonths, setNumberMonths] = useState(
        window.innerWidth >= 640 ? 2 : 1
    );

    // Handle window resize for calendar display
    useEffect(() => {
        const handleResize = () => {
            setNumberMonths(window.innerWidth >= 640 ? 2 : 1);
        };

        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    // Filter orders based on date range
    useEffect(() => {
        if (!date?.from && !date?.to) {
            setFilteredOrders(orders);
            return;
        }

        const filtered = orders.filter((order) => {
            const orderDate = new Date(order.created_at);

            if (date.from && date.to) {
                return orderDate >= date.from && orderDate <= date.to;
            } else if (date.from) {
                return orderDate >= date.from;
            } else if (date.to) {
                return orderDate <= date.to;
            }

            return true;
        });

        setFilteredOrders(filtered);
    }, [date, orders]);

    const handlePeriodChange = (period: Period) => {
        setActivePeriod(period);
        setDate(getDateRangeForPeriod(period));
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

        // Convert data to CSV rows - use filtered orders
        const rows = filteredOrders.map((order) => [
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
                {/* Date range picker */}
                <div>
                    <Popover>
                        <PopoverTrigger asChild>
                            <Button
                                variant="outline"
                                className={cn(
                                    "w-full sm:w-[300px] justify-start text-left font-normal",
                                    !date && "text-muted-foreground"
                                )}
                            >
                                <CalendarIcon className="mr-2 h-4 w-4 flex-shrink-0" />
                                {date?.from ? (
                                    date.to ? (
                                        <>
                                            {format(date.from, "LLL dd, y")} -{" "}
                                            {format(date.to, "LLL dd, y")}
                                        </>
                                    ) : (
                                        format(date.from, "LLL dd, y")
                                    )
                                ) : (
                                    <span>All time</span>
                                )}
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
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
            </div>
            <DataTable columns={columns} data={filteredOrders} />
        </Layout>
    );
};

export default Index;
