import React, { useEffect, useState } from "react";
import Layout from "@/Layouts/Layout";
import { Head, Link } from "@inertiajs/react";
import { Order, Stock, StockEntry } from "@/types";
import { Button } from "@/Components/ui/button";
import { differenceInDays, differenceInMilliseconds, parseISO } from "date-fns";
import SalesChart from "./sales-chart";
import axios from "axios";
import MyBarChart from "./bar-chart";

type SalesData = {
    label: string;
    count: number;
};

type SalesTotal = {
    daily: number;
    weekly: number;
    monthly: number;
    yearly: number;
    allTime: number;
};

type Props = {
    lowStocks: StockEntry[];
    expiringStocks: Stock[];
    // hourlySales: SalesData[];
    // dailySales: SalesData[];
    // weeklySales: SalesData[];
    // monthlySales: SalesData[];
    // allTimeSales: SalesData[];
    // topFiveSellingItems: {
    //     daily: SalesData[];
    //     weekly: SalesData[];
    //     monthly: SalesData[];
    //     yearly: SalesData[];
    //     allTime: SalesData[];
    // };

    // revenue: SalesTotal;
    // expenses: SalesTotal;
    // income: SalesTotal;
};

const Home = ({
    lowStocks,
    expiringStocks,
}: // hourlySales,
// dailySales,
// weeklySales,
// monthlySales,
// allTimeSales,
// topFiveSellingItems,
// revenue,
// expenses,
// income,
Props) => {
    // Fix this
    const [range, setRange] = useState<
        "today" | "week" | "month" | "year" | "all"
    >("today");
    return (
        <Layout>
            <Head title="Dashboard" />
            <div className="grid grid-cols-12 gap-4">
                <div className="border rounded-lg col-span-12 lg:col-span-5 p-4 space-y-4">
                    <h1 className="text-xl font-medium">Inventory Status</h1>
                    <div className="space-y-4">
                        <p className="text-lg">Low Stocks</p>
                        {lowStocks?.length === 0 && <p>No low stocks</p>}
                        {lowStocks?.map((stock) => (
                            <div
                                key={stock.id}
                                className="border rounded-lg p-2 flex items-center justify-between"
                            >
                                <div className="flex items-center space-x-2">
                                    <p>{stock.name}</p>
                                    <p className="text-red-700">
                                        {stock.quantity}
                                        {stock.unit} left
                                    </p>
                                </div>
                                <Button asChild>
                                    <Link
                                        href={route("stock.create", stock.id)}
                                    >
                                        Add Stock
                                    </Link>
                                </Button>
                            </div>
                        ))}
                    </div>

                    <div className="space-y-4">
                        <p className="text-lg">Expiring Stocks</p>
                        {expiringStocks?.length === 0 && (
                            <p>No expiring stocks</p>
                        )}
                        {expiringStocks?.map((stock) => (
                            <div
                                key={stock.id}
                                className="border rounded-lg p-2"
                            >
                                <div className="flex items-center space-x-2">
                                    <p>{stock.stock_entry.name}</p>
                                    <p className="text-red-700">
                                        {stock.quantity}
                                        {stock.stock_entry.unit}
                                    </p>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <p>{stock.batch_label}</p>
                                    <p>
                                        <span className="text-red-700">
                                            {(() => {
                                                const diffInMs =
                                                    differenceInMilliseconds(
                                                        parseISO(
                                                            stock.expiry_date ||
                                                                ""
                                                        ),
                                                        new Date()
                                                    );
                                                const days = Math.floor(
                                                    diffInMs /
                                                        (1000 * 60 * 60 * 24)
                                                );
                                                const hours = Math.floor(
                                                    (diffInMs %
                                                        (1000 * 60 * 60 * 24)) /
                                                        (1000 * 60 * 60)
                                                );
                                                const daysLabel =
                                                    days === 1 ? "day" : "days";
                                                const hoursLabel =
                                                    hours === 1
                                                        ? "hour"
                                                        : "hours";
                                                return `${days} ${daysLabel} ${hours} ${hoursLabel} remaining`;
                                            })()}
                                        </span>
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
                <div className="border rounded-lg col-span-12 lg:col-span-7 p-4 space-y-4">
                    <h1 className="text-xl font-medium">Sales Overview</h1>
                    <div className="flex border rounded-lg w-fit p-1 flex-wrap gap-2">
                        <Button
                            variant={range === "today" ? "default" : "ghost"}
                            onClick={() => setRange("today")}
                        >
                            Today
                        </Button>
                        <Button
                            variant={range === "week" ? "default" : "ghost"}
                            onClick={() => setRange("week")}
                        >
                            This Week
                        </Button>
                        <Button
                            variant={range === "month" ? "default" : "ghost"}
                            onClick={() => setRange("month")}
                        >
                            This Month
                        </Button>
                        <Button
                            variant={range === "year" ? "default" : "ghost"}
                            onClick={() => setRange("year")}
                        >
                            This Year
                        </Button>
                        <Button
                            variant={range === "all" ? "default" : "ghost"}
                            onClick={() => setRange("all")}
                        >
                            All Time
                        </Button>
                    </div>
                    {/* <SalesChart
                        data={
                            range === "today"
                                ? hourlySales
                                : range === "week"
                                ? dailySales
                                : range === "month"
                                ? weeklySales
                                : range === "year"
                                ? monthlySales
                                : allTimeSales
                        }
                    /> */}

                    <p className="text-lg">Top Selling Items</p>

                    {/* <MyBarChart
                        data={
                            topFiveSellingItems[
                                range === "today"
                                    ? "daily"
                                    : range === "week"
                                    ? "weekly"
                                    : range === "month"
                                    ? "monthly"
                                    : range === "year"
                                    ? "yearly"
                                    : "allTime"
                            ]
                        }
                    /> */}

                    {/* <div className="border rounded-lg p-4">
                        <p>Total Revenue</p>
                        <p className="text-xl">
                            ₱
                            {revenue[
                                range === "today"
                                    ? "daily"
                                    : range === "week"
                                    ? "weekly"
                                    : range === "month"
                                    ? "monthly"
                                    : range === "year"
                                    ? "yearly"
                                    : "allTime"
                            ] || "0.00"}
                        </p>
                    </div>
                    <div className="border rounded-lg p-4">
                        <p>Total Expenses</p>
                        <p className="text-xl">
                            ₱
                            {expenses[
                                range === "today"
                                    ? "daily"
                                    : range === "week"
                                    ? "weekly"
                                    : range === "month"
                                    ? "monthly"
                                    : range === "year"
                                    ? "yearly"
                                    : "allTime"
                            ].toFixed(2)}
                        </p>
                    </div>

                    <div className="border rounded-lg p-4">
                        <p>Total Income</p>
                        <p className="text-xl">
                            ₱
                            {income[
                                range === "today"
                                    ? "daily"
                                    : range === "week"
                                    ? "weekly"
                                    : range === "month"
                                    ? "monthly"
                                    : range === "year"
                                    ? "yearly"
                                    : "allTime"
                            ].toFixed(2)}
                        </p>
                    </div> */}
                </div>
            </div>
        </Layout>
    );
};

export default Home;
