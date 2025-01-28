import React from "react";
import { Button, ButtonProps } from "./ui/button";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

interface SubmitButtonProps extends ButtonProps {
    children: React.ReactNode;
    isLoading?: boolean;
    className?: string;
}

const SubmitButton = ({
    children,
    className,
    isLoading,
    disabled,
    ...props
}: SubmitButtonProps) => {
    return (
        <Button
            disabled={isLoading || disabled}
            className={cn("flex items-center space-x-2", className)}
            aria-busy={isLoading}
            type="submit"
            {...props}
        >
            <Loader2 className={cn("animate-spin", { hidden: !isLoading })} />
            {children}
        </Button>
    );
};

export default SubmitButton;
