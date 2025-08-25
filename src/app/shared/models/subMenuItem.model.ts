export interface SubMenuItem {
    label: string;
    labelKey?: string;
    routerLink: string;
    requiredPermission?: string;
    icon?: string;
    isActive?: boolean;
    isVisible?: boolean;
}