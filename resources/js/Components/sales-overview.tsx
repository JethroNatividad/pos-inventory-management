import { Order, OrderStats } from "@/types";
import { useEffect, useState } from "react";
import { DateRange } from "react-day-picker";
import { addDays, format, set } from "date-fns";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { Button } from "./ui/button";
import { CalendarIcon } from "lucide-react";
import { Calendar } from "./ui/calendar";
import { cn } from "@/lib/utils";
import {
    ChartConfig,
    ChartContainer,
    ChartLegend,
    ChartLegendContent,
    ChartTooltip,
    ChartTooltipContent,
} from "./ui/chart";
import { Area, AreaChart, CartesianGrid, XAxis } from "recharts";
import { Skeleton } from "./ui/skeleton";

type Period = "24h" | "7d" | "1m" | "1y" | "max";

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
        case "max":
            return {
                from: new Date(0),
                to: now,
            };
    }
};

const chartConfig = {
    total_orders: {
        label: "Orders",
        color: "hsl(var(--chart-1))",
    },
} satisfies ChartConfig;

const SalesOverview = () => {
    const [date, setDate] = useState<DateRange | undefined>({
        from: addDays(new Date(), -30),
        to: new Date(),
    });
    const [activePeriod, setActivePeriod] = useState<Period>("1m");

    const [error, setError] = useState<string | null>(null);
    const [statsLoading, setStatsLoading] = useState(true);
    const [stats, setStats] = useState<OrderStats | null>(null);
    const [numberOfMonths, setNumberMonths] = useState(
        window.innerWidth >= 640 ? 2 : 1
    );

    useEffect(() => {
        const fetchStats = async () => {
            if (!date?.from || !date?.to) return;
            setStatsLoading(true);
            setError(null);

            try {
                const response = await fetch(
                    `/api/order-stats?from=${date.from.toISOString()}&to=${date.to.toISOString()}`
                );
                if (!response.ok) {
                    throw new Error("Failed to fetch stats");
                }
                const data = await response.json();
                setStats(data);
            } catch (err) {
                setError(
                    err instanceof Error ? err.message : "An error occurred"
                );
            } finally {
                setStatsLoading(false);
            }
        };

        fetchStats();
    }, [date]);

    useEffect(() => {
        const handleResize = () => {
            setNumberMonths(window.innerWidth >= 640 ? 2 : 1);
        };

        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    const handlePeriodChange = (period: Period) => {
        setActivePeriod(period);
        setDate(getDateRangeForPeriod(period));
    };

    const StatCard = ({ title, value }: { title: string; value: string }) => (
        <div className="p-4 border rounded-lg">
            <h3 className="text-sm text-muted-foreground">{title}</h3>
            {statsLoading ? (
                <Skeleton className="h-8 w-24 mt-1" />
            ) : (
                <p className="text-2xl font-medium">{value}</p>
            )}
        </div>
    );

    return (
        <div>
            <div className="mb-6">
                <h1 className="text-xl font-medium">Sales Overview</h1>
            </div>
            <div className="space-y-4">
                <div>
                    <Popover>
                        <PopoverTrigger asChild>
                            <Button
                                variant={"outline"}
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
                                    <span>Pick a date range</span>
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
                <div className="flex border rounded-lg w-fit p-1 flex-wrap gap-2">
                    <Button
                        variant={activePeriod === "24h" ? "default" : "ghost"}
                        onClick={() => handlePeriodChange("24h")}
                    >
                        24h
                    </Button>
                    <Button
                        variant={activePeriod === "7d" ? "default" : "ghost"}
                        onClick={() => handlePeriodChange("7d")}
                    >
                        7d
                    </Button>
                    <Button
                        variant={activePeriod === "1m" ? "default" : "ghost"}
                        onClick={() => handlePeriodChange("1m")}
                    >
                        1m
                    </Button>
                    <Button
                        variant={activePeriod === "1y" ? "default" : "ghost"}
                        onClick={() => handlePeriodChange("1y")}
                    >
                        1y
                    </Button>
                    <Button
                        variant={activePeriod === "max" ? "default" : "ghost"}
                        onClick={() => handlePeriodChange("max")}
                    >
                        Max
                    </Button>
                </div>

                <div>
                    {statsLoading ? (
                        <Skeleton className="h-[250px] w-full" />
                    ) : (
                        <ChartContainer
                            config={chartConfig}
                            className="aspect-auto h-[250px] w-full"
                        >
                            <AreaChart data={stats?.daily_stats}>
                                <defs>
                                    <linearGradient
                                        id="fillTotalOrders"
                                        x1="0"
                                        y1="0"
                                        x2="0"
                                        y2="1"
                                    >
                                        <stop
                                            offset="5%"
                                            stopColor="var(--color-total_orders)"
                                            stopOpacity={0.8}
                                        />
                                        <stop
                                            offset="95%"
                                            stopColor="var(--color-total_orders)"
                                            stopOpacity={0.1}
                                        />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid vertical={false} />
                                <XAxis
                                    dataKey="date"
                                    tickLine={false}
                                    axisLine={false}
                                    tickMargin={8}
                                    minTickGap={32}
                                    tickFormatter={(value) => {
                                        if (activePeriod === "24h") {
                                            const date = new Date(value);
                                            return date.toLocaleTimeString(
                                                "en-US",
                                                {
                                                    hour: "numeric",
                                                    minute: "numeric",
                                                }
                                            );
                                        }

                                        const date = new Date(value);
                                        return date.toLocaleDateString(
                                            "en-US",
                                            {
                                                month: "short",
                                                day: "numeric",
                                            }
                                        );
                                    }}
                                />
                                <ChartTooltip
                                    cursor={false}
                                    content={
                                        <ChartTooltipContent
                                            labelFormatter={(value) => {
                                                return new Date(
                                                    value
                                                ).toLocaleDateString("en-US", {
                                                    month: "short",
                                                    day: "numeric",
                                                    year: "numeric",
                                                    hour: "numeric",
                                                    minute: "numeric",
                                                    second: "numeric",
                                                });
                                            }}
                                            indicator="dot"
                                        />
                                    }
                                />
                                <Area
                                    dataKey="total_orders"
                                    type="natural"
                                    fill="url(#fillTotalOrders)"
                                    stroke="var(--color-total_orders)"
                                    stackId="a"
                                />

                                <ChartLegend
                                    accumulate="sum"
                                    additive="sum"
                                    content={<ChartLegendContent />}
                                />
                            </AreaChart>
                        </ChartContainer>
                    )}
                </div>
                <div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mb-6">
                        <StatCard
                            title="Total Orders"
                            value={
                                stats?.financial_summary.totalOrders.toString() ??
                                "0"
                            }
                        />
                        <StatCard
                            title="Total Revenue"
                            value={`₱${
                                stats?.financial_summary.totalRevenue.toLocaleString(
                                    "fil-PH",
                                    { minimumFractionDigits: 2 }
                                ) ?? "0.00"
                            }`}
                        />
                        <StatCard
                            title="Total Cost"
                            value={`₱${
                                stats?.financial_summary.totalCost.toLocaleString(
                                    "fil-PH",
                                    { minimumFractionDigits: 2 }
                                ) ?? "0.00"
                            }`}
                        />
                        <StatCard
                            title="Total Income"
                            value={`₱${
                                stats?.financial_summary.totalIncome.toLocaleString(
                                    "fil-PH",
                                    { minimumFractionDigits: 2 }
                                ) ?? "0.00"
                            }`}
                        />
                    </div>
                </div>

                <div className="mt-8">
                    <h2 className="text-lg font-medium mb-4">
                        Top Selling Items
                    </h2>
                    <div className="mt-8">
                        <h2 className="text-lg font-medium mb-4">
                            Top Selling Items
                        </h2>
                        <div className="border rounded-lg overflow-hidden">
                            {statsLoading ? (
                                <div className="p-4 space-y-4">
                                    {[1, 2, 3].map((i) => (
                                        <Skeleton
                                            key={i}
                                            className="h-12 w-full"
                                        />
                                    ))}
                                </div>
                            ) : (
                                <div className="overflow-x-auto">
                                    <table className="w-full min-w-[500px]">
                                        <thead>
                                            <tr className="border-b bg-muted/50">
                                                <th className="text-left p-4">
                                                    Item Name
                                                </th>
                                                <th className="text-right p-4">
                                                    Quantity Sold
                                                </th>
                                                <th className="text-right p-4">
                                                    Total Revenue
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {stats?.top_selling_items.map(
                                                (item, index) => (
                                                    <tr
                                                        key={index}
                                                        className="border-b last:border-0"
                                                    >
                                                        <td className="p-4">
                                                            {item.name}
                                                        </td>
                                                        <td className="text-right p-4">
                                                            {item.quantitySold}
                                                        </td>
                                                        <td className="text-right p-4">
                                                            ₱
                                                            {item.totalRevenue.toLocaleString(
                                                                "fil-PH",
                                                                {
                                                                    minimumFractionDigits: 2,
                                                                }
                                                            )}
                                                        </td>
                                                    </tr>
                                                )
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SalesOverview;
