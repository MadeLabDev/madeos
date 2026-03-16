"use client";

import { useEffect, useMemo, useState } from "react";

import { ChevronDown, ChevronRight, HomeIcon, Loader, X } from "lucide-react";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";

import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { SIDEBAR_MENU_ITEMS, type SidebarMenuItem } from "@/lib/config/sidebar-menu";
import { cn } from "@/lib/utils";
import { isDevMode } from "@/lib/utils/dev-mode";
import { isMenuItemActive, isMenuItemOrChildActive } from "@/lib/utils/sidebar-active";

import { Logo } from "./site-logo";

interface SidebarProps {
	isOpen: boolean;
	user: {
		roles: string[];
		permissions: Array<{
			module: string;
			actions: string[];
		}>;
	};
	isMobile?: boolean;
	onClose?: () => void;
}

export function Sidebar({ isOpen, user, isMobile = false, onClose }: SidebarProps) {
	const pathname = usePathname();
	const searchParams = useSearchParams();
	const searchParamsStr = searchParams.toString();
	const [expandedItems, setExpandedItems] = useState<string[]>(() => {
		// Load from localStorage
		if (typeof window !== "undefined") {
			const saved = localStorage.getItem("sidebar-expanded");
			return saved ? JSON.parse(saved) : [];
		}
		return [];
	});
	const devMode = isDevMode();

	// Auto-expand parent items when their child is active
	const autoExpandedItems = useMemo(() => {
		const newExpandedItems: string[] = [];

		const findActiveParents = (items: SidebarMenuItem[], depth = 0) => {
			for (const item of items) {
				if (item.children && item.children.some((child) => isMenuItemOrChildActive(child, pathname, searchParamsStr))) {
					newExpandedItems.push(item.href);
				}

				if (item.children) {
					findActiveParents(item.children, depth + 1);
				}
			}
		};

		findActiveParents(SIDEBAR_MENU_ITEMS);

		// Merge with saved expanded items (don't override user's manual expand/collapse)
		const saved = localStorage.getItem("sidebar-expanded");
		const savedExpanded = saved ? JSON.parse(saved) : [];
		return Array.from(new Set([...newExpandedItems, ...savedExpanded]));
	}, [pathname, searchParamsStr]);

	// Sync auto-expanded items with state
	useEffect(() => {
		setExpandedItems(autoExpandedItems);
	}, [autoExpandedItems]);

	// Toggle expand/collapse for parent menu items and save to localStorage
	const toggleExpand = (href: string) => {
		const newExpanded = expandedItems.includes(href) ? expandedItems.filter((item) => item !== href) : [...expandedItems, href];
		setExpandedItems(newExpanded);
		localStorage.setItem("sidebar-expanded", JSON.stringify(newExpanded));
	};

	// Check if user has permission for menu item
	const hasPermission = (item: SidebarMenuItem): boolean => {
		// In dev mode, show all menu items
		if (devMode) return true;

		if (!item.permission) return true;

		return user.permissions.some((perm) => perm.module === item.permission!.module && perm.actions.includes(item.permission!.action));
	};

	// Check if menu item or any of its children are accessible
	const hasAccessibleContent = (item: SidebarMenuItem): boolean => {
		// Item itself has permission
		if (hasPermission(item)) return true;

		// Or any child has permission
		if (item.children && item.children.length > 0) {
			return item.children.some((child) => hasAccessibleContent(child));
		}

		return false;
	};

	const renderMenuItem = (item: SidebarMenuItem, depth = 0) => {
		// Skip items marked as hidden unless in dev mode
		if (item.display === false && !devMode) return null;

		// For parent items with children, check if there's any accessible content
		if (item.children && item.children.length > 0) {
			if (!hasAccessibleContent(item)) return null;
		} else {
			// For leaf items, check direct permission
			if (!hasPermission(item)) return null;
		}

		const isActive = isMenuItemActive(item, pathname, searchParamsStr);
		const isExpanded = expandedItems.includes(item.href);
		const hasChildren = item.children && item.children.length > 0;

		return (
			<div
				key={item.href}
				className={depth === 0 ? "border-border/30 border-b last:border-b-0" : ""}>
				<div className="relative">
					{hasChildren ? (
						// Parent menu item with children (expandable)
						<Button
							variant="ghost"
							className={cn("w-full gap-3 rounded-none px-3 py-3 transition-colors duration-200", isOpen ? "justify-start" : "justify-center", depth > 0 && "pl-4", depth > 0 && "h-5 pr-7 hover:bg-transparent", isActive && depth === 0 && "bg-accent/50 text-accent-foreground border-accent-foreground/20 border-l-2")}
							onClick={() => toggleExpand(item.href)}>
							{depth === 0 && <item.icon className={cn("h-4 w-4 shrink-0", isActive ? "text-foreground" : "text-muted-foreground")} />}
							{isOpen && (
								<div className={cn("flex w-full items-center justify-between", isActive ? "text-foreground font-medium" : "text-muted-foreground")}>
									<span className="flex items-center gap-2">
										{item.label}
										{item.display === false && <Loader className="h-1 w-1 text-orange-500" />}
									</span>
									<span>{isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}</span>
								</div>
							)}
						</Button>
					) : (
						// Leaf menu item (clickable link)
						<Button
							variant="ghost"
							className={cn("w-full gap-3 rounded-none px-3 py-0 transition-colors duration-200", isOpen ? "justify-start" : "justify-center", depth > 0 && "pl-4", depth > 0 && "h-5 pr-7 hover:bg-transparent", isActive && depth === 0 && "bg-accent/50 text-accent-foreground border-accent-foreground/20 border-l-2")}
							asChild>
							<Link
								href={item.href}
								onClick={isMobile ? onClose : undefined}>
								{depth === 0 && <item.icon className={cn("h-4 w-4 shrink-0", isActive ? "text-foreground" : "text-muted-foreground")} />}
								{isOpen && (
									<span className={cn("flex items-center gap-2", isActive ? "text-foreground font-medium" : "text-muted-foreground")}>
										{item.label}
										{item.display === false && <Loader className="h-1 w-1 text-orange-500" />}
									</span>
								)}
							</Link>
						</Button>
					)}
				</div>

				{hasChildren && isExpanded && isOpen && <div className={depth === 0 ? "ml-6" : "ml-3"}>{item.children?.map((child) => renderMenuItem(child, depth + 1))}</div>}
			</div>
		);
	};

	return (
		<aside className={cn("bg-background flex h-screen flex-col border-r transition-all duration-300", isMobile ? "fixed top-0 left-0 z-50 w-64" : "fixed top-0 left-0 z-40", isMobile ? (isOpen ? "translate-x-0" : "-translate-x-full") : isOpen ? "w-64" : "w-16")}>
			<div className="border-border flex h-16 shrink-0 items-center justify-between overflow-hidden border-b px-3">
				{isOpen ? (
					<Logo />
				) : (
					<div className="flex w-full items-center justify-center text-lg font-bold">
						<HomeIcon />
					</div>
				)}
				{isMobile && isOpen && onClose && (
					<Button
						variant="ghost"
						size="icon"
						onClick={onClose}
						className="hover:bg-accent/50 shrink-0 rounded-none">
						<X className="h-5 w-5" />
						<span className="sr-only">Close sidebar</span>
					</Button>
				)}
			</div>
			<ScrollArea className="min-h-0 flex-1">
				<nav className="space-y-0">{SIDEBAR_MENU_ITEMS.map((item) => renderMenuItem(item))}</nav>
			</ScrollArea>
			{isOpen && (
				<div className="bg-muted/20 border-border/30 shrink-0 border-t px-6 py-4">
					<p className="text-muted-foreground text-center text-xs font-medium">© {new Date().getFullYear()} MADE Laboratory</p>
				</div>
			)}
		</aside>
	);
}
