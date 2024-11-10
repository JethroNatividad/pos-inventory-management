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
import ApplicationLogo from "./application-logo";
import { NavUser } from "./nav-user";
import { User } from "@/types";

// Menu items.
const items = [
    {
        title: "Dashboard",
        icon: Home,
        name: "home",
    },
    {
        title: "POS",
        icon: LayoutDashboard,
        name: "pos",
    },
    {
        title: "Inventory",
        icon: Box,
        name: "inventory",
    },
    {
        title: "Recipes",
        icon: Boxes,
        name: "recipes",
    },
    {
        title: "Reports",
        icon: Notebook,
        name: "reports",
    },
    {
        title: "Manage Users",
        icon: Users,
        name: "users.index",
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
                        <ApplicationLogo className="w-20 fill-sidebar-primary-foreground group-hover/menu-button:fill-sidebar-accent-foreground" />
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
                                    <SidebarMenuButton
                                        asChild
                                        isActive={route().current(item.name)}
                                    >
                                        <Link href={route(item.name)}>
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
