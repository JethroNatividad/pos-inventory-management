import Layout from "@/Layouts/Layout";
import { Head } from "@inertiajs/react";
import { DataTable } from "./data-table";
import { columns } from "./columns";
import type { StockEntry } from "@/types";
import { useToast } from "@/hooks/use-toast";

type Props = {
    stockEntries: StockEntry[];
};

const Index = ({ stockEntries }: Props) => {
    useToast();

    return (
        <Layout>
            <Head title="Inventory" />
            <h1 className="text-xl font-medium mb-2">Manage Inventory</h1>
            <DataTable columns={columns} data={stockEntries} />
        </Layout>
    );
};

export default Index;
