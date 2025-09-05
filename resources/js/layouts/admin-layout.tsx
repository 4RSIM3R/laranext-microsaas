'use client';

import type React from 'react';

import { SidebarMenuItemComponent } from '@/components/sidebar-menu-item';
import { Avatar } from '@/components/ui/avatar';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarGroup,
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarHeader,
    SidebarInset,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarProvider,
    SidebarRail,
    SidebarTrigger,
} from '@/components/ui/sidebar';
import { useSidebarState } from '@/hooks/use-sidebar-state';
import { FormResponse } from '@/lib/constant';
import { initial_name } from '@/lib/format';
import { logout } from '@/routes/admin/auth';
import type { SharedData } from '@/types';
import type { MenuGroup } from '@/types/ui';
import { useForm, usePage } from '@inertiajs/react';
import { AvatarFallback, AvatarImage } from '@radix-ui/react-avatar';
import { Building2, ChevronsUpDown, Home, LogOut, Pencil, Receipt, Settings, SunIcon, User, User2 } from 'lucide-react';
import { Toaster } from 'sonner';

type AdminLayoutProps = {
    children: React.ReactNode;
};

const navigations: MenuGroup[] = [
    {
        id: 'main',
        title: 'Main Menu',
        items: [
            {
                id: 'dashboard',
                title: 'Dashboard',
                icon: Home,
                url: '',
            },
        ],
    },
    {
        id: 'operational',
        title: 'Operational',
        items: [
            {
                id: 'plan',
                title: 'Plan',
                icon: Pencil,
                url: '',
            },
            {
                id: 'subscription',
                title: 'Subscription',
                icon: Receipt,
                url: '',
            },
            {
                id: 'user',
                title: 'User',
                icon: User2,
                url: '',
            },
        ],
    },
    {
        id: 'setting',
        title: 'Setting',
        items: [
            {
                id: 'system',
                title: 'System Setting',
                icon: Settings,
                url: '',
            },
            {
                id: 'appearance',
                title: 'Appearance Setting',
                icon: SunIcon,
                url: '',
            },
        ],
    },
];

export default function AdminLayout({ children }: AdminLayoutProps) {
    const page = usePage<SharedData>();
    const { auth } = page.props;
    const { post } = useForm();
    const { toggleSection, isSectionOpen } = useSidebarState();

    const onLogout = (e: React.MouseEvent<HTMLDivElement>) => {
        e.preventDefault();
        post(logout().url, FormResponse);
    };

    return (
        <SidebarProvider>
            <Sidebar variant="sidebar" collapsible="offcanvas">
                <SidebarHeader className="border-b">
                    <SidebarMenuButton size="lg" className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground">
                        <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                            <Building2 className="size-4" />
                        </div>
                        <div className="flex flex-col gap-0.5 leading-none">
                            <span className="font-semibold">Admin</span>
                            <span className="text-xs text-muted-foreground">Admin</span>
                        </div>
                    </SidebarMenuButton>
                </SidebarHeader>

                <SidebarContent>
                    {navigations.map((group) => (
                        <SidebarGroup key={group.id}>
                            {group.title && (
                                <SidebarGroupLabel className="text-xs font-medium tracking-wider text-muted-foreground uppercase">
                                    {group.title}
                                </SidebarGroupLabel>
                            )}
                            <SidebarGroupContent>
                                <SidebarMenu>
                                    {group.items.map((item) => (
                                        <SidebarMenuItemComponent
                                            key={item.id}
                                            item={item}
                                            isOpen={isSectionOpen(item.id, group.defaultOpen)}
                                            onToggle={() => toggleSection(item.id)}
                                        />
                                    ))}
                                </SidebarMenu>
                            </SidebarGroupContent>
                        </SidebarGroup>
                    ))}
                </SidebarContent>

                <SidebarFooter className="border-t">
                    <SidebarMenu>
                        <SidebarMenuItem>
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <SidebarMenuButton
                                        size="lg"
                                        className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
                                    >
                                        <Avatar className="h-8 w-8 rounded-lg">
                                            <AvatarImage src="/placeholder.svg?height=32&width=32" alt="User" />
                                            <AvatarFallback className="rounded-lg">{initial_name(auth.user.name)}</AvatarFallback>
                                        </Avatar>
                                        <div className="grid flex-1 text-left text-sm leading-tight">
                                            <span className="truncate font-semibold">{auth.user.name}</span>
                                            <span className="truncate text-xs text-muted-foreground">{auth.user.email}</span>
                                        </div>
                                        <ChevronsUpDown className="ml-auto size-4" />
                                    </SidebarMenuButton>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent
                                    className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
                                    side="bottom"
                                    align="end"
                                    sideOffset={4}
                                >
                                    <DropdownMenuItem className="gap-2">
                                        <User className="size-4" />
                                        <span>Profile</span>
                                    </DropdownMenuItem>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem onClick={onLogout} className="gap-2 text-red-600">
                                        <LogOut className="size-4" />
                                        <span>Logout</span>
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </SidebarMenuItem>
                    </SidebarMenu>
                </SidebarFooter>
                <SidebarRail />
            </Sidebar>

            <SidebarInset>
                <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
                    <SidebarTrigger className="size-8" />
                </header>
                <main className="flex-1 overflow-hidden p-4">
                    <Toaster />
                    {children}
                </main>
            </SidebarInset>
        </SidebarProvider>
    );
}
