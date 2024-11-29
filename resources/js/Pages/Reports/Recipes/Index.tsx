import Layout from "@/Layouts/Layout";
import { Head } from "@inertiajs/react";
import { DataTable } from "./data-table";
import { columns } from "./columns";
import { RecipeLog } from "@/types";

type Props = {
    recipeLogs: RecipeLog[];
};
const Index = ({ recipeLogs }: Props) => {
    return (
        <Layout>
            <Head title="Reports" />
            <div>
                <h1 className="text-xl font-medium mb-2">Recipe Logs</h1>
            </div>
            <DataTable columns={columns} data={recipeLogs} />
        </Layout>
    );
};

export default Index;
