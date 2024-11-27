import { Button } from "@/Components/ui/button";
import { Recipe } from "@/types";

const Item = ({ name, description }: Recipe) => {
    return (
        <div className="border rounded-lg">
            <div>Image</div>
            <div className="p-2">
                <h2>{name}</h2>
                <p>{description}</p>
                <Button className="w-full" size="sm">
                    Add to Order
                </Button>
            </div>
        </div>
    );
};

export default Item;
