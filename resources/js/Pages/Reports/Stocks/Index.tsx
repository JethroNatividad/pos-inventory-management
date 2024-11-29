import Layout from "@/Layouts/Layout";
import type { StockActivityLog, StockEntryLog } from "@/types";
import { Head } from "@inertiajs/react";
import { DataTable as StockEntryLogsDataTable } from "./StockEntry/data-table";
import { columns as stockEntryLogsColumns } from "./StockEntry/columns";
import { DataTable as StockLogsDataTable } from "./Stock/data-table";
import { columns as stockLogsColumns } from "./Stock/columns";

type Props = {
    stockEntryLogs: StockEntryLog[];
    stockActivityLogs: StockActivityLog[];
};

const Index = ({ stockEntryLogs, stockActivityLogs }: Props) => {
    return (
        <Layout>
            <Head title="Reports" />
            <div>
                <h1 className="text-xl font-medium mb-2">Stock Entry Logs</h1>
            </div>
            <StockEntryLogsDataTable
                columns={stockEntryLogsColumns}
                data={stockEntryLogs}
            />

            <div>
                <h1 className="text-xl font-medium mb-2">Stock Logs</h1>
            </div>
            <StockLogsDataTable
                columns={stockLogsColumns}
                data={stockActivityLogs}
            />
        </Layout>
    );
};

export default Index;
