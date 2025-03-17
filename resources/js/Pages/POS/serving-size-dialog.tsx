import { Button } from "@/Components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/Components/ui/dialog";
import { useOrder } from "@/contexts/OrderContext";
import { Recipe, Serving } from "@/types";

interface ServingSizeDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    recipe: Recipe;
    onSelectServing: (serving: Serving) => void;
    checkAvailability: (serving: Serving) => number;
}

export const ServingSizeDialog = ({
    open,
    onOpenChange,
    recipe,
    onSelectServing,
    checkAvailability,
}: ServingSizeDialogProps) => {
    const { getTotalOrderQuantityForServing } = useOrder();
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>{recipe.name}</DialogTitle>
                    <DialogDescription>Select Serving Size</DialogDescription>
                </DialogHeader>
                <div className="flex space-y-4 flex-col">
                    {recipe.servings.map((serving) => {
                        const availableQuantity = checkAvailability(serving);

                        return (
                            <Button
                                disabled={
                                    !serving.is_available ||
                                    getTotalOrderQuantityForServing(
                                        recipe.id,
                                        serving.id
                                    ) >= availableQuantity
                                }
                                key={serving.id}
                                onClick={() => onSelectServing(serving)}
                                className="w-full"
                            >
                                {serving.name} - ₱{serving.price}
                            </Button>
                        );
                    })}
                </div>
            </DialogContent>
        </Dialog>
    );
};
