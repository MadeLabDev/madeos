"use client";

import { useEffect, useState } from "react";

import { LogOut, Menu, MessageSquare, Settings as SettingsIcon, User as UserIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { signOut } from "next-auth/react";

import { ThemeToggle } from "@/components/theme-toggle";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

import { Breadcrumb } from "./breadcrumb";
import { Logo } from "./site-logo";

interface HeaderProps {
	user: {
		name: string | null;
		email: string | null;
		roles: string[];
	};
	onToggleSidebar: () => void;
}

export function Header({ user, onToggleSidebar }: HeaderProps) {
	const router = useRouter();
	const [isMobile, setIsMobile] = useState(false);

	// Check if mobile screen
	useEffect(() => {
		const checkMobile = () => {
			setIsMobile(window.innerWidth < 768);
		};

		checkMobile();
		window.addEventListener("resize", checkMobile);
		return () => window.removeEventListener("resize", checkMobile);
	}, []);

	const initials =
		user.name
			?.split(" ")
			.map((n) => n[0])
			.join("")
			.toUpperCase() ||
		user.email?.[0]?.toUpperCase() ||
		"U";

	// Check if user has admin or manager role
	const hasAdminAccess = user.roles.includes("admin") || user.roles.includes("manager");

	const handleSignOut = async () => {
		await signOut({ callbackUrl: "/auth/signin" });
	};

	return (
		<>
			<header className="bg-background sticky top-0 z-30 flex h-16 items-center gap-4 border-b px-4 py-3.5 md:px-6">
				<Button
					variant="ghost"
					size="icon"
					onClick={onToggleSidebar}
					className="shrink-0">
					<Menu className="h-5 w-5" />
					<span className="sr-only">Toggle sidebar</span>
				</Button>

				{/* Mobile: Show site name, Desktop: Show breadcrumb */}
				{isMobile ? (
					<div className="flex-1">
						<Logo />
					</div>
				) : (
					<div className="flex-1">
						<Breadcrumb />
					</div>
				)}

				<div className="flex items-center gap-2">
					{/* Notifications */}
					{/* <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="h-5 w-5" />
              <span className="absolute right-1 top-1 flex h-4 w-4 items-center justify-center rounded-full bg-error text-error-foreground text-[10px] font-bold">
                3
              </span>
              <span className="sr-only">Notifications</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-80">
            <DropdownMenuLabel>Notifications</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <div className="p-2 text-sm text-muted-foreground">
              No new notifications
            </div>
          </DropdownMenuContent>
        </DropdownMenu> */}

					{/* Theme Toggle */}
					<ThemeToggle />

					{/* User Menu */}
					<DropdownMenu>
						<DropdownMenuTrigger asChild>
							<Button
								variant="ghost"
								className="relative gap-2">
								<Avatar className="h-8 w-8">
									<AvatarFallback>{initials}</AvatarFallback>
								</Avatar>
								<div className="hidden flex-col items-start text-left md:flex">
									<span className="text-sm font-medium">{user.name || user.email}</span>
									<span className="text-muted-foreground text-xs">{user.roles.join(", ")}</span>
								</div>
							</Button>
						</DropdownMenuTrigger>
						<DropdownMenuContent
							align="end"
							className="w-56">
							<DropdownMenuLabel>
								<div className="flex flex-col space-y-1">
									<p className="text-sm font-medium">{user.name || "User"}</p>
									<p className="text-muted-foreground text-xs">{user.email}</p>
								</div>
							</DropdownMenuLabel>
							<DropdownMenuSeparator />
							<DropdownMenuItem onClick={() => router.push("/profile")}>
								<UserIcon className="mr-2 h-4 w-4" />
								Profile
							</DropdownMenuItem>
							{hasAdminAccess && (
								<DropdownMenuItem onClick={() => router.push("/settings")}>
									<SettingsIcon className="mr-2 h-4 w-4" />
									Settings
								</DropdownMenuItem>
							)}
							<DropdownMenuItem onClick={() => router.push("/contact-us")}>
								<MessageSquare className="mr-2 h-4 w-4" />
								Contact
							</DropdownMenuItem>
							<DropdownMenuSeparator />
							<DropdownMenuItem
								onClick={handleSignOut}
								className="text-destructive">
								<LogOut className="mr-2 h-4 w-4" />
								Logout
							</DropdownMenuItem>
						</DropdownMenuContent>
					</DropdownMenu>
				</div>
			</header>
		</>
	);
}
