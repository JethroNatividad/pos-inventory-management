import { AppSidebar } from "@/Components/app-sidebar";
import {
    SidebarProvider,
    SidebarTrigger,
    useSidebar,
} from "@/Components/ui/sidebar";
import { Toaster } from "@/Components/ui/sonner";
import { usePage } from "@inertiajs/react";
import { PropsWithChildren } from "react";
import Cookies from "js-cookie";
import { useToastListener } from "@/hooks/use-toast-listener";

export default function Layout({ children }: PropsWithChildren) {
    const user = usePage().props.auth.user;
    const defaultOpen = Cookies.get("sidebar:state") === "true";
    useToastListener();

    return (
        <SidebarProvider defaultOpen={defaultOpen}>
            <AppSidebar user={user} />
            <main className="w-full">
                <div className="shadow-sm p-2 fixed w-full bg-background">
                    <SidebarTrigger />
                </div>
                <div className="px-6 pt-16 pb-4">{children}</div>
            </main>
            <Toaster />
        </SidebarProvider>
    );
}
