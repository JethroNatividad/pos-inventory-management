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
        <div className="border rounded-md p-4 mb-4 space-y-4">
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
            <div className="space-y-2">
                <div className="flex justify-between items-center">
                    <h2 className="text-lg font-medium">Ingredients</h2>
                    <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        onClick={addIngredient}
                    >
                        <Plus />
                    </Button>
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
        </div>
    );
};

export default ServingSizeForm;
