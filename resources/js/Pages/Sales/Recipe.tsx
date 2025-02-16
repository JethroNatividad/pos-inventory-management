import SalesOverview from "@/Components/sales-overview";
import Layout from "@/Layouts/Layout";
import { Recipe as RecipeType } from "@/types";
import { Head } from "@inertiajs/react";
import RecipeSalesOverview from "./recipe-sales-overview";

type Props = {
    recipe: RecipeType;
};

const Recipe = (props: Props) => {
    return (
        <Layout>
            <Head title="Sales" />
            <div className="space-y-4">
                <div className="border rounded-lg p-4 space-y-4">
                    <RecipeSalesOverview recipe={props.recipe} />
                </div>
            </div>
        </Layout>
    );
};

export default Recipe;
