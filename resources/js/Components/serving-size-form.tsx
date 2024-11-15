import { Label } from "./ui/label";
import { Input } from "./ui/input";
import InputError from "./input-error";
import { ServingFormData } from "@/types";
import ServingIngredientForm from "./serving-ingredient-form";

type Props = {
    serving: ServingFormData;
    index: number;
    setData: (key: string, value: string) => void;
    errors: Partial<Record<string | number, string>>;
    ingredientOptions: { label: string; value: string }[];
};

const ServingSizeForm = ({
    serving,
    index,
    setData,
    errors,
    ingredientOptions,
}: Props) => {
    return (
        <div className="border rounded-md p-4 mb-4 space-y-4">
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
                <h3>Ingredients</h3>
                {serving.ingredients.map((ingredient, ingIndex) => (
                    <ServingIngredientForm
                        ingredient={ingredient}
                        index={index}
                        ingIndex={ingIndex}
                        key={ingIndex}
                        setData={setData}
                        errors={errors}
                        ingredientOptions={ingredientOptions}
                    />
                ))}
            </div>
        </div>
    );
};

export default ServingSizeForm;
