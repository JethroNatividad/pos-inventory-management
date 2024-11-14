import Layout from "@/Layouts/Layout";
import type { Recipe } from "@/types";
import { Head } from "@inertiajs/react";
import { DataTable } from "./data-table";
import { columns } from "./columns";

type Props = {
    recipes: Recipe[];
};

const Index = ({ recipes }: Props) => {
    return (
        <Layout>
            <Head title="Recipes" />
            <h1 className="text-xl font-medium mb-2">Manage Recipes</h1>
            <DataTable columns={columns} data={recipes} />
        </Layout>
    );
};

export default Index;
