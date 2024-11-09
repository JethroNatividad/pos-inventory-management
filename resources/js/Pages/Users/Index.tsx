import Layout from "@/Layouts/Layout";
import type { Role, User } from "@/types";
import { DataTable } from "./data-table";
import { columns } from "./columns";

type Props = {
    users: User[];
    roles: Role[];
};

const Index = ({ users, roles }: Props) => {
    return (
        <Layout>
            <h1 className="text-xl font-medium mb-2">Manage Users</h1>
            <DataTable roles={roles} columns={columns} data={users} />
        </Layout>
    );
};

export default Index;
