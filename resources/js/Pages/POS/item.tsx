import { Button } from "@/Components/ui/button";
import { Recipe, Serving } from "@/types";
import { DialogTrigger } from "@/Components/ui/dialog";
import { useOrder } from "@/contexts/OrderContext";
import { useState } from "react";
import { convert } from "@/lib/utils";
import { units } from "@/data/units";
import { OrderAddon } from "@/types";
import { AddonsDialog } from "./addons-dialog";
import { ServingSizeDialog } from "./serving-size-dialog";

interface ItemProps {
    recipe: Recipe;
}

const Item = ({ recipe }: ItemProps) => {
    const { addOrder, getOrder, stockEntries, isRecipeAvailable } = useOrder();

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
            // Create a unique signature for the addons
            const addonSignature =
                selectedAddons.length > 0
                    ? `-${selectedAddons
                          .sort((a, b) =>
                              a.stock_entry_id.localeCompare(b.stock_entry_id)
                          )
                          .map(
                              (addon) =>
                                  `${addon.stock_entry_id}-${addon.quantity}-${addon.unit}`
                          )
                          .join("_")}`
                    : "";

            // Create a unique order ID that includes addon information
            const orderId = `${recipe.id}-${selectedServing.id}${addonSignature}`;

            addOrder({
                serving: selectedServing,
                quantity: 1,
                recipe: recipe,
                id: orderId,
                addons: selectedAddons,
            });

            setAddonsOpen(false);
            setSelectedServing(null);
            setSelectedAddons([]);
        }
    };

    const calculateAddonCost = (addon: OrderAddon) => {
        const stockEntry = stockEntries.find(
            (entry) => entry.id.toString() === addon.stock_entry_id
        );

        if (!stockEntry) return 0;

        const baseUnit =
            stockEntry.unit || (units[addon.type] ? units[addon.type][0] : "");
        const baseQuantity = convert(
            addon.type,
            addon.unit,
            baseUnit,
            addon.quantity
        );

        return stockEntry.average_price * baseQuantity;
    };

    const addonsCost = selectedAddons.reduce((total, addon) => {
        return total + calculateAddonCost(addon);
    }, 0);

    const getOrderQuantity = (id: string) => {
        return getOrder(id)?.quantity ?? 0;
    };

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

                <ServingSizeDialog
                    open={open}
                    onOpenChange={setOpen}
                    recipe={recipe}
                    onSelectServing={handleServingSelect}
                />

                {/* <DialogTrigger asChild> */}
                <Button
                    disabled={!isRecipeAvailable(recipe)}
                    className="w-full"
                    size="sm"
                    onClick={() => setOpen(true)}
                >
                    {isRecipeAvailable(recipe)
                        ? "Add to Order"
                        : "Not Available"}
                </Button>
                {/* </DialogTrigger> */}

                <AddonsDialog
                    open={addonsOpen}
                    onOpenChange={(state) => {
                        if (!state) {
                            setSelectedAddons([]);
                        }
                        setAddonsOpen(state);
                    }}
                    recipe={recipe}
                    selectedServing={selectedServing}
                    selectedAddons={selectedAddons}
                    availableAddons={stockEntries}
                    onAddAddon={handleAddAddon}
                    onUpdateAddon={handleUpdateAddon}
                    onRemoveAddon={removeAddon}
                    onConfirmOrder={handleConfirmOrder}
                    calculateAddonCost={calculateAddonCost}
                    addonsCost={addonsCost}
                />
            </div>
        </div>
    );
};

export default Item;
