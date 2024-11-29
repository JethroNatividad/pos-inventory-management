import Layout from "@/Layouts/Layout";
import { Recipe } from "@/types";
import { Head } from "@inertiajs/react";
import Items from "./items";

import { ShoppingCart } from "lucide-react";
import { OrderProvider } from "@/contexts/OrderContext";
import Orders from "./orders";
import MobileOrders from "./mobileOrders";

type Props = {
    recipes: Recipe[];
};

const Index = ({ recipes }: Props) => {
    return (
        <Layout>
            <OrderProvider>
                <Head title="POS" />
                <div className="flex space-x-4 min-h-screen h-full">
                    <div className="flex-1">
                        <Items recipes={recipes} />
                    </div>
                    <div className="max-w-14 lg:max-w-sm w-full">
                        <div className="lg:hidden sticky top-16">
                            <MobileOrders />
                        </div>
                        <div className="hidden lg:block sticky top-16">
                            <Orders />
                        </div>
                    </div>
                </div>
            </OrderProvider>
        </Layout>
    );
};

export default Index;
