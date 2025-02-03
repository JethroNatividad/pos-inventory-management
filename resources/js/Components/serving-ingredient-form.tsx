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
import { Trash, Trash2, X } from "lucide-react";
import { convert } from "@/lib/utils";

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
        price: number;
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
            (option) => option.value === ingredient.stock_entry_id
        );

        if (currentIngredient) {
            setData(
                `servings.${index}.ingredients.${ingIndex}.unit`,
                units[currentIngredient.type][0]
            );
        }
    }, [ingredient.stock_entry_id]);

    const currentIngredient = ingredientOptions.find(
        (option) => option.value === ingredient.stock_entry_id
    );

    return (
        <div>
            <div className="grid grid-cols-10 gap-2">
                <div className="space-y-2 col-span-4">
                    <SearchableSelect
                        options={ingredientOptions}
                        value={ingredient.stock_entry_id}
                        setValue={(value) =>
                            setData(
                                `servings.${index}.ingredients.${ingIndex}.stock_entry_id`,
                                value
                            )
                        }
                    />
                    <InputError
                        message={
                            errors[
                                `servings.${index}.ingredients.${ingIndex}.stock_entry_id`
                            ]
                        }
                    />
                </div>
                <div className="grid gap-2 grid-cols-5 col-span-3">
                    <div className="col-span-3">
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
                            placeholder="0"
                        />
                    </div>
                    <div className="col-span-2">
                        <Select
                            // onValueChange={(value) => {
                            //     setData(
                            //         `servings.${index}.ingredients.${ingIndex}.unit`,
                            //         value
                            //     );
                            // }}
                            onValueChange={(value) => {
                                const converted = convert(
                                    currentIngredient?.type || "liquid",
                                    ingredient.unit,
                                    value,
                                    Number(ingredient.quantity)
                                );

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
                                {currentIngredient &&
                                    units[currentIngredient.type].map(
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
                <div className="col-span-2 flex items-center border rounded-md px-2 bg-gray-50">
                    <span>₱</span>
                    <p className="text-sm text-wrap">
                        {currentIngredient
                            ? currentIngredient.price *
                              convert(
                                  currentIngredient.type || "liquid",
                                  ingredient.unit,
                                  units[currentIngredient.type][0],
                                  Number(ingredient.quantity)
                              )
                            : "0.00"}
                    </p>
                </div>
                <div className="col-span-1">
                    <Button
                        variant="outline"
                        onClick={removeIngredient}
                        type="button"
                        size="icon"
                        disabled={ingIndex === 0}
                    >
                        <Trash2 />
                    </Button>
                </div>
            </div>
            <InputError
                message={
                    errors[`servings.${index}.ingredients.${ingIndex}.unit`] ||
                    errors[`servings.${index}.ingredients.${ingIndex}.quantity`]
                }
            />
        </div>
    );
};

export default ServingIngredientForm;
