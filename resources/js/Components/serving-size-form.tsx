import { Label } from "./ui/label";
import { Input } from "./ui/input";
import InputError from "./input-error";
import { ServingFormData } from "@/types";
import ServingIngredientForm from "./serving-ingredient-form";
import { Button } from "./ui/button";
import { Plus, X } from "lucide-react";

type Props = {
    serving: ServingFormData;
    index: number;
    setData: (key: string, value: any) => void;
    errors: Partial<Record<string | number, string>>;
    ingredientOptions: {
        label: string;
        value: string;
        type: "liquid" | "powder" | "item";
        price: number;
    }[];
    removeServing: () => void;
};

const ServingSizeForm = ({
    serving,
    index,
    setData,
    errors,
    ingredientOptions,
    removeServing,
}: Props) => {
    const addIngredient = () => {
        setData(`servings.${index}.ingredients`, [
            ...serving.ingredients,
            {
                stock_entry_id: "",
                quantity: "",
                unit: "",
            },
        ]);
    };

    const removeIngredient = (ingIndex: number) => {
        setData(
            `servings.${index}.ingredients`,
            serving.ingredients.filter((_, i) => i !== ingIndex)
        );
    };
    return (
        <div className="border rounded-md p-4 space-y-4">
            <div className="flex justify-between">
                <p className="font-medium">Serving {index + 1}</p>

                {index > 0 && (
                    <Button
                        variant="outline"
                        type="button"
                        size="icon"
                        onClick={removeServing}
                    >
                        <X className="h-4 w-4" />
                    </Button>
                )}
            </div>
            <div className="space-y-2">
                <Label htmlFor={`serving-name-${index}`}>Name</Label>
                <Input
                    id={`serving-name-${index}`}
                    type="text"
                    name={`servings[${index}].name`}
                    value={serving.name}
                    onChange={(e) =>
                        setData(`servings.${index}.name`, e.target.value)
                    }
                    placeholder="Small"
                />
                <InputError message={errors[`servings.${index}.name`]} />
            </div>

            <div className="space-y-2">
                <div className="grid grid-cols-10 gap-2">
                    <p className="col-span-4">Ingredients</p>
                    <p className="col-span-3">Quantity</p>
                    <p className="col-span-2">Cost</p>
                    <p className="col-span-1"></p>
                </div>
                {serving.ingredients.map((ingredient, ingIndex) => (
                    <ServingIngredientForm
                        ingredient={ingredient}
                        index={index}
                        ingIndex={ingIndex}
                        key={ingIndex}
                        setData={setData}
                        errors={errors}
                        ingredientOptions={ingredientOptions}
                        removeIngredient={() => removeIngredient(ingIndex)}
                    />
                ))}
            </div>

            <Button
                type="button"
                variant="default"
                size="sm"
                onClick={addIngredient}
            >
                <Plus /> Add Ingredient
            </Button>

            <div className="space-y-2">
                <Label htmlFor={`serving-price-${index}`}>Price</Label>
                <Input
                    id={`serving-price-${index}`}
                    type="text"
                    name={`servings[${index}].price`}
                    value={serving.price}
                    onChange={(e) =>
                        setData(`servings.${index}.price`, e.target.value)
                    }
                    placeholder="Serving Price"
                />
                <InputError message={errors[`servings.${index}.price`]} />
            </div>
        </div>
    );
};

export default ServingSizeForm;
