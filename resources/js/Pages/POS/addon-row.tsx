import { Button } from "@/Components/ui/button";
import { Input } from "@/Components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/Components/ui/select";
import { OrderAddon } from "@/types";
import { Trash2 } from "lucide-react";

interface AddonRowProps {
    addon: OrderAddon;
    index: number;
    stockEntries: any[];
    onUpdate: (index: number, field: keyof OrderAddon, value: any) => void;
    onRemove: (index: number) => void;
    calculateAddonCost: (addon: OrderAddon) => number;
}

export const AddonRow = ({
    addon,
    index,
    stockEntries,
    onUpdate,
    onRemove,
    calculateAddonCost,
}: AddonRowProps) => {
    return (
        <div className="grid grid-cols-12 gap-2 items-center">
            <div className="col-span-4">
                <Select
                    value={addon.stock_entry_id.toString()}
                    onValueChange={(value) =>
                        onUpdate(index, "stock_entry_id", value)
                    }
                >
                    <SelectTrigger>
                        <SelectValue placeholder="Select add-on" />
                    </SelectTrigger>
                    <SelectContent>
                        {stockEntries.map((item) => (
                            <SelectItem
                                key={item.id}
                                value={item.id.toString()}
                            >
                                {item.name || `${item.id} (${item.unit})`}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            <div className="col-span-5">
                <div className="grid grid-cols-5 gap-2">
                    <div className="col-span-3">
                        <Input
                            type="number"
                            min="1"
                            value={addon.quantity}
                            onChange={(e) =>
                                onUpdate(
                                    index,
                                    "quantity",
                                    Number(e.target.value)
                                )
                            }
                        />
                    </div>
                    <div className="col-span-2">
                        <div className="h-full w-full rounded-md bg-gray-100 text-sm border flex items-center px-2">
                            {addon.unit}
                        </div>
                    </div>
                </div>
            </div>

            <div className="col-span-2 flex h-10 items-center border rounded-md px-2 bg-gray-50">
                <span>₱</span>
                <p className="text-sm text-wrap">
                    {calculateAddonCost(addon).toFixed(2)}
                </p>
            </div>

            <div className="col-span-1">
                <Button
                    variant="outline"
                    onClick={() => onRemove(index)}
                    type="button"
                    size="icon"
                >
                    <Trash2 className="h-4 w-4" />
                </Button>
            </div>
        </div>
    );
};
