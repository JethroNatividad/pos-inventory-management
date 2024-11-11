import InputError from "@/Components/input-error";
import { Button } from "@/Components/ui/button";
import { Input } from "@/Components/ui/input";
import { Label } from "@/Components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/Components/ui/select";
import { Textarea } from "@/Components/ui/textarea";
import Layout from "@/Layouts/Layout";
import type { StockEntry } from "@/types";
import { Head, Link, useForm } from "@inertiajs/react";
import { ChevronLeft } from "lucide-react";
import { FormEventHandler } from "react";

type Props = {
    stockEntry: StockEntry;
};

const Edit = ({ stockEntry }: Props) => {
    const { data, setData, put, processing, errors, reset } = useForm({
        name: stockEntry.name,
        description: stockEntry.description,
        type: stockEntry.type,
        perishable: stockEntry.perishable,
        warn_stock_level: stockEntry.warn_stock_level,
        warn_days_remaining: stockEntry.warn_days_remaining,
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        put(route("inventory.update", stockEntry.id));
    };

    const types = [
        { name: "Liquid", id: "liquid" },
        { name: "Powder", id: "powder" },
        { name: "Item", id: "item" },
    ];

    return (
        <Layout>
            <Head title="Edit Stock Entry" />

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
                        Edit {stockEntry.name}
                    </h1>
                </div>

                <div className="space-y-4 rounded-md p-4 border">
                    <div className="space-y-2">
                        <Label htmlFor="name">Name</Label>
                        <Input
                            id="name"
                            type="text"
                            name="name"
                            value={data.name}
                            onChange={(e) => setData("name", e.target.value)}
                            placeholder="Brown Sugar"
                        />
                        <InputError message={errors.name} />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="first_name">Description</Label>
                        <Textarea
                            id="description"
                            name="description"
                            value={data.description}
                            onChange={(e) =>
                                setData("description", e.target.value)
                            }
                            placeholder="Brown Sugar"
                        />
                        <InputError message={errors.description} />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="type">Type</Label>
                        <Select
                            onValueChange={(value) => setData("type", value)}
                            value={data.type}
                        >
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                {types.map((type) => (
                                    <SelectItem key={type.id} value={type.id}>
                                        {type.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <InputError message={errors.type} />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="perishable">Perishable</Label>
                        <Select
                            onValueChange={(value) =>
                                setData("perishable", value === "1")
                            }
                            value={data.perishable ? "1" : "0"}
                        >
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="1">Yes</SelectItem>
                                <SelectItem value="0">No</SelectItem>
                            </SelectContent>
                        </Select>
                        <InputError message={errors.perishable} />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="warn_stock_level">
                            Warn when stock is below
                        </Label>
                        <Input
                            id="warn_stock_level"
                            type="number"
                            name="warn_stock_level"
                            value={data.warn_stock_level}
                            onChange={(e) =>
                                setData(
                                    "warn_stock_level",
                                    Number(e.target.value)
                                )
                            }
                            placeholder="Brown Sugar"
                        />
                        <InputError message={errors.warn_stock_level} />
                    </div>

                    {data.perishable && (
                        <div className="space-y-2">
                            <Label htmlFor="warn_days_remaining">
                                Warn when expiring days remaining is below
                            </Label>
                            <Input
                                id="warn_days_remaining"
                                type="number"
                                name="warn_days_remaining"
                                value={data.warn_days_remaining}
                                onChange={(e) =>
                                    setData(
                                        "warn_days_remaining",
                                        Number(e.target.value)
                                    )
                                }
                                placeholder="Brown Sugar"
                            />
                            <InputError message={errors.warn_days_remaining} />
                        </div>
                    )}

                    <div className="flex justify-end">
                        <Button type="submit" disabled={processing}>
                            Create
                        </Button>
                    </div>
                </div>
            </form>
        </Layout>
    );
};

export default Edit;
