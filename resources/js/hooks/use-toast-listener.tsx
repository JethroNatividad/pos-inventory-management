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
                          onClick: () => {
                              if (!flashToast.action) return;
                              const method = flashToast.action.method || "get";

                              if (method === "get")
                                  router.get(flashToast.action.url);

                              if (method === "post")
                                  router.post(flashToast.action.url);

                              if (method === "put")
                                  router.put(flashToast.action.url);

                              if (method === "delete")
                                  router.delete(flashToast.action.url);

                              if (method === "patch")
                                  router.patch(flashToast.action.url);
                          },
                      }
                    : undefined,
            });
        }
    }, [flashToast]);

    return null;
}
