import { Recipe } from "@/types";
import Item from "./item";
import { useState, useMemo } from "react";
import { Input } from "@/Components/ui/input";
import { Button } from "@/Components/ui/button";

type Props = {
    recipes: Recipe[];
};

const Items = ({ recipes }: Props) => {
    const [query, setQuery] = useState("");

    const filtered = useMemo(() => {
        const lower = query.toLowerCase();
        return recipes.filter(
            (r) =>
                r.name.toLowerCase().includes(lower) ||
                r.description.toLowerCase().includes(lower)
        );
    }, [query, recipes]);

    const clearSearch = () => setQuery("");

    return (
        <div>
            <div className="mb-2 flex space-x-2">
                <Input
                    onChange={(e) => setQuery(e.currentTarget.value)}
                    value={query}
                    placeholder="Search.."
                />
                <Button onClick={clearSearch}>Clear</Button>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
                {filtered.length === 0 && <div>No recipes found.</div>}
                {filtered.map((recipe) => (
                    <Item key={recipe.id} recipe={recipe} />
                ))}
            </div>
        </div>
    );
};

export default Items;
