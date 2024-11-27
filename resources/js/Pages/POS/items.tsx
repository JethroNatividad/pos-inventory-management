import { Recipe } from "@/types";
import Item from "./item";

type Props = {
    recipes: Recipe[];
};

const Items = ({ recipes }: Props) => {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {recipes.map((recipe) => (
                <Item key={recipe.id} {...recipe} />
            ))}
        </div>
    );
};

export default Items;
