import InputError from "@/Components/input-error";
import ServingSizeForm from "@/Components/serving-size-form";
import SubmitButton from "@/Components/submit-button";
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
import { ChevronLeft, Plus } from "lucide-react";
import { FormEventHandler, useEffect, useState } from "react";

type Props = {
    stockEntries: StockEntry[];
};

const Index = ({ stockEntries }: Props) => {
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);

    const { data, setData, post, processing, errors, reset } = useForm<
        RecipeFormData & { [key: string]: any }
    >({
        name: "",
        description: "",
        image: null,
        servings: [
            {
                name: "",
                price: "",
                ingredients: [
                    {
                        stock_entry_id: "",
                        quantity: "",
                        unit: "",
                    },
                ],
            },
        ],
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(route("recipes.store"));
    };

    const ingredientOptions = stockEntries.map((entry) => ({
        label: entry.name,
        value: entry.id.toString(),
        type: entry.type,
        price: entry.average_price,
    }));

    const setNestedData = (path: string, value: any) => {
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

    const addServing = () => {
        setData("servings", [
            ...data.servings,
            {
                name: "",
                price: "",
                ingredients: [
                    {
                        stock_entry_id: "",
                        quantity: "",
                        unit: "",
                    },
                ],
            },
        ]);
    };

    const duplicateServing = (index: number) => {
        const hardcopy = JSON.parse(JSON.stringify(data.servings[index]));
        setData("servings", [...data.servings, hardcopy]);
    };

    const removeServing = (index: number) => {
        setData(
            "servings",
            data.servings.filter((_, i) => i !== index)
        );
    };

    useEffect(() => {
        // Cleanup function to revoke object URL
        return () => {
            if (previewUrl) {
                URL.revokeObjectURL(previewUrl);
            }
        };
    }, [previewUrl]);

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0] || null;
        setData("image", file);

        if (file) {
            const url = URL.createObjectURL(file);
            setPreviewUrl(url);
        } else {
            setPreviewUrl(null);
        }
    };

    return (
        <Layout>
            <Head title="Create Stock Entry" />

            <form onSubmit={submit} className="w-full mx-auto space-y-8">
                <div className="flex items-center space-x-2">
                    <Button size="icon" variant="outline" asChild>
                        <Link href={route("recipes.index")}>
                            <ChevronLeft />
                        </Link>
                    </Button>
                    <h1 className="text-xl font-medium">Create Recipe</h1>
                </div>

                <div className="space-y-4 rounded-md sm:p-4 sm:border">
                    <div className="space-y-4 lg:flex">
                        <div className="lg:w-1/2">
                            <h2 className="text-xl font-medium">General</h2>
                            <p>Recipe name, description, and image</p>
                        </div>
                        <div className="lg:w-1/2 space-y-2">
                            <div className="space-y-2">
                                <Label htmlFor="name">Name</Label>
                                <Input
                                    id="name"
                                    type="text"
                                    name="name"
                                    value={data.name}
                                    onChange={(e) =>
                                        setData("name", e.target.value)
                                    }
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

                            <div className="space-y-2">
                                <Label htmlFor="image">Image</Label>
                                <Input
                                    id="image"
                                    type="file"
                                    name="image"
                                    accept="image/*"
                                    onChange={handleImageChange}
                                />
                                {previewUrl && (
                                    <div className="mt-2">
                                        <img
                                            src={previewUrl}
                                            alt="Preview"
                                            className="max-w-full h-auto rounded-md"
                                            style={{ maxHeight: "200px" }}
                                        />
                                    </div>
                                )}
                                <InputError message={errors.image} />
                            </div>
                        </div>
                    </div>
                </div>
                <div className="space-y-4 rounded-md sm:p-4 sm:border">
                    <div className="flex">
                        <div className="lg:w-1/2">
                            <h2 className="text-xl font-medium">
                                Serving Sizes
                            </h2>
                            <p>Set serving sizes</p>
                        </div>
                        <div className="lg:w-1/2 space-y-2"></div>
                    </div>

                    <div className="grid gap-4 grid-cols-1 2xl:grid-cols-2">
                        {data.servings.map((serving, index) => (
                            <ServingSizeForm
                                duplicateServing={() => duplicateServing(index)}
                                ingredientOptions={ingredientOptions}
                                serving={serving}
                                index={index}
                                key={index}
                                setData={setNestedData}
                                removeServing={() => removeServing(index)}
                                errors={errors}
                            />
                        ))}
                        <Button
                            type="button"
                            variant="outline"
                            size="icon"
                            className="w-full"
                            onClick={addServing}
                        >
                            <Plus />
                        </Button>
                    </div>
                </div>
                <div className="flex justify-end">
                    <SubmitButton isLoading={processing}>
                        Create Recipe
                    </SubmitButton>
                </div>
            </form>
        </Layout>
    );
};

export default Index;
