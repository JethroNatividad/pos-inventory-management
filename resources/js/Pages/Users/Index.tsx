import Layout from "@/Layouts/Layout";
import type { User } from "@/types";

type Props = {
    users: User[];
};

const Index = ({ users }: Props) => {
    return (
        <Layout>
            <h1>Show users table</h1>
            {JSON.stringify(users)}
        </Layout>
    );
};

export default Index;
