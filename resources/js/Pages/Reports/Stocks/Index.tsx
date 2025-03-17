import Layout from "@/Layouts/Layout";
import type { StockActivityLog, StockEntryLog } from "@/types";
import { Head } from "@inertiajs/react";
import { DataTable as StockEntryLogsDataTable } from "./StockEntry/data-table";
import { columns as stockEntryLogsColumns } from "./StockEntry/columns";
import { DataTable as StockLogsDataTable } from "./Stock/data-table";
import { columns as stockLogsColumns } from "./Stock/columns";
import { Button } from "@/Components/ui/button";
import { Download } from "lucide-react";

type Props = {
    stockEntryLogs: StockEntryLog[];
    stockActivityLogs: StockActivityLog[];
};

const Index = ({ stockEntryLogs, stockActivityLogs }: Props) => {
    const exportStockEntryLogsToCSV = () => {
        // Define headers for CSV file
        const headers = ["Date", "Time", "Action", "User", "Stock Entry"];

        // Convert data to CSV rows
        const rows = stockEntryLogs.map((log) => [
            new Date(log.created_at).toLocaleString(),
            log.action,
            `${log.user.first_name}${
                log.user.middle_name ? " " + log.user.middle_name : ""
            } ${log.user.last_name}` || "N/A",
            log.stock_entry?.name || "N/A",
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
            `stock-entry-logs-${new Date().toISOString().split("T")[0]}.csv`
        );
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const exportStockActivityLogsToCSV = () => {
        // Define headers for CSV file
        const headers = [
            "Date",
            "Time",
            "Action",
            "User",
            "Reason",
            "Stock Entry",
            "Quantity",
            "Price",
            "Batch Label",
            "Expiry Date",
            "Is Perishable",
        ];

        // Convert data to CSV rows
        const rows = stockActivityLogs.map((log) => [
            new Date(log.created_at).toLocaleString(),
            log.action,
            `${log.user.first_name}${
                log.user.middle_name ? " " + log.user.middle_name : ""
            } ${log.user.last_name}` || "N/A",
            log.reason || "N/A",
            log.stock?.stock_entry?.name || "N/A",
            `${log.quantity || 0}${log.stock?.stock_entry?.unit || ""}`,
            log.price ? `₱ ${log.price}` : "N/A",
            log.batch_label || "N/A",
            log.expiry_date || "N/A",
            log.stock?.stock_entry?.perishable ? "Yes" : "No",
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
            `stock-activity-logs-${new Date().toISOString().split("T")[0]}.csv`
        );
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <Layout>
            <Head title="Reports" />
            <div className="flex justify-between items-center mb-4">
                <h1 className="text-xl font-medium">Stock Entry Logs</h1>
                <Button
                    onClick={exportStockEntryLogsToCSV}
                    variant="outline"
                    className="flex items-center gap-2"
                >
                    <Download className="w-4 h-4" />
                    Export CSV
                </Button>
            </div>
            <StockEntryLogsDataTable
                columns={stockEntryLogsColumns}
                data={stockEntryLogs}
            />

            <div className="flex justify-between items-center mb-4 mt-8">
                <h1 className="text-xl font-medium">Stock Logs</h1>
                <Button
                    onClick={exportStockActivityLogsToCSV}
                    variant="outline"
                    className="flex items-center gap-2"
                >
                    <Download className="w-4 h-4" />
                    Export CSV
                </Button>
            </div>
            <StockLogsDataTable
                columns={stockLogsColumns}
                data={stockActivityLogs}
            />
        </Layout>
    );
};

export default Index;
