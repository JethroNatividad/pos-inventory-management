import Layout from "@/Layouts/Layout";
import { Recipe } from "@/types";
import { Head } from "@inertiajs/react";

type Props = {
    recipes: Recipe[];
};

const Index = ({ recipes }: Props) => {
    return (
        <Layout>
            <Head title="POS" />
            POS page
        </Layout>
    );
};

export default Index;
