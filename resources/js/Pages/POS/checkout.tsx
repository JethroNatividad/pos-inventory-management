import InputError from "@/Components/input-error";
import { Button } from "@/Components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/Components/ui/dialog";
import { Input } from "@/Components/ui/input";
import { Label } from "@/Components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/Components/ui/select";
import { useOrder } from "@/contexts/OrderContext";
import { useForm } from "@inertiajs/react";
import { FormEventHandler, useState, useEffect } from "react";

const Checkout = () => {
    const [open, setOpen] = useState(false);
    const { orders, calculateSubtotal, clearOrders } = useOrder();
    const { data, setData, post, processing, errors, reset } = useForm({
        type: "dine-in",
        discountPercentage: "0",
        subtotal: 0,
        total: 0,
        orders: orders,
    });

    useEffect(() => {
        setData("orders", orders);
        setData("subtotal", calculateSubtotal());
    }, [orders]);

    useEffect(() => {
        const discountAmount =
            Number(data.discountPercentage) * 0.01 * data.subtotal;
        setData("total", data.subtotal - discountAmount);
    }, [data.subtotal, data.discountPercentage]);

    const submit: FormEventHandler = (e) => {
        e.preventDefault();

        post(route("orders.store"), {
            onStart: () => {
                reset();
                clearOrders();
                setOpen(false);
            },
        });
    };

    const discountAmount =
        Number(data.discountPercentage) * 0.01 * data.subtotal;

    return (
        <Dialog open={open} onOpenChange={(state) => setOpen(state)}>
            <DialogTrigger asChild>
                <Button disabled={orders.length === 0} className="w-full">
                    Checkout
                </Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Confirm your Order</DialogTitle>
                </DialogHeader>
                <form onSubmit={submit} className="flex space-y-4 flex-col">
                    <div className="space-y-2">
                        <Label htmlFor="type">Type</Label>
                        <Select
                            value={data.type}
                            onValueChange={(value) => setData("type", value)}
                        >
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="dine-in">Dine In</SelectItem>
                                <SelectItem value="take-out">
                                    Take Out
                                </SelectItem>
                                <SelectItem value="delivery">
                                    Delivery
                                </SelectItem>
                            </SelectContent>
                        </Select>
                        <InputError message={errors.type} />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="discountPercentage">Discount %</Label>
                        <Input
                            id="discountPercentage"
                            type="number"
                            name="discountPercentage"
                            value={data.discountPercentage}
                            onChange={(e) =>
                                setData("discountPercentage", e.target.value)
                            }
                            placeholder="0"
                        />
                        <InputError message={errors.discountPercentage} />
                    </div>

                    <p className="text-lg font-medium">Order Summary</p>
                    {orders.map((order) => (
                        <div key={order.id} className="flex justify-between">
                            <p>{order.recipeName}</p>
                            <p>₱{order.serving.price}</p>
                        </div>
                    ))}

                    <div className="flex justify-between">
                        <p className="text-xl font-medium">Subtotal:</p>
                        <p className="text-xl font-medium">
                            ₱{data.subtotal.toFixed(2)}
                        </p>
                    </div>

                    {data.discountPercentage && (
                        <>
                            <div className="flex justify-between">
                                <p className="text-xl font-medium">Discount:</p>
                                <p className="text-xl font-medium text-red-700">
                                    -₱{discountAmount.toFixed(2)}
                                </p>
                            </div>
                        </>
                    )}
                    <div className="flex justify-between">
                        <p className="text-xl font-medium">Total:</p>
                        <p className="text-xl font-medium text-green-700">
                            ₱{data.total.toFixed(2)}
                        </p>
                    </div>

                    <div className="space-x-2 self-end">
                        <Button
                            type="button"
                            variant="destructive"
                            onClick={() => setOpen(false)}
                        >
                            Cancel
                        </Button>
                        <Button disabled={processing} type="submit">
                            Confirm Order
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
};

export default Checkout;
