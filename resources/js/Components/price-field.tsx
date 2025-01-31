import { Label } from "@/Components/ui/label";
import { Input } from "@/Components/ui/input";
import InputError from "@/Components/input-error";

type PriceFieldProps = {
    value: string;
    onChange: (value: string) => void;
    error?: string;
};

export const PriceField = ({ value, onChange, error }: PriceFieldProps) => (
    <div className="space-y-2">
        <Label htmlFor="price">Price</Label>
        <Input
            id="price"
            type="number"
            name="price"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder="0"
        />
        <InputError message={error} />
    </div>
);
