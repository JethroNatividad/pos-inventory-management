import { Button } from "@/Components/ui/button";
import { Input } from "@/Components/ui/input";
import { type OrderItem, useOrder } from "@/contexts/OrderContext";
import { Minus, Plus } from "lucide-react";
import React, { useState } from "react";
import { User } from "@/types";

import { useForm } from "@inertiajs/react";

type OrderProps = OrderItem & {
    user: User;
};

const Order = ({ id, quantity, recipe, serving, addons, user }: OrderProps) => {
    const {
        incrementOrder,
        decrementOrder,
        updateOrder,
        getMaximumOrderQuantity,
        calculateItemBasePrice,
        calculateItemTotalPrice,
    } = useOrder();

    // const [adminDialogOpen, setAdminDialogOpen] = useState(false);

    // const { data, setData, post, processing, errors, reset } = useForm({
    //     email: "",
    //     password: "",
    // });

    const orderItem = { id, quantity, serving, recipe, addons };
    const availableQuantity = getMaximumOrderQuantity(orderItem);

    // Check if user is administrator or store_manager
    // const isAdmin =
    //     user?.role === "administrator" || user?.role === "store_manager";

    const handleDecrement = () => {
        decrementOrder(id);
        // if (isAdmin) {
        //     // If admin, allow decrement directly
        //     decrementOrder(id);
        // } else {
        //     // If not admin, show authentication dialog
        //     setAdminDialogOpen(true);
        // }
    };

    // const handleAdminAuth = (e: React.FormEvent<HTMLFormElement>) => {
    //     e.preventDefault();

    //     post(route("admin.verify"), {
    //         preserveScroll: true,
    //         preserveState: true,
    //         onSuccess: () => {
    //             decrementOrder(id);
    //             setAdminDialogOpen(false);
    //             reset();
    //             toast.success("Item quantity decreased");
    //         },
    //         onError: () => {
    //             toast.error("Invalid admin credentials");
    //         },
    //     });
    // };

    return (
        <div>
            <div className="flex justify-between items-center">
                <div>
                    <p className="text-xl">{recipe.name}</p>
                    <p className="text-amber-800">{serving.name}</p>
                </div>
                <div className="flex space-x-2 items-center">
                    <Button size="icon" onClick={handleDecrement}>
                        <Minus />
                    </Button>
                    <Input
                        className="w-12 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                        type="number"
                        value={quantity}
                        disabled
                    />
                    <Button
                        disabled={availableQuantity <= 0}
                        size="icon"
                        onClick={() => incrementOrder(id)}
                    >
                        <Plus />
                    </Button>
                </div>
            </div>

            <div className="flex justify-between">
                <p>₱{serving.price}</p>
                <p>₱{calculateItemBasePrice(orderItem).toFixed(2)}</p>
            </div>

            {/* Display addons if any */}
            {addons && addons.length > 0 && (
                <>
                    <div className="w-full">
                        {addons.map((addon, index) => (
                            <div
                                key={index}
                                className="flex justify-between text-sm w-full text-gray-600"
                            >
                                <div>
                                    + {addon.quantity}
                                    {addon.unit} {addon.name}
                                </div>
                                <div>
                                    ₱
                                    {(
                                        addon.quantity *
                                        addon.price *
                                        quantity
                                    ).toFixed(2)}
                                </div>
                            </div>
                        ))}
                    </div>
                    <div>
                        <p className="flex justify-between font-bold">
                            <span>Total</span>
                            <span>
                                ₱{calculateItemTotalPrice(orderItem).toFixed(2)}
                            </span>
                        </p>
                    </div>
                </>
            )}

            {/* Admin Authentication Dialog */}
            {/* <Dialog open={adminDialogOpen} onOpenChange={setAdminDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Administrator Authentication</DialogTitle>
                        <DialogDescription>
                            Admin credentials required to decrease item
                            quantity.
                        </DialogDescription>
                    </DialogHeader>

                    <form onSubmit={handleAdminAuth} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="email">Admin Email</Label>
                            <Input
                                id="email"
                                type="email"
                                value={data.email}
                                onChange={(e) =>
                                    setData("email", e.target.value)
                                }
                                placeholder="admin@example.com"
                                required
                            />
                            {errors.email && (
                                <p className="text-red-500 text-sm">
                                    {errors.email}
                                </p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="password">Admin Password</Label>
                            <Input
                                id="password"
                                type="password"
                                value={data.password}
                                onChange={(e) =>
                                    setData("password", e.target.value)
                                }
                                placeholder="••••••••"
                                required
                            />
                            {errors.password && (
                                <p className="text-red-500 text-sm">
                                    {errors.password}
                                </p>
                            )}
                        </div>

                        <div className="flex justify-end gap-2">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setAdminDialogOpen(false)}
                            >
                                Cancel
                            </Button>
                            <Button type="submit" disabled={processing}>
                                Verify & Decrease Quantity
                            </Button>
                        </div>
                    </form>
                </DialogContent>
            </Dialog> */}
        </div>
    );
};

export default Order;
