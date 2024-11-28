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
import { useOrder } from "@/contexts/orderContext";
import { useState } from "react";

const Item = ({ name, description, servings, id }: Recipe) => {
    const { addOrder } = useOrder();
    const [open, setOpen] = useState(false);
    return (
        <div className="border rounded-lg">
            <div>Image</div>
            <div className="p-2">
                <h2>{name}</h2>
                <p>{description}</p>

                <Dialog open={open} onOpenChange={(state) => setOpen(state)}>
                    <DialogTrigger asChild>
                        <Button className="w-full" size="sm">
                            Add to Order
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
                                    key={serving.id}
                                    onClick={() => {
                                        addOrder({
                                            recipeName: name,
                                            serving,
                                            quantity: 1,
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
