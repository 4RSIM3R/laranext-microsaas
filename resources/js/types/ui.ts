import { LucideIcon } from 'lucide-react';

export interface MenuItem {
    id: string;
    title: string;
    icon?: LucideIcon;
    url?: string;
    badge?: string | number;
    isActive?: boolean;
    children?: MenuItem[];
    onClick?: () => void;
    disabled?: boolean;
    divider?: boolean;
}

export interface MenuGroup {
    id: string;
    title?: string;
    items: MenuItem[];
    collapsible?: boolean;
    defaultOpen?: boolean;
}
