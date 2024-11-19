import { Label } from "./ui/label";
import { Input } from "./ui/input";
import InputError from "./input-error";
import { IngredientFormData } from "@/types";
import SearchableSelect from "./searchable-select";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "./ui/select";
import { units } from "@/data/units";
import { useEffect } from "react";
import { Button } from "./ui/button";
import { X } from "lucide-react";

type Props = {
    ingredient: IngredientFormData;
    index: number;
    ingIndex: number;
    setData: (key: string, value: any) => void;
    errors: Partial<Record<string | number, string>>;
    ingredientOptions: {
        label: string;
        value: string;
        type: "liquid" | "powder" | "item";
    }[];
    removeIngredient: () => void;
};

const ServingIngredientForm = ({
    ingredient,
    index,
    ingIndex,
    setData,
    errors,
    ingredientOptions,
    removeIngredient,
}: Props) => {
    useEffect(() => {
        const currentIngredient = ingredientOptions.find(
            (option) => option.value === ingredient.id
        );

        if (currentIngredient) {
            setData(
                `servings.${index}.ingredients.${ingIndex}.unit`,
                units[currentIngredient.type][0]
            );
        }
    }, [ingredient.id]);

    const currentIngredient = ingredientOptions.find(
        (option) => option.value === ingredient.id
    );

    return (
        <div className="space-y-4 border rounded-md p-4">
            <div className="flex justify-between">
                <p className="font-medium">Ingredient {ingIndex + 1}</p>

                {ingIndex > 0 && (
                    <Button
                        variant="outline"
                        onClick={removeIngredient}
                        type="button"
                        size="icon"
                    >
                        <X className="h-4 w-4" />
                    </Button>
                )}
            </div>
            <div className="space-y-2">
                <SearchableSelect
                    options={ingredientOptions}
                    value={ingredient.id}
                    setValue={(value) =>
                        setData(
                            `servings.${index}.ingredients.${ingIndex}.id`,
                            value
                        )
                    }
                />
                <InputError
                    message={
                        errors[`servings.${index}.ingredients.${ingIndex}.id`]
                    }
                />
            </div>

            {currentIngredient && (
                <div className="space-y-2">
                    <Label htmlFor={`ingredient-quantity-${index}-${ingIndex}`}>
                        Quantity
                    </Label>
                    <div className="flex space-x-2">
                        <Input
                            id={`ingredient-quantity-${index}-${ingIndex}`}
                            type="number"
                            name={`servings[${index}].ingredients[${ingIndex}].quantity`}
                            value={ingredient.quantity}
                            onChange={(e) =>
                                setData(
                                    `servings.${index}.ingredients.${ingIndex}.quantity`,
                                    e.target.value
                                )
                            }
                            className="w-3/4"
                            placeholder="0"
                        />
                        <div className="w-1/4">
                            <Select
                                onValueChange={(value) => {
                                    setData(
                                        `servings.${index}.ingredients.${ingIndex}.unit`,
                                        value
                                    );
                                }}
                                value={ingredient.unit}
                            >
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {units[currentIngredient.type].map(
                                        (unit) => (
                                            <SelectItem key={unit} value={unit}>
                                                {unit}
                                            </SelectItem>
                                        )
                                    )}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                    <InputError
                        message={
                            errors[
                                `servings.${index}.ingredients.${ingIndex}.unit`
                            ] ||
                            errors[
                                `servings.${index}.ingredients.${ingIndex}.quantity`
                            ]
                        }
                    />
                </div>
            )}
        </div>
    );
};

export default ServingIngredientForm;
