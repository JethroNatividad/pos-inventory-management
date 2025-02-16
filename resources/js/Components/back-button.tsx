import { Button } from "./ui/button";
import { ChevronLeft } from "lucide-react";

const BackButton = () => {
    return (
        <Button
            variant="outline"
            size="icon"
            onClick={() => window.history.back()}
        >
            <ChevronLeft />
        </Button>
    );
};

export default BackButton;
