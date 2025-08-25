import { SubMenuItem } from "./subMenuItem.model";

export interface MenuItem {
    label: string;
    labelKey?: string;
    routerLink: string;
    hasSubmenu?: boolean;
    isSubmenuVisible?: boolean;
    submenuItems?: SubMenuItem[];
    requiredPermission?: string | string[];
    icon?: string;
    isActive?: boolean;
    isVisible?: boolean;
}