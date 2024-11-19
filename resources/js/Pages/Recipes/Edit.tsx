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
import type { Recipe, RecipeFormData, StockEntry } from "@/types";
import { Head, Link, useForm } from "@inertiajs/react";
import { ChevronLeft, Plus } from "lucide-react";
import { FormEventHandler } from "react";

type Props = {
    stockEntries: StockEntry[];
    recipe: Recipe;
};

const Edit = ({ stockEntries, recipe }: Props) => {
    const { data, setData, put, processing, errors, reset } = useForm<
        RecipeFormData & { [key: string]: any }
    >("editRecipeForm", {
        name: recipe.name,
        description: recipe.description,
        servings: recipe.servings.map((serving) => ({
            id: String(serving.id),
            name: serving.name,
            price: String(serving.price),
            ingredients: serving.recipe_ingredients.map((ingredient) => ({
                id: String(ingredient.id),
                stock_entry_id: String(ingredient.stock_entry_id),
                quantity: String(ingredient.quantity),
                unit: ingredient.unit,
            })),
        })),
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        put(route("recipes.update", recipe.id));
    };

    const ingredientOptions = stockEntries.map((entry) => ({
        label: entry.name,
        value: entry.id.toString(),
        type: entry.type,
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

    const removeServing = (index: number) => {
        setData(
            "servings",
            data.servings.filter((_, i) => i !== index)
        );
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
                        <Link href={route("recipes.index")}>
                            <ChevronLeft />
                        </Link>
                    </Button>
                    <h1 className="text-xl font-medium">Edit Recipe</h1>
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

                    <div className="flex justify-between items-center">
                        <h2 className="text-xl font-medium">Serving Sizes</h2>
                        <Button
                            type="button"
                            variant="outline"
                            size="icon"
                            onClick={addServing}
                        >
                            <Plus />
                        </Button>
                    </div>
                    {data.servings.map((serving, index) => (
                        <ServingSizeForm
                            ingredientOptions={ingredientOptions}
                            serving={serving}
                            index={index}
                            key={index}
                            setData={setNestedData}
                            removeServing={() => removeServing(index)}
                            errors={errors}
                        />
                    ))}

                    <div className="flex justify-end">
                        <Button type="submit" disabled={processing}>
                            Update
                        </Button>
                    </div>
                </div>
            </form>
        </Layout>
    );
};

export default Edit;
