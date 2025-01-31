import Layout from "@/Layouts/Layout";
import { Head, Link, useForm } from "@inertiajs/react";
import { Button } from "@/Components/ui/button";
import { ChevronLeft } from "lucide-react";
import { format } from "date-fns";
import { useState, FormEventHandler } from "react";
import SubmitButton from "@/Components/submit-button";
import { units } from "@/data/units";
import type { StockEntry } from "@/types";
import { BatchLabelField } from "@/Components/batch-label-field";
import { QuantityField } from "@/Components/quantity-field";
import { PriceField } from "@/Components/price-field";
import { ExpiryDateField } from "@/Components/expiry-date-field";

type Props = {
    stockEntry: StockEntry;
    batchLabels: {
        label: string;
        amount: number;
    }[];
};

const AddStock = ({ stockEntry, batchLabels }: Props) => {
    const [isNewLabel, setIsNewLabel] = useState(batchLabels.length === 0);
    const { data, setData, post, processing, errors } = useForm({
        batch_label:
            batchLabels.length > 0
                ? batchLabels[0].label
                : `Batch ${format(new Date(), "yyyy-MM-dd HH:mm:ss")}`,
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
                    <BatchLabelField
                        batchLabels={batchLabels}
                        isNewLabel={isNewLabel}
                        setIsNewLabel={setIsNewLabel}
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

                    <PriceField
                        value={data.price}
                        onChange={(value) => setData("price", value)}
                        error={errors.price}
                    />

                    {stockEntry.perishable && (
                        <ExpiryDateField
                            value={data.expiry_date}
                            onChange={(date) => setData("expiry_date", date)}
                            error={errors.expiry_date}
                        />
                    )}

                    <div className="flex justify-end">
                        <SubmitButton isLoading={processing}>
                            Add stock
                        </SubmitButton>
                    </div>
                </div>
            </form>
        </Layout>
    );
};

export default AddStock;
