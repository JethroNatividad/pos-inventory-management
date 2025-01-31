import { Label } from "@/Components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/Components/ui/select";
import InputError from "@/Components/input-error";

type BatchLabelSelectProps = {
    batchLabels: { label: string; amount: number }[];
    value: string;
    onChange: (value: string) => void;
    error?: string;
    stockEntryUnit: string;
};

export const BatchLabelSelect = ({
    batchLabels,
    value,
    onChange,
    error,
    stockEntryUnit,
}: BatchLabelSelectProps) => (
    <div className="space-y-2">
        <Label htmlFor="batch_label">Batch Label</Label>
        <Select onValueChange={onChange} value={value}>
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
        <InputError message={error} />
    </div>
);
