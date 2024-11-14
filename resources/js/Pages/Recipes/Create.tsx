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
import { units } from "@/data/units";
import Layout from "@/Layouts/Layout";
import { Head, Link, useForm } from "@inertiajs/react";
import { ChevronLeft } from "lucide-react";
import { FormEventHandler, useEffect } from "react";

export type InventoryFormData = {
    name: string;
    description: string;
    servings: {
        name: string;
        price: string;
        ingredients: {
            id: string;
            quantity: string;
            unit: string;
        }[];
    }[];
};

const Index = () => {
    const { data, setData, post, processing, errors, reset } = useForm<
        InventoryFormData & { [key: string]: any }
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
                    <h1 className="text-xl font-medium">Create Stock Entry</h1>
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

                    <h2>Serving Sizes</h2>
                    {data.servings.map((serving, index) => (
                        <div className="border rounded-md p-4 mb-4" key={index}>
                            <div className="space-y-2">
                                <Label htmlFor={`serving-name-${index}`}>
                                    Name
                                </Label>
                                <Input
                                    id={`serving-name-${index}`}
                                    type="text"
                                    name={`servings[${index}].name`}
                                    value={serving.name}
                                    onChange={(e) =>
                                        setData(
                                            `servings.${index}.name`,
                                            e.target.value
                                        )
                                    }
                                    placeholder="Serving Name"
                                />
                                <InputError
                                    message={errors[`servings.${index}.name`]}
                                />

                                <Label htmlFor={`serving-price-${index}`}>
                                    Price
                                </Label>
                                <Input
                                    id={`serving-price-${index}`}
                                    type="text"
                                    name={`servings[${index}].price`}
                                    value={serving.price}
                                    onChange={(e) =>
                                        setData(
                                            `servings.${index}.price`,
                                            e.target.value
                                        )
                                    }
                                    placeholder="Serving Price"
                                />
                                <InputError
                                    message={errors[`servings.${index}.price`]}
                                />
                                <h3>Ingredients</h3>
                                {serving.ingredients.map(
                                    (ingredient, ingIndex) => (
                                        <div
                                            className="space-y-2"
                                            key={ingIndex}
                                        >
                                            <Label
                                                htmlFor={`ingredient-id-${index}-${ingIndex}`}
                                            >
                                                Ingredient ID
                                            </Label>
                                            <Input
                                                id={`ingredient-id-${index}-${ingIndex}`}
                                                type="text"
                                                name={`servings[${index}].ingredients[${ingIndex}].id`}
                                                value={ingredient.id}
                                                onChange={(e) =>
                                                    setData(
                                                        `servings.${index}.ingredients.${ingIndex}.id`,
                                                        e.target.value
                                                    )
                                                }
                                                placeholder="Ingredient ID"
                                            />
                                            <InputError
                                                message={
                                                    errors[
                                                        `servings.${index}.ingredients.${ingIndex}.id`
                                                    ]
                                                }
                                            />

                                            <Label
                                                htmlFor={`ingredient-quantity-${index}-${ingIndex}`}
                                            >
                                                Quantity
                                            </Label>
                                            <Input
                                                id={`ingredient-quantity-${index}-${ingIndex}`}
                                                type="text"
                                                name={`servings[${index}].ingredients[${ingIndex}].quantity`}
                                                value={ingredient.quantity}
                                                onChange={(e) =>
                                                    setData(
                                                        `servings.${index}.ingredients.${ingIndex}.quantity`,
                                                        e.target.value
                                                    )
                                                }
                                                placeholder="Quantity"
                                            />
                                            <InputError
                                                message={
                                                    errors[
                                                        `servings.${index}.ingredients.${ingIndex}.quantity`
                                                    ]
                                                }
                                            />
                                            <Label
                                                htmlFor={`ingredient-unit-${index}-${ingIndex}`}
                                            >
                                                Unit
                                            </Label>
                                            <Input
                                                id={`ingredient-unit-${index}-${ingIndex}`}
                                                type="text"
                                                name={`servings[${index}].ingredients[${ingIndex}].unit`}
                                                value={ingredient.unit}
                                                onChange={(e) =>
                                                    setData(
                                                        `servings.${index}.ingredients.${ingIndex}.unit`,
                                                        e.target.value
                                                    )
                                                }
                                                placeholder="Unit"
                                            />
                                            <InputError
                                                message={
                                                    errors[
                                                        `servings.${index}.ingredients.${ingIndex}.unit`
                                                    ]
                                                }
                                            />
                                        </div>
                                    )
                                )}
                            </div>
                        </div>
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
