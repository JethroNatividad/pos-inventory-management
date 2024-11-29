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
import { useOrder } from "@/contexts/orderContext";
import { useForm } from "@inertiajs/react";
import { FormEventHandler, useState } from "react";

const Checkout = () => {
    const [open, setOpen] = useState(false);
    const { orders, calculateTotal } = useOrder();
    const { data, setData, post, processing, errors, reset } = useForm({
        type: "dine-in",
        discountPercentage: "",
        total: 0,
        discountedTotal: 0,
        orders: orders,
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        const discountAmount = Number(data.discountPercentage) * 0.01 * total;

        setData("total", calculateTotal());
        setData("discountedTotal", data.total - discountAmount);

        // post(route("inventory.store"));
    };

    const total = calculateTotal();
    const discountAmount = Number(data.discountPercentage) * 0.01 * total;
    const discountedTotal = total - discountAmount;

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
                        <p className="text-xl font-medium">Total:</p>
                        <p className="text-xl font-medium">
                            ₱{total.toFixed(2)}
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

                            <div className="flex justify-between">
                                <p className="text-xl font-medium">
                                    Discounted Total:
                                </p>
                                <p className="text-xl font-medium text-green-700">
                                    ₱{discountedTotal.toFixed(2)}
                                </p>
                            </div>
                        </>
                    )}

                    <div className="space-x-2 self-end">
                        <Button
                            type="button"
                            variant="destructive"
                            onClick={() => setOpen(false)}
                        >
                            Cancel
                        </Button>
                        <Button type="submit">Confirm Order</Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
};

export default Checkout;
