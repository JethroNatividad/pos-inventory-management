import {
    Card,
    CardContent,
    CardFooter,
    CardHeader,
    CardTitle,
} from "./ui/card";
import { format } from "date-fns";

interface ReceiptProps {
    order?: {
        id: number;
        subtotal: number;
        discountPercentage: number;
        total: number;
        type: string;
        created_at: string;
        user: {
            name: string;
        };
    };
    items?: Array<{
        id: number;
        quantity: number;
        price: number;
        serving: {
            name: string;
        };
    }>;
}

export default function Receipt({ order, items }: ReceiptProps) {
    if (!order || !items) {
        return (
            <Card className="w-full max-w-md mx-auto p-6 text-center">
                Loading receipt...
            </Card>
        );
    }

    return (
        <Card className="w-full max-w-md mx-auto">
            <CardHeader className="text-center border-b">
                <CardTitle className="text-xl font-medium">
                    Order Receipt
                </CardTitle>
                <div className="text-sm text-muted-foreground">
                    {format(new Date(order.created_at), "MMM d, yyyy h:mm a")}
                </div>
                <div className="text-sm text-muted-foreground">
                    Order #{order.id}
                </div>
                <div className="text-sm text-muted-foreground">
                    Cashier: {order.user.name}
                </div>
            </CardHeader>
            <CardContent className="p-6">
                <div className="mb-4">
                    <div className="text-sm font-medium mb-2">Order Type</div>
                    <div>{order.type}</div>
                </div>
                <div className="space-y-4">
                    <div className="text-sm font-medium">Order Summary</div>
                    {items.map((item) => (
                        <div
                            key={item.id}
                            className="flex justify-between text-sm"
                        >
                            <div>
                                {item.quantity}x {item.serving.name}
                            </div>
                            <div>
                                ₱{(item.price * item.quantity).toFixed(2)}
                            </div>
                        </div>
                    ))}
                </div>
                <div className="mt-6 space-y-2 pt-4 border-t">
                    <div className="flex justify-between">
                        <div>Subtotal:</div>
                        <div>₱{order.subtotal.toFixed(2)}</div>
                    </div>
                    <div className="flex justify-between text-red-600">
                        <div>Discount ({order.discountPercentage}%):</div>
                        <div>
                            -₱
                            {(
                                (order.subtotal * order.discountPercentage) /
                                100
                            ).toFixed(2)}
                        </div>
                    </div>
                    <div className="flex justify-between font-medium text-green-600 pt-2 border-t">
                        <div>Total:</div>
                        <div>₱{order.total.toFixed(2)}</div>
                    </div>
                </div>
            </CardContent>
            <CardFooter className="text-center text-sm text-muted-foreground border-t">
                <div className="w-full">Thank you for your order!</div>
            </CardFooter>
        </Card>
    );
}
