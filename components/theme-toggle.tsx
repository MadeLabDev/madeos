"use client";

import { useState } from "react";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";

import { Button } from "@/components/ui/button";
import { isDevMode } from "@/lib/utils/dev-mode";

export function ThemeToggle() {
	const { theme, setTheme } = useTheme();
	const [mounted] = useState(() => {
		// Avoid hydration mismatch by checking if we're on client
		return typeof window !== "undefined";
	});

	// Avoid hydration mismatch - removed useEffect, using lazy init instead

	if (!mounted) {
		return (
			<div className="flex items-center gap-2">
				{isDevMode() && <span className="rounded bg-yellow-500 px-1.5 py-0.5 text-xs font-medium text-white">DEV MODE</span>}
				<Button
					variant="ghost"
					size="icon">
					<Sun className="h-5 w-5" />
				</Button>
			</div>
		);
	}

	return (
		<div className="flex items-center gap-2">
			{isDevMode() && <span className="rounded bg-yellow-500 px-1.5 py-0.5 text-xs font-medium text-white">DEV MODE</span>}
			<Button
				variant="ghost"
				size="icon"
				onClick={() => setTheme(theme === "dark" ? "light" : "dark")}>
				<Sun className="h-5 w-5 scale-100 rotate-0 transition-all dark:scale-0 dark:-rotate-90" />
				<Moon className="absolute h-5 w-5 scale-0 rotate-90 transition-all dark:scale-100 dark:rotate-0" />
				<span className="sr-only">Toggle theme</span>
			</Button>
		</div>
	);
}
