"use client";

//  <LoadingImage
//   src={img.src}
//   alt="Image description"
//   width={800}
//   height={600}
//   className="h-full w-full object-cover"
//   loading="lazy"
//   decoding="async"
//   containerClassName="w-20 h-20 sm:w-24 sm:h-24 md:w-full md:h-auto md:aspect-[16/9] md:border-b md:border-border bg-muted overflow-hidden flex-shrink-0 rounded-lg md:rounded-none md:order-1"
// />

import { useState } from "react";

import { Loader2 } from "lucide-react";
import Image, { ImageProps } from "next/image";

import { cn } from "@/lib/utils";

interface LoadingImageProps extends ImageProps {
	containerClassName?: string;
	noWrapper?: boolean; // For MDX inline contexts where wrapper causes HTML nesting issues
}

export function LoadingImage({ className, containerClassName, noWrapper = false, alt, onLoad, ...props }: LoadingImageProps) {
	const [isLoading, setIsLoading] = useState(true);

	const handleLoad = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
		setIsLoading(false);
		onLoad?.(e);
	};

	// For MDX inline contexts (inside <p> tags), use inline-block wrapper
	// This avoids div nesting issues while still supporting loading indicator
	if (noWrapper) {
		return (
			<span className={cn("border-border relative mb-3 block w-full overflow-hidden rounded-3xl border", containerClassName)}>
				{/* Loading Skeleton with Spinner */}
				{isLoading && (
					<span className="absolute inset-0 z-10 animate-pulse rounded-lg bg-gray-200">
						{/* Shimmer Effect */}
						<span className="via-foreground/5 animate-shimmer absolute inset-0 bg-gradient-to-r from-transparent to-transparent" />

						{/* Spinner Icon */}
						<span className="absolute inset-0 flex items-center justify-center">
							<Loader2 className="text-foreground h-8 w-8 animate-spin" />
						</span>
					</span>
				)}

				{/* Next.js Image with lazy loading */}
				<Image
					className={cn("transition-opacity duration-500", isLoading ? "opacity-0" : "opacity-100", className)}
					alt={alt}
					onLoad={handleLoad}
					{...props}
				/>
			</span>
		);
	}

	// Normal rendering with wrapper for loading indicator
	return (
		<div className={cn("relative", containerClassName)}>
			{/* Loading Skeleton with Spinner */}
			{isLoading && (
				<div className="absolute inset-0 z-10 animate-pulse bg-gray-200">
					{/* Shimmer Effect */}
					<div className="via-foreground/5 animate-shimmer absolute inset-0 bg-gradient-to-r from-transparent to-transparent" />

					{/* Spinner Icon */}
					<div className="absolute inset-0 flex items-center justify-center">
						<Loader2 className="h-8 w-8 animate-spin text-black" />
					</div>
				</div>
			)}

			{/* Next.js Image with lazy loading */}
			<Image
				className={cn("transition-opacity duration-500", isLoading ? "opacity-0" : "opacity-100", className)}
				alt={alt}
				onLoad={handleLoad}
				{...props}
			/>
		</div>
	);
}
