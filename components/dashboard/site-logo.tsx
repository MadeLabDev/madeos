"use client";

import Image from "next/image";

export function Logo() {
	return (
		<h1 className="text-lg font-bold">
			{/* MADE App */}
			<Image
				src="/logo.svg"
				alt="MADE App"
				width={200}
				height={24}
				priority
				className="h-6 w-auto dark:invert"
			/>
		</h1>
	);
}
