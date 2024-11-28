import Layout from "@/Layouts/Layout";
import { Recipe } from "@/types";
import { Head } from "@inertiajs/react";
import Items from "./items";
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from "@/Components/ui/sheet";
import { Button } from "@/Components/ui/button";
import { ShoppingCart } from "lucide-react";
import { OrderProvider } from "@/contexts/orderContext";
import Orders from "./orders";

type Props = {
    recipes: Recipe[];
};

const Index = ({ recipes }: Props) => {
    return (
        <Layout>
            <OrderProvider>
                <Head title="POS" />
                <div className="flex space-x-4 h-full">
                    <div className="flex-1">
                        <Items recipes={recipes} />
                    </div>
                    <div className="max-w-14 lg:max-w-sm w-full">
                        <div className="md:hidden">
                            <Sheet>
                                <SheetTrigger asChild>
                                    <Button variant="outline" size="icon">
                                        <ShoppingCart />
                                    </Button>
                                </SheetTrigger>
                                <SheetContent>
                                    <SheetHeader>
                                        <SheetTitle>Cart</SheetTitle>
                                        <SheetDescription>
                                            Cart Contents!
                                        </SheetDescription>
                                    </SheetHeader>
                                </SheetContent>
                            </Sheet>
                        </div>
                        <div className="hidden md:block">
                            <Orders />
                        </div>
                    </div>
                </div>
            </OrderProvider>
        </Layout>
    );
};

export default Index;
