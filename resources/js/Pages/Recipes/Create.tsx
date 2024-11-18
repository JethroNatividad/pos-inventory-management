import InputError from "@/Components/input-error";
import ServingSizeForm from "@/Components/serving-size-form";
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
import { units } from "@/data/units";
import Layout from "@/Layouts/Layout";
import type { RecipeFormData, StockEntry } from "@/types";
import { Head, Link, useForm } from "@inertiajs/react";
import { ChevronLeft } from "lucide-react";
import { FormEventHandler } from "react";

type Props = {
    stockEntries: StockEntry[];
};

const Index = ({ stockEntries }: Props) => {
    const { data, setData, post, processing, errors, reset } = useForm<
        RecipeFormData & { [key: string]: any }
    >("inventoryForm", {
        name: "",
        description: "",
        servings: [
            {
                name: "",
                price: "",
                ingredients: [
                    {
                        id: "",
                        quantity: "",
                        unit: "",
                    },
                ],
            },
        ],
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(route("inventory.store"));
    };

    const ingredientOptions = stockEntries.map((entry) => ({
        label: entry.name,
        value: entry.id.toString(),
        type: entry.type,
    }));

    const setNestedData = (path: string, value: string) => {
        const keys = path.split(".");
        setData((prevData) => {
            let updatedData = { ...prevData };
            let pointer = updatedData;

            // Traverse the keys and drill down into the object
            for (let i = 0; i < keys.length - 1; i++) {
                if (!pointer[keys[i]]) {
                    pointer[keys[i]] = isNaN(Number(keys[i + 1])) ? {} : [];
                }
                pointer = pointer[keys[i]];
            }

            // Set the value for the last key
            pointer[keys[keys.length - 1]] = value;

            return updatedData;
        });
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
                    <h1 className="text-xl font-medium">Create Recipe</h1>
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
                            placeholder="Recipe Name"
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
                            placeholder="Recipe Description"
                        />
                        <InputError message={errors.description} />
                    </div>

                    <h2 className="text-xl font-medium">Serving Sizes</h2>
                    {data.servings.map((serving, index) => (
                        <ServingSizeForm
                            ingredientOptions={ingredientOptions}
                            serving={serving}
                            index={index}
                            key={index}
                            setData={setNestedData}
                            errors={errors}
                        />
                    ))}

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

export default Index;
