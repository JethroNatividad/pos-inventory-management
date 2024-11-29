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
    SidebarMenuSub,
    SidebarMenuSubItem,
} from "@/Components/ui/sidebar";

import { Link } from "@inertiajs/react";
import ApplicationLogo from "./application-logo";
import { NavUser } from "./nav-user";
import { User } from "@/types";
import {
    Collapsible,
    CollapsibleTrigger,
    CollapsibleContent,
} from "@/Components/ui/collapsible";

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
        name: "inventory.index",
    },
    {
        title: "Recipes",
        icon: Boxes,
        name: "recipes.index",
    },
    {
        title: "Reports",
        icon: Notebook,
        name: "reports",
        children: [
            { title: "Stock logs", name: "reports.stocks" },
            { title: "Recipe logs", name: "reports.recipes" },
            { title: "Order logs", name: "reports.orders" },
        ],
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
                                    {item.children ? (
                                        <Collapsible
                                            defaultOpen
                                            className="group/collapsible"
                                        >
                                            <CollapsibleTrigger asChild>
                                                <SidebarMenuButton>
                                                    <item.icon />
                                                    <span>{item.title}</span>
                                                </SidebarMenuButton>
                                            </CollapsibleTrigger>
                                            <CollapsibleContent>
                                                <SidebarMenuSub>
                                                    {item.children.map(
                                                        (subItem) => (
                                                            <SidebarMenuSubItem
                                                                key={
                                                                    subItem.title
                                                                }
                                                            >
                                                                <SidebarMenuButton
                                                                    asChild
                                                                    isActive={route().current(
                                                                        subItem.name
                                                                    )}
                                                                >
                                                                    <Link
                                                                        href={route(
                                                                            subItem.name
                                                                        )}
                                                                    >
                                                                        <span>
                                                                            {
                                                                                subItem.title
                                                                            }
                                                                        </span>
                                                                    </Link>
                                                                </SidebarMenuButton>
                                                            </SidebarMenuSubItem>
                                                        )
                                                    )}
                                                </SidebarMenuSub>
                                            </CollapsibleContent>
                                        </Collapsible>
                                    ) : (
                                        <SidebarMenuButton
                                            asChild
                                            isActive={route().current(
                                                item.name
                                            )}
                                        >
                                            <Link href={route(item.name)}>
                                                <item.icon />
                                                <span>{item.title}</span>
                                            </Link>
                                        </SidebarMenuButton>
                                    )}
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
