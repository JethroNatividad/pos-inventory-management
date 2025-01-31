import { Label } from "@/Components/ui/label";
import { Button } from "@/Components/ui/button";
import { Calendar } from "@/Components/ui/calendar";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/Components/ui/popover";
import InputError from "@/Components/input-error";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";

type ExpiryDateFieldProps = {
    value: Date | null;
    onChange: (date: Date) => void;
    error?: string;
};

export const ExpiryDateField = ({
    value,
    onChange,
    error,
}: ExpiryDateFieldProps) => (
    <div className="space-y-2">
        <Label htmlFor="expiry_date">Expiry Date</Label>
        <div>
            <Popover>
                <PopoverTrigger asChild>
                    <Button
                        variant="outline"
                        className={cn(
                            "w-[240px] pl-3 text-left font-normal",
                            !value && "text-muted-foreground"
                        )}
                    >
                        {value ? (
                            format(value, "PPP")
                        ) : (
                            <span>Pick a date</span>
                        )}
                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                        mode="single"
                        selected={value || undefined}
                        onSelect={(date) => date && onChange(date)}
                        disabled={(date) =>
                            new Date(
                                new Date().setDate(new Date().getDate() + 1)
                            ) > date
                        }
                        initialFocus
                    />
                </PopoverContent>
            </Popover>
        </div>
        <InputError message={error} />
    </div>
);
