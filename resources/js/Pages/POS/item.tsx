import { Button } from "@/Components/ui/button";
import { Recipe } from "@/types";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/Components/ui/dialog";
import { useOrder } from "@/contexts/OrderContext";
import { useState } from "react";

interface ItemProps {
    recipe: Recipe;
}

const Item = ({ recipe }: ItemProps) => {
    const { addOrder, getOrder, checkAvailability } = useOrder();

    const [open, setOpen] = useState(false);
    return (
        <div className="border rounded-lg overflow-hidden">
            <img
                className="h-40 object-cover w-full"
                src={
                    recipe.image
                        ? "/storage/" + recipe.image
                        : "/images/coffee-template.png"
                }
                alt="Coffee"
            />
            <div className="p-2">
                <div className="mb-8">
                    <h2 className="text-xl">{recipe.name}</h2>
                    <p>{recipe.description}</p>
                </div>

                <Dialog open={open} onOpenChange={(state) => setOpen(state)}>
                    <DialogTrigger asChild>
                        <Button
                            disabled={!recipe.is_available}
                            className="w-full"
                            size="sm"
                        >
                            {recipe.is_available
                                ? "Add to Order"
                                : "Not Available"}
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>{recipe.name}</DialogTitle>
                            <DialogDescription>
                                Select Serving Size
                            </DialogDescription>
                        </DialogHeader>
                        <div className="flex space-y-4 flex-col">
                            {recipe.servings.map((serving) => {
                                const availableQuantity =
                                    checkAvailability(serving);

                                return (
                                    <Button
                                        disabled={
                                            !serving.is_available ||
                                            (getOrder(
                                                `${recipe.id}-${serving.id}`
                                            )?.quantity ?? 0) >=
                                                availableQuantity
                                        }
                                        key={serving.id}
                                        onClick={() => {
                                            addOrder({
                                                serving,
                                                quantity: 1,
                                                recipe: recipe,
                                                id: `${recipe.id}-${serving.id}`,
                                            });
                                            setOpen(false);
                                        }}
                                        className="w-full"
                                    >
                                        {serving.name} - ₱{serving.price}
                                    </Button>
                                );
                            })}
                        </div>
                    </DialogContent>
                </Dialog>
            </div>
        </div>
    );
};

export default Item;
