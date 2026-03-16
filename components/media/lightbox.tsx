"use client";

import { useState } from "react";
import { ReactNode } from "react";

import { X } from "lucide-react";
import Lightbox from "yet-another-react-lightbox";
import { SlideImage } from "yet-another-react-lightbox";

import "yet-another-react-lightbox/styles.css";

interface LightboxWrapperProps {
	children: ReactNode;
	images?: Array<{
		src: string;
		alt?: string;
		width?: number;
		height?: number;
	}>;
	initialIndex?: number;
}

export function LightboxWrapper({ children, images = [], initialIndex = 0 }: LightboxWrapperProps) {
	const [open, setOpen] = useState(false);

	// Convert to SlideImage format
	const slides: SlideImage[] = images.map((img) => ({
		src: img.src,
		alt: img.alt,
		width: img.width,
		height: img.height,
	}));

	const handleOpen = () => {
		setOpen(true);
	};

	const handleClose = () => {
		setOpen(false);
	};

	return (
		<>
			<div
				onClick={handleOpen}
				style={{ cursor: "pointer" }}>
				{children}
			</div>

			<Lightbox
				open={open}
				close={handleClose}
				slides={slides}
				index={initialIndex}
			/>
		</>
	);
}

// Convenience component for single image
interface ImageLightboxProps {
	src: string;
	alt?: string;
	width?: number;
	height?: number;
	children: ReactNode;
}

export function ImageLightbox({ src, alt, width, height, children }: ImageLightboxProps) {
	return <LightboxWrapper images={[{ src, alt, width, height }]}>{children}</LightboxWrapper>;
}

// Component for YouTube video - opens in modal lightbox
interface YouTubeLightboxProps {
	url: string;
	children: ReactNode;
}

function getYouTubeEmbedUrl(url: string): string {
	// Handle various YouTube URL formats
	let videoId = "";

	if (url.includes("youtu.be/")) {
		const parts = url.split("youtu.be/");
		videoId = parts[1]?.split("?")[0] || "";
	} else if (url.includes("youtube.com/watch")) {
		const parts = url.split("v=");
		videoId = parts[1]?.split("&")[0] || "";
	} else if (url.includes("youtube.com/embed/")) {
		const parts = url.split("embed/");
		videoId = parts[1]?.split("?")[0] || "";
	}

	return `https://www.youtube.com/embed/${videoId}?autoplay=1`;
}

export function YouTubeLightbox({ url, children }: YouTubeLightboxProps) {
	const [isOpen, setIsOpen] = useState(false);
	const embedUrl = getYouTubeEmbedUrl(url);

	return (
		<>
			<div
				onClick={() => setIsOpen(true)}
				style={{ cursor: "pointer" }}>
				{children}
			</div>

			{isOpen && (
				<div
					className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4 backdrop-blur-sm"
					onClick={() => setIsOpen(false)}>
					<div
						className="relative w-full max-w-4xl"
						onClick={(e) => e.stopPropagation()}>
						{/* Close Button */}
						<button
							onClick={() => setIsOpen(false)}
							className="absolute -top-10 right-0 z-10 text-white transition-colors hover:text-gray-300"
							aria-label="Close video">
							<X className="h-8 w-8" />
						</button>

						{/* Video Container with Aspect Ratio */}
						<div className="relative h-0 overflow-hidden pb-[56.25%]">
							<iframe
								src={embedUrl}
								title="YouTube video"
								className="absolute top-0 left-0 h-full w-full"
								frameBorder="0"
								allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
								allowFullScreen
							/>
						</div>
					</div>
				</div>
			)}
		</>
	);
}
