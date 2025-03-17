import Layout from "@/Layouts/Layout";
import { Head } from "@inertiajs/react";
import { DataTable } from "./data-table";
import { columns } from "./columns";
import { RecipeLog } from "@/types";
import { Button } from "@/Components/ui/button";
import { Download } from "lucide-react";

type Props = {
    recipeLogs: RecipeLog[];
};

const Index = ({ recipeLogs }: Props) => {
    const exportToCSV = () => {
        // Define headers for CSV file
        const headers = ["Date", "Time", "User", "Recipe", "Action"];

        // Convert data to CSV rows
        const rows = recipeLogs.map((log) => [
            new Date(log.created_at).toLocaleString(),
            `${log.user.first_name}${
                log.user.middle_name ? " " + log.user.middle_name : ""
            } ${log.user.last_name}`,
            log.recipe.name,
            log.action,
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
            `recipe-logs-${new Date().toISOString().split("T")[0]}.csv`
        );
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <Layout>
            <Head title="Reports" />
            <div className="flex justify-between items-center mb-4">
                <h1 className="text-xl font-medium">Recipe Logs</h1>
                <Button
                    onClick={exportToCSV}
                    variant="outline"
                    className="flex items-center gap-2"
                >
                    <Download className="w-4 h-4" />
                    Export CSV
                </Button>
            </div>
            <DataTable columns={columns} data={recipeLogs} />
        </Layout>
    );
};

export default Index;
