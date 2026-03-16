"use client";

import { useEffect } from "react";

import { usePathname } from "next/navigation";

/**
 * ScrollToTop component
 * Automatically scrolls to top when pathname changes (page navigation)
 */
export function ScrollToTop() {
	const pathname = usePathname();

	useEffect(() => {
		// Scroll to top immediately when pathname changes
		window.scrollTo({
			top: 0,
			left: 0,
			behavior: "instant", // Use 'instant' for immediate scroll, 'smooth' for animated
		});
	}, [pathname]);

	return null;
}
