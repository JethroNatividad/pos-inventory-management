import { useOrder } from "@/contexts/OrderContext";
import React, { useState } from "react";
import Order from "./order";
import { ScrollArea } from "@/Components/ui/scroll-area";
import { Button } from "@/Components/ui/button";
import { Trash } from "lucide-react";
import Checkout from "./checkout";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/Components/ui/dialog";
import { Input } from "@/Components/ui/input";
import { Label } from "@/Components/ui/label";
import { useForm } from "@inertiajs/react";
import { toast } from "sonner";
import { User } from "@/types";

type OrderProps = {
    user: User;
};

const Orders = ({ user }: OrderProps) => {
    const { orders, clearOrders, calculateSubtotal } = useOrder();
    const [adminDialogOpen, setAdminDialogOpen] = useState(false);

    const { data, setData, post, processing, errors, reset } = useForm({
        email: "",
        password: "",
    });

    const handleClearOrders = () => {
        // Check if user is administrator or store_manager
        const isAdmin =
            user?.role === "administrator" || user?.role === "store_manager";

        if (isAdmin) {
            // If admin, clear orders directly
            clearOrders();
        } else {
            // If not admin, show authentication dialog
            setAdminDialogOpen(true);
        }
    };

    const handleAdminAuth = (e) => {
        e.preventDefault();

        // Use Inertia's post method with preserveScroll and preserveState options
        post(route("admin.verify"), {
            preserveScroll: true, // Prevents scrolling to top
            preserveState: true, // Preserves component state
            onSuccess: (response) => {
                // On successful verification, clear orders
                clearOrders();
                setAdminDialogOpen(false);
                reset();
                toast.success("Orders cleared successfully");
            },
            onError: () => {
                toast.error("Invalid admin credentials");
            },
        });
    };

    return (
        <div className="border rounded-lg w-full h-screen max-h-[90vh] overflow-y-scroll relative flex flex-col">
            <div className="sticky top-0 left-0 bg-background w-full p-4 border-b flex justify-between items-center">
                <h2 className="text-2xl">Orders</h2>
                <Button variant="destructive" onClick={handleClearOrders}>
                    <Trash />
                </Button>
            </div>
            <div className="flex flex-col space-y-4 p-4 flex-1">
                {orders.map((order) => (
                    <Order key={order.id} {...order} user={user} />
                ))}
            </div>
            <div className="sticky bg-background bottom-0 left-0 w-full p-4 border-t">
                <div className="flex justify-between mb-4">
                    <p className="text-xl font-medium">Total:</p>
                    <p className="text-xl font-medium">
                        ₱{calculateSubtotal().toFixed(2)}
                    </p>
                </div>
                <Checkout />
            </div>

            {/* Admin Authentication Dialog */}
            <Dialog open={adminDialogOpen} onOpenChange={setAdminDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Administrator Authentication</DialogTitle>
                        <DialogDescription>
                            Admin credentials required to clear orders.
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
                                Verify & Clear Orders
                            </Button>
                        </div>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default Orders;
