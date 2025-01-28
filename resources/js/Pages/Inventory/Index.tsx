import Layout from "@/Layouts/Layout";
import { Head, usePage } from "@inertiajs/react";
import { DataTable } from "./data-table";
import { columns } from "./columns";
import type { PageProps, StockEntry } from "@/types";
import { useEffect } from "react";
import { toast } from "sonner";

type Props = {
    stockEntries: StockEntry[];
};

const Index = ({ stockEntries }: Props) => {
    const { flash } = usePage().props;

    useEffect(() => {
        if (flash.message) {
            toast(flash.message);
        }
    }, [flash.message]);

    return (
        <Layout>
            <Head title="Inventory" />
            <h1 className="text-xl font-medium mb-2">Manage Inventory</h1>
            <DataTable columns={columns} data={stockEntries} />
        </Layout>
    );
};

export default Index;
