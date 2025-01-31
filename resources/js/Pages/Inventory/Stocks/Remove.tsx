import InputError from "@/Components/input-error";
import { Button } from "@/Components/ui/button";
import { Calendar } from "@/Components/ui/calendar";
import { Input } from "@/Components/ui/input";
import { Label } from "@/Components/ui/label";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/Components/ui/popover";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/Components/ui/select";
import { Textarea } from "@/Components/ui/textarea";
import { units } from "@/data/units";
import Layout from "@/Layouts/Layout";
import { cn } from "@/lib/utils";
import type { StockEntry } from "@/types";
import { Head, Link, useForm } from "@inertiajs/react";
import { format } from "date-fns";
import { CalendarIcon, ChevronLeft } from "lucide-react";
import { FormEventHandler } from "react";

type Props = {
    stockEntry: StockEntry;
    batchLabels: {
        label: string;
        amount: number;
    }[];
};

const AddStock = ({ stockEntry, batchLabels }: Props) => {
    const { data, setData, post, processing, errors, reset } = useForm({
        batch_label: batchLabels[0].label ?? "",
        quantity: "",
        price: "",
        reason: "",
        unit: units[stockEntry.type][0],
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(route("stock.remove", stockEntry.id));
    };

    return (
        <Layout>
            <Head title="Manually Remove Stock" />

            <form
                onSubmit={submit}
                className="max-w-md w-full mx-auto space-y-4"
            >
                <div className="flex items-center space-x-2">
                    <Button size="icon" variant="outline" asChild>
                        <Link href={route("inventory.index")}>
                            <ChevronLeft />
                        </Link>
                    </Button>
                    <h1 className="text-xl font-medium">
                        Remove stock from {stockEntry.name}
                    </h1>
                </div>

                <div className="space-y-4 rounded-md p-4 border">
                    <div className="space-y-2">
                        <Label htmlFor="batch_label">Batch Label</Label>
                        <Select
                            onValueChange={(value) =>
                                setData("batch_label", value)
                            }
                            value={data.batch_label}
                        >
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                {batchLabels.map((batch_label) => (
                                    <SelectItem
                                        key={batch_label.label}
                                        value={batch_label.label}
                                    >
                                        <span>{batch_label.label}</span>{" "}
                                        <span>
                                            ({batch_label.amount}
                                            {stockEntry.unit})
                                        </span>
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <InputError message={errors.batch_label} />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="quantity">Quantity</Label>
                        <div className="flex space-x-2">
                            <Input
                                id="quantity"
                                type="number"
                                name="quantity"
                                value={data.quantity}
                                onChange={(e) =>
                                    setData("quantity", e.target.value)
                                }
                                className="w-3/4"
                                placeholder="0"
                            />
                            <div className="w-1/4">
                                <Select
                                    onValueChange={(value) =>
                                        setData("unit", value)
                                    }
                                    value={data.unit}
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {units[stockEntry.type].map((unit) => (
                                            <SelectItem key={unit} value={unit}>
                                                {unit}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                        <InputError message={errors.quantity || errors.unit} />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="reason">Reason</Label>
                        <Textarea
                            id="reason"
                            name="reason"
                            value={data.reason}
                            onChange={(e) => setData("reason", e.target.value)}
                            placeholder="Accidental Spillage"
                        />
                        <InputError message={errors.reason} />
                    </div>

                    <div className="flex justify-end">
                        <Button type="submit" disabled={processing}>
                            Remove stock
                        </Button>
                    </div>
                </div>
            </form>
        </Layout>
    );
};

export default AddStock;
