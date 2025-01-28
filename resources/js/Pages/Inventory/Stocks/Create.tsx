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
};

const AddStock = ({ stockEntry }: Props) => {
    const { data, setData, post, processing, errors, reset } = useForm({
        batch_label: `Batch ${format(new Date(), "yyyy-MM-dd")}`,
        quantity: "",
        price: "",
        unit: units[stockEntry.type][0],
        expiry_date: stockEntry.perishable
            ? new Date(new Date().setDate(new Date().getDate() + 1))
            : null,
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(route("stock.store", stockEntry.id));
    };

    return (
        <Layout>
            <Head title="Create Stock Entry" />

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
                        Add Stock to {stockEntry.name}
                    </h1>
                </div>

                <div className="space-y-4 rounded-md p-4 border">
                    <div className="space-y-2">
                        <Label htmlFor="batch_label">Batch Label</Label>
                        <Input
                            id="batch_label"
                            type="text"
                            name="batch_label"
                            value={data.batch_label}
                            onChange={(e) =>
                                setData("batch_label", e.target.value)
                            }
                            placeholder="Batch 1"
                        />
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
                        <Label htmlFor="price">Price</Label>
                        <Input
                            id="price"
                            type="number"
                            name="price"
                            value={data.price}
                            onChange={(e) => setData("price", e.target.value)}
                            placeholder="0"
                        />
                        <InputError message={errors.price} />
                    </div>

                    {stockEntry.perishable && (
                        <div className="space-y-2">
                            <Label htmlFor="expiry_date">Expiry Date</Label>
                            <div>
                                <Popover>
                                    <PopoverTrigger asChild>
                                        <Button
                                            variant={"outline"}
                                            className={cn(
                                                "w-[240px] pl-3 text-left font-normal",
                                                !data.expiry_date &&
                                                    "text-muted-foreground"
                                            )}
                                        >
                                            {data.expiry_date ? (
                                                format(data.expiry_date, "PPP")
                                            ) : (
                                                <span>Pick a date</span>
                                            )}
                                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent
                                        className="w-auto p-0"
                                        align="start"
                                    >
                                        <Calendar
                                            mode="single"
                                            selected={
                                                data.expiry_date || undefined
                                            }
                                            onSelect={(date) =>
                                                date &&
                                                setData("expiry_date", date)
                                            }
                                            // disabled={(date) => date < new Date()}
                                            // date must be greater than today
                                            disabled={(date) =>
                                                new Date(
                                                    new Date().setDate(
                                                        new Date().getDate() + 1
                                                    )
                                                ) > date
                                            }
                                            initialFocus
                                        />
                                    </PopoverContent>
                                </Popover>
                            </div>

                            <InputError message={errors.expiry_date} />
                        </div>
                    )}

                    <div className="flex justify-end">
                        <Button type="submit" disabled={processing}>
                            Add stock
                        </Button>
                    </div>
                </div>
            </form>
        </Layout>
    );
};

export default AddStock;
