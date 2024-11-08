import Layout from "@/Layouts/Layout";
import type { User } from "@/types";
import { DataTable } from "./data-table";
import { columns } from "./columns";

type Props = {
    users: User[];
};

const Index = ({ users }: Props) => {
    return (
        <Layout>
            <h1>Show users table</h1>
            <DataTable columns={columns} data={users} />
        </Layout>
    );
};

export default Index;
