"use client";

import { Loader } from "@/components/ui/loader";

export function PageLoading({ message }: { message?: string }) {
	return (
		<div className="flex h-full min-h-[240px] items-center justify-center">
			<div className="flex items-center whitespace-nowrap">
				<Loader size="lg" />
				{message && <p className="text-muted-foreground ml-2 text-sm">{message}</p>}
			</div>
		</div>
	);
}

export default PageLoading;
