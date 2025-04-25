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
    // Calculate discount amount
    const discountAmount = (order.subtotal * order.discountPercentage) / 100;

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
                        <div>{order.customer_name || "Customer"}</div>
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
                        <div>
                            <div
                                key={item.id}
                                className="flex justify-between text-sm"
                            >
                                <div>
                                    {item.quantity}x {item.serving.recipe.name}{" "}
                                    ({item.serving.name})
                                </div>
                                <div>
                                    ₱{(item.price * item.quantity).toFixed(2)}
                                </div>
                            </div>
                            {item.addons.map((addon, index) => (
                                <div
                                    key={index}
                                    className="flex justify-between text-sm pl-4 text-gray-600"
                                >
                                    <p>
                                        + {Number(addon.quantity).toFixed(2)}
                                        {addon.stock_entry.unit}{" "}
                                        {addon.stock_entry.name}
                                    </p>
                                    <p>
                                        ₱
                                        {(
                                            addon.price *
                                            addon.quantity *
                                            item.quantity
                                        ).toFixed(2)}
                                    </p>
                                </div>
                            ))}
                            <div className="flex justify-between font-medium text-sm">
                                <p>Item Total:</p>
                                <p>
                                    ₱
                                    {(
                                        item.quantity * item.price +
                                        item.addons.reduce(
                                            (total, addon) =>
                                                total +
                                                addon.price * addon.quantity,
                                            0
                                        ) *
                                            item.quantity
                                    ).toFixed(2)}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
                <div className="mt-6 space-y-2">
                    {order.discountPercentage > 0 && (
                        <>
                            <div className="flex justify-between border-t pt-2">
                                <div>Subtotal:</div>
                                <div>₱{order.subtotal}</div>
                            </div>

                            <div className="flex justify-between text-red-600">
                                <div>
                                    Discount ({order.discountPercentage}%):
                                </div>
                                <div>-₱{discountAmount.toFixed(2)}</div>
                            </div>
                        </>
                    )}

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
