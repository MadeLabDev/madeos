"use client";

import { Loader2 } from "lucide-react";

type LoaderProps = React.ComponentProps<typeof Loader2> & {
	size?: "sm" | "md" | "lg";
	className?: string;
};

export function Loader({ size = "md", className = "", ...props }: LoaderProps) {
	const sizeClass = size === "sm" ? "h-4 w-4" : size === "lg" ? "h-8 w-8" : "h-6 w-6";

	return (
		<Loader2
			{...props}
			className={`${sizeClass} text-muted-foreground animate-spin ${className}`}
		/>
	);
}

export default Loader;
