import SalesOverview from "@/Components/sales-overview";
import Layout from "@/Layouts/Layout";
import { Recipe } from "@/types";
import { Head, Link } from "@inertiajs/react";

type Props = {
    recipes: Recipe[];
};

const Index = ({ recipes }: Props) => {
    return (
        <Layout>
            <Head title="Sales" />
            <div className="space-y-4">
                <div className="border rounded-lg p-4 space-y-4">
                    <SalesOverview />
                </div>
                <div className="border rounded-lg p-4 space-y-4">
                    <div className="mb-6">
                        <h1 className="text-xl font-medium">
                            Recipe Sales Overview
                        </h1>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {recipes.map((recipe) => (
                            <Link
                                key={recipe.id}
                                href={route("sales.recipes.index", {
                                    recipe: recipe.id,
                                })}
                                className="block p-6 bg-white hover:bg-gray-50 rounded-lg border transition duration-150 ease-in-out"
                            >
                                <div className="space-y-2">
                                    <h2 className="text-lg font-medium text-gray-900">
                                        {recipe.name}
                                    </h2>
                                    <p className="text-sm text-gray-500">
                                        {recipe.description}
                                    </p>
                                    <div className="flex items-center text-sm text-gray-600">
                                        <span>View sales details →</span>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>
            </div>
        </Layout>
    );
};

export default Index;
