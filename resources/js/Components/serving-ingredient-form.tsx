import { Label } from "./ui/label";
import { Input } from "./ui/input";
import InputError from "./input-error";
import { IngredientFormData } from "@/types";
import SearchableSelect from "./searchable-select";

type Props = {
    ingredient: IngredientFormData;
    index: number;
    ingIndex: number;
    setData: (key: string, value: string) => void;
    errors: Partial<Record<string | number, string>>;
    ingredientOptions: { label: string; value: string }[];
};

const ServingIngredientForm = ({
    ingredient,
    index,
    ingIndex,
    setData,
    errors,
    ingredientOptions,
}: Props) => {
    return (
        <div className="space-y-4 border rounded-md p-4" key={index}>
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

            <div className="space-y-2">
                <Label htmlFor={`ingredient-quantity-${index}-${ingIndex}`}>
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
            </div>
            <div className="space-y-2">
                <Label htmlFor={`ingredient-unit-${index}-${ingIndex}`}>
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
                        errors[`servings.${index}.ingredients.${ingIndex}.unit`]
                    }
                />
            </div>
        </div>
    );
};

export default ServingIngredientForm;
