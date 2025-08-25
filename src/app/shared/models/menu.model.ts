import { MenuItem } from "./menuItem.model";

export interface Menu {
    icon: string;
    title: string;
    titleKey?: string;
    items: MenuItem[];
    requiredPermission?: string;
    isExpanded?: boolean;
    isVisible?: boolean;
}