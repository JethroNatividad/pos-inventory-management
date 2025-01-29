import Layout from "@/Layouts/Layout";
import { Head, router, usePage } from "@inertiajs/react";
import { DataTable } from "./data-table";
import { columns } from "./columns";
import type { PageProps, StockEntry } from "@/types";
import { useEffect } from "react";
import { toast } from "sonner";

type Props = {
    stockEntries: StockEntry[];
};

const Index = ({ stockEntries }: Props) => {
    const { toast: flashToast } = usePage().props;

    useEffect(() => {
        if (flashToast?.message) {
            toast(flashToast.message, {
                description: flashToast.description,
                action: flashToast.action
                    ? {
                          label: flashToast.action.label,
                          onClick: () =>
                              flashToast.action &&
                              router.visit(flashToast.action.url),
                      }
                    : undefined,
            });
        }
    }, [flashToast]);

    return (
        <Layout>
            <Head title="Inventory" />
            <h1 className="text-xl font-medium mb-2">Manage Inventory</h1>
            <DataTable columns={columns} data={stockEntries} />
        </Layout>
    );
};

export default Index;
