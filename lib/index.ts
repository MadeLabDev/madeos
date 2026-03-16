/**
 * Central lib exports
 * Re-exports all config, utilities, and helpers
 */

// Config exports
export { SITE_CONFIG } from "./config/site";
export type { SiteConfigType, SiteInfoType, PaginationResource, MediaVisibility } from "./config/site";
export { ROUTE_PROTECTION_MAP } from "./config/route-protection";
export type { RouteProtectionConfig } from "./config/route-protection";
export { SIDEBAR_MENU_ITEMS } from "./config/sidebar-menu";
export type { SidebarMenuItem } from "./config/sidebar-menu";

// Type exports
export type { User, Role, Permission } from "@/generated/prisma/client";
