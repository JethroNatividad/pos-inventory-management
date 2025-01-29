import { useEffect } from "react";
import { usePage, router } from "@inertiajs/react";
import { toast } from "sonner";

export function useToastListener() {
    const { toast: flashToast } = usePage().props;

    useEffect(() => {
        if (flashToast?.message) {
            toast(flashToast.message, {
                description: flashToast.description,
                action: flashToast.action
                    ? {
                          label: flashToast.action.label,
                          onClick: () =>
                              flashToast.action &&
                              router.visit(flashToast.action.url),
                      }
                    : undefined,
            });
        }
    }, [flashToast]);

    return null;
}
