import { Button } from "@/Components/ui/button";
import { Recipe, Serving } from "@/types";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/Components/ui/dialog";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/Components/ui/select";
import { Input } from "@/Components/ui/input";
import { useOrder } from "@/contexts/OrderContext";
import { useState, useEffect } from "react";
import { Badge } from "@/Components/ui/badge";
import { Plus, Trash2 } from "lucide-react";
import { convert } from "@/lib/utils";
import { units } from "@/data/units";

interface ItemProps {
    recipe: Recipe;
}

interface OrderAddon {
    id: string;
    stock_entry_id: string;
    quantity: number;
    unit: string;
    name: string;
    price: number;
    type: "liquid" | "powder" | "item";
}

const Item = ({ recipe }: ItemProps) => {
    const { addOrder, getOrder, checkAvailability, stockEntries } = useOrder();

    const [open, setOpen] = useState(false);
    const [addonsOpen, setAddonsOpen] = useState(false);
    const [selectedServing, setSelectedServing] = useState<Serving | null>(
        null
    );
    const [selectedAddons, setSelectedAddons] = useState<OrderAddon[]>([]);

    const handleServingSelect = (serving: Serving) => {
        setSelectedServing(serving);
        setOpen(false);
        setAddonsOpen(true);
    };

    const handleAddAddon = () => {
        setSelectedAddons([
            ...selectedAddons,
            {
                id: Date.now().toString(),
                stock_entry_id: "",
                quantity: 1,
                unit: "",
                name: "",
                price: 0,
                type: "item",
            },
        ]);
    };

    const handleUpdateAddon = (
        index: number,
        field: keyof OrderAddon,
        value: any
    ) => {
        const updatedAddons = [...selectedAddons];

        if (field === "stock_entry_id") {
            const stockEntry = stockEntries.find(
                (entry) => entry.id.toString() === value
            );
            if (stockEntry) {
                // Determine the type based on stockEntry or default to "item"
                const type = stockEntry.type || "item";

                updatedAddons[index] = {
                    ...updatedAddons[index],
                    stock_entry_id: value,
                    name: stockEntry.name || `${stockEntry.id}`,
                    unit:
                        stockEntry.unit || (units[type] ? units[type][0] : ""),
                    price: stockEntry.average_price || 0,
                    type: type as "liquid" | "powder" | "item",
                };
            }
        } else if (field === "unit") {
            const addon = updatedAddons[index];
            const newQuantity = convert(
                addon.type,
                addon.unit,
                value,
                addon.quantity
            );

            updatedAddons[index] = {
                ...updatedAddons[index],
                unit: value,
                quantity: newQuantity,
            };
        } else {
            updatedAddons[index] = {
                ...updatedAddons[index],
                [field]: value,
            };
        }

        setSelectedAddons(updatedAddons);
    };

    const removeAddon = (index: number) => {
        setSelectedAddons(selectedAddons.filter((_, i) => i !== index));
    };

    const handleConfirmOrder = () => {
        if (selectedServing) {
            addOrder({
                serving: selectedServing,
                quantity: 1,
                recipe: recipe,
                id: `${recipe.id}-${selectedServing.id}`,
                addons: selectedAddons,
            });
            setAddonsOpen(false);
            setSelectedServing(null);
            setSelectedAddons([]);
        }
    };

    const availableAddons = stockEntries;

    const calculateAddonCost = (addon: OrderAddon) => {
        // Get base stock entry
        const stockEntry = stockEntries.find(
            (entry) => entry.id.toString() === addon.stock_entry_id
        );

        if (!stockEntry) return 0;

        // Convert quantity to base unit for price calculation
        const baseUnit =
            stockEntry.unit || (units[addon.type] ? units[addon.type][0] : "");
        const baseQuantity = convert(
            addon.type,
            addon.unit,
            baseUnit,
            addon.quantity
        );

        // Make sure we're using the converted quantity for price calculation
        return stockEntry.average_price * baseQuantity;
    };

    const addonsCost = selectedAddons.reduce((total, addon) => {
        return total + calculateAddonCost(addon);
    }, 0);

    return (
        <div className="border rounded-lg overflow-hidden">
            <img
                className="h-40 object-cover w-full"
                src={
                    recipe.image
                        ? "/storage/" + recipe.image
                        : "/images/coffee-template.png"
                }
                alt="Coffee"
            />
            <div className="p-2">
                <div className="mb-8">
                    <h2 className="text-xl">{recipe.name}</h2>
                    <p>{recipe.description}</p>
                </div>

                <Dialog open={open} onOpenChange={(state) => setOpen(state)}>
                    <DialogTrigger asChild>
                        <Button
                            disabled={!recipe.is_available}
                            className="w-full"
                            size="sm"
                        >
                            {recipe.is_available
                                ? "Add to Order"
                                : "Not Available"}
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>{recipe.name}</DialogTitle>
                            <DialogDescription>
                                Select Serving Size
                            </DialogDescription>
                        </DialogHeader>
                        <div className="flex space-y-4 flex-col">
                            {recipe.servings.map((serving) => {
                                const availableQuantity =
                                    checkAvailability(serving);

                                return (
                                    <Button
                                        disabled={
                                            !serving.is_available ||
                                            (getOrder(
                                                `${recipe.id}-${serving.id}`
                                            )?.quantity ?? 0) >=
                                                availableQuantity
                                        }
                                        key={serving.id}
                                        onClick={() =>
                                            handleServingSelect(serving)
                                        }
                                        className="w-full"
                                    >
                                        {serving.name} - ₱{serving.price}
                                    </Button>
                                );
                            })}
                        </div>
                    </DialogContent>
                </Dialog>

                {/* Add-ons Dialog */}
                <Dialog
                    open={addonsOpen}
                    onOpenChange={(state) => {
                        if (!state) {
                            setSelectedAddons([]);
                        }
                        setAddonsOpen(state);
                    }}
                >
                    <DialogContent className="max-w-xl">
                        <DialogHeader>
                            <DialogTitle>Add-ons</DialogTitle>
                            <DialogDescription>
                                Select add-ons for your {recipe.name} (
                                {selectedServing?.name})
                            </DialogDescription>
                        </DialogHeader>

                        <div className="space-y-4 w-full overflow-x-scroll">
                            <div className="overflow-x-scroll py-2 w-full">
                                <div className="space-y-3 w-[500px]">
                                    <div className="grid grid-cols-12 gap-2">
                                        <p className="col-span-4">Add-on</p>
                                        <p className="col-span-5">Quantity</p>
                                        <p className="col-span-2">Cost</p>
                                        <p className="col-span-1"></p>
                                    </div>

                                    {selectedAddons.map((addon, index) => (
                                        <div
                                            key={addon.id}
                                            className="grid grid-cols-12 gap-2 items-center"
                                        >
                                            <div className="col-span-4">
                                                <Select
                                                    value={addon.stock_entry_id.toString()}
                                                    onValueChange={(value) =>
                                                        handleUpdateAddon(
                                                            index,
                                                            "stock_entry_id",
                                                            value
                                                        )
                                                    }
                                                >
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Select add-on" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {availableAddons.map(
                                                            (item) => (
                                                                <SelectItem
                                                                    key={
                                                                        item.id
                                                                    }
                                                                    value={item.id.toString()}
                                                                >
                                                                    {item.name ||
                                                                        `${item.id} (${item.unit})`}
                                                                </SelectItem>
                                                            )
                                                        )}
                                                    </SelectContent>
                                                </Select>
                                            </div>

                                            <div className="col-span-5">
                                                <div className="grid grid-cols-5 gap-2">
                                                    <div className="col-span-3">
                                                        <Input
                                                            type="number"
                                                            min="1"
                                                            value={
                                                                addon.quantity
                                                            }
                                                            onChange={(e) =>
                                                                handleUpdateAddon(
                                                                    index,
                                                                    "quantity",
                                                                    Number(
                                                                        e.target
                                                                            .value
                                                                    )
                                                                )
                                                            }
                                                        />
                                                    </div>
                                                    <div className="col-span-2">
                                                        <Select
                                                            value={addon.unit}
                                                            onValueChange={(
                                                                value
                                                            ) =>
                                                                handleUpdateAddon(
                                                                    index,
                                                                    "unit",
                                                                    value
                                                                )
                                                            }
                                                            disabled={
                                                                !addon.stock_entry_id
                                                            }
                                                        >
                                                            <SelectTrigger>
                                                                <SelectValue placeholder="Unit" />
                                                            </SelectTrigger>
                                                            <SelectContent>
                                                                {addon.type &&
                                                                    units[
                                                                        addon
                                                                            .type
                                                                    ]?.map(
                                                                        (
                                                                            unit
                                                                        ) => (
                                                                            <SelectItem
                                                                                key={
                                                                                    unit
                                                                                }
                                                                                value={
                                                                                    unit
                                                                                }
                                                                            >
                                                                                {
                                                                                    unit
                                                                                }
                                                                            </SelectItem>
                                                                        )
                                                                    )}
                                                            </SelectContent>
                                                        </Select>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="col-span-2 flex h-10 items-center border rounded-md px-2 bg-gray-50">
                                                <span>₱</span>
                                                <p className="text-sm text-wrap">
                                                    {calculateAddonCost(
                                                        addon
                                                    ).toFixed(2)}
                                                </p>
                                            </div>

                                            <div className="col-span-1">
                                                <Button
                                                    variant="outline"
                                                    onClick={() =>
                                                        removeAddon(index)
                                                    }
                                                    type="button"
                                                    size="icon"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={handleAddAddon}
                            >
                                <Plus className="h-4 w-4 mr-2" /> Add Add-on
                            </Button>

                            <div className="pt-4 border-t">
                                {selectedAddons.length > 0 && (
                                    <div className="mb-2 text-sm">
                                        <span className="font-medium">
                                            Total add-ons cost:
                                        </span>
                                        <span className="ml-2">
                                            ₱{addonsCost.toFixed(2)}
                                        </span>
                                    </div>
                                )}
                                <Button
                                    onClick={handleConfirmOrder}
                                    className="w-full"
                                >
                                    Confirm Order (₱
                                    {(
                                        Number(selectedServing?.price || 0) +
                                        addonsCost
                                    ).toFixed(2)}
                                    )
                                </Button>
                            </div>
                        </div>
                    </DialogContent>
                </Dialog>
            </div>
        </div>
    );
};

export default Item;
