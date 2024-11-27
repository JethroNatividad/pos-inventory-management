import Layout from "@/Layouts/Layout";
import { Recipe } from "@/types";
import { Head } from "@inertiajs/react";
import Items from "./items";

type Props = {
    recipes: Recipe[];
};

const Index = ({ recipes }: Props) => {
    return (
        <Layout>
            <Head title="POS" />
            <Items recipes={recipes} />
        </Layout>
    );
};

export default Index;
