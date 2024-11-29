import Layout from "@/Layouts/Layout";
import { Head } from "@inertiajs/react";
import { DataTable } from "./data-table";
import { columns } from "./columns";
import type { Order } from "@/types";

type Props = {
    orders: Order[];
};

const Index = ({ orders }: Props) => {
    return (
        <Layout>
            <Head title="Reports" />
            <div>
                <h1 className="text-xl font-medium mb-2">Recipe Logs</h1>
            </div>
            <DataTable columns={columns} data={orders} />
        </Layout>
    );
};

export default Index;
