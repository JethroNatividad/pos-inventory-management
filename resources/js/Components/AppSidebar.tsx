import {
    Box,
    Boxes,
    Home,
    LayoutDashboard,
    Notebook,
    Users,
} from "lucide-react";

import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarGroup,
    SidebarGroupContent,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from "@/Components/ui/sidebar";

import { Link } from "@inertiajs/react";
import ApplicationLogo from "./ApplicationLogo";
import { NavUser } from "./nav-user";
import { User } from "@/types";

// Menu items.
const items = [
    {
        title: "Dashboard",
        url: "#",
        icon: Home,
    },
    {
        title: "POS",
        url: "#",
        icon: LayoutDashboard,
    },
    {
        title: "Inventory",
        url: "#",
        icon: Box,
    },
    {
        title: "Recipes",
        url: "#",
        icon: Boxes,
    },
    {
        title: "Reports",
        url: "#",
        icon: Notebook,
    },
    {
        title: "Users",
        url: "#",
        icon: Users,
    },
];

type AppSidebarProps = {
    user: User;
};

export function AppSidebar({ user }: AppSidebarProps) {
    return (
        <Sidebar collapsible="icon">
            <SidebarHeader>
                <Link href="/">
                    <SidebarMenuButton className="flex">
                        <ApplicationLogo className="w-20" />
                        <h1 className="text-xl font-bold truncate">
                            Paso Cafe
                        </h1>
                    </SidebarMenuButton>
                </Link>
            </SidebarHeader>
            <SidebarContent>
                <SidebarGroup>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            {items.map((item) => (
                                <SidebarMenuItem key={item.title}>
                                    <SidebarMenuButton asChild>
                                        <Link href={item.url}>
                                            <item.icon />
                                            <span>{item.title}</span>
                                        </Link>
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                            ))}
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>
            </SidebarContent>

            <SidebarFooter>
                <NavUser user={user} />
            </SidebarFooter>
        </Sidebar>
    );
}
