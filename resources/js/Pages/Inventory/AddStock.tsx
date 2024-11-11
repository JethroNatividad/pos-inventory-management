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
        batch_label: "",
        quantity: 0,
        price: 0,
        expiry_date: new Date(new Date().setDate(new Date().getDate() + 1)),
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(route("inventory.store"));
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
                        <Input
                            id="quantity"
                            type="number"
                            name="quantity"
                            value={data.quantity}
                            onChange={(e) =>
                                setData("quantity", Number(e.target.value))
                            }
                            placeholder="Brown Sugar"
                        />
                        <InputError message={errors.quantity} />
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
                                            selected={data.expiry_date}
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
