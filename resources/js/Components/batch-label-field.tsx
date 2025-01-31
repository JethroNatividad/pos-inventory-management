import { Label } from "@/Components/ui/label";
import { Input } from "@/Components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/Components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/Components/ui/radio-group";
import InputError from "@/Components/input-error";
import { format } from "date-fns";

type BatchLabelFieldProps = {
    batchLabels: { label: string; amount: number }[];
    isNewLabel: boolean;
    setIsNewLabel: (value: boolean) => void;
    value: string;
    onChange: (value: string) => void;
    error?: string;
    stockEntryUnit: string;
};

export const BatchLabelField = ({
    batchLabels,
    isNewLabel,
    setIsNewLabel,
    value,
    onChange,
    error,
    stockEntryUnit,
}: BatchLabelFieldProps) => (
    <div className="space-y-2">
        <Label>Batch Label</Label>
        <RadioGroup
            value={isNewLabel ? "new" : "existing"}
            onValueChange={(value) => {
                setIsNewLabel(value === "new");
                onChange(
                    value === "new"
                        ? `Batch ${format(new Date(), "yyyy-MM-dd HH:mm:ss")}`
                        : batchLabels[0]?.label
                );
            }}
            className="flex space-x-4"
        >
            <div className="flex items-center space-x-2">
                <RadioGroupItem
                    value="existing"
                    id="existing"
                    disabled={batchLabels.length === 0}
                />
                <Label htmlFor="existing">Use Existing</Label>
            </div>
            <div className="flex items-center space-x-2">
                <RadioGroupItem value="new" id="new" />
                <Label htmlFor="new">Create New</Label>
            </div>
        </RadioGroup>

        {isNewLabel ? (
            <Input
                id="batch_label"
                type="text"
                name="batch_label"
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder="Batch 1"
            />
        ) : (
            <Select
                onValueChange={onChange}
                value={value}
                disabled={batchLabels.length === 0}
            >
                <SelectTrigger>
                    <SelectValue />
                </SelectTrigger>
                <SelectContent>
                    {batchLabels.map((batch) => (
                        <SelectItem key={batch.label} value={batch.label}>
                            <span>{batch.label}</span>{" "}
                            <span>
                                ({batch.amount}
                                {stockEntryUnit})
                            </span>
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>
        )}
        <InputError message={error} />
    </div>
);
