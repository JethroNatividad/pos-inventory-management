import { AppSidebar } from "@/Components/app-sidebar";
import { SidebarProvider, SidebarTrigger } from "@/Components/ui/sidebar";
import { usePage } from "@inertiajs/react";
import { PropsWithChildren } from "react";

export default function Layout({ children }: PropsWithChildren) {
    const user = usePage().props.auth.user;

    return (
        <SidebarProvider>
            <AppSidebar user={user} />
            <main className="w-full">
                <div className="shadow-sm p-1">
                    <SidebarTrigger />
                </div>
                <div className="p-2">{children}</div>
            </main>
        </SidebarProvider>
    );
}
