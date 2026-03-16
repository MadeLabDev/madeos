"use client";

import { useEffect, useState } from "react";

import { redirect } from "next/navigation";
import { useSession } from "next-auth/react";

import { Header } from "@/components/dashboard/header";
import { Sidebar } from "@/components/dashboard/sidebar";
import { GlobalInfoModal } from "@/components/dialogs/global-info-modal";
import { SessionProvider } from "@/components/providers/session-provider";
// import { AIAssistant } from "@/components/ai-assistant";
// import { useRAGStatus } from "@/hooks/use-rag-status";
// import { useAIAssistantStatus } from "@/hooks/use-ai-assistant-status";
import Loader from "@/components/ui/loader";
import { BreadcrumbProvider } from "@/lib/contexts/breadcrumb-context";
import { InfoModalProvider } from "@/lib/contexts/info-modal-context";

function DashboardContent({ children }: { children: React.ReactNode }) {
	const { data: session, status } = useSession();
	// const { ragEnabled } = useRAGStatus();
	// const { aiAssistantEnabled } = useAIAssistantStatus();
	const [isSidebarOpen, setIsSidebarOpen] = useState(() => {
		// Load initial state from localStorage, but respect mobile state
		if (typeof window !== "undefined") {
			const saved = localStorage.getItem("sidebar-open");
			const isMobile = window.innerWidth < 768;
			// Don't open sidebar on mobile
			return saved === "true" && !isMobile;
		}
		return false; // Default for SSR
	});
	const [isMobile, setIsMobile] = useState(true); // Default to mobile for SSR

	// Check if mobile screen
	useEffect(() => {
		const checkMobile = () => {
			const wasMobile = isMobile;
			const nowMobile = window.innerWidth < 768;
			setIsMobile(nowMobile);

			// If switching to mobile, close sidebar
			if (!wasMobile && nowMobile && isSidebarOpen) {
				setIsSidebarOpen(false);
			}
		};

		checkMobile();
		window.addEventListener("resize", checkMobile);
		return () => window.removeEventListener("resize", checkMobile);
	}, [isMobile, isSidebarOpen]);

	// Handle mobile sidebar behavior - removed separate useEffect

	// Save sidebar state to localStorage (only for desktop)
	const toggleSidebar = () => {
		const newState = !isSidebarOpen;
		setIsSidebarOpen(newState);
		// Only save to localStorage if not on mobile
		if (!isMobile) {
			localStorage.setItem("sidebar-open", newState.toString());
		}
	};

	// Redirect if not authenticated
	if (status === "unauthenticated") {
		redirect("/auth/signin");
	}

	// Show loading state
	if (status === "loading" || !session) {
		return (
			<div className="flex h-screen items-center justify-center">
				<div className="flex items-center whitespace-nowrap">
					<Loader size="lg" />
					<p className="text-muted-foreground ml-2 text-sm">Loading...</p>
				</div>
			</div>
		);
	}

	const user = {
		name: session.user.name || null,
		email: session.user.email || null,
		roles: session.user.roles?.map((r) => r.name) || [],
		permissions:
			Object.entries(session.user.permissions || {}).map(([module, actions]) => ({
				module,
				actions: actions as string[],
			})) || [],
	};

	return (
		<div className="relative flex h-screen">
			{/* Mobile overlay */}
			{isMobile && isSidebarOpen && (
				<div
					className="fixed inset-0 z-40 bg-black/50 md:hidden"
					onClick={toggleSidebar}
				/>
			)}

			{/* AI Assistant */}
			{/* {aiAssistantEnabled && <AIAssistant ragEnabled={ragEnabled} />} */}

			{/* Sidebar */}
			<Sidebar
				isOpen={isSidebarOpen}
				user={user}
				isMobile={isMobile}
				onClose={toggleSidebar}
			/>

			<BreadcrumbProvider>
				<div className={`flex flex-1 flex-col transition-all duration-300 ${isMobile ? "ml-0" : isSidebarOpen ? "ml-64" : "ml-16"} `}>
					<Header
						user={user}
						onToggleSidebar={toggleSidebar}
					/>
					<main className="flex-1 p-4 md:p-6">{children}</main>
				</div>
			</BreadcrumbProvider>
		</div>
	);
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
	return (
		<SessionProvider>
			<InfoModalProvider>
				<DashboardContent>{children}</DashboardContent>
				<GlobalInfoModal />
			</InfoModalProvider>
		</SessionProvider>
	);
}
