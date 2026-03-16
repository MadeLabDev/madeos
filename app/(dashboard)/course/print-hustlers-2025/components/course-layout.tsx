"use client";

import { useEffect, useState } from "react";

import { Menu } from "lucide-react";

import { SetBreadcrumb } from "@/components/breadcrumb/set-breadcrumb";
import { Button } from "@/components/ui/button";

import { SessionSidebar } from "./session-sidebar";

interface CourseLayoutProps {
	children: React.ReactNode;
}

export function CourseLayout({ children }: CourseLayoutProps) {
	const [isMobile, setIsMobile] = useState(false);
	const [isSidebarOpen, setIsSidebarOpen] = useState(false);

	// Check if mobile screen
	useEffect(() => {
		const checkMobile = () => {
			const mobile = window.innerWidth < 768;
			setIsMobile(mobile);
			// On mobile, sidebar starts closed
			if (mobile) {
				setIsSidebarOpen(false);
			} else {
				// On desktop, sidebar starts open
				setIsSidebarOpen(true);
			}
		};

		checkMobile();
		window.addEventListener("resize", checkMobile);
		return () => window.removeEventListener("resize", checkMobile);
	}, []);

	const toggleSidebar = () => {
		setIsSidebarOpen(!isSidebarOpen);
	};

	return (
		<>
			<SetBreadcrumb
				segment="print-hustlers-2025"
				label="Print Hustlers 2025"
			/>

			<div className="bg-background -m-6 flex min-h-screen">
				{/* Mobile overlay */}
				{isMobile && isSidebarOpen && (
					<div
						className="fixed inset-0 z-40 bg-black/50 md:hidden"
						onClick={toggleSidebar}
					/>
				)}

				{/* Sidebar */}
				<div className={` ${isMobile ? "fixed top-0 left-0 z-50" : "relative"} ${isMobile && !isSidebarOpen ? "-translate-x-full" : "translate-x-0"} transition-transform duration-300 ease-in-out`}>
					<SessionSidebar onClose={isMobile ? toggleSidebar : undefined} />
				</div>

				{/* Main Content */}
				<div className={`flex-1 overflow-y-auto transition-all duration-300 ${isMobile ? "ml-0" : "ml-0"} `}>
					{/* Mobile Header */}
					{isMobile && (
						<div className="bg-background sticky top-0 z-30 flex h-16 items-center gap-4 border-b px-4">
							<Button
								variant="ghost"
								size="icon"
								onClick={toggleSidebar}
								className="shrink-0">
								<Menu className="h-5 w-5" />
								<span className="sr-only">Toggle sidebar</span>
							</Button>

							<div className="flex-1">
								<h1 className="text-lg font-bold">Print Hustlers 2025</h1>
							</div>
						</div>
					)}

					<div className="container mx-auto max-w-4xl px-8 py-8">{children}</div>
				</div>
			</div>
		</>
	);
}
