import { Label } from "./ui/label";
import { Input } from "./ui/input";
import InputError from "./input-error";
import { IngredientFormData } from "@/types";

type Props = {
    ingredient: IngredientFormData;
    index: number;
    setData: (key: string, value: string) => void;
    errors: Partial<Record<string | number, string>>;
};

const ServingIngredientForm = ({
    ingredient,
    index,
    setData,
    errors,
}: Props) => {
    return (
        <div className="space-y-2" key={index}>
            <Label htmlFor={`ingredient-id-${index}-${index}`}>
                Ingredient ID
            </Label>
            <Input
                id={`ingredient-id-${index}-${index}`}
                type="text"
                name={`servings[${index}].ingredients[${index}].id`}
                value={ingredient.id}
                onChange={(e) =>
                    setData(
                        `servings.${index}.ingredients.${index}.id`,
                        e.target.value
                    )
                }
                placeholder="Ingredient ID"
            />
            <InputError
                message={errors[`servings.${index}.ingredients.${index}.id`]}
            />

            <Label htmlFor={`ingredient-quantity-${index}-${index}`}>
                Quantity
            </Label>
            <Input
                id={`ingredient-quantity-${index}-${index}`}
                type="text"
                name={`servings[${index}].ingredients[${index}].quantity`}
                value={ingredient.quantity}
                onChange={(e) =>
                    setData(
                        `servings.${index}.ingredients.${index}.quantity`,
                        e.target.value
                    )
                }
                placeholder="Quantity"
            />
            <InputError
                message={
                    errors[`servings.${index}.ingredients.${index}.quantity`]
                }
            />
            <Label htmlFor={`ingredient-unit-${index}-${index}`}>Unit</Label>
            <Input
                id={`ingredient-unit-${index}-${index}`}
                type="text"
                name={`servings[${index}].ingredients[${index}].unit`}
                value={ingredient.unit}
                onChange={(e) =>
                    setData(
                        `servings.${index}.ingredients.${index}.unit`,
                        e.target.value
                    )
                }
                placeholder="Unit"
            />
            <InputError
                message={errors[`servings.${index}.ingredients.${index}.unit`]}
            />
        </div>
    );
};

export default ServingIngredientForm;
