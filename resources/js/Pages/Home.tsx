import React, { useEffect, useState } from "react";
import Layout from "@/Layouts/Layout";
import { Head, Link } from "@inertiajs/react";
import { Order, Stock, StockEntry } from "@/types";
import { Button } from "@/Components/ui/button";
import { differenceInDays, differenceInMilliseconds, parseISO } from "date-fns";
import SalesChart from "./sales-chart";
import axios from "axios";
import MyBarChart from "./bar-chart";
import SalesOverview from "@/Components/sales-overview";

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
    orders: Order[];
};

const Home = ({ lowStocks, expiringStocks, orders }: Props) => {
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
                    <SalesOverview orders={orders} />
                </div>
            </div>
        </Layout>
    );
};

export default Home;
