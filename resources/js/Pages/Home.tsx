import React from "react";
import Layout from "@/Layouts/Layout";
import { Head, Link } from "@inertiajs/react";
import { StockEntry } from "@/types";
import { Button } from "@/Components/ui/button";
import { StatisticChart } from "./chart";

type Props = {
    lowStocks: StockEntry[];
};

const Home = ({ lowStocks }: Props) => {
    return (
        <Layout>
            <Head title="Dashboard" />

            <div className="grid grid-cols-12 gap-4">
                <div className="border rounded-lg col-span-12 lg:col-span-5 p-2">
                    <h1 className="text-xl font-medium">Inventory Status</h1>
                    <div className="space-y-4">
                        <p className="text-lg">Low Stock Alerts</p>
                        {lowStocks?.map((stock) => (
                            <div
                                key={stock.id}
                                className="border rounded-lg p-2 flex items-center justify-between"
                            >
                                <p>{stock.name}</p>
                                <p className="text-red-700">
                                    {stock.quantity}
                                    {stock.unit} left
                                </p>
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
                    {/* <div>
                        <p>Expiring Stocks</p>
                    </div> */}
                </div>
                <div className="border rounded-lg col-span-12 lg:col-span-7">
                    <StatisticChart />
                </div>
            </div>
        </Layout>
    );
};

export default Home;
