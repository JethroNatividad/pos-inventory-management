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

const Item = ({ name, description, servings, id, is_available }: Recipe) => {
    const { addOrder, getOrder } = useOrder();
    const [open, setOpen] = useState(false);
    return (
        <div className="border rounded-lg overflow-hidden">
            <div className="h-40 bg-gray-400" />
            <div className="p-2">
                <div className="mb-8">
                    <h2 className="text-xl">{name}</h2>
                    <p>{description}</p>
                </div>

                <Dialog open={open} onOpenChange={(state) => setOpen(state)}>
                    <DialogTrigger asChild>
                        <Button
                            disabled={!is_available}
                            className="w-full"
                            size="sm"
                        >
                            {is_available ? "Add to Order" : "Not Available"}
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>{name}</DialogTitle>
                            <DialogDescription>
                                Select Serving Size
                            </DialogDescription>
                        </DialogHeader>
                        <div className="flex space-y-4 flex-col">
                            {servings.map((serving) => (
                                <Button
                                    disabled={
                                        !serving.is_available ||
                                        (getOrder(`${id}-${serving.id}`)
                                            ?.quantity ?? 0) >=
                                            serving.quantity_available
                                    }
                                    key={serving.id}
                                    onClick={() => {
                                        addOrder({
                                            recipeName: name,
                                            serving,
                                            quantity: 1,
                                            quantityAvailable:
                                                serving.quantity_available,
                                            id: `${id}-${serving.id}`,
                                        });
                                        setOpen(false);
                                    }}
                                    className="w-full"
                                >
                                    {serving.name}
                                </Button>
                            ))}
                        </div>
                    </DialogContent>
                </Dialog>
            </div>
        </div>
    );
};

export default Item;
