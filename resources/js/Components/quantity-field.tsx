import { Label } from "@/Components/ui/label";
import { Input } from "@/Components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/Components/ui/select";
import InputError from "@/Components/input-error";

type QuantityFieldProps = {
    quantity: string;
    unit: string;
    onQuantityChange: (value: string) => void;
    onUnitChange: (value: string) => void;
    availableUnits: string[];
    error?: string;
};

export const QuantityField = ({
    quantity,
    unit,
    onQuantityChange,
    onUnitChange,
    availableUnits,
    error,
}: QuantityFieldProps) => (
    <div className="space-y-2">
        <Label htmlFor="quantity">Quantity</Label>
        <div className="flex space-x-2">
            <Input
                id="quantity"
                type="number"
                name="quantity"
                value={quantity}
                onChange={(e) => onQuantityChange(e.target.value)}
                className="w-3/4"
                placeholder="0"
            />
            <div className="w-1/4">
                <Select onValueChange={onUnitChange} value={unit}>
                    <SelectTrigger>
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        {availableUnits.map((unit) => (
                            <SelectItem key={unit} value={unit}>
                                {unit}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>
        </div>
        <InputError message={error} />
    </div>
);
