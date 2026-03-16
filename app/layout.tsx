import type { Metadata } from "next";
import { ThemeProvider } from "next-themes";

import { ScrollToTop } from "@/components/dashboard/scroll-to-top";
import { Toaster } from "@/components/ui/sonner";
import { initializeSettings } from "@/lib/initialize-settings";

import "./globals.css";

export const metadata: Metadata = {
	title: "MADE Laboratory",
	description: "Business management system",
};

// Initialize application settings at server startup
initializeSettings().catch((error) => {
	console.error("Failed to initialize settings:", error);
});

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html
			lang="en"
			suppressHydrationWarning>
			<body>
				<ThemeProvider
					attribute="class"
					defaultTheme="light"
					enableSystem
					disableTransitionOnChange>
					{children}
					<ScrollToTop />
					<Toaster />
				</ThemeProvider>
			</body>
		</html>
	);
}
