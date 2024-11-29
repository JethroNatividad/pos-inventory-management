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
import Orders from "./orders";
import { useOrder } from "@/contexts/OrderContext";

const MobileOrders = () => {
    const { orders } = useOrder();
    return (
        <Sheet>
            <div className="relative">
                {orders.length > 0 && (
                    <div className="absolute -top-2 right-2 bg-red-500 text-white text-xs flex items-center justify-center rounded-full size-5">
                        <p>{orders.length}</p>
                    </div>
                )}
                <SheetTrigger asChild>
                    <Button variant="outline" size="icon">
                        <ShoppingCart />
                    </Button>
                </SheetTrigger>
            </div>
            <SheetContent className="w-full">
                <SheetHeader>
                    <div className="mt-4">
                        <Orders />
                    </div>
                </SheetHeader>
            </SheetContent>
        </Sheet>
    );
};

export default MobileOrders;
