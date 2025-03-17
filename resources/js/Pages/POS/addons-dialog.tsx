import { Button } from "@/Components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/Components/ui/dialog";
import { OrderAddon, Recipe, Serving } from "@/types";
import { Plus } from "lucide-react";
import { AddonRow } from "./addon-row";

interface AddonsDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    recipe: Recipe;
    selectedServing: Serving | null;
    selectedAddons: OrderAddon[];
    availableAddons: any[];
    onAddAddon: () => void;
    onUpdateAddon: (index: number, field: keyof OrderAddon, value: any) => void;
    onRemoveAddon: (index: number) => void;
    onConfirmOrder: () => void;
    calculateAddonCost: (addon: OrderAddon) => number;
    addonsCost: number;
}

export const AddonsDialog = ({
    open,
    onOpenChange,
    recipe,
    selectedServing,
    selectedAddons,
    availableAddons,
    onAddAddon,
    onUpdateAddon,
    onRemoveAddon,
    onConfirmOrder,
    calculateAddonCost,
    addonsCost,
}: AddonsDialogProps) => {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
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
                                <AddonRow
                                    key={addon.id}
                                    addon={addon}
                                    index={index}
                                    stockEntries={availableAddons}
                                    onUpdate={onUpdateAddon}
                                    onRemove={onRemoveAddon}
                                    calculateAddonCost={calculateAddonCost}
                                />
                            ))}
                        </div>
                    </div>

                    <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={onAddAddon}
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
                        <Button onClick={onConfirmOrder} className="w-full">
                            Confirm Order (₱
                            {(
                                Number(selectedServing?.price || 0) + addonsCost
                            ).toFixed(2)}
                            )
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
};
