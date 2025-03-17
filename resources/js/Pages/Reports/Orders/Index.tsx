import Layout from "@/Layouts/Layout";
import { Head } from "@inertiajs/react";
import { DataTable } from "./data-table";
import { columns } from "./columns";
import type { Order } from "@/types";
import { Button } from "@/Components/ui/button";
import { Download } from "lucide-react";

type Props = {
    orders: Order[];
};

const Index = ({ orders }: Props) => {
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

        // Convert data to CSV rows
        const rows = orders.map((order) => [
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
        link.setAttribute(
            "download",
            `order-logs-${new Date().toISOString().split("T")[0]}.csv`
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
            <DataTable columns={columns} data={orders} />
        </Layout>
    );
};

export default Index;
