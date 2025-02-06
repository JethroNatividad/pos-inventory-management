import { Order } from "@/types";
import React, { act, useState } from "react";
import { DateRange } from "react-day-picker";
import { addDays, format } from "date-fns";
import { Card, CardContent, CardHeader } from "./ui/card";
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
import orders from "@/Pages/POS/orders";

type Props = {
    orders: Order[];
};

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

const SalesOverview = ({ orders }: Props) => {
    console.log(orders);
    const [date, setDate] = useState<DateRange | undefined>({
        from: addDays(new Date(), -30),
        to: new Date(),
    });
    const [activePeriod, setActivePeriod] = useState<Period>("1m");

    const handlePeriodChange = (period: Period) => {
        setActivePeriod(period);
        setDate(getDateRangeForPeriod(period));
    };

    const filteredData = orders
        .filter((order) => {
            const orderDate = new Date(order.created_at);
            return (
                date?.from &&
                date?.to &&
                orderDate >= new Date(date.from.setHours(0, 0, 0, 0)) &&
                orderDate <= new Date(date.to.setHours(23, 59, 59, 999))
            );
        })
        .reduce((acc, order) => {
            const orderDate = new Date(order.created_at);
            // Normalize to midnight for consistent date grouping
            const dateStr = new Date(orderDate).toISOString();
            console.log(dateStr);

            const existing = acc.find((item) => item.date === dateStr);
            if (existing) {
                existing.total_orders += order.items.reduce(
                    (total, item) => total + item.quantity,
                    0
                );
            } else {
                acc.push({
                    date: dateStr,
                    total_orders: order.items.reduce(
                        (total, item) => total + item.quantity,
                        0
                    ),
                    originalDate: order.created_at, // Store original date for tooltip
                });
            }
            return acc;
        }, [] as { date: string; total_orders: number; originalDate: string }[])
        .sort(
            (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
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
                                    "w-[300px] justify-start text-left font-normal",
                                    !date && "text-muted-foreground"
                                )}
                            >
                                <CalendarIcon className="mr-2 h-4 w-4" />
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
                                numberOfMonths={2}
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
                    <ChartContainer
                        config={chartConfig}
                        className="aspect-auto h-[250px] w-full"
                    >
                        <AreaChart data={filteredData}>
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
                                    return date.toLocaleDateString("en-US", {
                                        month: "short",
                                        day: "numeric",
                                    });
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
                </div>
            </div>
        </div>
    );
};

export default SalesOverview;
