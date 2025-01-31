import Layout from "@/Layouts/Layout";
import { Head, Link, useForm } from "@inertiajs/react";
import { Button } from "@/Components/ui/button";
import { ChevronLeft } from "lucide-react";
import { FormEventHandler } from "react";
import { units } from "@/data/units";
import type { StockEntry } from "@/types";

import SubmitButton from "@/Components/submit-button";
import { BatchLabelSelect } from "@/Components/batch-label-select";
import { QuantityField } from "@/Components/quantity-field";
import { Label } from "@/Components/ui/label";
import { Textarea } from "@/Components/ui/textarea";
import InputError from "@/Components/input-error";

type Props = {
    stockEntry: StockEntry;
    batchLabels: {
        label: string;
        amount: number;
    }[];
};

const RemoveStock = ({ stockEntry, batchLabels }: Props) => {
    const { data, setData, post, processing, errors } = useForm({
        batch_label: batchLabels[0]?.label ?? "",
        quantity: "",
        unit: units[stockEntry.type][0],
        reason: "",
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
                    <BatchLabelSelect
                        batchLabels={batchLabels}
                        value={data.batch_label}
                        onChange={(value) => setData("batch_label", value)}
                        error={errors.batch_label}
                        stockEntryUnit={stockEntry.unit}
                    />

                    <QuantityField
                        quantity={data.quantity}
                        unit={data.unit}
                        onQuantityChange={(value) => setData("quantity", value)}
                        onUnitChange={(value) => setData("unit", value)}
                        availableUnits={units[stockEntry.type]}
                        error={errors.quantity || errors.unit}
                    />

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
                        <SubmitButton isLoading={processing}>
                            Remove stock
                        </SubmitButton>
                    </div>
                </div>
            </form>
        </Layout>
    );
};

export default RemoveStock;
