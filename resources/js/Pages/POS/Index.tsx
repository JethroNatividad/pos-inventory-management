import Layout from "@/Layouts/Layout";
import { Recipe } from "@/types";
import { Head } from "@inertiajs/react";
import Items from "./items";
import Basket from "./basket";
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from "@/Components/ui/sheet";
import { Button } from "@/Components/ui/button";
import { ShoppingBag, ShoppingCart } from "lucide-react";
import { OrderProvider } from "@/contexts/orderContext";

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
                    <div className="max-w-14 md:max-w-sm w-full">
                        <div className="md:hidden">
                            <Sheet>
                                <SheetTrigger>
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
                            <Basket />
                        </div>
                    </div>
                </div>
            </OrderProvider>
        </Layout>
    );
};

export default Index;
