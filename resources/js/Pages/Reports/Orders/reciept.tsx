import {
    Card,
    CardContent,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/Components/ui/card";
import { Order } from "@/types";
import { format } from "date-fns";

interface ReceiptProps {
    order: Order;
}

export default function Receipt({ order }: ReceiptProps) {
    return (
        <Card className="w-full">
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
                    Cashier: {order.user.first_name} {order.user.middle_name}{" "}
                    {order.user.last_name}
                </div>
            </CardHeader>
            <CardContent className="p-6">
                <div className="space-y-4 mb-4">
                    <div className="flex justify-between">
                        <div className="text-sm font-medium">Order Type</div>
                        <div>{order.type}</div>
                    </div>
                    <div className="flex justify-between">
                        <div className="text-sm font-medium">Customer Name</div>
                        <div>{order.customer_name || "Walk-in Customer"}</div>
                    </div>
                    <div className="flex justify-between">
                        <div className="text-sm font-medium">
                            Payment Method
                        </div>
                        <div className="capitalize">{order.payment_method}</div>
                    </div>
                </div>
                <div className="space-y-4">
                    <div className="text-sm font-medium">Order Summary</div>
                    {order.items.map((item) => (
                        <div
                            key={item.id}
                            className="flex justify-between text-sm"
                        >
                            <div>
                                {item.quantity}x {item.serving.recipe.name} (
                                {item.serving.name})
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
                        <div>₱{order.subtotal}</div>
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
                        <div>₱{order.total}</div>
                    </div>
                </div>
            </CardContent>
            <CardFooter className="text-center text-sm text-muted-foreground border-t pt-5">
                <div className="w-full">Thank you for your order!</div>
            </CardFooter>
        </Card>
    );
}
